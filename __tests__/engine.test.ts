import ChessBoard from "../src/board";
import { EMPTY } from "../src/board-constants";
import Engine from "../src/engine";
import { NORTH, SOUTH, EAST, WEST, NORTHEAST, NORTHWEST, SOUTHEAST, SOUTHWEST, SQUARE_TO, SQUARE_FROM, PIECE_PROMOTE, PIECE_CAPTURE, CASTLE, KS_CASTLE, QS_CASTLE, DOUBLE_PUSH, EN_PASSANT, MOVES_LIST, SLIDERS } from "../src/engine-constants";
import { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, CAN_CASTLE, HAS_MOVED, WHITE, BLACK } from "../src/piece-constants";

describe("Encode Move Data", () => {
  test("1. EnPassant[No], DoublePush[No], Castle[No], Capture[No], Promotion[No], From[21], To[22]", () => {
    expect(Engine.encodeMoveData(0, 0, 0, 0, 0, 21, 22)).toStrictEqual(0b0000_0000_0000_0000_0001_0101_0001_0110);
  });
  test("2. EnPassant[No], DoublePush[No], Castle[No], Capture[Black Rook Unmoved], Promotion[No], From[98], To[28]", () => {
    expect(Engine.encodeMoveData(0, 0, 0, ROOK | BLACK, 0, 98, 28)).toStrictEqual(0b0000_0000_1010_0000_0110_0010_0001_1100);
  });
  test("3. EnPassant[No], DoublePush[No], Castle[QueenSide], Capture[No], Promotion[No], From[25], To[21]", () => {
    expect(Engine.encodeMoveData(0, 0, QS_CASTLE, 0, 0, 25, 21)).toStrictEqual(0b0001_0000_0000_0000_0001_1001_0001_0101);
  });
  test("4. EnPassant[No], DoublePush[No], Castle[No], Capture[White Knight Moved], Promotion[Queen], From[87], To[96]", () => {
    expect(Engine.encodeMoveData(0, 0, 0, KNIGHT | HAS_MOVED, QUEEN, 87, 96)).toStrictEqual(0b0000_0010_0001_0101_0101_0111_0110_0000);
  });
  test("5. EnPassant[No], DoublePush[No], Castle[KingSide], Capture[No], Promotion[No], From[95], To[98]", () => {
    expect(Engine.encodeMoveData(0, 0, KS_CASTLE, 0, 0, 95, 98)).toStrictEqual(0b0000_1000_0000_0000_0101_1111_0110_0010);
  });
  test("6. EnPassant[No], DoublePush[Yes], Castle[No], Capture[No], Promotion[No], From[35], To[55]", () => {
    expect(Engine.encodeMoveData(0, DOUBLE_PUSH, 0, 0, 0, 35, 55)).toStrictEqual(0b0010_0000_0000_0000_0010_0011_0011_0111);
  });
  test("7. EnPassant[Yes], DoublePush[No], Castle[No], Capture[Black Pawn Moved], Promotion[No], From[54], To[43]", () => {
    expect(Engine.encodeMoveData(EN_PASSANT, 0, 0, PAWN | BLACK | HAS_MOVED, 0, 54, 43)).toStrictEqual(0b0100_0010_1000_1000_0011_0110_0010_1011);
  });
});

describe("Decode Move Data", () => {
  test("1. EnPassant[No], DoublePush[No], Castle[No], Capture[No], Promotion[No], From[21], To[22]", () => {
    expect(Engine.decodeMoveData(0b0000_0000_0000_0000_0001_0101_0001_0110)).toStrictEqual({
      enpassant: 0,
      doublePush: 0,
      castle: 0,
      capture: 0,
      promotion: 0,
      from: 21,
      to: 22,
    });
  });
  test("2. EnPassant[No], DoublePush[No], Castle[No], Capture[Black Rook Unmoved], Promotion[No], From[98], To[28]", () => {
    expect(Engine.decodeMoveData(0b0000_0000_1010_0000_0110_0010_0001_1100)).toStrictEqual({
      enpassant: 0,
      doublePush: 0,
      castle: 0,
      capture: ROOK | BLACK,
      promotion: 0,
      from: 98,
      to: 28,
    });
  });
  test("3. EnPassant[No], DoublePush[No], Castle[QueenSide], Capture[No], Promotion[No], From[25], To[21]", () => {
    expect(Engine.decodeMoveData(0b0001_0000_0000_0000_0001_1001_0001_0101)).toStrictEqual({
      enpassant: 0,
      doublePush: 0,
      castle: QS_CASTLE,
      capture: 0,
      promotion: 0,
      from: 25,
      to: 21,
    });
  });
  test("4. EnPassant[No], DoublePush[No], Castle[No], Capture[White Knight Moved], Promotion[Queen], From[87], To[96]", () => {
    expect(Engine.decodeMoveData(0b0000_0010_0001_0101_0101_0111_0110_0000)).toStrictEqual({
      enpassant: 0,
      doublePush: 0,
      castle: 0,
      capture: KNIGHT | HAS_MOVED,
      promotion: QUEEN,
      from: 87,
      to: 96,
    });
  });
  test("5. EnPassant[No], DoublePush[No], Castle[KingSide], Capture[No], Promotion[No], From[95], To[98]", () => {
    expect(Engine.decodeMoveData(0b0000_1000_0000_0000_0101_1111_0110_0010)).toStrictEqual({
      enpassant: 0,
      doublePush: 0,
      castle: KS_CASTLE,
      capture: 0,
      promotion: 0,
      from: 95,
      to: 98,
    });
  });
  test("6. EnPassant[No], DoublePush[Yes], Castle[No], Capture[No], Promotion[No], From[35], To[55]", () => {
    expect(Engine.decodeMoveData(0b0010_0000_0000_0000_0010_0011_0011_0111)).toStrictEqual({
      enpassant: 0,
      doublePush: DOUBLE_PUSH,
      castle: 0,
      capture: 0,
      promotion: 0,
      from: 35,
      to: 55,
    });
  });
  test("7. EnPassant[Yes], DoublePush[No], Castle[No], Capture[Black Pawn Moved], Promotion[No], From[54], To[43]", () => {
    expect(Engine.decodeMoveData(0b0100_0010_1000_1000_0011_0110_0010_1011)).toStrictEqual({
      enpassant: EN_PASSANT,
      doublePush: 0,
      castle: 0,
      capture: PAWN | BLACK | HAS_MOVED,
      promotion: 0,
      from: 54,
      to: 43,
    });
  });
});


describe("King Is In Check", () => {
  describe("White King", () => {
    test("1. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", () => {
      const engine = new Engine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(false);
    });
    test("2. k7/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(false);
    });
    test("3. k6b/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k6b/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(false);
    });
    test("4. nk6/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("nk6/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(false);
    });
    test("5. bk6/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("bk6/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(true);
    });
    test("6. k6r/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k6r/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(true);
    });
    test("7. k6q/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k6q/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(true);
    });
    test("8. k7/8/8/8/8/6n1/8/7K", () => {
      const engine = new Engine("k7/8/8/8/8/6n1/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(true);
    });
    test("9. b6k/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("b6k/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(true);
    });
    test("10. k7/8/8/8/8/8/7p/7K", () => {
      const engine = new Engine("k7/8/8/8/8/8/7p/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(false);
    });
    test("11. k7/8/8/8/8/8/6p1/7K", () => {
      const engine = new Engine("k7/8/8/8/8/8/6p1/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(true);
    });
    test("12. k7/8/8/8/8/7q/7p/7K", () => {
      const engine = new Engine("k7/8/8/8/8/7q/7p/7K w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(false);
    });
    test("13. k7/8/8/8/8/8/8/5rnK", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/5rnK w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(false);
    });
    test("14. 8/8/8/8/8/8/8/6kK", () => {
      const engine = new Engine("8/8/8/8/8/8/8/6kK w - - 0 1");
      expect(engine.kingIsInCheck(WHITE)).toStrictEqual(true);
    });
  });

  describe("Black King", () => {
    test("1. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", () => {
      const engine = new Engine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(false);
    });
    test("2. k7/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(false);
    });
    test("3. k7/8/8/8/8/8/8/B6K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/B6K b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(false);
    });
    test("4. k7/8/8/8/8/8/8/6KN", () => {
      const engine = new Engine("nk6/8/8/8/8/8/8/6KN b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(false);
    });
    test("5. k7/8/8/8/8/8/8/6KB", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/6KB b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(true);
    });
    test("6. k7/8/8/8/8/8/8/R6K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/R6K b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(true);
    });
    test("7. k7/8/8/8/8/8/8/Q6K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/Q6K b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(true);
    });
    test("8. k7/8/1N6/8/8/8/8/7K", () => {
      const engine = new Engine("k7/8/1N6/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(true);
    });
    test("9. k7/8/8/8/8/8/8/K6B", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/K6B b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(true);
    });
    test("10. k7/P7/8/8/8/8/8/7K", () => {
      const engine = new Engine("k7/P7/8/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(false);
    });
    test("11. k7/8/8/8/8/8/6p1/7K", () => {
      const engine = new Engine("k7/1P6/8/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(true);
    });
    test("12. k7/P7/Q7/8/8/8/8/7K", () => {
      const engine = new Engine("k7/P7/Q7/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(false);
    });
    test("13. kNR5/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("kNR5/8/8/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(false);
    });
    test("14. kK6/8/8/8/8/8/8/8", () => {
      const engine = new Engine("kK6/8/8/8/8/8/8/8 b - - 0 1");
      expect(engine.kingIsInCheck(BLACK)).toStrictEqual(true);
    });
  });
});


describe("Evaluate Position", () => {
  test("1. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", () => {
    const engine = new Engine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(engine.evaluatePosition()).toBeLessThanOrEqual(0.25);
    expect(engine.evaluatePosition()).toBeGreaterThanOrEqual(-0.25);
  });
  test("2. 6k1/5r1p/p1p2qp1/2Pp1p2/PP3P2/4P1P1/5K1P/1BQ1R3 w KQkq - 0 1", () => {
    const engine = new Engine("6k1/5r1p/p1p2qp1/2Pp1p2/PP3P2/4P1P1/5K1P/1BQ1R3 w KQkq - 0 1");
    expect(engine.evaluatePosition()).toBeGreaterThan(0);
  });
  test("3. 8/pk5p/2nP2p1/1PP5/7P/1K6/1B6/4r3 b - - 0 1", () => {
    const engine = new Engine("8/pk5p/2nP2p1/1PP5/7P/1K6/1B6/4r3 b - - 0 1");
    expect(engine.evaluatePosition()).toBeGreaterThan(0);
  });
  test("4. k7/8/8/8/8/8/8/K7", () => {
    const engine = new Engine("kn6/8/8/8/8/8/8/KN6 w - - 0 1");
    expect(engine.evaluatePosition()).toBeGreaterThanOrEqual(0);
  });
  test("5. 2r5/8/8/4k3/2Q5/2KP4/8/8 b - - 0 1", () => {
    const engine = new Engine("2r5/8/8/4k3/2Q5/2KP4/8/8 b - - 0 1");
    expect(engine.evaluatePosition()).toBeLessThan(0);
  });
});


describe("Make Move", () => {
  test("1. Regular Move", () => {
    const engine = new Engine("r6k/8/8/8/8/8/8/K7 b - - 0 1");
    const move = Engine.encodeMoveData(0, 0, 0, 0, 0, 21, 22);
    engine.makeMove(move);
    expect(engine.chessboard.board[21]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[22]).toStrictEqual(ROOK | BLACK | HAS_MOVED);
    expect(engine.chessboard.ply).toStrictEqual(3);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([0, 0, 0, 0]),
      currentTurn: WHITE,
      enPassantSquare: -1,
      halfmoveCount: 1,
      prevPiece: ROOK | BLACK | HAS_MOVED
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(move);
  });
  test("2. Two Ply", () => {
    const engine = new Engine("r6k/8/8/8/8/8/8/R6K b - - 0 1");
    // First Move
    const move1 = Engine.encodeMoveData(0, 0, 0, 0, 0, 21, 22);
    engine.makeMove(move1);
    expect(engine.chessboard.board[21]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[22]).toStrictEqual(ROOK | BLACK | HAS_MOVED);
    expect(engine.chessboard.ply).toStrictEqual(3);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([0, 0, 0, 0]),
      currentTurn: WHITE,
      enPassantSquare: -1,
      halfmoveCount: 1,
      prevPiece: ROOK | BLACK | HAS_MOVED
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(move1);
    // Second Move
    const move2 = Engine.encodeMoveData(0, 0, 0, 0, 0, 91, 61);
    engine.makeMove(move2);
    expect(engine.chessboard.board[91]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[61]).toStrictEqual(ROOK | WHITE | HAS_MOVED);
    expect(engine.chessboard.ply).toStrictEqual(4);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([0, 0, 0, 0]),
      currentTurn: BLACK,
      enPassantSquare: -1,
      halfmoveCount: 2,
      prevPiece: ROOK | WHITE | HAS_MOVED
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(move2);
  });
  test("3. Double Pawn Push", () => {
    const engine = new Engine("r3k3/8/8/8/8/8/P7/R3k2R w KQq - 20 80");
    const move = Engine.encodeMoveData(0, DOUBLE_PUSH, 0, 0, 0, 81, 61);
    engine.makeMove(move);
    expect(engine.chessboard.board[81]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[61]).toStrictEqual(PAWN | WHITE | HAS_MOVED);
    expect(engine.chessboard.ply).toStrictEqual(160);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([1, 1, 0, 1]),
      currentTurn: BLACK,
      enPassantSquare: 71,
      halfmoveCount: 0,
      prevPiece: PAWN | WHITE
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(move);
  });
  test("4. Queenside Castle", () => {
    const engine = new Engine("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b Kkq - 20 35");
    const move = Engine.encodeMoveData(0, 0, QS_CASTLE, 0, 0, 25, 23);
    engine.makeMove(move);
    // King's Square
    expect(engine.chessboard.board[25]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[23]).toStrictEqual(KING | BLACK | HAS_MOVED);
    // Rook's Square
    expect(engine.chessboard.board[21]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[24]).toStrictEqual(ROOK | BLACK | HAS_MOVED);
    // Board State
    expect(engine.chessboard.ply).toStrictEqual(71);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([1, 0, 0, 0]),
      currentTurn: WHITE,
      enPassantSquare: -1,
      halfmoveCount: 21,
      prevPiece: KING | BLACK | CAN_CASTLE
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(move);
  });
  test("5. Kingside Castle", () => {
    const engine = new Engine("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w Kkq - 20 35");
    const move = Engine.encodeMoveData(0, 0, KS_CASTLE, 0, 0, 95, 97);
    engine.makeMove(move);
    // King's Square
    expect(engine.chessboard.board[95]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[97]).toStrictEqual(KING | WHITE | HAS_MOVED);
    // Rook's Square
    expect(engine.chessboard.board[98]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[96]).toStrictEqual(ROOK | WHITE | HAS_MOVED);
    // Board State
    expect(engine.chessboard.ply).toStrictEqual(70);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([0, 0, 1, 1]),
      currentTurn: BLACK,
      enPassantSquare: -1,
      halfmoveCount: 21,
      prevPiece: KING | WHITE | CAN_CASTLE
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(move);
  });
  test("6. Piece Capture", () => {
    const engine = new Engine("r1bkqbnr/pppppppp/1n6/8/P7/8/1PPPPPPP/RNBKQBNR b Qq - 30 82");
    const pawnCapture = engine.chessboard.board[61];
    const move = Engine.encodeMoveData(0, 0, 0, pawnCapture, 0, 42, 61);
    engine.makeMove(move);
    // Square Updates
    expect(engine.chessboard.board[42]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[61]).toStrictEqual(KNIGHT | BLACK | HAS_MOVED);
    // Board State
    expect(engine.chessboard.ply).toStrictEqual(165);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([0, 1, 0, 1]),
      currentTurn: WHITE,
      enPassantSquare: -1,
      halfmoveCount: 0,
      prevPiece: KNIGHT | BLACK | HAS_MOVED
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(move);
  });
  test("7. En Passant", () => {
    const engine = new Engine("r1bkqbnr/ppp1pppp/2n5/3pP3/8/8/PPPP1PPP/RNBKQBNR w Kk d6 0 99");
    const pawnCapture = engine.chessboard.board[44];
    const move = Engine.encodeMoveData(EN_PASSANT, 0, 0, pawnCapture, 0, 55, 44);
    engine.makeMove(move);
    // Square Updates
    expect(engine.chessboard.board[54]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[55]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[44]).toStrictEqual(PAWN | WHITE | HAS_MOVED);
    // Empty Pawn Push Confirmation
    expect(engine.chessboard.board[45]).toStrictEqual(EMPTY);
    // Board State
    expect(engine.chessboard.ply).toStrictEqual(198);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([1, 0, 1, 0]),
      currentTurn: BLACK,
      enPassantSquare: -1,
      halfmoveCount: 0,
      prevPiece: PAWN | WHITE | HAS_MOVED
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(move);
  });
});


describe("Unmake Move", () => {
  test("1. Regular Move", () => {
    const engine = new Engine("r6k/8/8/8/8/8/8/K7 b - - 0 1");
    const move = Engine.encodeMoveData(0, 0, 0, 0, 0, 21, 22);
    engine.makeMove(move);
    engine.unmakeMove();

    expect(engine.chessboard.board[21]).toStrictEqual(ROOK | BLACK | HAS_MOVED);
    expect(engine.chessboard.board[22]).toStrictEqual(EMPTY);
    expect(engine.chessboard.ply).toStrictEqual(2);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([0, 0, 0, 0]),
      currentTurn: BLACK,
      enPassantSquare: -1,
      halfmoveCount: 0,
      prevPiece: EMPTY
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(EMPTY);
  });
  test("2. Two Ply", () => {
    const engine = new Engine("r6k/8/8/8/8/8/8/R6K b - - 0 1");
    // First Move
    const move1 = Engine.encodeMoveData(0, 0, 0, 0, 0, 21, 22);
    engine.makeMove(move1);
    // Second Move
    const move2 = Engine.encodeMoveData(0, 0, 0, 0, 0, 91, 61);
    engine.makeMove(move2);
    // Unmake Second
    engine.unmakeMove();
    expect(engine.chessboard.board[91]).toStrictEqual(ROOK | WHITE | HAS_MOVED);
    expect(engine.chessboard.board[61]).toStrictEqual(EMPTY);
    expect(engine.chessboard.ply).toStrictEqual(3);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([0, 0, 0, 0]),
      currentTurn: WHITE,
      enPassantSquare: -1,
      halfmoveCount: 1,
      prevPiece: ROOK | BLACK | HAS_MOVED
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(move1);

    // Unmake First
    engine.unmakeMove();
    expect(engine.chessboard.board[21]).toStrictEqual(ROOK | BLACK | HAS_MOVED);
    expect(engine.chessboard.board[22]).toStrictEqual(EMPTY);
    expect(engine.chessboard.ply).toStrictEqual(2);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([0, 0, 0, 0]),
      currentTurn: BLACK,
      enPassantSquare: -1,
      halfmoveCount: 0,
      prevPiece: EMPTY
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(EMPTY);
  });

  test("3. Double Pawn Push", () => {
    const engine = new Engine("r3k3/8/8/8/8/8/P7/R3k2R w KQq - 20 80");
    const move = Engine.encodeMoveData(0, DOUBLE_PUSH, 0, 0, 0, 81, 61);
    engine.makeMove(move);
    engine.unmakeMove();

    expect(engine.chessboard.board[81]).toStrictEqual(PAWN | WHITE);
    expect(engine.chessboard.board[61]).toStrictEqual(EMPTY);
    expect(engine.chessboard.ply).toStrictEqual(159);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([1, 1, 0, 1]),
      currentTurn: WHITE,
      enPassantSquare: -1,
      halfmoveCount: 20,
      prevPiece: EMPTY
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(EMPTY);
  });

  test("4. Queenside Castle", () => {
    const engine = new Engine("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b Kkq - 20 35");
    const move = Engine.encodeMoveData(0, 0, QS_CASTLE, 0, 0, 25, 23);
    engine.makeMove(move);
    engine.unmakeMove();

    // Castled King's Square (make)
    expect(engine.chessboard.board[23]).toStrictEqual(EMPTY);
    // Original King's Square (unmake)
    expect(engine.chessboard.board[25]).toStrictEqual(KING | BLACK | CAN_CASTLE);
    // Castled Rook's Square (make)
    expect(engine.chessboard.board[24]).toStrictEqual(EMPTY);
    // Original Rook's Square (unmake)
    expect(engine.chessboard.board[21]).toStrictEqual(ROOK | BLACK);
    // Board State
    expect(engine.chessboard.ply).toStrictEqual(70);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([1, 0, 1, 1]),
      currentTurn: BLACK,
      enPassantSquare: -1,
      halfmoveCount: 20,
      prevPiece: EMPTY
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(EMPTY);
  });

  test("5. Kingside Castle", () => {
    const engine = new Engine("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w Kkq - 20 35");
    const move = Engine.encodeMoveData(0, 0, KS_CASTLE, 0, 0, 95, 97);
    engine.makeMove(move);
    engine.unmakeMove();

    // Castled King's Square (make)
    expect(engine.chessboard.board[97]).toStrictEqual(EMPTY);
    // Original King's Square (unmake)
    expect(engine.chessboard.board[95]).toStrictEqual(KING | WHITE | CAN_CASTLE);
    // Castled Rook's Square (make)
    expect(engine.chessboard.board[96]).toStrictEqual(EMPTY);
    // Original Rook's Square (unmake)
    expect(engine.chessboard.board[98]).toStrictEqual(ROOK | WHITE);
    // Board State
    expect(engine.chessboard.ply).toStrictEqual(69);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([1, 0, 1, 1]),
      currentTurn: WHITE,
      enPassantSquare: -1,
      halfmoveCount: 20,
      prevPiece: EMPTY
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(EMPTY);
  });

  test("6. Piece Capture", () => {
    const engine = new Engine("r1bkqbnr/pppppppp/1n6/8/P7/8/1PPPPPPP/RNBKQBNR b Qq - 30 82");
    const pawnCapture = engine.chessboard.board[61];
    const move = Engine.encodeMoveData(0, 0, 0, pawnCapture, 0, 42, 61);
    engine.makeMove(move);
    engine.unmakeMove();
    // Restored Squares (unmake)
    expect(engine.chessboard.board[42]).toStrictEqual(KNIGHT | BLACK | HAS_MOVED);
    expect(engine.chessboard.board[61]).toStrictEqual(pawnCapture);
    // Board State
    expect(engine.chessboard.ply).toStrictEqual(164);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([0, 1, 0, 1]),
      currentTurn: BLACK,
      enPassantSquare: -1,
      halfmoveCount: 30,
      prevPiece: EMPTY
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(EMPTY);
  });

  test("7. En Passant", () => {
    const engine = new Engine("r1bkqbnr/ppp1pppp/2n5/3pP3/8/8/PPPP1PPP/RNBKQBNR w Kk d6 0 99");
    const pawnCapture = engine.chessboard.board[44];
    const move = Engine.encodeMoveData(EN_PASSANT, 0, 0, pawnCapture, 0, 55, 44);
    engine.makeMove(move);
    engine.unmakeMove();
    // Restored Squares
    expect(engine.chessboard.board[54]).toStrictEqual(EMPTY);
    expect(engine.chessboard.board[44]).toStrictEqual(pawnCapture);
    expect(engine.chessboard.board[55]).toStrictEqual(PAWN | WHITE | HAS_MOVED);
    // Empty Pawn Push Confirmation
    expect(engine.chessboard.board[45]).toStrictEqual(EMPTY);
    // Board State
    expect(engine.chessboard.ply).toStrictEqual(197);
    expect(ChessBoard.decodeBoardState(engine.chessboard.boardstates[engine.chessboard.ply])).toStrictEqual({
      castleRights: new Int8Array([1, 0, 1, 0]),
      currentTurn: WHITE,
      enPassantSquare: 44,
      halfmoveCount: 0,
      prevPiece: EMPTY
    });
    expect(engine.moveHistory[engine.chessboard.ply]).toStrictEqual(EMPTY);
  });
});


describe("Generate Moves", () => {
  describe("White Pawn", () => {
    test("1. Single Push", () => {
      const engine = new Engine("8/8/8/8/3P4/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[0]).toStrictEqual(16438);    // encoded single pawn push
      expect(moves[1]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Double Push", () => {
      const engine = new Engine("8/8/8/8/8/8/P7/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves[0]).toStrictEqual(20807);
      expect(moves[1]).toStrictEqual(536891709);
      expect(moves[2]).toStrictEqual(0);
    });
    test("3. East Capture", () => {
      const engine = new Engine("8/8/8/8/8/1pp5/1P7/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves[0]).toStrictEqual(42488393);
      expect(moves[1]).toStrictEqual(0);
    });
    test("4. West Capture", () => {
      const engine = new Engine("8/8/8/8/p7/1P6/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves[0]).toStrictEqual(18494);
      expect(moves[1]).toStrictEqual(42485821);
      expect(moves[2]).toStrictEqual(0);
    });
    test("4. En Passant", () => {
      const engine = new Engine("8/8/8/3pP3/8/8/8/8 w - d6 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves[0]).toStrictEqual(14125);
      expect(moves[1]).toStrictEqual(1116223276);
      expect(moves[2]).toStrictEqual(0);
    });
    test("5. Promotion", () => {
      const engine = new Engine("8/P7/8/8/8/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves).toContain(139029); // knight promotion
      expect(moves).toContain(204565); // bishop promotion
      expect(moves).toContain(270101); // rook promotion
      expect(moves).toContain(335637); // queen promotion
      expect(moves[4]).toStrictEqual(0);
    });
  });

  describe("Black Pawn", () => {
    test("1. Single Push", () => {
      const engine = new Engine("8/8/8/3p4/8/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[0]).toStrictEqual(13888);    // encoded single pawn push
      expect(moves[1]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Double Push", () => {
      const engine = new Engine("8/p7/8/8/8/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves[0]).toStrictEqual(7977);
      expect(moves[1]).toStrictEqual(536878899);
      expect(moves[2]).toStrictEqual(0);
    });
    test("3. East Capture", () => {
      const engine = new Engine("8/1p6/1PP5/8/8/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves[0]).toStrictEqual(34086955);
      expect(moves[1]).toStrictEqual(0);
    });
    test("4. West Capture", () => {
      const engine = new Engine("8/8/1p6/P7/8/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves[0]).toStrictEqual(10804);
      expect(moves[1]).toStrictEqual(34089523);
      expect(moves[2]).toStrictEqual(0);
    });
    test("4. En Passant", () => {
      const engine = new Engine("8/8/8/8/3pP3/8/8/8 b - e3 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves[0]).toStrictEqual(16458);
      expect(moves[1]).toStrictEqual(1107837003);
      expect(moves[2]).toStrictEqual(0);
    });
    test("5. Promotion", () => {
      const engine = new Engine("8/8/8/8/8/8/7p/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);
      expect(moves).toContain(153698); // knight promotion
      expect(moves).toContain(219234); // bishop promotion
      expect(moves).toContain(284770); // rook promotion
      expect(moves).toContain(350306); // queen promotion
      expect(moves[4]).toStrictEqual(0);
    });
  });

  describe("White Knight", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3N4/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,43));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,45));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,56));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,76));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,85));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,83));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,72));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,52));
      expect(moves[8]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/N7/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,42));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,82));
      expect(moves[4]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      const engine = new Engine("8/8/2p1n3/1b3r2/3N4/1q3q2/2p1n3/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,43));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|KNIGHT|HAS_MOVED,0,64,45));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|ROOK|HAS_MOVED,0,64,56));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|QUEEN|HAS_MOVED,0,64,76));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|KNIGHT|HAS_MOVED,0,64,85));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,83));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|QUEEN|HAS_MOVED,0,64,72));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|BISHOP|HAS_MOVED,0,64,52));
      expect(moves[8]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/8/2P1P3/1P3P2/3N4/1P3P2/2P1P3/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[10]).toStrictEqual(0);       // the index for when no more moves are available (8x single pawn pushes, 2x double pawn push, 0x knight)
    });
  });

  describe("Black Knight", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3n4/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,43));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,45));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,56));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,76));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,85));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,83));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,72));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,52));
      expect(moves[8]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/n7/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,42));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,82));
      expect(moves[4]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      const engine = new Engine("8/2P1N3/1B3R2/3n4/1Q3Q2/2P1N3/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,54,33));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|KNIGHT|HAS_MOVED,0,54,35));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|ROOK|HAS_MOVED,0,54,46));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|QUEEN|HAS_MOVED,0,54,66));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|KNIGHT|HAS_MOVED,0,54,75));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,54,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|QUEEN|HAS_MOVED,0,54,62));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|BISHOP|HAS_MOVED,0,54,42));
      expect(moves[8]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/2p1p3/1p3p2/3n4/1p3p2/2p1p3/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[10]).toStrictEqual(0);       // the index for when no more moves are available (8x single pawn pushes, 2x double pawn push, 0x knight)
    });
  });

  describe("White Bishop", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3B4/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,31));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,42));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,86));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,97));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,28));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,37));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,46));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,82));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,91));
      expect(moves[13]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/B7/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,25));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,34));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,43));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,52));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,72));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,83));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,94));
      expect(moves[7]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      const engine = new Engine("8/8/1q6/2p1n3/3B4/2b5/5r2/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|KNIGHT|HAS_MOVED,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|BISHOP|HAS_MOVED,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|ROOK|HAS_MOVED,0,64,86));
      expect(moves[5]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/8/8/2P1P3/3B4/2P1P3/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[8]).toStrictEqual(0);       // the index for when no more moves are available (8x single pawn pushes, 0x bishop)
    });
  });

  describe("Black Bishop", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3b4/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,31));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,42));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,86));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,97));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,28));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,37));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,46));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,82));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,91));
      expect(moves[13]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/b7/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,25));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,34));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,43));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,52));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,72));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,83));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,94));
      expect(moves[7]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      const engine = new Engine("8/8/1Q6/2P1N3/3b4/2B5/5R2/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|KNIGHT|HAS_MOVED,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|BISHOP|HAS_MOVED,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|ROOK|HAS_MOVED,0,64,86));
      expect(moves[5]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/8/8/2p1p3/3b4/2p1p3/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[8]).toStrictEqual(0);       // the index for when no more moves are available (8x single pawn pushes, 0x bishop)
    });
  });

  describe("White Rook", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3R4/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,24));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,34));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,44));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,84));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,94));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,61));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,62));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,66));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,67));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,68));
      expect(moves[14]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/R7/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,21));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,31));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,41));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,51));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,71));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,81));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,91));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,62));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,64));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,66));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,67));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,68));
      expect(moves[14]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      const engine = new Engine("8/8/3q4/3n4/2pRb3/8/3r4/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|KNIGHT|HAS_MOVED,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|BISHOP|HAS_MOVED,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|ROOK|HAS_MOVED,0,64,84));
      expect(moves[5]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/8/8/3P4/2PRP3/3P4/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[3]).toStrictEqual(0);        // the index for when no more moves are available (3x single pawn pushes, 0x rook)
    });
  });

  describe("Black Rook", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3r4/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,24));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,34));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,44));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,84));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,94));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,61));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,62));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,66));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,67));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,68));
      expect(moves[14]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/r7/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,21));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,31));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,41));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,51));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,71));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,81));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,91));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,62));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,64));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,66));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,67));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,68));
      expect(moves[14]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      const engine = new Engine("8/8/3Q4/3N4/2PrB3/8/3R4/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|KNIGHT|HAS_MOVED,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|BISHOP|HAS_MOVED,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|ROOK|HAS_MOVED,0,64,84));
      expect(moves[5]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/8/8/3p4/2prp3/3p4/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[3]).toStrictEqual(0);        // the index for when no more moves are available (3x single pawn pushes, 0x rook)
    });
  });

  describe("White Queen", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3Q4/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,24));  // along file
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,34));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,44));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,84));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,94));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,61));  // along rank
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,62));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,66));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,67));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,68));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,91));  // along diagonal - southeast to northwest
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,82));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,46));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,37));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,28));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,31));  // along diagonal - northeast to southwest
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,42));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,86));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,97));
      expect(moves[27]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/Q7/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,21));  // along file
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,31));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,41));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,51));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,71));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,81));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,91));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,62));  // along rank
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,64));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,66));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,67));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,68));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,52));  // along diagonal - southeast to northwest
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,43));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,34));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,25));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,72));  // along diagonal - northeast to southwest
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,83));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,94));
      expect(moves[21]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      const engine = new Engine("8/8/3q4/2pnb3/2pQb3/2q1q3/3r4/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|KNIGHT|HAS_MOVED,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|BISHOP|HAS_MOVED,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|BISHOP|HAS_MOVED,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|QUEEN|HAS_MOVED,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|ROOK|HAS_MOVED,0,64,84));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,BLACK|QUEEN|HAS_MOVED,0,64,75));
      expect(moves[9]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/8/8/2PPP3/2PQP3/2PPP3/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[3]).toStrictEqual(0);        // the index for when no more moves are available (3x single pawn pushes, 0x queen)
    });
  });

  describe("Black Queen", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3q4/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,24));  // along file
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,34));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,44));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,84));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,94));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,61));  // along rank
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,62));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,66));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,67));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,68));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,91));  // along diagonal - southeast to northwest
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,82));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,46));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,37));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,28));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,31));  // along diagonal - northeast to southwest
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,42));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,86));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,97));
      expect(moves[27]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/q7/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,21));  // along file
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,31));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,41));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,51));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,71));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,81));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,91));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,62));  // along rank
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,64));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,66));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,67));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,68));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,52));  // along diagonal - southeast to northwest
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,43));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,34));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,25));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,72));  // along diagonal - northeast to southwest
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,83));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,94));
      expect(moves[21]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      const engine = new Engine("8/8/3Q4/2PNB3/2PqB3/2Q1Q3/3R4/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|KNIGHT|HAS_MOVED,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|BISHOP|HAS_MOVED,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|BISHOP|HAS_MOVED,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|QUEEN|HAS_MOVED,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|ROOK|HAS_MOVED,0,64,84));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,WHITE|QUEEN|HAS_MOVED,0,64,75));
      expect(moves[9]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/8/8/2ppp3/2pqp3/2ppp3/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[3]).toStrictEqual(0);        // the index for when no more moves are available (3x single pawn pushes, 0x queen)
    });
  });

  describe("White King", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3K4/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves[8]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/K7/8/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,51));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,52));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,62));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,72));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,71));
      expect(moves[5]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      // separate into 2 separate scenarios, as otherwise surrounding pieces protect captures from king
      const engine1 = new Engine("8/8/8/2ppp3/3K4/2ppp3/8/8 w - - 0 1");
      const moves1 = engine1.generateLegalMoves();
      expect(moves1.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,53));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,54));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,55));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,73));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,74));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,75));
      expect(moves1[6]).toStrictEqual(0);        // the index for when no more moves are available

      const engine2 = new Engine("8/8/8/8/2pKp3/8/8/8 w - - 0 1");
      const moves2 = engine2.generateLegalMoves();
      expect(moves2.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,53));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,54));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,55));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,63));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,BLACK|PAWN|HAS_MOVED,0,64,65));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,73));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves2[7]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/8/8/2PPP3/2PKP3/2PPP3/8/8 w - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[3]).toStrictEqual(0);        // the index for when no more moves are available (3x single pawn pushes, 0x queen)
    });
  });

  describe("Black King", () => {
    test("1. Regular Moves - Centre of Board", () => {
      const engine = new Engine("8/8/8/8/3k4/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,53));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,54));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,55));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,63));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,65));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,73));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves[8]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("2. Regular Moves - Edge of Board", () => {
      const engine = new Engine("8/8/8/8/k7/8/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,51));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,52));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,62));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,72));
      expect(moves).toContain(Engine.encodeMoveData(0,0,0,0,0,61,71));
      expect(moves[5]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("3. Captures", () => {
      // separate into 2 separate scenarios, as otherwise surrounding pieces protect captures from king
      const engine1 = new Engine("8/8/8/2PPP3/3k4/2PPP3/8/8 b - - 0 1");
      const moves1 = engine1.generateLegalMoves();
      expect(moves1.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,53));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,54));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,55));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,73));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,74));
      expect(moves1).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,75));
      expect(moves1[6]).toStrictEqual(0);        // the index for when no more moves are available

      const engine2 = new Engine("8/8/8/8/2PkP3/8/8/8 b - - 0 1");
      const moves2 = engine2.generateLegalMoves();
      expect(moves2.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,53));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,55));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,63));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,WHITE|PAWN|HAS_MOVED,0,64,65));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,73));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,74));
      expect(moves2).toContain(Engine.encodeMoveData(0,0,0,0,0,64,75));
      expect(moves2[7]).toStrictEqual(0);        // the index for when no more moves are available
    });
    test("4. Blocked Squares", () => {
      const engine = new Engine("8/8/8/2ppp3/2pkp3/2ppp3/8/8 b - - 0 1");
      const moves = engine.generateLegalMoves();

      expect(moves.length).toStrictEqual(218);  // moves array is always 218 length
      expect(moves[3]).toStrictEqual(0);        // the index for when no more moves are available (3x single pawn pushes, 0x queen)
    });
  });
});