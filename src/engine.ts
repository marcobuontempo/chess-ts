import { MOVES_LIST, SLIDERS, SQ, mailbox64, padBoard } from "./board";

/**
 * THE INITIAL CHESS POSITION
 */
const INITIAL_BOARD = new Int8Array([
  (SQ.b | SQ.R), (SQ.b | SQ.N), (SQ.b | SQ.B), (SQ.b | SQ.Q), (SQ.b | SQ.K | SQ.c), (SQ.b | SQ.B), (SQ.b | SQ.N), (SQ.b | SQ.R),
  (SQ.b | SQ.P), (SQ.b | SQ.P), (SQ.b | SQ.P), (SQ.b | SQ.P), (SQ.b | SQ.P), (SQ.b | SQ.P), (SQ.b | SQ.P), (SQ.b | SQ.P),
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  (SQ.w | SQ.P), (SQ.w | SQ.P), (SQ.w | SQ.P), (SQ.w | SQ.P), (SQ.w | SQ.P), (SQ.w | SQ.P), (SQ.w | SQ.P), (SQ.w | SQ.P),
  (SQ.w | SQ.R), (SQ.w | SQ.N), (SQ.w | SQ.B), (SQ.w | SQ.Q), (SQ.w | SQ.K | SQ.c), (SQ.w | SQ.B), (SQ.w | SQ.N), (SQ.w | SQ.R)
]);



export class Engine {
  board: Int8Array;
  currentTurn: number;
  enpassant: number;

  constructor() {
    this.board = padBoard(INITIAL_BOARD);
    this.currentTurn = SQ.w;
    this.enpassant = 0;
  }

  // pseudo-legal move generator
  generateMoves() {
    for (let i = 0; i < 64; i++) {
      const mb = mailbox64[i];  // get the mailbox index for the padded board
      const from = this.board[mb];
      const piece = from & 0b0000_0111; // check the piece type only
      const colour = from & 0b0001_0000;  // check the piece colour only

      if (piece !== 0 && colour === this.currentTurn)
        if (piece == SQ.P) {
          // TODO: SPECIAL PAWN MOVE GENERATION
          continue;
        } else {
          for (let j = 0; j < MOVES_LIST[piece].length; j++) { // iterate through the piece's possible move directions
            const offset = MOVES_LIST[piece][j];  // the direction to move
            while (true) { // infinite loop until a break is hit. i.e. edge of board, capture, etc.
              const to = this.board[mb + offset]; // the new square to move to
              if (to === -1) break; // off edge of board
              if ((to & 0b0000_0111) !== 0 && (to & 0b0001_0000) === this.currentTurn) break; // occupied by same colour piece

              // TODO: ADD MOVE TO STACK
              if (SLIDERS[piece] === false) break;  // it shouldn't progress more than 1 step in any direction if it isn't a slider piece
            }
          }
        }
    }
  }
}


const test = new Engine();
test.generateMoves();
