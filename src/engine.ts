import ChessBoard from "./board";

export default class Engine {
  chessboard: ChessBoard;
  history: Array<any>;

  constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    this.chessboard = new ChessBoard(fen);
    this.history = [];
  }

  /* MOVES VALUES
  * binary representation of move information
  *
  * bit 1-8:    [TO]      square from (index of 120[] board)
  * bit 9-16:   [FROM]    square to (index of 120[] board)
  * bit 17-19:  [PROMOTE] 3-bit piece value of what to promote to (in case of pawn promotion. i.e. ChessBoard.SQ.N, B, R or Q)
  * bit 20-27:  [CAPTURE] complete 8-bit piece value of what was captured (i.e. ChessBoard.SQ.P, N, B, R, Q, including flags)
  * bit 28-29:  [CASTLE]  whether the move was castle (1 = KingSide, 2 = QueenSide)
  * bit 30-32:  [UNUSUED] currently unused
  */
  static MV = {
    SQ_TO: 0b0000_0000_0000_0000_0000_0000_1111_1111,
    SQ_FROM: 0b0000_0000_0000_0000_1111_1111_0000_0000,
    PC_PROMOTE: 0b0000_0000_0000_0111_0000_0000_0000_0000,
    PC_CAPTURE: 0b0000_0111_1111_1000_0000_0000_0000_0000,
    CASTLE: 0b001_1000_0000_0000_0000_0000_0000_0000,
    KS_CASTLE: 0b0000_1000_0000_0000_0000_0000_0000_0000,
    QS_CASTLE: 0b0001_0000_0000_0000_0000_0000_0000_0000,
    DOUBLE_PUSH: 0b0010_0000_0000_0000_0000_0000_0000_0000,
    EN_PASSANT: 0b0100_0000_0000_0000_0000_0000_0000_0000,
    NONE: 0b0000_0000_0000_0000_0000_0000_0000_0000,
    UNUSED: 0b1000_0000_0000_0000_0000_0000_0000_0000,
  };

  /**
  * MOVE DIRECTIONS
  * index matches piece encoding
  * e.g. king = 6 = MOVES_LIST[6]
  */
  static DIRECTIONS = {
    N: -10,
    S: 10,
    E: 1,
    W: -1,
    NE: -9,
    NW: -11,
    SE: 11,
    SW: 9,
  };

  /**
  * THE POSSIBLE DIRECTIONS THAT EACH PIECE CAN GO IN 1-STEP
  * can be accessed using the the piece value (black pawn is special). i.e. knight = 2 = MOVES_LIST[2]
  */
  static MOVES_LIST = [
    /* black pawn */[(Engine.DIRECTIONS.S), (Engine.DIRECTIONS.S + Engine.DIRECTIONS.S), (Engine.DIRECTIONS.SE), (Engine.DIRECTIONS.SW)],
    /* white pawn */[(Engine.DIRECTIONS.N), (Engine.DIRECTIONS.N + Engine.DIRECTIONS.N), (Engine.DIRECTIONS.NE), (Engine.DIRECTIONS.NW)],
    /*     knight */[(Engine.DIRECTIONS.N + Engine.DIRECTIONS.NE), (Engine.DIRECTIONS.N + Engine.DIRECTIONS.NW), (Engine.DIRECTIONS.E + Engine.DIRECTIONS.NE), (Engine.DIRECTIONS.E + Engine.DIRECTIONS.SE), (Engine.DIRECTIONS.S + Engine.DIRECTIONS.SE), (Engine.DIRECTIONS.S + Engine.DIRECTIONS.SW), (Engine.DIRECTIONS.W + Engine.DIRECTIONS.NW), (Engine.DIRECTIONS.W + Engine.DIRECTIONS.SW)],
    /*     bishop */[(Engine.DIRECTIONS.NE), (Engine.DIRECTIONS.NW), (Engine.DIRECTIONS.SE), (Engine.DIRECTIONS.SW)],
    /*       rook */[(Engine.DIRECTIONS.N), (Engine.DIRECTIONS.S), (Engine.DIRECTIONS.E), (Engine.DIRECTIONS.W)],
    /*      queen */[(Engine.DIRECTIONS.N), (Engine.DIRECTIONS.S), (Engine.DIRECTIONS.E), (Engine.DIRECTIONS.W), (Engine.DIRECTIONS.NE), (Engine.DIRECTIONS.NW), (Engine.DIRECTIONS.SE), (Engine.DIRECTIONS.SW)],
    /*       king */[(Engine.DIRECTIONS.N), (Engine.DIRECTIONS.S), (Engine.DIRECTIONS.E), (Engine.DIRECTIONS.W), (Engine.DIRECTIONS.NE), (Engine.DIRECTIONS.NW), (Engine.DIRECTIONS.SE), (Engine.DIRECTIONS.SW)]
  ];


  /**
  * WHETHER A PIECE IS A SLIDER OR NOT (I.E. WHETHER IT CAN GO MORE THAN 1-STEP)
  * can be accessed using the the piece value (excl. black pawn). i.e. knight = 2 = MOVES_LIST[2]
  */
  static SLIDERS = [
    /* black pawn */ false,
    /* white pawn */ false,
    /*     knight */ false,
    /*     bishop */ true,
    /*       rook */ true,
    /*      queen */ true,
    /*       king */ false
  ];


  /**
   * ENCODES THE MOVE INFORMATION ENCODED INTO A 32UInt
   */
  static encodeMoveData(enpassant: number, doublepush: number, castle: number, capture: number, promotion: number, from: number, to: number) {
    return (enpassant << 30) | (doublepush << 29) | (castle << 27) | (capture << 19) | (promotion << 16) | (from << 8) | (to);
  }

  /**
   * DECODES MOVE INFORMATION INTO AN OBJECT
   */
  static decodeMoveData(move: number) {
    // TODO: output as an array for faster access: [ castle, capture, promotion, from, to]
    //                                  e.g usage: const [ , , promotion, from, to] = decodeMoveData(m);
    return {
      enpassant: (move & Engine.MV.EN_PASSANT),
      doublePush: (move & Engine.MV.DOUBLE_PUSH),
      castle: (move & Engine.MV.CASTLE),
      capture: (move & Engine.MV.PC_CAPTURE) >> 19,
      promotion: (move & Engine.MV.PC_PROMOTE) >> 16,
      from: (move & Engine.MV.SQ_FROM) >> 8,
      to: (move & Engine.MV.SQ_TO),
    };
  }

  /**
   * CONVERTS A MOVE TO *BASIC* CHESS NOTATION
   */
  static convertMoveToNotation(move: number, squareFrom: number) {
    let notation = "";

    const { castle, capture, promotion, from, to } = Engine.decodeMoveData(move);
    
    if (castle === Engine.MV.QS_CASTLE) {
      return "O-O-O";
    }
    if (castle === Engine.MV.KS_CASTLE) {
      return "O-O";
    }
    
    const { piece: pieceFrom } = ChessBoard.decodeSquare(squareFrom);

    // pawn push -> 'e4'
    // pawn capture -> 'exd4'
    // piece move -> 'Nf6'
    // piece capture -> 'Nxf6'
    // check -> 'Qc8+'
    // checkmate -> 'Qc8#'

    return notation;
  }

  /**
   * PSEUDO-LEGAL MOVE GENERATOR
   */
  generatePseudoMoves() {
    const pseudoMoves = new Uint32Array(218); // to store each move's data. can only be <= 218 moves in a chess position. set array size for better performance vs .push()
    let pmIdx = 0; // current index to store pseudo move

    for (let i = 0; i < 64; i++) {
      const from = ChessBoard.mailbox64[i];  // get the mailbox index for the padded board
      const squareFrom = this.chessboard.board[from]; // get the encoded square information
      const colourFrom = squareFrom & ChessBoard.SQ.b;  // check the piece colour only
      let pieceFrom = squareFrom & ChessBoard.SQ.pc; // check the piece type only
      let to; // index for where the move will be to
      let squareTo; // encoded square information for square to
      let offset; // the amount to change direction (e.g. -10 for South, +1 for East, etc.)

      if (squareFrom === ChessBoard.SQ.EMPTY) continue;  // skip if no piece on square
      if (colourFrom !== this.chessboard.turn) continue; // skip if piece is not for current turn

      if ((pieceFrom === ChessBoard.SQ.P) && (colourFrom === ChessBoard.SQ.b)) pieceFrom -= 1; // use 0 as piece value for black pawn (e.g. to access MOVES_LIST[0] instead of MOVES_LIST[1])

      for (let j = 0; j < Engine.MOVES_LIST[pieceFrom].length; j++) { // iterate through the piece's possible move directions
        const offset = Engine.MOVES_LIST[pieceFrom][j];  // the direction to move
        to = from + offset; // the new square index to move to

        while (true) { // infinite loop until a break is hit. i.e. edge of board, capture, or piece isn't 'slider'
          squareTo = this.chessboard.board[to];
          const pieceTo = squareTo & ChessBoard.SQ.pc;
          if (squareTo === ChessBoard.SQ.EDGE) break; // off edge of board
          if (pieceTo !== 0) {
            if (((squareTo & ChessBoard.SQ.b) === this.chessboard.turn) || (pieceFrom === ChessBoard.SQ.P)) break; // occupied by same colour piece, or if piece moving is pawn (blocked by any forward pieces)
            pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, 0, pieceTo, 0, from, to);
          } else {
            if ((pieceFrom === ChessBoard.SQ.P) && !(to >= 31 && to <= 88)) { // pawn on final rank -> promote
              const promotions = [ChessBoard.SQ.N, ChessBoard.SQ.B, ChessBoard.SQ.R, ChessBoard.SQ.Q];
              for (let k = 0; k < 4; k++, pmIdx++) {
                pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, 0, 0, promotions[k], from, to);
              }
              pmIdx--; // remove extra iteration from loop, as it is done universally later on
            } else {
              pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, 0, 0, 0, from, to);
            }
          }
          pmIdx++;
          if (Engine.SLIDERS[pieceFrom] === false) break;  // it shouldn't progress more than 1 step in any direction if it isn't a slider piece
          to += offset; // increment next step
        }
        if (pieceFrom === ChessBoard.SQ.P) break; // only the single push is used here, the 'special' moves are calculated next
      }

      // SPECIAL PAWN MOVES
      if (pieceFrom === ChessBoard.SQ.P) {
        // double push
        if ((squareFrom & ChessBoard.SQ.m) === 0) {  // piece hasn't moved
          offset = Engine.MOVES_LIST[pieceFrom][1];
          to = from + offset;
          squareTo = this.chessboard.board[to];
          const firstSquare = this.chessboard.board[from + Engine.MOVES_LIST[pieceFrom][0]];  // first square in double push
          if ((squareTo === ChessBoard.SQ.EMPTY) && (firstSquare === ChessBoard.SQ.EMPTY)) {  // check both squares are empty
            pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 1, 0, 0, 0, from, to);
            pmIdx++;
          }
        }

        // diagonal captures (incl. en passant)
        for (let j = 2; j <= 3; j++) {
          offset = Engine.MOVES_LIST[pieceFrom][j];
          to = from + offset;
          squareTo = this.chessboard.board[to];
          if (squareTo === ChessBoard.SQ.EDGE) continue;
          // enpassant
          if ((squareTo !== ChessBoard.SQ.EMPTY) && (to === this.chessboard.enpassant)) {
            pseudoMoves[pmIdx] = Engine.encodeMoveData(1, 0, 0, squareTo & ChessBoard.SQ.pc, 0, from, to);
            pmIdx++;
            continue;
          }
          // normal capture
          if ((squareTo !== ChessBoard.SQ.EMPTY)) {
            if (to >= 31 && to <= 88) { // if not last rank
              pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, 0, squareTo & ChessBoard.SQ.pc, 0, from, to);
              pmIdx++;
            } else {
              // else, final rank, so promote
              const promotions = [ChessBoard.SQ.N, ChessBoard.SQ.B, ChessBoard.SQ.R, ChessBoard.SQ.Q];
              for (let k = 0; k < 4; k++, pmIdx++) {
                pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, 0, 0, promotions[k], from, to);
              }
            }
          }
        }
      }

      // CASTLING
      if ((pieceFrom === ChessBoard.SQ.K) && (squareFrom !== ChessBoard.SQ.m)) { // ensure king hasn't moved
        const squareRookKing = this.chessboard.board[from + (3 * Engine.DIRECTIONS.E)]; // kingside rook square
        const squareRookQueen = this.chessboard.board[from + (4 * Engine.DIRECTIONS.W)];  // queenside rook square

        // Kingside - Check if rook is on starting square and hasn't moved
        if (((squareRookKing & ChessBoard.SQ.pc) === ChessBoard.SQ.R) && (squareRookKing & ChessBoard.SQ.m) === 0) {
          let kingCanCastle = true;
          // Ensure squares are empty between king and rook
          for (let k = 1; k <= 2; k++) {
            if (this.chessboard.board[from + (k * Engine.DIRECTIONS.E)] !== ChessBoard.SQ.EMPTY) {
              kingCanCastle = false;
              break;
            }
          }
          if (kingCanCastle === true) {
            pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, Engine.MV.KS_CASTLE, 0, 0, from, from + (2 * Engine.DIRECTIONS.E));
            pmIdx++;
          }
        }
        // Queenside
        if (((squareRookQueen & ChessBoard.SQ.pc) === ChessBoard.SQ.R) && (squareRookQueen & ChessBoard.SQ.m) === 0) {
          let kingCanCastle = true;
          for (let k = 1; k <= 3; k++) {
            if (this.chessboard.board[from + (k * Engine.DIRECTIONS.W)] !== ChessBoard.SQ.EMPTY) {
              kingCanCastle = false;
              break;
            }
          }
          if (kingCanCastle === true) {
            pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, Engine.MV.QS_CASTLE, 0, 0, from, from + (2 * Engine.DIRECTIONS.W));
            pmIdx++;
          }
        }
      }
    }

    return pseudoMoves;
  }

  /**
   * VALIDATES WHETHER KING IS IN CHECK
   * checks against the specified colour and finds the king
   * then, searches each direction in reverse (i.e. from the king's origin), until a piece is found
   * if the piece is an attack (e.g. opposite bishop on diagonal, opposite rook on rank/file), then king is in check
   */
  kingIsInCheck(colour: number) {
    let kingInCheck = false;

    for (let i = 0; i < 64; i++) {
      const from = ChessBoard.mailbox64[i];
      const squareFrom = this.chessboard.board[from];
      const pieceFrom = squareFrom & ChessBoard.SQ.pc;
      const colourFrom = squareFrom & ChessBoard.SQ.b;

      if ((squareFrom === ChessBoard.SQ.EMPTY) || !((pieceFrom === ChessBoard.SQ.K) && (colourFrom === colour))) continue; // If empty, or not King in specified colour, skip square
      let offset;
      let to;
      let squareTo;
      let pieceTo;
      let colourTo;

      let moves = Engine.MOVES_LIST[pieceFrom]; // store all king move directions
      for (let j = 0; j < moves.length; j++) {
        if (kingInCheck === true) return kingInCheck;  // don't continue searching if king is already found to be in check
        offset = moves[j];
        to = from + offset;
        while (true) {
          squareTo = this.chessboard.board[to];
          pieceTo = squareTo & ChessBoard.SQ.pc;
          colourTo = squareTo & ChessBoard.SQ.b;
          if (squareTo == ChessBoard.SQ.EMPTY) {  // skip square if empty
            to += offset;
            continue;
          }
          if ((colourTo === colour) || (squareTo === ChessBoard.SQ.EDGE)) break; // if same colour piece or edge of board, not under attack in the specified direction
          // if Rook or Queen, on same rank or file
          if (((pieceTo === ChessBoard.SQ.R) || (pieceTo === ChessBoard.SQ.Q)) && ((offset === Engine.DIRECTIONS.N) || (offset === Engine.DIRECTIONS.S) || (offset === Engine.DIRECTIONS.E) || (offset === Engine.DIRECTIONS.W))) {
            kingInCheck = true;
          }
          // if Bishop or Queen, on same diagonal
          if (((pieceTo === ChessBoard.SQ.B) || (pieceTo === ChessBoard.SQ.Q)) && ((offset === Engine.DIRECTIONS.NE) || (offset === Engine.DIRECTIONS.SE) || (offset === Engine.DIRECTIONS.NW) || (offset === Engine.DIRECTIONS.SW))) {
            kingInCheck = true;
          }
          to += offset; // check next square
        }
      }

      const pawn = colour === ChessBoard.SQ.b ? 0 : 1;
      const pawnMoves = Engine.MOVES_LIST[pawn];
      // East - pawn capture
      offset = pawnMoves[2];
      to = from + offset;
      squareTo = this.chessboard.board[to];
      colourTo = squareTo & ChessBoard.SQ.b;
      pieceTo = squareTo & ChessBoard.SQ.pc;
      if ((colourTo !== colour) && (pieceTo === ChessBoard.SQ.P)) {
        kingInCheck = true;
        return kingInCheck;
      }
      // West - pawn capture
      offset = pawnMoves[3];
      to = from + offset;
      squareTo = this.chessboard.board[to];
      colourTo = squareTo & ChessBoard.SQ.b;
      pieceTo = squareTo & ChessBoard.SQ.pc;
      if ((colourTo !== colour) && (pieceTo === ChessBoard.SQ.P)) {
        kingInCheck = true;
        return kingInCheck;
      }

      //KNIGHT moves
      moves = Engine.MOVES_LIST[ChessBoard.SQ.N];
      for (let j = 0; j < moves.length; j++) {
        offset = moves[j];
        to = from + offset;
        squareTo = this.chessboard.board[to];
        colourTo = squareTo & ChessBoard.SQ.b;
        pieceTo = squareTo & ChessBoard.SQ.pc;
        if ((colourTo !== colour) && (pieceTo === ChessBoard.SQ.N)) {
          kingInCheck = true;
          return kingInCheck;
        }
      }

      return kingInCheck;
    }
  }

  /**
   * EVALUATE/SCORE POSITION
   * returns a score *relative* to the current turn (i.e. if white is winning, but it's black's turn, a -ve will be returned)
   */
  SCORES = {
    [ChessBoard.SQ.P]: 1,
    [ChessBoard.SQ.N]: 2.8,
    [ChessBoard.SQ.B]: 3,
    [ChessBoard.SQ.R]: 5,
    [ChessBoard.SQ.Q]: 8.5,
    [ChessBoard.SQ.K]: 99999,
  };
  evaluatePosition() {
    const wOffset = 1;
    const bOffset = -1;
    const toMove = this.chessboard.turn === ChessBoard.SQ.w ? wOffset : bOffset;

    const materialScores = {
      [ChessBoard.SQ.P]: 0,
      [ChessBoard.SQ.N]: 0,
      [ChessBoard.SQ.B]: 0,
      [ChessBoard.SQ.R]: 0,
      [ChessBoard.SQ.Q]: 0,
      [ChessBoard.SQ.K]: 0,
    };
    for (let i = 0; i < 64; i++) {
      const from = ChessBoard.mailbox64[i];
      const square = this.chessboard.board[from];
      const piece = square & ChessBoard.SQ.pc;
      const colour = square & ChessBoard.SQ.b;
      if (piece === ChessBoard.SQ.EMPTY) continue;
      const colourOffset = colour === ChessBoard.SQ.w ? wOffset : bOffset;
      materialScores[piece] += colourOffset;
    }

    let materialScore = 0;
    for (const piece in materialScores) {
      materialScore += (materialScores[piece] * this.SCORES[piece]);
    }

    return materialScore * toMove;
  }


  /**
   * MAKE MOVE ()
   */
  makeMove(move: number) {
    // Store information that isn't encoded in the current move
    const boardState = [
      new Int8Array(this.chessboard.castle),
      this.chessboard.enpassant,
      this.chessboard.halfmove,
      this.chessboard.fullmove,
      move
    ];

    const { enpassant, doublePush, castle, capture, promotion, from, to } = Engine.decodeMoveData(move);

    // en passant
    if (enpassant === Engine.MV.EN_PASSANT) {
      // remove pawn necessary next to enpassant square (+1 row for white capturing, -1 row for black capturing)
      if (this.chessboard.enpassant >= 41 && this.chessboard.enpassant <= 48) {
        this.chessboard.board[to + 10] = ChessBoard.SQ.EMPTY;
      } else if (this.chessboard.enpassant >= 61 && this.chessboard.enpassant <= 68) {
        this.chessboard.board[to - 10] = ChessBoard.SQ.EMPTY;
      }
    }

    // Update En Passant square (if double pawn push)
    if (doublePush === Engine.MV.DOUBLE_PUSH) {
      this.chessboard.enpassant = to - 10;
    } else {
      this.chessboard.enpassant = -1;
    }

    const pieceFrom = this.chessboard.board[from] & ChessBoard.SQ.pc;

    // UPDATE halfmove clock
    if ((pieceFrom === ChessBoard.SQ.P) || capture !== 0) {
      // if pawn move or capture, reset to 0
      this.chessboard.halfmove = 0;
    } else {
      // else, increment
      this.chessboard.halfmove += 1;
    }

    // UPDATE fullmove clock, if black is making turn
    if (this.chessboard.turn === ChessBoard.SQ.b) this.chessboard.fullmove += 1;

    // MOVE PIECE (and set flag to 'has moved', and restore piece colour)
    this.chessboard.board[to] = this.chessboard.board[from] | ChessBoard.SQ.m | this.chessboard.turn;

    // IF ROOK, update relevant castle rights
    if (pieceFrom === ChessBoard.SQ.R) {
      if (this.chessboard.turn === ChessBoard.SQ.w) {
        if (from === 98) this.chessboard.castle[0] = 0;
        if (from === 91) this.chessboard.castle[1] = 0;
      } else {
        if (from === 21) this.chessboard.castle[2] = 0;
        if (from === 28) this.chessboard.castle[3] = 0;
      }
    }

    // IF KING, also remove 'can castle' flag
    if (pieceFrom === ChessBoard.SQ.K) {
      this.chessboard.board[to] &= ~ChessBoard.SQ.c;

      // and update stored castling rights
      if (this.chessboard.turn === ChessBoard.SQ.w) {
        this.chessboard.castle[0] = 0;
        this.chessboard.castle[1] = 0;
      } else {
        this.chessboard.castle[2] = 0;
        this.chessboard.castle[3] = 0;
      }
    }

    // MOVE rook if castle
    if (castle === Engine.MV.KS_CASTLE) {
      this.chessboard.board[from + 3] = ChessBoard.SQ.EMPTY;
      this.chessboard.board[from + 1] = ChessBoard.SQ.R | this.chessboard.turn | ChessBoard.SQ.m;
    } else if (castle === Engine.MV.QS_CASTLE) {
      this.chessboard.board[from - 4] = ChessBoard.SQ.EMPTY;
      this.chessboard.board[from - 1] = ChessBoard.SQ.R | this.chessboard.turn | ChessBoard.SQ.m;
    }

    // PROMOTE to new piece if possible
    if (promotion !== 0) {
      this.chessboard.board[to] &= ~ChessBoard.SQ.pc;
      this.chessboard.board[to] &= promotion;
    }

    // CLEAR the square from
    this.chessboard.board[from] = ChessBoard.SQ.EMPTY;

    // CHANGE turn
    this.chessboard.turn = this.chessboard.turn === ChessBoard.SQ.w ? ChessBoard.SQ.b : ChessBoard.SQ.w;

    // PUSH previous board state to stack
    this.history.push(boardState);
  }

  /**
   * TODO: UNMAKE MOVE ()
   */
  unmakeMove() {
    // RESET to previous board state
    const [prevCastle, prevEnPassant, prevHalfmove, prevFullmove, move] = this.history.pop();
    this.chessboard.castle = prevCastle;
    this.chessboard.enpassant = prevEnPassant;
    this.chessboard.halfmove = prevHalfmove;
    this.chessboard.fullmove = prevFullmove;

    const { enpassant, doublePush, castle, capture, promotion, from, to } = Engine.decodeMoveData(move);


    // 1. set 'from' square back to 'board[to]' (restores moved piece)
    this.chessboard.board[from] = this.chessboard.board[to];
    // 2. set 'to' square to 'capture' (restores any existing piece)
    if (from === enpassant) {
      // restore en passant capture
      if (enpassant >= 41 && enpassant <= 48) {
        this.chessboard.board[to + 10] = capture;
      } else if (this.chessboard.enpassant >= 61 && this.chessboard.enpassant <= 68) {
        this.chessboard.board[to - 10] = capture;
      }
      this.chessboard.board[to] = ChessBoard.SQ.EMPTY;
    } else {
      this.chessboard.board[to] = capture;
    }

    // MOVE rook and king back if castled
    if (castle === Engine.MV.KS_CASTLE) {
      this.chessboard.board[from + 3] = this.chessboard.board[from + 1] & ~ChessBoard.SQ.m; // return rook to position
      this.chessboard.board[from] |= ChessBoard.SQ.c;  // return king state to 'can castle'
      this.chessboard.board[from] &= ~ChessBoard.SQ.m;  // return king state to 'unmoved'
      this.chessboard.board[to] = ChessBoard.SQ.EMPTY; 
      this.chessboard.board[from + 1] = ChessBoard.SQ.EMPTY;
    } else if (castle === Engine.MV.QS_CASTLE) {
      this.chessboard.board[from - 4] = this.chessboard.board[from - 1] & ~ChessBoard.SQ.m; // return rook to position
      this.chessboard.board[from] |= ChessBoard.SQ.c;  // return king state to 'can castle'
      this.chessboard.board[from] &= ~ChessBoard.SQ.m;  // return king state to 'unmoved'
      this.chessboard.board[to] = ChessBoard.SQ.EMPTY; 
      this.chessboard.board[from - 1] = ChessBoard.SQ.EMPTY; 
    }

    // 3. if promotion, set 'from' back to pawn (& ~pc | P)
    if (promotion !== 0) {
      this.chessboard.board[from] &= ~ChessBoard.SQ.pc;
      this.chessboard.board[from] |= ChessBoard.SQ.P;
    }
    // 4. flip turn
    this.chessboard.turn = this.chessboard.turn === ChessBoard.SQ.w ? ChessBoard.SQ.b : ChessBoard.SQ.w;
  }

  /**
   * TODO: PERFT FUNCTION +++ UNIT TESTS
   */
  perft(depth: number) {
    if(depth === 0) return 1;

    let nodes = 0;

    const moves = this.generatePseudoMoves();

    for(let i=0; i<=218; i++) {
      if(moves[i] === 0) break;
      this.makeMove(moves[i]);
      if (!this.kingIsInCheck(this.chessboard.turn)) {
        nodes += this.perft(depth - 1);
      }
      this.unmakeMove();
      console.log(nodes);
    }

    return nodes;
  }

}

// const engine = new Engine();
// const perft = engine.perft(2);
// console.log(perft);

const engine = new Engine();
// engine.chessboard.printBoard();

const moves = engine.generatePseudoMoves();
const move = moves[0];
console.log(Engine.convertMoveToNotation(move));
// engine.makeMove(move);
// engine.chessboard.printBoard();