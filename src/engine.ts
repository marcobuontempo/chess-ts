import ChessBoard from "./board";

export default class Engine {
  chessboard: ChessBoard;

  constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    this.chessboard = new ChessBoard(fen);
  }

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
   * 
   *   | U  | K  | C  |  P |    T    |    F   |
   * 0b 0000_0000_0000_0000_0000_0000_0000_0000
   * 
   * (U)NUSED: spare bits
   * (K)ING CASTLE: the king has castled (1 - Kingside, 2 - Queenside)
   * (C)APTURE: the piece capture value (i.e. ChessBoard.SQ.P, ChessBoard.SQ.N, etc.)
   * (P)ROMOTION: the piece to promote to (ChessBoard.SQ.N, B, R or Q)
   * (T)O: 10x12 index of square to move to
   * (F)ROM: 10x12 index of square to move from
   */
  static encodeMoveData(castle: number, capture: number, promotion: number, from: number, to: number) {
    return (castle << 24) | (capture << 20) | (promotion << 16) | (from << 8) | (to);
  }

  /**
   * DECODES MOVE INFORMATION INTO AN OBJECT
   */
  static decodeMoveData(move: number) {
    return {
      castle: (move & 0b0000_1111_0000_0000_0000_0000_0000_0000) >> 24,
      capture: (move & 0b0000_0000_1111_0000_0000_0000_0000_0000) >> 20,
      promotion: (move & 0b0000_0000_0000_1111_0000_0000_0000_0000) >> 16,
      from: (move & 0b0000_0000_0000_0000_1111_1111_0000_0000) >> 8,
      to: (move & 0b0000_0000_0000_0000_0000_0000_1111_1111),
    };
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
            pseudoMoves[pmIdx] = Engine.encodeMoveData(0, pieceTo, 0, from, to);
          } else {
            if ((pieceFrom === ChessBoard.SQ.P) && !(to >= 31 && to <= 88)) { // pawn on final rank -> promote
              const promotions = [ChessBoard.SQ.N, ChessBoard.SQ.B, ChessBoard.SQ.R, ChessBoard.SQ.Q];
              for (let k = 0; k < 4; k++, pmIdx++) {
                pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, promotions[k], from, to);
              }
              pmIdx--; // remove extra iteration from loop, as it is done universally later on
            } else {
              pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, 0, from, to);
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
            pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, 0, from, to);
            pmIdx++;
          }
        }

        // diagonal captures (incl. en passant)
        for (let j = 2; j <= 3; j++) {
          offset = Engine.MOVES_LIST[pieceFrom][j];
          to = from + offset;
          squareTo = this.chessboard.board[to];
          if (squareTo === ChessBoard.SQ.EDGE) continue;
          if ((squareTo !== ChessBoard.SQ.EMPTY) || (to === this.chessboard.enpassant)) {
            if (to >= 31 && to <= 88) { // if not last rank
              pseudoMoves[pmIdx] = Engine.encodeMoveData(0, squareTo & ChessBoard.SQ.pc, 0, from, to);
              pmIdx++;
            } else {
              // else, final rank, so promote
              const promotions = [ChessBoard.SQ.N, ChessBoard.SQ.B, ChessBoard.SQ.R, ChessBoard.SQ.Q];
              for (let k = 0; k < 4; k++, pmIdx++) {
                pseudoMoves[pmIdx] = Engine.encodeMoveData(0, 0, promotions[k], from, to);
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
            pseudoMoves[pmIdx] = Engine.encodeMoveData(1, 0, 0, from, from + (2 * Engine.DIRECTIONS.E));
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
            pseudoMoves[pmIdx] = Engine.encodeMoveData(2, 0, 0, from, from + (2 * Engine.DIRECTIONS.W));
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
      let kingInCheck = false;

      const moves = Engine.MOVES_LIST[pieceFrom]; // store all king move directions
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

      return kingInCheck;
    }
  }

  /**
   * TODO: EVALUATE/SCORE POSITION
   * include king is in check logic here ? (maybe, simply check if score -100000, where king is taken, for example)
   * else, use 2 bitboards to store each king's position. then do a search NESW on king. if Q found any, bishop diagonal, rook straight, pawn diagonal, or knight 'L', then king is in check and is invalid
   */
  evaluatePosition() {
    return;
  }


  /**
   * TODO: MAKE MOVE ()
   */

  /**
   * TODO: UNMAKE MOVE ()
   */

  /**
   * TODO: PERFT FUNCTION +++ UNIT TESTS
   */
}

const test = new Engine();
test.chessboard.printBoard("unicode");
console.log(ChessBoard.decodeSquare(84));


// const moves = test.generatePseudoMoves();
// moves.forEach(move => {
//   if (move === 0) return;
//   console.log(Engine.decodeMoveData(move));
// });

