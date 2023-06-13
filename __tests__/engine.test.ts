import ChessBoard from "../src/board";
import Engine from "../src/engine";


describe("Encode Move Data", () => {
  test("1. Castle[No], Capture[No], Promotion[No], From[21], To[22]", () => {
    expect(Engine.encodeMoveData(0, 0, 0, 21, 22)).toStrictEqual(0b0000_0000_0000_0000_0001_0101_0001_0110);
  });
  test("2. Castle[No], Capture[Rook], Promotion[No], From[98], To[28]", () => {
    expect(Engine.encodeMoveData(0, ChessBoard.SQ.R, 0, 98, 28)).toStrictEqual(0b0000_0000_0010_0000_0110_0010_0001_1100);
  });
  test("3. Castle[QueenSide], Capture[No], Promotion[No], From[25], To[21]", () => {
    expect(Engine.encodeMoveData(2, 0, 0, 25, 21)).toStrictEqual(0b0000_0000_1000_0000_0001_1001_0001_0101);
  });
  test("4. Castle[No], Capture[Knight], Promotion[Queen], From[87], To[96]", () => {
    expect(Engine.encodeMoveData(0, ChessBoard.SQ.N, ChessBoard.SQ.Q, 87, 96)).toStrictEqual(0b0000_0000_0001_0101_0101_0111_0110_0000);
  });
  test("5. Castle[KingSide], Capture[No], Promotion[No], From[95], To[98]", () => {
    expect(Engine.encodeMoveData(1, 0, 0, 95, 98)).toStrictEqual(0b0000_0000_0100_0000_0101_1111_0110_0010);
  });
});


describe("Decode Move Data", () => {
  test("1. Castle[No], Capture[No], Promotion[No], From[21], To[22]", () => {
    expect(Engine.decodeMoveData(0b0000_0000_0000_0000_0001_0101_0001_0110)).toStrictEqual({
      castle: 0,
      capture: 0,
      promotion: 0,
      from: 21,
      to: 22,
    });
  });
  test("2. Castle[No], Capture[Rook], Promotion[No], From[98], To[28]", () => {
    expect(Engine.decodeMoveData(0b0000_0000_0010_0000_0110_0010_0001_1100)).toStrictEqual({
      castle: 0,
      capture: ChessBoard.SQ.R,
      promotion: 0,
      from: 98,
      to: 28,
    });
  });
  test("3. Castle[QueenSide], Capture[No], Promotion[No], From[25], To[21]", () => {
    expect(Engine.decodeMoveData(0b0000_0000_1000_0000_0001_1001_0001_0101)).toStrictEqual({
      castle: 2,
      capture: 0,
      promotion: 0,
      from: 25,
      to: 21,
    });
  });
  test("4. Castle[No], Capture[Knight], Promotion[Queen], From[87], To[96]", () => {
    expect(Engine.decodeMoveData(0b0000_0000_0001_0101_0101_0111_0110_0000)).toStrictEqual({
      castle: 0,
      capture: ChessBoard.SQ.N,
      promotion: ChessBoard.SQ.Q,
      from: 87,
      to: 96,
    });
  });
  test("5. Castle[KingSide], Capture[No], Promotion[No], From[95], To[98]", () => {
    expect(Engine.decodeMoveData(0b0000_0000_0100_0000_0101_1111_0110_0010)).toStrictEqual({
      castle: 1,
      capture: 0,
      promotion: 0,
      from: 95,
      to: 98,
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
  test("1. nbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", () => {
    const engine = new Engine("nbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(engine.evaluatePosition()).toBeGreaterThanOrEqual(0);
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


//TODO
describe("Make Move", () => {
  test("PLACEHOLDER", () => {
    expect(true).toStrictEqual(true);
  });
});


//TODO
describe("Unmake Move", () => {
  test("PLACEHOLDER", () => {
    expect(true).toStrictEqual(true);
  });
});