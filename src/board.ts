import { COLOUR_MASK, DEFAULT_FEN, EMPTY, MAILBOX120, MAILBOX64, PIECE_LOOKUP, PIECE_MASK, SQUARE_ALPHAS, SQUARE_UTF } from "./board-constants";
import { WHITE, BLACK, PAWN, HAS_MOVED, CAN_CASTLE } from "./piece-constants";

export default class ChessBoard {
  board = new Int8Array(120);               // 10x12 board - represented as a 1D array
  ply = 1;                                  // the total count of plys (half-moves) ... fullmove = Math.ceil(ply/2);
  boardstates = new Int32Array(3600);       // the boardstate of each ply. e.g. boardstates[1]=ply1. includes: castle rights, turn, enpassant square, halfmove count, previous piece moved
  
  constructor(fen = DEFAULT_FEN) {
    // this.initBoardState(fen);
  }

  /**
   * Initialises the board state based on the input FEN (or default FEN)
   */
  // private initBoardState(fen: string) {
  //   const { board, turn, castle, enpassant, halfmove, fullmove } = ChessBoard.parseFEN(fen);
  //   this.board = board;
  // }

  /**
   * convert number to chess notation (i.e. 65 => e4)
   */
  static numberToCoordinate(square: number) {
    return String.fromCharCode(square%10 + 96) + (10 - Math.floor(square / 10));
  }

  /**
   * converts FEN string into data values
   */
  private static parseFEN(fen: string) {
    // Object to store output data
    const output = {
      board: new Int8Array(120),
      turn: WHITE,
      castle: new Int8Array(4),
      enpassant: -1,
      halfmove: 0,
      fullmove: 0
    };

    // Split each segment of FEN
    const fenSplit = fen.split(" ");
    const fenBoard = fenSplit[0];
    let [, fenTurn, fenCastle, fenEnPassant, fenHalfMove, fenFullMove] = fenSplit;

    // Set default values if ONLY board position was provided
    if(fenSplit.length === 1) {
      fenHalfMove = String(0);
      fenFullMove = String(1);
      fenEnPassant = "-";
      fenCastle = "-";
      fenTurn = "w";
    }

    // Convert halfmove and fullmove to Integers
    output.halfmove = parseInt(fenHalfMove);
    output.fullmove = parseInt(fenFullMove);

    // Convert En Passant Square to 10x12 index
    if (fenEnPassant !== "-") {
      const file = fenEnPassant[0].toLowerCase().charCodeAt(0) - 97;
      const rank = 8 - parseInt(fenEnPassant[1]);
      const index64 = rank * 8 + file;
      output.enpassant = MAILBOX64[index64];
    }

    // Convert castle information to an array
    if (fenCastle.includes("K")) output.castle[0] = 1;
    if (fenCastle.includes("Q")) output.castle[1] = 1;
    if (fenCastle.includes("k")) output.castle[2] = 1;
    if (fenCastle.includes("q")) output.castle[3] = 1;

    // Convert turn to data
    output.turn = fenTurn === "w" ? WHITE : BLACK;

    // Convert board string into array
    const fenBoardFormatted = fenBoard.replace(/\//g, ""); // Remove newlines '/'
    const board64 = new Int8Array(64);  // Initialise an empty array
    for (let i = 0, j = 0; i < fenBoardFormatted.length; i++, j++) {
      const fenCh = fenBoardFormatted[i];
      if (!isNaN(parseInt(fenCh))) { // Skip # of blank sqaures
        j += parseInt(fenCh) - 1;
        continue;
      }

      // Get square information
      const piece = PIECE_LOOKUP[fenCh.toUpperCase()];
      const colour = fenCh === fenCh.toUpperCase() ? WHITE : BLACK;
      let hasMoved = true;  // set each piece to 'has moved' by default, unless otherwise specified
      let canCastle = false;

      // Set flags for king castling (set 'can castle' if either king-side or queen-side available)
      if ((fenCh === "K" && (output.castle[0] === 1 || output.castle[1] === 1)) ||
        (fenCh === "k" && (output.castle[2] === 1 || output.castle[3] === 1))) {
        hasMoved = false;
        canCastle = true;
      }

      // Set flags for rook (set to 'piece unmoved' if castle is available)
      if ((fenCh === "R" && j === 63 && output.castle[0] === 1) ||
        (fenCh === "R" && j === 56 && output.castle[1] === 1) ||
        (fenCh === "r" && j === 7 && output.castle[2] === 1) ||
        (fenCh === "r" && j === 0 && output.castle[3] === 1)) {
        hasMoved = false;
      }

      // Set flags for pawns on starting rank (set to unmoved)
      if ((piece === PAWN) &&
        ((colour === WHITE && j >= 48 && j <= 55) ||
          ((colour === BLACK && j >= 8 && j <= 15)))) {
        hasMoved = false;
      }

      // Encode square
      board64[j] = ChessBoard.encodeSquare(fenCh,HAS_MOVED,CAN_CASTLE);
    }

    // Pad 64 board into 120
    output.board = ChessBoard.padBoard(board64);

    return output;
  }

  /**
   * GETS CURRENT FEN
   * converts current internal board state into a FEN string
   */
  // getFEN() {
  //   let board = "";
  //   let enpassant = "-";
  //   const turn = this.turn === WHITE ? "w" : "b";
  //   const castle = ["K", "Q", "k", "q"].filter((v, i) => this.castle[i] === 1).join("") || "-";
  //   const halfmove = this.halfmove;
  //   const fullmove = this.fullmove;
    
  //   // enpassant value to algebraic notation
  //   if(this.enpassant !== -1) {
  //     const mb = MAILBOX120[this.enpassant]; // get the 8x8 array index, as it is easier to calculate rank/file with
  //     const file = String.fromCharCode((mb % 8) + 97);
  //     const rank = String(8 - Math.floor(mb / 8));
  //     enpassant = file + rank;
  //   }

  //   // stringify board state
  //   for (let i = 0; i < 64; i++) {
  //     if (i % 8 === 0 && i !== 0) board += "/";
  //     const mb = MAILBOX64[i];
  //     let square = this.board[mb];
  //     const piece = square & (PIECE_MASK | BLACK);  // TODO -> CHANGE BLACK TO COLOUR_MASK ?
  //     // if empty square, count how many additional empty squares exist and add to FEN string
  //     if (square === EMPTY) {
  //       let skip = 0;
  //       while (square === EMPTY) {
  //         skip++;
  //         i++;
  //         square = this.board[mb + skip];
  //       }
  //       board += String(skip);
  //       i--;  // reduce by 1 to reverse the last 'i++' in the while loop above (to ensure no squares are skipped)
  //     } else {
  //       board += SQUARE_ALPHAS[piece];  // add piece character to FEN string
  //     }
  //   }

  //   // combine all components of FEN string
  //   return `${board} ${turn} ${castle} ${enpassant} ${halfmove} ${fullmove}`;
  // }

  /**
   * ENCODE SQUARE - CONVERTS SQUARE INFORMATION TO BINARY-REPRESENTED SQUARE DATA
   */
  static encodeSquare(pieceCh: string, pieceHasMoved: number, kingCanCastle: number) {
    const piece = PIECE_LOOKUP[pieceCh.toUpperCase()];
    const colour = pieceCh === pieceCh.toUpperCase() ? WHITE : BLACK; 
    return piece | colour | pieceHasMoved | kingCanCastle;
  }


  /**
   * DECODE SQUARE - CONVERTS BINARY-REPRESENTED SQUARE DATA TO SQUARE INFORMATION
   */
  static decodeSquare(encodedSquare: number) {
    const pieceCh = (encodedSquare & PIECE_MASK) | (encodedSquare & COLOUR_MASK);
    const piece = SQUARE_ALPHAS[pieceCh];
    return {
      piece: piece === "." ? "EMPTY" : piece,
      hasMoved: (encodedSquare & HAS_MOVED) > 0,
      canCastle: (encodedSquare & CAN_CASTLE) > 0,
    };
  }


  /**
   * ENCODE BOARD STATE - CONVERTS BOARD STATE INFORMATION TO BINARY-REPRESENTED DATA
   */
  static encodeBoardState(castleRights: string, currentTurn: "w" | "b", enpassantSquare: string, halfmoveCount: number, prevPiece: number | null = null) {
    let encodedBoardState = 0b0000_0000_0000_0000_0000_0000_0000_0000;

    // Castle
    if (castleRights.includes("K")) encodedBoardState |= 0b1000;
    if (castleRights.includes("Q")) encodedBoardState |= 0b0100;
    if (castleRights.includes("k")) encodedBoardState |= 0b0010;
    if (castleRights.includes("q")) encodedBoardState |= 0b0001;
    
    // Current Turn
    if (currentTurn === "w") {
      encodedBoardState |= WHITE;
    } else if (currentTurn === "b") {
      encodedBoardState |= BLACK;
    }

    // En Passant Square
    if (enpassantSquare !== "-") {
      const file = enpassantSquare[0].toLowerCase().charCodeAt(0) - 97;
      const rank = 8 - parseInt(enpassantSquare[1]);
      const index64 = rank * 8 + file;
      const enpassantNumber = MAILBOX64[index64];
      encodedBoardState |= (enpassantNumber << 8);
    }

    // Halfmove Counter
    encodedBoardState |= (halfmoveCount << 16);

    // Prev Piece
    if (prevPiece !== null) encodedBoardState |= (prevPiece << 24);

    return encodedBoardState;
  }

  /**
   * DECODE BOARD STATE - CONVERTS BINARY-REPRESENTED BOARD STATE TO BOARD INFORMATION
   */
  static decodeBoardState(encodedBoardState:number) {
    const { castleRights, currentTurn,  }
  }

  /**
  * PADS A [64]Int8 BOARD WITH -1'S TO MAKE [120]Int8
  */
  private static padBoard(inpBoard: Int8Array) {
    const outBoard = new Int8Array([...MAILBOX120]);
    MAILBOX64.forEach((mi, i) => {
      outBoard[mi] = inpBoard[i];
    });
    return outBoard;
  }

  /**
  * PRINTS CURRENT BOARD STATE TO TERMINAL
  * can use decimal, character, or unicode notation
  */
  // printBoard(pieceSymbol: "decimal" | "character" | "unicode" = "unicode") {
  //   process.stdout.write(" +---------------------------+\n");
  //   process.stdout.write("+-----------------------------+\n| |");

  //   for (let i = 21; i <= 98; i++) {
  //     if (i % 10 === 0) { process.stdout.write("| |"); continue; }
  //     if (i % 10 === 9) { process.stdout.write(" | |\n"); continue; }

  //     let square = "";
  //     const piece = this.board[i] & 0b0001_0111;  // get *only* the piece and colour value for lookup

  //     switch (pieceSymbol) {
  //     case "decimal":
  //       square = String(this.board[i]);
  //       break;
  //     case "character":
  //       square = ` ${SQUARE_ALPHAS[piece]} `;
  //       break;
  //     case "unicode":
  //       square = ` ${SQUARE_UTF[piece]} `;
  //       break;
  //     default:
  //       square = "ERR";
  //       break;
  //     }

  //     square = square.padStart(3);
  //     process.stdout.write(square);
  //   }

  //   let printCastle = ["K","Q","k","q"].filter((v,i) => this.castle[i]===1).join("");
  //   if (printCastle === "") printCastle = "-";

  //   process.stdout.write(" | |\n+-----------------------------+\n");
  //   process.stdout.write(`Turn: ${this.turn===0 ? "w" : "b"}\n`);
  //   process.stdout.write(`Castle: ${printCastle}\n`);
  //   process.stdout.write(`En Passant Square: ${this.enpassant===-1 ? "-" : ChessBoard.numberToCoordinate(this.enpassant)}\n`);
  //   process.stdout.write(`Halfmove: ${this.halfmove}\n`);
  //   process.stdout.write(`Fullmove: ${this.fullmove}\n`);
  //   process.stdout.write("+-----------------------------+\n");
  // }
}