import ChessBoard from "./board";

export default class Engine {
  chessboard: ChessBoard;

  constructor(fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
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
   * STORES THE MOVE INFORMATION ENCODED INTO A 32UInt
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
    let move = (castle << 24) | (capture << 20) | (promotion << 16) | (from << 8) | (to);
    return move;
  }


  /**
   * PSEUDO-LEGAL MOVE GENERATOR
   */
  generateMoves() {
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
          offset = Engine.MOVES_LIST[pieceFrom][1]
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
      if ((pieceFrom === ChessBoard.SQ.K) && (squareFrom !== ChessBoard.SQ.m)) { // check king hasn't moved
        if (colourFrom === ChessBoard.SQ.w) { // white
          const squareRookKing = this.chessboard.board[98]; // kingside Rook
          const squareRookQueen = this.chessboard.board[91];  // queenside Rook
          // Check if rook is on starting square and hasn't moved
          if (((squareRookKing & ChessBoard.SQ.pc) === ChessBoard.SQ.R) && (squareRookKing & ChessBoard.SQ.m)) Engine.encodeMoveData(1, 0, 0, from, from + 2 * (Engine.DIRECTIONS.E));
          if (((squareRookQueen & ChessBoard.SQ.pc) === ChessBoard.SQ.R) && (squareRookQueen & ChessBoard.SQ.m)) Engine.encodeMoveData(1, 0, 0, from, from + 2 * (Engine.DIRECTIONS.W));
        } else {  // black  
          const squareRookKing = this.chessboard.board[28]; // kingside Rook
          const squareRookQueen = this.chessboard.board[21];  // queenside Rook
          // Check if rook is on starting square and hasn't moved
          if (((squareRookKing & ChessBoard.SQ.pc) === ChessBoard.SQ.R) && (squareRookKing & ChessBoard.SQ.m)) Engine.encodeMoveData(1, 0, 0, from, from + 2 * (Engine.DIRECTIONS.E));
          if (((squareRookQueen & ChessBoard.SQ.pc) === ChessBoard.SQ.R) && (squareRookQueen & ChessBoard.SQ.m)) Engine.encodeMoveData(1, 0, 0, from, from + 2 * (Engine.DIRECTIONS.W));
        }
      }
    }

    return pseudoMoves;
  }
}

const test = new Engine("R7/8/8/8/8/8/8 w - - 0 1");
test.chessboard.printBoard("unicode");
const moves = test.generateMoves();