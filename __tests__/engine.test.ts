import ChessBoard from "../src/board";
import Engine from "../src/engine";


describe("Encode Move Data", () => {
  test("1. EnPassant[No], DoublePush[No], Castle[No], Capture[No], Promotion[No], From[21], To[22]", () => {
    expect(Engine.encodeMoveData(0, 0, 0, 0, 0, 21, 22)).toStrictEqual(0b0000_0000_0000_0000_0001_0101_0001_0110);
  });
  test("2. EnPassant[No], DoublePush[No], Castle[No], Capture[Black Rook Unmoved], Promotion[No], From[98], To[28]", () => {
    expect(Engine.encodeMoveData(0, 0, 0, ChessBoard.SQ.R | ChessBoard.SQ.b, 0, 98, 28)).toStrictEqual(0b0000_0000_1010_0000_0110_0010_0001_1100);
  });
  test("3. EnPassant[No], DoublePush[No], Castle[QueenSide], Capture[No], Promotion[No], From[25], To[21]", () => {
    expect(Engine.encodeMoveData(0, 0, 2, 0, 0, 25, 21)).toStrictEqual(0b0001_0000_0000_0000_0001_1001_0001_0101);
  });
  test("4. EnPassant[No], DoublePush[No], Castle[No], Capture[White Knight Moved], Promotion[Queen], From[87], To[96]", () => {
    expect(Engine.encodeMoveData(0, 0, 0, ChessBoard.SQ.N | ChessBoard.SQ.m, ChessBoard.SQ.Q, 87, 96)).toStrictEqual(0b0000_0010_0001_0101_0101_0111_0110_0000);
  });
  test("5. EnPassant[No], DoublePush[No], Castle[KingSide], Capture[No], Promotion[No], From[95], To[98]", () => {
    expect(Engine.encodeMoveData(0, 0, 1, 0, 0, 95, 98)).toStrictEqual(0b0000_1000_0000_0000_0101_1111_0110_0010);
  });
  test("6. EnPassant[No], DoublePush[Yes], Castle[No], Capture[No], Promotion[No], From[35], To[55]", () => {
    expect(Engine.encodeMoveData(0, 1, 0, 0, 0, 35, 55)).toStrictEqual(0b0010_0000_0000_0000_0010_0011_0011_0111);
  });
  test("7. EnPassant[Yes], DoublePush[No], Castle[No], Capture[Black Pawn Moved], Promotion[No], From[54], To[43]", () => {
    expect(Engine.encodeMoveData(1, 0, 0, ChessBoard.SQ.P | ChessBoard.SQ.b | ChessBoard.SQ.m, 0, 54, 43)).toStrictEqual(0b0100_0010_1000_1000_0011_0110_0010_1011);
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
      capture: ChessBoard.SQ.R | ChessBoard.SQ.b,
      promotion: 0,
      from: 98,
      to: 28,
    });
  });
  test("3. EnPassant[No], DoublePush[No], Castle[QueenSide], Capture[No], Promotion[No], From[25], To[21]", () => {
    expect(Engine.decodeMoveData(0b0001_0000_0000_0000_0001_1001_0001_0101)).toStrictEqual({
      enpassant: 0,
      doublePush: 0,
      castle: Engine.MV.QS_CASTLE,
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
      capture: ChessBoard.SQ.N | ChessBoard.SQ.m,
      promotion: ChessBoard.SQ.Q,
      from: 87,
      to: 96,
    });
  });
  test("5. EnPassant[No], DoublePush[No], Castle[KingSide], Capture[No], Promotion[No], From[95], To[98]", () => {
    expect(Engine.decodeMoveData(0b0000_1000_0000_0000_0101_1111_0110_0010)).toStrictEqual({
      enpassant: 0,
      doublePush: 0,
      castle: Engine.MV.KS_CASTLE,
      capture: 0,
      promotion: 0,
      from: 95,
      to: 98,
    });
  });
  test("6. EnPassant[No], DoublePush[Yes], Castle[No], Capture[No], Promotion[No], From[35], To[55]", () => {
    expect(Engine.decodeMoveData(0b0010_0000_0000_0000_0010_0011_0011_0111)).toStrictEqual({
      enpassant: 0,
      doublePush: Engine.MV.DOUBLE_PUSH,
      castle: 0,
      capture: 0,
      promotion: 0,
      from: 35,
      to: 55,
    });
  });
  test("7. EnPassant[Yes], DoublePush[No], Castle[No], Capture[Black Pawn Moved], Promotion[No], From[54], To[43]", () => {
    expect(Engine.decodeMoveData(0b0100_0010_1000_1000_0011_0110_0010_1011)).toStrictEqual({
      enpassant: Engine.MV.EN_PASSANT,
      doublePush: 0,
      castle: 0,
      capture: ChessBoard.SQ.P | ChessBoard.SQ.b | ChessBoard.SQ.m,
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
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(false);
    });
    test("2. k7/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(false);
    });
    test("3. k6b/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k6b/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(false);
    });
    test("4. nk6/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("nk6/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(false);
    });
    test("5. bk6/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("bk6/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(true);
    });
    test("6. k6r/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k6r/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(true);
    });
    test("7. k6q/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k6q/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(true);
    });
    test("8. k7/8/8/8/8/6n1/8/7K", () => {
      const engine = new Engine("k7/8/8/8/8/6n1/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(true);
    });
    test("9. b6k/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("b6k/8/8/8/8/8/8/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(true);
    });
    test("10. k7/8/8/8/8/8/7p/7K", () => {
      const engine = new Engine("k7/8/8/8/8/8/7p/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(false);
    });
    test("11. k7/8/8/8/8/8/6p1/7K", () => {
      const engine = new Engine("k7/8/8/8/8/8/6p1/7K w - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.w)).toStrictEqual(true);
    });
  });

  describe("Black King", () => {
    test("1. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", () => {
      const engine = new Engine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(false);
    });
    test("2. k7/8/8/8/8/8/8/7K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(false);
    });
    test("3. k7/8/8/8/8/8/8/B6K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/B6K b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(false);
    });
    test("4. k7/8/8/8/8/8/8/6KN", () => {
      const engine = new Engine("nk6/8/8/8/8/8/8/6KN b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(false);
    });
    test("5. k7/8/8/8/8/8/8/6KB", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/6KB b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(true);
    });
    test("6. k7/8/8/8/8/8/8/R6K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/R6K b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(true);
    });
    test("7. k7/8/8/8/8/8/8/Q6K", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/Q6K b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(true);
    });
    test("8. k7/8/1N6/8/8/8/8/7K", () => {
      const engine = new Engine("k7/8/1N6/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(true);
    });
    test("9. k7/8/8/8/8/8/8/K6B", () => {
      const engine = new Engine("k7/8/8/8/8/8/8/K6B b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(true);
    });
    test("10. k7/P7/8/8/8/8/8/7K", () => {
      const engine = new Engine("k7/P7/8/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(false);
    });
    test("11. k7/8/8/8/8/8/6p1/7K", () => {
      const engine = new Engine("k7/1P6/8/8/8/8/8/7K b - - 0 1");
      expect(engine.kingIsInCheck(ChessBoard.SQ.b)).toStrictEqual(true);
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
    expect(engine.chessboard.board[21]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[22]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.b | ChessBoard.SQ.m);
    expect(engine.chessboard.halfmove).toStrictEqual(1);
    expect(engine.chessboard.fullmove).toStrictEqual(2);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([0, 0, 0, 0]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.w);
  });
  test("2. Two Ply", () => {
    const engine = new Engine("r6k/8/8/8/8/8/8/R6K b - - 0 1");
    // First Move
    const move1 = Engine.encodeMoveData(0, 0, 0, 0, 0, 21, 22);
    engine.makeMove(move1);
    expect(engine.chessboard.board[21]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[22]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.b | ChessBoard.SQ.m);
    expect(engine.chessboard.halfmove).toStrictEqual(1);
    expect(engine.chessboard.fullmove).toStrictEqual(2);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([0, 0, 0, 0]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.w);
    // Second Move
    const move2 = Engine.encodeMoveData(0, 0, 0, 0, 0, 91, 61);
    engine.makeMove(move2);
    expect(engine.chessboard.board[91]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[61]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.w | ChessBoard.SQ.m);
    expect(engine.chessboard.halfmove).toStrictEqual(2);
    expect(engine.chessboard.fullmove).toStrictEqual(2);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([0, 0, 0, 0]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.b);
  });
  test("3. Double Pawn Push", () => {
    const engine = new Engine("r3k3/8/8/8/8/8/P7/R3k2R w KQq - 20 80");
    const move = Engine.encodeMoveData(0, 1, 0, 0, 0, 81, 61);
    engine.makeMove(move);
    expect(engine.chessboard.board[81]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[61]).toStrictEqual(ChessBoard.SQ.P | ChessBoard.SQ.w | ChessBoard.SQ.m);
    expect(engine.chessboard.halfmove).toStrictEqual(0);
    expect(engine.chessboard.fullmove).toStrictEqual(80);
    expect(engine.chessboard.enpassant).toStrictEqual(51);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([1, 1, 0, 1]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.b);
  });
  test("4. Queenside Castle", () => {
    const engine = new Engine("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b Kkq - 20 35");
    const move = Engine.encodeMoveData(0, 0, 2, 0, 0, 25, 23);
    engine.makeMove(move);
    // King's Square
    expect(engine.chessboard.board[25]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[23]).toStrictEqual(ChessBoard.SQ.K | ChessBoard.SQ.b | ChessBoard.SQ.m);
    // Rook's Square
    expect(engine.chessboard.board[21]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[24]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.b | ChessBoard.SQ.m);
    // Board State
    expect(engine.chessboard.halfmove).toStrictEqual(21);
    expect(engine.chessboard.fullmove).toStrictEqual(36);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([1, 0, 0, 0]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.w);
  });
  test("5. Kingside Castle", () => {
    const engine = new Engine("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w Kkq - 20 35");
    const move = Engine.encodeMoveData(0, 0, 1, 0, 0, 95, 97);
    engine.makeMove(move);
    // King's Square
    expect(engine.chessboard.board[95]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[97]).toStrictEqual(ChessBoard.SQ.K | ChessBoard.SQ.w | ChessBoard.SQ.m);
    // Rook's Square
    expect(engine.chessboard.board[98]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[96]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.w | ChessBoard.SQ.m);
    // Board State
    expect(engine.chessboard.halfmove).toStrictEqual(21);
    expect(engine.chessboard.fullmove).toStrictEqual(35);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([0, 0, 1, 1]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.b);
  });
  test("6. Piece Capture", () => {
    const engine = new Engine("r1bkqbnr/pppppppp/1n6/8/P7/8/1PPPPPPP/RNBKQBNR b Qq - 30 82");
    const pawnCapture = engine.chessboard.board[61];
    const move = Engine.encodeMoveData(0, 0, 0, pawnCapture, 0, 42, 61);
    engine.makeMove(move);
    // Square Updates
    expect(engine.chessboard.board[42]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[61]).toStrictEqual(ChessBoard.SQ.N | ChessBoard.SQ.b | ChessBoard.SQ.m);
    // Board State
    expect(engine.chessboard.halfmove).toStrictEqual(0);
    expect(engine.chessboard.fullmove).toStrictEqual(83);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([0, 1, 0, 1]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.w);
  });
  test("7. En Passant", () => {
    const engine = new Engine("r1bkqbnr/ppp1pppp/2n5/3pP3/8/8/PPPP1PPP/RNBKQBNR w Kk d6 0 99");
    const pawnCapture = engine.chessboard.board[44];
    const move = Engine.encodeMoveData(1, 0, 0, pawnCapture, 0, 55, 44);
    engine.makeMove(move);
    // Square Updates
    expect(engine.chessboard.board[54]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[55]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[44]).toStrictEqual(ChessBoard.SQ.P | ChessBoard.SQ.w | ChessBoard.SQ.m);
    // Empty Pawn Push Confirmation
    expect(engine.chessboard.board[45]).toStrictEqual(ChessBoard.SQ.EMPTY);
    // Board State
    expect(engine.chessboard.halfmove).toStrictEqual(0);
    expect(engine.chessboard.fullmove).toStrictEqual(99);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([1, 0, 1, 0]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.b);
  });
});


//TODO
describe("Unmake Move", () => {
  test("1. Regular Move", () => {
    const engine = new Engine("r6k/8/8/8/8/8/8/K7 b - - 0 1");
    const move = Engine.encodeMoveData(0, 0, 0, 0, 0, 21, 22);
    engine.makeMove(move);
    engine.unmakeMove();

    expect(engine.chessboard.board[21]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.b | ChessBoard.SQ.m);
    expect(engine.chessboard.board[22]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.halfmove).toStrictEqual(0);
    expect(engine.chessboard.fullmove).toStrictEqual(1);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([0, 0, 0, 0]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.b);
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
    expect(engine.chessboard.board[91]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.w | ChessBoard.SQ.m);
    expect(engine.chessboard.board[61]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.halfmove).toStrictEqual(1);
    expect(engine.chessboard.fullmove).toStrictEqual(2);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([0, 0, 0, 0]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.w);
    // Unmake First
    engine.unmakeMove();
    expect(engine.chessboard.board[21]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.b | ChessBoard.SQ.m);
    expect(engine.chessboard.board[22]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.halfmove).toStrictEqual(0);
    expect(engine.chessboard.fullmove).toStrictEqual(1);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([0, 0, 0, 0]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.b);
  });

  test("3. Double Pawn Push", () => {
    const engine = new Engine("r3k3/8/8/8/8/8/P7/R3k2R w KQq - 20 80");
    const move = Engine.encodeMoveData(0, 1, 0, 0, 0, 81, 61);
    engine.makeMove(move);
    engine.unmakeMove();
    
    expect(engine.chessboard.board[81]).toStrictEqual(ChessBoard.SQ.P | ChessBoard.SQ.w | ChessBoard.SQ.m);
    expect(engine.chessboard.board[61]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.halfmove).toStrictEqual(20);
    expect(engine.chessboard.fullmove).toStrictEqual(80);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([1, 1, 0, 1]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.w);
  });

  test("4. Queenside Castle", () => {
    const engine = new Engine("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b Kkq - 20 35");
    const move = Engine.encodeMoveData(0, 0, 2, 0, 0, 25, 23);
    engine.makeMove(move);
    engine.unmakeMove();

    // Castled King's Square (make)
    expect(engine.chessboard.board[23]).toStrictEqual(ChessBoard.SQ.EMPTY);
    // Original King's Square (unmake)
    expect(engine.chessboard.board[25]).toStrictEqual(ChessBoard.SQ.K | ChessBoard.SQ.b | ChessBoard.SQ.c);
    // Castled Rook's Square (make)
    expect(engine.chessboard.board[24]).toStrictEqual(ChessBoard.SQ.EMPTY);
    // Original Rook's Square (unmake)
    expect(engine.chessboard.board[21]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.b);
    // Board State
    expect(engine.chessboard.halfmove).toStrictEqual(20);
    expect(engine.chessboard.fullmove).toStrictEqual(35);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([1, 0, 1, 1]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.b);
  });

  test("5. Kingside Castle", () => {
    const engine = new Engine("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w Kkq - 20 35");
    const move = Engine.encodeMoveData(0, 0, 1, 0, 0, 95, 97);
    engine.makeMove(move);
    engine.unmakeMove();

    // Castled King's Square (make)
    expect(engine.chessboard.board[97]).toStrictEqual(ChessBoard.SQ.EMPTY);
    // Original King's Square (unmake)
    expect(engine.chessboard.board[95]).toStrictEqual(ChessBoard.SQ.K | ChessBoard.SQ.w | ChessBoard.SQ.c);
    // Castled Rook's Square (make)
    expect(engine.chessboard.board[96]).toStrictEqual(ChessBoard.SQ.EMPTY);
    // Original Rook's Square (unmake)
    expect(engine.chessboard.board[98]).toStrictEqual(ChessBoard.SQ.R | ChessBoard.SQ.w);
    // Board State
    expect(engine.chessboard.halfmove).toStrictEqual(20);
    expect(engine.chessboard.fullmove).toStrictEqual(35);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([1, 0, 1, 1]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.w);
  });

  test("6. Piece Capture", () => {
    const engine = new Engine("r1bkqbnr/pppppppp/1n6/8/P7/8/1PPPPPPP/RNBKQBNR b Qq - 30 82");
    const pawnCapture = engine.chessboard.board[61];
    const move = Engine.encodeMoveData(0, 0, 0, pawnCapture, 0, 42, 61);
    engine.makeMove(move);
    engine.unmakeMove();
    // Restored Squares (unmake)
    expect(engine.chessboard.board[42]).toStrictEqual(ChessBoard.SQ.N | ChessBoard.SQ.b | ChessBoard.SQ.m);
    expect(engine.chessboard.board[61]).toStrictEqual(pawnCapture);
    // Board State
    expect(engine.chessboard.halfmove).toStrictEqual(30);
    expect(engine.chessboard.fullmove).toStrictEqual(82);
    expect(engine.chessboard.enpassant).toStrictEqual(-1);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([0, 1, 0, 1]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.b);
  });

  test("7. En Passant", () => {
    const engine = new Engine("r1bkqbnr/ppp1pppp/2n5/3pP3/8/8/PPPP1PPP/RNBKQBNR w Kk d6 0 99");
    const pawnCapture = engine.chessboard.board[44];
    const move = Engine.encodeMoveData(1, 0, 0, pawnCapture, 0, 55, 44);
    engine.makeMove(move);
    engine.unmakeMove();
    // Restored Squares
    expect(engine.chessboard.board[54]).toStrictEqual(ChessBoard.SQ.EMPTY);
    expect(engine.chessboard.board[44]).toStrictEqual(pawnCapture);
    expect(engine.chessboard.board[55]).toStrictEqual(ChessBoard.SQ.P | ChessBoard.SQ.w | ChessBoard.SQ.m);
    // Empty Pawn Push Confirmation
    expect(engine.chessboard.board[45]).toStrictEqual(ChessBoard.SQ.EMPTY);
    // Board State
    expect(engine.chessboard.halfmove).toStrictEqual(0);
    expect(engine.chessboard.fullmove).toStrictEqual(99);
    expect(engine.chessboard.enpassant).toStrictEqual(44);
    expect(engine.chessboard.castle).toStrictEqual(new Int8Array([1, 0, 1, 0]));
    expect(engine.chessboard.turn).toStrictEqual(ChessBoard.SQ.w);
  });
});