import ChessBoard from "./board";
import { COLOUR_MASK, CURRENT_TURN, DEFAULT_FEN, EDGE, EMPTY, ENPASSANT_SQUARE, MAILBOX64, PIECE_MASK } from "./board-constants";
import { NORTH, SOUTH, EAST, WEST, NORTHEAST, NORTHWEST, SOUTHEAST, SOUTHWEST, SQUARE_TO, SQUARE_FROM, PIECE_PROMOTE, PIECE_CAPTURE, CASTLE, KS_CASTLE, QS_CASTLE, DOUBLE_PUSH, EN_PASSANT, MOVES_LIST, SLIDERS } from "./engine-constants";
import { BISHOP, BLACK, CAN_CASTLE, HAS_MOVED, KING, KNIGHT, PAWN, QUEEN, ROOK, WHITE } from "./piece-constants";

import fs from 'fs';

export default class Engine {
  chessboard: ChessBoard;
  moveHistory = new Uint32Array(3600);

  constructor(fen = DEFAULT_FEN) {
    this.chessboard = new ChessBoard(fen);
  }

  /**
   * ENCODES THE MOVE INFORMATION ENCODED INTO A 32UInt
   */
  static encodeMoveData(enpassant: number, doublepush: number, castle: number, capture: number, promotion: number, from: number, to: number) {
    return (enpassant) | (doublepush) | (castle) | (capture << 19) | (promotion << 16) | (from << 8) | (to);
  }

  /**
   * DECODES MOVE INFORMATION INTO AN OBJECT
   */
  static decodeMoveData(move: number) {
    // TODO: output as an array for faster access: [ castle, capture, promotion, from, to]
    //                                  e.g usage: const [ , , promotion, from, to] = decodeMoveData(m);
    return {
      enpassant: (move & EN_PASSANT),
      doublePush: (move & DOUBLE_PUSH),
      castle: (move & CASTLE),
      capture: (move & PIECE_CAPTURE) >> 19,
      promotion: (move & PIECE_PROMOTE) >> 16,
      from: (move & SQUARE_FROM) >> 8,
      to: (move & SQUARE_TO),
    };
  }

  /**
   * PSEUDO-LEGAL MOVE GENERATOR
   */
  generatePseudoMoves() {
    const pseudoMoves = new Uint32Array(218); // to store each move's data. can only be <= 218 moves in a chess position. set array size for better performance vs .push()
    let pseudoMoveIdx = 0; // current index to store pseudo move

    for (let i = 0; i < 64; i++) {
      const from = MAILBOX64[i];  // get the mailbox index for the padded board
      const squareFrom = this.chessboard.board[from]; // get the encoded square information
      const colourFrom = squareFrom & COLOUR_MASK;  // check the piece colour only
      const pieceFrom = squareFrom & PIECE_MASK; // check the piece type only
      let pieceIdx = pieceFrom; // used to access the piece's index reference for MOVES_LIST, SLIDERS, etc.
      let to; // index for where the move will be to
      let squareTo; // encoded square information for square to
      let offset; // the amount to change direction (e.g. -10 for South, +1 for East, etc.)

      const currentTurn = (this.chessboard.boardstates[this.chessboard.ply] & CURRENT_TURN);
      const enPassantSquare = (this.chessboard.boardstates[this.chessboard.ply] & ENPASSANT_SQUARE) >> 8;

      if (squareFrom === EMPTY) continue;  // skip if no piece on square
      if (colourFrom !== currentTurn) continue; // skip if piece is not for current turn

      if ((pieceFrom === PAWN) && (colourFrom === BLACK)) pieceIdx -= 1; // use 0 as piece value for black pawn (e.g. to access MOVES_LIST[0] instead of MOVES_LIST[1])

      for (let j = 0; j < MOVES_LIST[pieceIdx].length; j++) { // iterate through the piece's possible move directions
        const offset = MOVES_LIST[pieceIdx][j];  // the direction to move
        to = from + offset; // the new square index to move to

        while (true) { // infinite loop until a break is hit. i.e. edge of board, capture, or piece isn't 'slider'
          squareTo = this.chessboard.board[to];
          const pieceTo = squareTo & PIECE_MASK;
          if (squareTo === EDGE) break; // off edge of board
          if (squareTo !== EMPTY) {
            if (((squareTo & COLOUR_MASK) === currentTurn) || (pieceFrom === PAWN)) break; // occupied by same colour piece, or if piece moving is pawn (blocked by any forward pieces)
            pseudoMoves[pseudoMoveIdx] = Engine.encodeMoveData(0, 0, 0, squareTo, 0, from, to);
            pseudoMoveIdx++;
            break;
          } else {
            if ((pieceFrom === PAWN) && !(to >= 31 && to <= 88)) { // pawn on final rank -> promote
              const promotions = [KNIGHT, BISHOP, ROOK, QUEEN];
              for (let k = 0; k < 4; k++, pseudoMoveIdx++) {
                pseudoMoves[pseudoMoveIdx] = Engine.encodeMoveData(0, 0, 0, 0, promotions[k], from, to);
              }
              pseudoMoveIdx--; // remove extra iteration from loop, as it is done universally later on
            } else {
              pseudoMoves[pseudoMoveIdx] = Engine.encodeMoveData(0, 0, 0, 0, 0, from, to);
            }
          }
          pseudoMoveIdx++;
          if (SLIDERS[pieceIdx] === false) break;  // it shouldn't progress more than 1 step in any direction if it isn't a slider piece
          to += offset; // increment next step
        }
        if (pieceFrom === PAWN) break; // only the single push is used here, the 'special' moves are calculated next
      }

      // SPECIAL PAWN MOVES
      if (pieceFrom === PAWN) {
        // double push
        if ((squareFrom & HAS_MOVED) === 0) {  // piece hasn't moved
          offset = MOVES_LIST[pieceIdx][1];
          to = from + offset;
          squareTo = this.chessboard.board[to];
          const firstSquare = this.chessboard.board[from + MOVES_LIST[pieceIdx][0]];  // first square in double push
          if ((squareTo === EMPTY) && (firstSquare === EMPTY)) {  // check both squares are empty
            pseudoMoves[pseudoMoveIdx] = Engine.encodeMoveData(0, DOUBLE_PUSH, 0, 0, 0, from, to);
            pseudoMoveIdx++;
          }
        }

        // diagonal captures (incl. en passant)
        for (let j = 2; j <= 3; j++) {
          offset = MOVES_LIST[pieceIdx][j];
          to = from + offset;
          squareTo = this.chessboard.board[to];
          if (squareTo === EDGE) continue;
          // enpassant
          if ((squareTo === EMPTY) && (to === enPassantSquare)) {
            const epPawn = this.chessboard.board[to + (-1 * MOVES_LIST[pieceIdx][0])];
            pseudoMoves[pseudoMoveIdx] = Engine.encodeMoveData(EN_PASSANT, 0, 0, epPawn, 0, from, to);
            pseudoMoveIdx++;
            continue;
          }
          // normal capture
          if ((squareTo !== EMPTY) && ((squareTo & COLOUR_MASK) !== colourFrom)) {
            if (to >= 31 && to <= 88) { // if not last rank
              pseudoMoves[pseudoMoveIdx] = Engine.encodeMoveData(0, 0, 0, squareTo, 0, from, to);
              pseudoMoveIdx++;
            } else {
              // else, final rank, so promote
              const promotions = [KNIGHT, BISHOP, ROOK, QUEEN];
              for (let k = 0; k < 4; k++, pseudoMoveIdx++) {
                pseudoMoves[pseudoMoveIdx] = Engine.encodeMoveData(0, 0, 0, 0, promotions[k], from, to);
              }
            }
          }
        }
      }

      // CASTLING
      if ((pieceFrom === KING) && ((squareFrom & HAS_MOVED) === 0)) { // ensure king hasn't moved
        const squareRookKing = this.chessboard.board[from + (3 * EAST)]; // kingside rook square
        const squareRookQueen = this.chessboard.board[from + (4 * WEST)];  // queenside rook square

        // Kingside - Check if rook is on starting square and hasn't moved
        if (((squareRookKing & PIECE_MASK) === ROOK) && (squareRookKing & HAS_MOVED) === 0) { //TODO: redundant to check if rook? since has_moved == 0 already implies
          let kingCanCastle = true;
          // Ensure squares are empty between king and rook
          for (let k = 1; k <= 2; k++) {
            if (this.chessboard.board[from + (k * EAST)] !== EMPTY) {
              kingCanCastle = false;
              break;
            }
          }
          if (kingCanCastle === true) {
            pseudoMoves[pseudoMoveIdx] = Engine.encodeMoveData(0, 0, KS_CASTLE, 0, 0, from, from + (2 * EAST));
            pseudoMoveIdx++;
          }
        }
        // Queenside
        if (((squareRookQueen & PIECE_MASK) === ROOK) && (squareRookQueen & HAS_MOVED) === 0) {
          let kingCanCastle = true;
          for (let k = 1; k <= 3; k++) {
            if (this.chessboard.board[from + (k * WEST)] !== EMPTY) {
              kingCanCastle = false;
              break;
            }
          }
          if (kingCanCastle === true) {
            pseudoMoves[pseudoMoveIdx] = Engine.encodeMoveData(0, 0, QS_CASTLE, 0, 0, from, from + (2 * WEST));
            pseudoMoveIdx++;
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
      const from = MAILBOX64[i];
      const squareFrom = this.chessboard.board[from];
      const pieceFrom = squareFrom & PIECE_MASK;
      const colourFrom = squareFrom & COLOUR_MASK;

      if ((squareFrom === EMPTY) || !((pieceFrom === KING) && (colourFrom === colour))) continue; // If empty, or not King in specified colour, skip square
      let offset;
      let to;
      let squareTo;
      let pieceTo;
      let colourTo;

      let moves = MOVES_LIST[pieceFrom]; // store all king move directions
      for (let j = 0; j < moves.length; j++) {
        if (kingInCheck === true) return kingInCheck;  // don't continue searching if king is already found to be in check
        offset = moves[j];
        to = from + offset;
        while (true) {
          squareTo = this.chessboard.board[to];
          pieceTo = squareTo & PIECE_MASK;
          colourTo = squareTo & COLOUR_MASK;
          if (squareTo == EMPTY) {  // skip square if empty
            to += offset;
            continue;
          }
          if ((colourTo === colour) || (squareTo === EDGE)) break; // if same colour piece or edge of board, not under attack in the specified direction
          // if Rook or Queen, on same rank or file
          if (((pieceTo === ROOK) || (pieceTo === QUEEN)) && ((offset === NORTH) || (offset === SOUTH) || (offset === EAST) || (offset === WEST))) {
            kingInCheck = true;
          }
          // if Bishop or Queen, on same diagonal
          if (((pieceTo === BISHOP) || (pieceTo === QUEEN)) && ((offset === NORTHEAST) || (offset === SOUTHEAST) || (offset === NORTHWEST) || (offset === SOUTHWEST))) {
            kingInCheck = true;
          }
          to += offset; // check next square
        }
      }

      const pawn = colour === BLACK ? 0 : 1;
      const pawnMoves = MOVES_LIST[pawn];
      // East - pawn capture
      offset = pawnMoves[2];
      to = from + offset;
      squareTo = this.chessboard.board[to];
      colourTo = squareTo & COLOUR_MASK;
      pieceTo = squareTo & PIECE_MASK;
      if ((colourTo !== colour) && (pieceTo === PAWN)) {
        kingInCheck = true;
        return kingInCheck;
      }
      // West - pawn capture
      offset = pawnMoves[3];
      to = from + offset;
      squareTo = this.chessboard.board[to];
      colourTo = squareTo & COLOUR_MASK;
      pieceTo = squareTo & PIECE_MASK;
      if ((colourTo !== colour) && (pieceTo === PAWN)) {
        kingInCheck = true;
        return kingInCheck;
      }

      //KNIGHT moves
      moves = MOVES_LIST[KNIGHT];
      for (let j = 0; j < moves.length; j++) {
        offset = moves[j];
        to = from + offset;
        squareTo = this.chessboard.board[to];
        colourTo = squareTo & COLOUR_MASK;
        pieceTo = squareTo & PIECE_MASK;
        if ((colourTo !== colour) && (pieceTo === KNIGHT)) {
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
  private SCORES: { [key: number]: number } = {
    [PAWN]: 1,
    [KNIGHT]: 2.8,
    [BISHOP]: 3,
    [ROOK]: 5,
    [QUEEN]: 8.5,
    [KING]: 99999,
  };
  evaluatePosition() {
    const wOffset = 1;
    const bOffset = -1;
    const currentTurn = (this.chessboard.boardstates[this.chessboard.ply] & CURRENT_TURN);
    const toMove = currentTurn === WHITE ? wOffset : bOffset;

    const materialScores: { [key: number]: number } = {
      [PAWN]: 0,
      [KNIGHT]: 0,
      [BISHOP]: 0,
      [ROOK]: 0,
      [QUEEN]: 0,
      [KING]: 0,
    };
    for (let i = 0; i < 64; i++) {
      const from = MAILBOX64[i];
      const square = this.chessboard.board[from];
      const piece = square & PIECE_MASK;
      const colour = square & COLOUR_MASK;
      if (piece === EMPTY) continue;
      const colourOffset = colour === WHITE ? wOffset : bOffset;
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
    // GET current board state info
    let { castleRights, currentTurn, enPassantSquare, halfmoveCount } = ChessBoard.decodeBoardState(this.chessboard.boardstates[this.chessboard.ply]);

    // GET current move information
    const { enpassant, doublePush, castle, capture, promotion, from, to } = Engine.decodeMoveData(move);
    const squareFrom = this.chessboard.board[from];
    const pieceFrom = squareFrom & PIECE_MASK;
    const colourFrom = squareFrom & COLOUR_MASK;

    // MOVE rook if castle
    if (castle === KS_CASTLE) {
      this.chessboard.board[from + 3] = EMPTY;
      this.chessboard.board[from + 1] = ROOK | currentTurn | HAS_MOVED;
    } else if (castle === QS_CASTLE) {
      this.chessboard.board[from - 4] = EMPTY;
      this.chessboard.board[from - 1] = ROOK | currentTurn | HAS_MOVED;
    }

    // UPDATE move ply
    this.chessboard.ply += 1;


    // en passant
    if (enpassant === EN_PASSANT) {
      // remove pawn necessary next to enpassant square (+1 row for white capturing, -1 row for black capturing)
      if (currentTurn === WHITE) {
        this.chessboard.board[to + 10] = EMPTY;
      } else if (currentTurn === BLACK) {
        this.chessboard.board[to - 10] = EMPTY;
      }
    }

    // Update En Passant square (if double pawn push)
    if (doublePush === DOUBLE_PUSH) {
      enPassantSquare = to + 10 * (colourFrom === WHITE ? 1 : -1);
    } else {
      enPassantSquare = 0;
    }

    // UPDATE halfmove clock
    if ((pieceFrom === PAWN) || capture !== 0) {
      // if pawn move or capture, reset to 0
      halfmoveCount = 0;
    } else {
      // else, increment
      halfmoveCount = halfmoveCount + 1;
    }

    // MOVE PIECE (and set flag to 'has moved', and restore piece colour)
    this.chessboard.board[to] = squareFrom | HAS_MOVED;

    // IF ROOK, update relevant castle rights
    if (pieceFrom === ROOK) {
      if (currentTurn === WHITE) {
        if (from === 98) castleRights[0] = 0;
        if (from === 91) castleRights[1] = 0;
      } else {
        if (from === 21) castleRights[2] = 0;
        if (from === 28) castleRights[3] = 0;
      }
    }

    // IF KING, also remove 'can castle' flag
    if (pieceFrom === KING) {
      this.chessboard.board[to] &= ~CAN_CASTLE;

      // and update stored castling rights
      if (currentTurn === WHITE) {
        castleRights[0] = 0;
        castleRights[1] = 0;
      } else {
        castleRights[2] = 0;
        castleRights[3] = 0;
      }
    }

    // PROMOTE to new piece if possible
    if (promotion !== 0) {
      this.chessboard.board[to] &= ~PIECE_MASK;
      this.chessboard.board[to] &= promotion;
    }

    // CLEAR the square from
    this.chessboard.board[from] = EMPTY;

    // CHANGE turn
    currentTurn = (currentTurn === WHITE) ? BLACK : WHITE;

    // UPDATE boardstates history
    this.chessboard.boardstates[this.chessboard.ply] = ChessBoard.encodeBoardState(castleRights, currentTurn, enPassantSquare, halfmoveCount, squareFrom);
    // UPDATE move history
    this.moveHistory[this.chessboard.ply] = move;
  }

  /**
   * TODO: UNMAKE MOVE ()
   */
  unmakeMove() {
    // RESET to previous board state
    const { castleRights, currentTurn, enPassantSquare, halfmoveCount, prevPiece } = ChessBoard.decodeBoardState(this.chessboard.boardstates[this.chessboard.ply]);
    this.chessboard.boardstates[this.chessboard.ply] = EMPTY;

    // RESET to previous move state
    const { enpassant, doublePush, castle, capture, promotion, from, to } = Engine.decodeMoveData(this.moveHistory[this.chessboard.ply]);
    this.moveHistory[this.chessboard.ply] = EMPTY;

    // RESET PLY
    this.chessboard.ply -= 1;

    // 1. set 'from' square back to 'board[to]' (restores moved piece)
    this.chessboard.board[from] = prevPiece;
    // 2. set 'to' square to 'capture' (restores any existing piece)
    this.chessboard.board[to] = capture;
    // restore en passant capture
    if (enpassant === EN_PASSANT) {
      // when enpassant was from white capture
      if (currentTurn === WHITE) {
        this.chessboard.board[to + 10] = capture;
      } else if (currentTurn === BLACK) {
        this.chessboard.board[to - 10] = capture;
      }
      this.chessboard.board[to] = EMPTY;
    } else {
      this.chessboard.board[to] = capture;
    }

    // MOVE rook and king back if castled
    if (castle === KS_CASTLE) {
      this.chessboard.board[from + 3] = this.chessboard.board[from + 1] & ~HAS_MOVED; // return rook to position
      this.chessboard.board[from] |= CAN_CASTLE;  // return king state to 'can castle'
      this.chessboard.board[from] &= ~HAS_MOVED;  // return king state to 'unmoved'
      this.chessboard.board[to] = EMPTY;
      this.chessboard.board[from + 1] = EMPTY;
    } else if (castle === QS_CASTLE) {
      this.chessboard.board[from - 4] = this.chessboard.board[from - 1] & ~HAS_MOVED; // return rook to position
      this.chessboard.board[from] |= CAN_CASTLE;  // return king state to 'can castle'
      this.chessboard.board[from] &= ~HAS_MOVED;  // return king state to 'unmoved'
      this.chessboard.board[to] = EMPTY;
      this.chessboard.board[from - 1] = EMPTY;
    }

    // 3. if promotion, set 'from' back to pawn (& ~pc | P)
    if (promotion !== 0) {
      this.chessboard.board[from] &= ~PIECE_MASK;
      this.chessboard.board[from] |= PAWN;
    }
  }

  /**
   * GENERATE LEGAL MOVES - validates whether each move is valid or not
   */
  generateLegalMoves() {
    const legalMoves = new Uint32Array(218);
    let idx = 0;

    // 1. generate pseudo moves
    const pseudoMoves = this.generatePseudoMoves();
    // 2. check each move:
    for (let i = 0; i <= 218; i++) {
      const move = pseudoMoves[i];
      if (move === 0) break;
      const { from, to, castle } = Engine.decodeMoveData(move);
      const currentTurn = this.chessboard.boardstates[this.chessboard.ply] & CURRENT_TURN;
      if (castle === KS_CASTLE) {
        let isLegal = true;
        const king = this.chessboard.board[from];
        this.chessboard.board[from] = EMPTY;
        for (let j = 1; j <= 2; j++) {
          this.chessboard.board[from + j] = king;
          if (this.kingIsInCheck(king & COLOUR_MASK)) isLegal = false;
          this.chessboard.board[from + j] = EMPTY;
          if (isLegal === false) break;
        }
        this.chessboard.board[from] = king;
        if (isLegal === true) {
          legalMoves[idx] = move;
          idx++;
        }
      } else if (castle === QS_CASTLE) {
        let isLegal = true;
        const king = this.chessboard.board[from];
        this.chessboard.board[from] = EMPTY;
        for (let j = 1; j <= 3; j++) {
          this.chessboard.board[from - j] = king;
          if (this.kingIsInCheck(king & COLOUR_MASK)) isLegal = false;
          this.chessboard.board[from + j] = EMPTY;
          if (isLegal === false) break;
        }
        this.chessboard.board[from] = king;
        if (isLegal === true) {
          legalMoves[idx] = move;
          idx++;
        }
      } else {
        this.makeMove(move);
        if (!this.kingIsInCheck(currentTurn)) {
          legalMoves[idx] = move;
          idx++;
        }
        this.unmakeMove();
      }

    }

    return legalMoves;
  }

  /**
   * TODO: PERFT FUNCTION +++ UNIT TESTS
   */
  perft(depth: number, prev = "") {
    if (depth === 0) {
      // fs.appendFile("perft.txt", `${prev}\n`, err => null);
      return 1;
    }

    let nodes = 0;

    const moves = this.generateLegalMoves();

    for (let i = 0; i <= 218; i++) {
      if (moves[i] === 0) break;
      this.makeMove(moves[i]);
      nodes += this.perft(depth - 1);
      this.unmakeMove();
    }

    return nodes;
  }

}




// Clear file contents
// fs.writeFile("perft.txt", "", err => null);

const engine = new Engine();

const start = process.hrtime.bigint();
const perft = engine.perft(3);
const end = process.hrtime.bigint();
// console.log(perft/(Number(end-start)/1000000000));
console.log(perft);