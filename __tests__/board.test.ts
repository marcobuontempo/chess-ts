import ChessBoard from "../src/board";

describe("unmoved piece value tests", () => {
  describe("white pieces", () => {
    test("white pawn should equal 1", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.P).toStrictEqual(1);
    });
    test("white knight should equal 2", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.N).toStrictEqual(2);
    });
    test("white bishop should equal 3", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.B).toStrictEqual(3);
    });
    test("white rook should equal 4", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.R).toStrictEqual(4);
    });
    test("white queen should equal 5", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.Q).toStrictEqual(5);
    });
    test("white king should equal 6", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.K).toStrictEqual(6);
    });
    test("white king (with castle) should equal 38", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.K | ChessBoard.SQ.c).toStrictEqual(38);
    });
  });

  describe("black pieces", () => {
    test("black pawn should equal 17", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.P).toStrictEqual(17);
    });
    test("black knight should equal 18", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.N).toStrictEqual(18);
    });
    test("black bishop should equal 19", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.B).toStrictEqual(19);
    });
    test("black rook should equal 20", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.R).toStrictEqual(20);
    });
    test("black queen should equal 21", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.Q).toStrictEqual(21);
    });
    test("black king should equal 22", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.K).toStrictEqual(22);
    });
    test("black king (with castle) should equal 54", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.K | ChessBoard.SQ.c).toStrictEqual(54);
    });
  });
});

describe("moved piece value tests", () => {
  describe("white pieces", () => {
    test("white pawn should equal 65", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.P | ChessBoard.SQ.m).toStrictEqual(65);
    });
    test("white knight should equal 66", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.N | ChessBoard.SQ.m).toStrictEqual(66);
    });
    test("white bishop should equal 67", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.B | ChessBoard.SQ.m).toStrictEqual(67);
    });
    test("white rook should equal 68", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.R | ChessBoard.SQ.m).toStrictEqual(68);
    });
    test("white queen should equal 69", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.Q | ChessBoard.SQ.m).toStrictEqual(69);
    });
    test("white king should equal 70", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.K | ChessBoard.SQ.m).toStrictEqual(70);
    });
  });

  describe("black pieces", () => {
    test("black pawn should equal 81", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.P | ChessBoard.SQ.m).toStrictEqual(81);
    });
    test("black knight should equal 82", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.N | ChessBoard.SQ.m).toStrictEqual(82);
    });
    test("black bishop should equal 83", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.B | ChessBoard.SQ.m).toStrictEqual(83);
    });
    test("black rook should equal 84", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.R | ChessBoard.SQ.m).toStrictEqual(84);
    });
    test("black queen should equal 85", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.Q | ChessBoard.SQ.m).toStrictEqual(85);
    });
    test("black king should equal 86", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.K | ChessBoard.SQ.m).toStrictEqual(86);
    });
  });
});

