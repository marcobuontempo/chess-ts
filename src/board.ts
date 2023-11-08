import { COLOUR_MASK, CURRENT_TURN, DEFAULT_FEN, EMPTY, ENPASSANT_SQUARE, HALFMOVE_COUNT, MAILBOX120, MAILBOX64, PIECE_LOOKUP, PIECE_MASK, PREV_PIECE, SQUARE_ALPHAS, SQUARE_UTF } from "./board-constants";
import { WHITE, BLACK, PAWN, HAS_MOVED, CAN_CASTLE } from "./piece-constants";

export default class ChessBoard {
  board = new Int8Array(120);               // 10x12 board - represented as a 1D array
  ply = 1;                                  // the current number of plys (half-moves)
  boardstates = new Int32Array(3600);       // the boardstate of each ply. e.g. boardstates[1]=ply1. includes: castle rights, turn, enpassant square, halfmove count, previous piece moved
  
  constructor(fen = DEFAULT_FEN) {
    this.initBoardState(fen);
  }

  /**
   * Initialises the board state based on the input FEN (or default FEN)
   */
  private initBoardState(fen: string) {
    const { board, state, ply } = ChessBoard.parseFEN(fen);
    this.board = board;
    this.ply = ply;
    this.boardstates[ply] = state;
  }

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
    let state = 0b0000_0000_0000_0000_0000_0000_0000_0000;  // encoded board state
    let ply = 0;  // current match ply
    let board = new Int8Array(120); // board representation

    // STATE
    // Split each segment of FEN
    const fenSplit = fen.split(" ");
    const fenBoard = fenSplit[0];
    let [, fenTurn, fenCastle, fenEnPassant, fenHalfMove, fenFullMove]: string[] | number[] | Int8Array[] = fenSplit;
    // Set default values if ONLY board position was provided
    if(fenSplit.length === 1) {
      fenHalfMove = String(0);
      fenFullMove = String(1);
      fenEnPassant = "-";
      fenCastle = "-";
      fenTurn = "w";
    } 
    // Format Turn
    fenTurn = (fenTurn.toLowerCase()==="w") ? WHITE : BLACK;
    // Format Castle
    const updatedCastle = new Int8Array([0,0,0,0]);
    if (fenCastle.includes("K")) updatedCastle[0] = 1;
    if (fenCastle.includes("Q")) updatedCastle[1] = 1;
    if (fenCastle.includes("k")) updatedCastle[2] = 1;
    if (fenCastle.includes("q")) updatedCastle[3] = 1;
    fenCastle = updatedCastle;
    // Format En Passant Square
    const file = fenEnPassant[0].toLowerCase().charCodeAt(0) - 97;
    const rank = 8 - parseInt(fenEnPassant[1]);
    const index64 = rank * 8 + file;
    fenEnPassant = MAILBOX64[index64];
    // Format Half Move
    fenHalfMove = parseInt(fenHalfMove);
    // Format Full Move
    fenFullMove = parseInt(fenFullMove);
    // Set encoded board state
    state = ChessBoard.encodeBoardState(fenCastle,fenTurn,fenEnPassant,fenHalfMove);

    // PLY
    ply = (fenFullMove*2) + (fenTurn===WHITE ? -1 : 0);

    // BOARD
    // Convert board string into array
    const fenBoardFormatted = fenBoard.replace(/\//g, ""); // Remove newlines '/'
    const board64 = new Int8Array(64);  // Initialise an empty array
    const { castleRights } = ChessBoard.decodeBoardState(state);  // simplifies logic later on by decoding castle rights into array 
    for (let i = 0, j = 0; i < fenBoardFormatted.length; i++, j++) {
      const fenCh = fenBoardFormatted[i];
      if (!isNaN(parseInt(fenCh))) { // Skip # of blank sqaures
        j += parseInt(fenCh) - 1;
        continue;
      }
      // Get square information
      const piece = PIECE_LOOKUP[fenCh.toUpperCase()];
      const colour = fenCh === fenCh.toUpperCase() ? WHITE : BLACK;
      let hasMoved: number | boolean = true;  // set each piece to 'has moved' by default, unless otherwise specified
      let canCastle: number | boolean = false;
      // Set flags for king castling (set 'can castle' if either king-side or queen-side available)
      if ((fenCh === "K" && (castleRights[0] === 1 || castleRights[1] === 1)) ||
        (fenCh === "k" && (castleRights[2] === 1 || castleRights[3] === 1))) {
        hasMoved = false;
        canCastle = true;
      }
      // Set flags for rook (set to 'piece unmoved' if castle is available)
      if ((fenCh === "R" && j === 63 && castleRights[0] === 1) ||
        (fenCh === "R" && j === 56 && castleRights[1] === 1) ||
        (fenCh === "r" && j === 7 && castleRights[2] === 1) ||
        (fenCh === "r" && j === 0 && castleRights[3] === 1)) {
        hasMoved = false;
      }
      // Set flags for pawns on starting rank (set to unmoved)
      if ((piece === PAWN) &&
        ((colour === WHITE && j >= 48 && j <= 55) ||
          ((colour === BLACK && j >= 8 && j <= 15)))) {
        hasMoved = false;
      }
      // Encode square
      hasMoved = (hasMoved===true) ? HAS_MOVED : 0; // set correct values for function calls
      canCastle = (canCastle===true) ? CAN_CASTLE : 0;
      board64[j] = ChessBoard.encodeSquare(fenCh,hasMoved,canCastle);
    }
    // pad 64[] board into 120[]
    board = ChessBoard.padBoard(board64);

    return {
      state,
      ply,
      board,  
    };
  }

  /**
   * GETS CURRENT FEN
   * converts current internal board state into a FEN string
   */
  getFEN() {
    const { castleRights, currentTurn, enPassantSquare, halfmoveCount } = ChessBoard.decodeBoardState(this.boardstates[this.ply]);
    let board = "";
    let enpassant = "-";
    const turn = currentTurn === WHITE ? "w" : "b";
    const castle = ["K", "Q", "k", "q"].filter((v, i) => castleRights[i] === 1).join("") || "-";
    const halfmove = halfmoveCount;
    const fullmove = Math.ceil(this.ply/2);
    
    // enpassant value to algebraic notation
    if(enPassantSquare !== -1) {
      const mb = MAILBOX120[enPassantSquare]; // get the 8x8 array index, as it is easier to calculate rank/file with
      const file = String.fromCharCode((mb % 8) + 97);
      const rank = String(8 - Math.floor(mb / 8));
      enpassant = file + rank;
    }

    // stringify board state
    for (let i = 0; i < 64; i++) {
      if (i % 8 === 0 && i !== 0) board += "/";
      const mb = MAILBOX64[i];
      let square = this.board[mb];
      const piece = square & (PIECE_MASK | BLACK);  // TODO -> CHANGE BLACK TO COLOUR_MASK ?
      // if empty square, count how many additional empty squares exist and add to FEN string
      if (square === EMPTY) {
        let skip = 0;
        while (square === EMPTY) {
          skip++;
          i++;
          square = this.board[mb + skip];
        }
        board += String(skip);
        i--;  // reduce by 1 to reverse the last 'i++' in the while loop above (to ensure no squares are skipped)
      } else {
        board += SQUARE_ALPHAS[piece];  // add piece character to FEN string
      }
    }

    // combine all components of FEN string
    return `${board} ${turn} ${castle} ${enpassant} ${halfmove} ${fullmove}`;
  }

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
  static encodeBoardState(castleRights: Int8Array | Array<number>, currentTurn: number, enPassantSquare: number, halfmoveCount: number, prevPiece: number = EMPTY) {
    let encodedBoardState = 0b0000_0000_0000_0000_0000_0000_0000_0000;

    // Castle
    if (castleRights[0]) encodedBoardState |= 0b1000;
    if (castleRights[1]) encodedBoardState |= 0b0100;
    if (castleRights[2]) encodedBoardState |= 0b0010;
    if (castleRights[3]) encodedBoardState |= 0b0001;
    
    // Current Turn
    encodedBoardState |= currentTurn;

    // En Passant Square
    if (enPassantSquare > 0) { encodedBoardState |= (enPassantSquare << 8); }

    // Halfmove Counter
    encodedBoardState |= (halfmoveCount << 16);

    // Prev Piece
    if (prevPiece !== EMPTY) encodedBoardState |= (prevPiece << 24);

    return encodedBoardState;
  }

  /**
   * DECODE BOARD STATE - CONVERTS BINARY-REPRESENTED BOARD STATE TO BOARD INFORMATION
   */
  static decodeBoardState(encodedBoardState:number) {
    // Default Values
    const decodedBoardState = { 
      castleRights: new Int8Array([0,0,0,0]),
      currentTurn: WHITE,
      enPassantSquare: -1, 
      halfmoveCount: 0,
      prevPiece: EMPTY
    };

    // Castle Rights
    if ((encodedBoardState & 0b1000) !== 0) decodedBoardState.castleRights[0] = 1;
    if ((encodedBoardState & 0b0100) !== 0) decodedBoardState.castleRights[1] = 1;
    if ((encodedBoardState & 0b0010) !== 0) decodedBoardState.castleRights[2] = 1;
    if ((encodedBoardState & 0b0001) !== 0) decodedBoardState.castleRights[3] = 1;

    // Current Turn
    decodedBoardState.currentTurn = encodedBoardState & CURRENT_TURN;

    // En Passant Square
    const newEnPassantSquare = (encodedBoardState & ENPASSANT_SQUARE)>>8;
    if (newEnPassantSquare > 0) decodedBoardState.enPassantSquare = newEnPassantSquare;

    // Halfmove Count
    decodedBoardState.halfmoveCount = (encodedBoardState & HALFMOVE_COUNT)>>16;

    // Previous Piece
    decodedBoardState.prevPiece = (encodedBoardState & PREV_PIECE)>>24;

    return decodedBoardState;
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
  printBoard(pieceSymbol: "decimal" | "character" | "unicode" = "unicode") {
    const { castleRights, currentTurn, enPassantSquare, halfmoveCount } = ChessBoard.decodeBoardState(this.boardstates[this.ply]);

    let boardDisplay = "";

    boardDisplay += (" +---------------------------+\n");
    boardDisplay += ("+-----------------------------+\n| |");

    for (let i = 21; i <= 98; i++) {
      if (i % 10 === 0) { boardDisplay += ("| |"); continue; }
      if (i % 10 === 9) { boardDisplay += (" | |\n"); continue; }

      let square = "";
      const piece = this.board[i] & (PIECE_MASK | COLOUR_MASK);  // get *only* the piece and colour value for lookup
      switch (pieceSymbol) {
      case "decimal":
        square = String(this.board[i]);
        break;
      case "character":
        square = ` ${SQUARE_ALPHAS[piece]} `;
        break;
      case "unicode":
        square = ` ${SQUARE_UTF[piece]} `;
        break;
      default:
        square = "ERR";
        break;
      }

      square = square.padStart(3);
      boardDisplay += (square);
    }

    let printCastle = ["K","Q","k","q"].filter((v,i) => castleRights[i]===1).join("");
    if (printCastle === "") printCastle = "-";

    boardDisplay += (" | |\n+-----------------------------+\n");
    boardDisplay += (`Turn: ${currentTurn===0 ? "w" : "b"}\n`);
    boardDisplay += (`Castle: ${printCastle}\n`);
    boardDisplay += (`En Passant Square: ${enPassantSquare===-1 ? "-" : ChessBoard.numberToCoordinate(enPassantSquare)}\n`);
    boardDisplay += (`Halfmove: ${halfmoveCount}\n`);
    boardDisplay += (`Fullmove: ${Math.ceil(this.ply/2)}\n`);
    boardDisplay += ("+-----------------------------+\n");

    process.stdout.write(boardDisplay);

    return boardDisplay;
  }
}