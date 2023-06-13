import ChessBoard from "../src/board";


describe("Unmoved Piece Values", () => {
  describe("white pieces", () => {
    test("1. white pawn should equal 1", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.P).toStrictEqual(1);
    });
    test("2. white knight should equal 2", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.N).toStrictEqual(2);
    });
    test("3. white bishop should equal 3", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.B).toStrictEqual(3);
    });
    test("4. white rook should equal 4", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.R).toStrictEqual(4);
    });
    test("5. white queen should equal 5", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.Q).toStrictEqual(5);
    });
    test("6. white king should equal 6", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.K).toStrictEqual(6);
    });
    test("7. white king (with castle) should equal 38", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.K | ChessBoard.SQ.c).toStrictEqual(38);
    });
  });

  describe("black pieces", () => {
    test("1. black pawn should equal 17", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.P).toStrictEqual(17);
    });
    test("2. black knight should equal 18", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.N).toStrictEqual(18);
    });
    test("3. black bishop should equal 19", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.B).toStrictEqual(19);
    });
    test("4. black rook should equal 20", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.R).toStrictEqual(20);
    });
    test("5. black queen should equal 21", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.Q).toStrictEqual(21);
    });
    test("6. black king should equal 22", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.K).toStrictEqual(22);
    });
    test("7. black king (with castle) should equal 54", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.K | ChessBoard.SQ.c).toStrictEqual(54);
    });
  });
});


describe("Moved Piece Values", () => {
  describe("white pieces", () => {
    test("1. white pawn should equal 65", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.P | ChessBoard.SQ.m).toStrictEqual(65);
    });
    test("2. white knight should equal 66", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.N | ChessBoard.SQ.m).toStrictEqual(66);
    });
    test("3. white bishop should equal 67", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.B | ChessBoard.SQ.m).toStrictEqual(67);
    });
    test("4. white rook should equal 68", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.R | ChessBoard.SQ.m).toStrictEqual(68);
    });
    test("5. white queen should equal 69", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.Q | ChessBoard.SQ.m).toStrictEqual(69);
    });
    test("6. white king should equal 70", () => {
      expect(ChessBoard.SQ.w | ChessBoard.SQ.K | ChessBoard.SQ.m).toStrictEqual(70);
    });
  });

  describe("black pieces", () => {
    test("1. black pawn should equal 81", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.P | ChessBoard.SQ.m).toStrictEqual(81);
    });
    test("2. black knight should equal 82", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.N | ChessBoard.SQ.m).toStrictEqual(82);
    });
    test("3. black bishop should equal 83", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.B | ChessBoard.SQ.m).toStrictEqual(83);
    });
    test("4. black rook should equal 84", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.R | ChessBoard.SQ.m).toStrictEqual(84);
    });
    test("5. black queen should equal 85", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.Q | ChessBoard.SQ.m).toStrictEqual(85);
    });
    test("6. black king should equal 86", () => {
      expect(ChessBoard.SQ.b | ChessBoard.SQ.K | ChessBoard.SQ.m).toStrictEqual(86);
    });
  });
});


describe("Mailbox Arrays", () => {
  test("mailbox64 length", () => {
    expect(ChessBoard.mailbox64.length).toStrictEqual(64);
  });
  test("mailbox120 length", () => {
    expect(ChessBoard.mailbox120.length).toStrictEqual(120);
  });
  test("mailbox120 '-1' count", () => {
    expect(ChessBoard.mailbox120.filter(i => i === -1).length).toStrictEqual(56);
  });
});


describe("Parse FEN", () => {
  test("1. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", () => {
    const chessboard = new ChessBoard();
    const chessboardProto = Object.getPrototypeOf(chessboard);
    expect(chessboardProto.constructor.parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")).toStrictEqual(
      {
        board: new Int8Array(
          [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, 20, 82, 83, 85, 54, 83, 82, 20, -1,
            -1, 17, 17, 17, 17, 17, 17, 17, 17, -1,
            -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
            -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
            -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
            -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
            -1, 1, 1, 1, 1, 1, 1, 1, 1, -1,
            -1, 4, 66, 67, 69, 38, 67, 66, 4, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]),
        castle: new Int8Array([1, 1, 1, 1]),
        enpassant: -1,
        fullmove: 1,
        halfmove: 0,
        turn: 0
      }
    );
  });
});


describe("Pad Board with -1's", () => {
  test("1. 8x8 blank array", () => {
    const board = new Int8Array([
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0
    ]);
    const chessboard = new ChessBoard();
    const chessboardProto = Object.getPrototypeOf(chessboard);
    expect(chessboardProto.constructor.padBoard(board)).toStrictEqual(new Int8Array(
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]));
  });
});



describe("Initialise ChessBoard", () => {
  test("1. No FEN provided in constructor", () => {
    const chessboard = new ChessBoard();
    expect(chessboard.castle).toStrictEqual(new Int8Array([1, 1, 1, 1]));
    expect(chessboard.turn).toStrictEqual(0);
    expect(chessboard.enpassant).toStrictEqual(-1);
    expect(chessboard.halfmove).toStrictEqual(0);
    expect(chessboard.fullmove).toStrictEqual(1);
    expect(chessboard.board).toStrictEqual(new Int8Array(
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, 20, 82, 83, 85, 54, 83, 82, 20, -1,
        -1, 17, 17, 17, 17, 17, 17, 17, 17, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 1, 1, 1, 1, 1, 1, 1, 1, -1,
        -1, 4, 66, 67, 69, 38, 67, 66, 4, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]));
  });
  test("2. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", () => {
    const chessboard = new ChessBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(chessboard.castle).toStrictEqual(new Int8Array([1, 1, 1, 1]));
    expect(chessboard.turn).toStrictEqual(0);
    expect(chessboard.enpassant).toStrictEqual(-1);
    expect(chessboard.halfmove).toStrictEqual(0);
    expect(chessboard.fullmove).toStrictEqual(1);
    expect(chessboard.board).toStrictEqual(new Int8Array(
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, 20, 82, 83, 85, 54, 83, 82, 20, -1,
        -1, 17, 17, 17, 17, 17, 17, 17, 17, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 1, 1, 1, 1, 1, 1, 1, 1, -1,
        -1, 4, 66, 67, 69, 38, 67, 66, 4, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]));
  });
  test("3. r3k3/p5pp/8/2p1p3/4P3/2N5/3P1PPP/R1BQK2R b q c6 0 38", () => {
    const chessboard = new ChessBoard("r3k3/p5pp/8/2p1p3/4P3/2N5/3P1PPP/R1BQK2R b q c6 0 38");
    expect(chessboard.castle).toStrictEqual(new Int8Array([0, 0, 0, 1]));
    expect(chessboard.turn).toStrictEqual(16);
    expect(chessboard.enpassant).toStrictEqual(43);
    expect(chessboard.halfmove).toStrictEqual(0);
    expect(chessboard.fullmove).toStrictEqual(38);
    expect(chessboard.board).toStrictEqual(new Int8Array(
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, 20, 0, 0, 0, 54, 0, 0, 0, -1,
        -1, 17, 0, 0, 0, 0, 0, 17, 17, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 81, 0, 81, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 65, 0, 0, 0, -1,
        -1, 0, 0, 66, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 1, 0, 1, 1, 1, -1,
        -1, 68, 0, 67, 69, 70, 0, 0, 68, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]));
  });
  test("4. 8/8/4k3/8/8/3K4/8/8 w - - 32 120", () => {
    const chessboard = new ChessBoard("8/8/4k3/8/8/3K4/8/8 w - - 32 120");
    expect(chessboard.castle).toStrictEqual(new Int8Array([0, 0, 0, 0]));
    expect(chessboard.turn).toStrictEqual(0);
    expect(chessboard.enpassant).toStrictEqual(-1);
    expect(chessboard.halfmove).toStrictEqual(32);
    expect(chessboard.fullmove).toStrictEqual(120);
    expect(chessboard.board).toStrictEqual(new Int8Array(
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 86, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 70, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]));
  });
  test("5. 7K/8/8/8/P7/8/8/k7 b - a4 0 65", () => {
    const chessboard = new ChessBoard("7K/8/8/8/P7/8/8/k7 b - a4 0 65");
    expect(chessboard.castle).toStrictEqual(new Int8Array([0, 0, 0, 0]));
    expect(chessboard.turn).toStrictEqual(16);
    expect(chessboard.enpassant).toStrictEqual(61);
    expect(chessboard.halfmove).toStrictEqual(0);
    expect(chessboard.fullmove).toStrictEqual(65);
    expect(chessboard.board).toStrictEqual(new Int8Array(
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 70, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 65, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, 86, 0, 0, 0, 0, 0, 0, 0, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]));
  });
});


describe("Get FEN", () => {
  test("1. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", () => {
    const chessboard = new ChessBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(chessboard.getFEN()).toStrictEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  });
  test("2. r3k3/p5pp/8/2p1p3/4P3/2N5/3P1PPP/R1BQK2R b q c6 0 38", () => {
    const chessboard = new ChessBoard("r3k3/p5pp/8/2p1p3/4P3/2N5/3P1PPP/R1BQK2R b q c6 0 38");
    expect(chessboard.getFEN()).toStrictEqual("r3k3/p5pp/8/2p1p3/4P3/2N5/3P1PPP/R1BQK2R b q c6 0 38");
  });
  test("3. 8/8/4k3/8/8/3K4/8/8 w - - 32 120", () => {
    const chessboard = new ChessBoard("8/8/4k3/8/8/3K4/8/8 w - - 32 120");
    expect(chessboard.getFEN()).toStrictEqual("8/8/4k3/8/8/3K4/8/8 w - - 32 120");
  });
  test("4. 7K/8/8/8/P7/8/8/k7 b - a4 0 65", () => {
    const chessboard = new ChessBoard("7K/8/8/8/P7/8/8/k7 b - a4 0 65");
    expect(chessboard.getFEN()).toStrictEqual("7K/8/8/8/P7/8/8/k7 b - a4 0 65");
  });
  test("5. 8/8/8/8/8/8/8/8 w - - 5 10", () => {
    const chessboard = new ChessBoard();
    chessboard.board = new Int8Array([
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
      -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
      -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
      -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
      -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
      -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
      -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
      -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);
    chessboard.turn = 0;
    chessboard.castle = new Int8Array([0,0,0,0]);
    chessboard.enpassant = -1;
    chessboard.halfmove = 5;
    chessboard.fullmove = 10;
    expect(chessboard.getFEN()).toStrictEqual("8/8/8/8/8/8/8/8 w - - 5 10");
  });
});


describe("Encode Square", () => {
  test("1. white pawn unmoved", () => {
    expect(ChessBoard.encodeSquare("P", false, false)).toStrictEqual(1);
  });
  test("2. black rook moved", () => {
    expect(ChessBoard.encodeSquare("r", true, false)).toStrictEqual(84);
  });
  test("3. white king moved", () => {
    expect(ChessBoard.encodeSquare("K", true, false)).toStrictEqual(70);
  });
  test("4. black king unmoved (can castle)", () => {
    expect(ChessBoard.encodeSquare("k", false, true)).toStrictEqual(54);
  });
});


describe("Decode Square", () => {
  test("1. white pawn unmoved", () => {
    const square = ChessBoard.encodeSquare("P",false,false);
    expect(ChessBoard.decodeSquare(square)).toStrictEqual({
      piece: "P",
      hasMoved: false,
      canCastle: false,
    });
  });
  test("2. black rook moved", () => {
    const square = ChessBoard.encodeSquare("r",true,false);
    expect(ChessBoard.decodeSquare(square)).toStrictEqual({
      piece: "r",
      hasMoved: true,
      canCastle: false,
    });  });
  test("3. white king moved", () => {
    const square = ChessBoard.encodeSquare("K",true,false);
    expect(ChessBoard.decodeSquare(square)).toStrictEqual({
      piece: "K",
      hasMoved: true,
      canCastle: false,
    });  });
  test("4. black king unmoved (can castle)", () => {
    const square = ChessBoard.encodeSquare("k",false,true);
    expect(ChessBoard.decodeSquare(square)).toStrictEqual({
      piece: "k",
      hasMoved: false,
      canCastle: true,
    });  });
});