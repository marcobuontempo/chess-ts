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
  static NESW = {
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
  * can be accessed using the the piece value (excl. black pawn). i.e. knight = 2 = MOVES_LIST[2]
  */
  static MOVES_LIST = [
    /* black pawn */[(Engine.NESW.S), (Engine.NESW.S + Engine.NESW.S), (Engine.NESW.SE), (Engine.NESW.SW)],
    /* white pawn */[(Engine.NESW.N), (Engine.NESW.N + Engine.NESW.N), (Engine.NESW.NE), (Engine.NESW.NW)],
    /*     knight */[(Engine.NESW.N + Engine.NESW.NE), (Engine.NESW.N + Engine.NESW.NW), (Engine.NESW.E + Engine.NESW.NE), (Engine.NESW.E + Engine.NESW.SE), (Engine.NESW.S + Engine.NESW.SE), (Engine.NESW.S + Engine.NESW.SW), (Engine.NESW.W + Engine.NESW.NW), (Engine.NESW.W + Engine.NESW.SW)],
    /*     bishop */[(Engine.NESW.NE), (Engine.NESW.NW), (Engine.NESW.SE), (Engine.NESW.SW)],
    /*       rook */[(Engine.NESW.N), (Engine.NESW.S), (Engine.NESW.E), (Engine.NESW.W)],
    /*      queen */[(Engine.NESW.N), (Engine.NESW.S), (Engine.NESW.E), (Engine.NESW.W), (Engine.NESW.NE), (Engine.NESW.NW), (Engine.NESW.SE), (Engine.NESW.SW)],
    /*       king */[(Engine.NESW.N), (Engine.NESW.S), (Engine.NESW.E), (Engine.NESW.W), (Engine.NESW.NE), (Engine.NESW.NW), (Engine.NESW.SE), (Engine.NESW.SW)]
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
   * PSEUDO-LEGAL MOVE GENERATOR
   */
  generateMoves() {
    for (let i = 0; i < 64; i++) {
      const mb = ChessBoard.mailbox64[i];  // get the mailbox index for the padded board
      const from = this.chessboard.board[mb];
      const piece = from & 0b0000_0111; // check the piece type only
      const colour = from & 0b0001_0000;  // check the piece colour only

      if (piece !== 0 && colour === this.chessboard.turn) {
        if (piece == ChessBoard.SQ.P) {
          // TODO: SPECIAL PAWN MOVE GENERATION
          continue;
        } else {
          for (let j = 0; j < Engine.MOVES_LIST[piece].length; j++) { // iterate through the piece's possible move directions
            const offset = Engine.MOVES_LIST[piece][j];  // the direction to move
            while (true) { // infinite loop until a break is hit. i.e. edge of board, capture, etc.
              const to = this.chessboard.board[mb + offset]; // the new square to move to
              if (to === -1) break; // off edge of board
              if ((to & 0b0000_0111) !== 0 && (to & 0b0001_0000) === this.chessboard.turn) break; // occupied by same colour piece
              // TODO: ADD MOVE TO STACK
              if (Engine.SLIDERS[piece] === false) break;  // it shouldn't progress more than 1 step in any direction if it isn't a slider piece
            }
          }
        }
      }
    }
  }
  
}

const test = new Engine();
test.chessboard.printBoard("unicode");
// test.generateMoves();
