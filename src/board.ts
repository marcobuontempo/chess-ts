export default class ChessBoard {
  board: Int8Array = new Int8Array(120);            // 10x12 board - represented as a 1D array
  castle: Int8Array = new Int8Array(4);             // castle rights available [wK, wQ, bK, bQ]
  enpassant: Number = 0;                            // 10x12 index for the enpassant target square
  halfmove: Number = 0;                             // halfmove clock for 50 move rule
  fullmove: Number = 0;                             // fullmove clock
  turn: Number = 0;                                 // current turn: 0 white, 1 black


  constructor(fen: string) {
    this.initBoardState(fen);
  }

  initBoardState(fen: string) {
    const { board, turn, castle, enpassant, halfmove, fullmove } = ChessBoard.parseFEN(fen);
    this.board = board;
    this.turn = turn;
    this.castle = castle;
    this.enpassant = enpassant;
    this.halfmove = halfmove;
    this.fullmove = fullmove;
    this.turn = turn;
  }

  /**
   * SQUARE INFORMATION ENCODINGS
   * binary representation to encode piece information
   * 
   * bit 1-3: piece information
   * bit 4: unused
   * bit 5: colour (0 white, 1 black)
   * bit 6: king castle rights
   * bit 7: piece has moved
   * bit 8: unused
   */
  static SQ = {
    P: 0b0000_0001,    //| pawn:               1   
    N: 0b0000_0010,    //| knight:             2
    B: 0b0000_0011,    //| bishop:             3
    R: 0b0000_0100,    //| rook:               4
    Q: 0b0000_0101,    //| queen:              5
    K: 0b0000_0110,    //| king:               6
    w: 0b0000_0000,    //| white:              0
    b: 0b0001_0000,    //| black:              16
    c: 0b0010_0000,    //| can castle (king):  32
    m: 0b0100_0000,    //| piece has moved:    64
  };

  /** REVERSE SQ LOOKUP */
  static SQ_R = {
    0b0000_0001: "P",
    0b0000_0010: "N",
    0b0000_0011: "B",
    0b0000_0100: "R",
    0b0000_0101: "Q",
    0b0000_0110: "K",
    0b0000_0000: "w",
    0b0001_0000: "b",
    0b0010_0000: "c",
    0b0100_0000: "m",
  };

  /** PIECE -> CHARACTER MAPPINGS */
  static PIECE_CH = {
    0b0000_0000: ".",
    0b0000_0001: "P",
    0b0000_0010: "N",
    0b0000_0011: "B",
    0b0000_0100: "R",
    0b0000_0101: "Q",
    0b0000_0110: "K",
    0b0001_0001: "p",
    0b0001_0010: "n",
    0b0001_0011: "b",
    0b0001_0100: "r",
    0b0001_0101: "q",
    0b0001_0110: "k",
  };

  /** PIECE -> UNICODE MAPPINGS */
  static PIECE_UTF = {
    0b0000_0000: ".",
    0b0000_0001: "♙",
    0b0000_0010: "♘",
    0b0000_0011: "♗",
    0b0000_0100: "♖",
    0b0000_0101: "♕",
    0b0000_0110: "♔",
    0b0001_0001: "♟",
    0b0001_0010: "♞",
    0b0001_0011: "♝",
    0b0001_0100: "♜",
    0b0001_0101: "♛",
    0b0001_0110: "♚",
  };

  /**
  *  MAILBOX BOARD STRUCTURES
  * 
  * [64]  -> a lookup table to get the index value of the outer board
  * 
  * [120] -> used for efficient move generation
  *       -> actual 8x8 board embedded in centre
  *       -> board edges padded with '-1' values (+1 col E&W, +2 rows N&S)
  *  
  * Example:
  * -> A1 = mailbox64[56] = mailbox120[91]
  * -> H8 = mailbox64[7]  = mailbox120[28]
  * 
  *     -- OUTER BOARD INDEXES [120] --              -- ACTUAL BOARD INDEXES [64] --
  *   0   1   2   3   4   5   6   7   8   9
  *  10  11  12  13  14  15  16  17  18  19
  *  20  21  22  23  24  25  26  27  28  29         8)  21  22  23  24  25  26  27  28
  *  30  31  32  33  34  35  36  37  38  39         7)  31  32  33  34  35  36  37  38
  *  40  41  42  43  44  45  46  47  48  49         6)  41  42  43  44  45  46  47  48
  *  50  51  52  53  54  55  56  57  58  59    =>   5)  51  52  53  54  55  56  57  58
  *  60  61  62  63  64  65  66  67  68  69    <=   4)  61  62  63  64  65  66  67  68
  *  70  71  72  73  74  75  76  77  78  79         3)  71  72  73  74  75  76  77  78
  *  80  81  82  83  84  85  86  87  88  89         2)  81  82  83  84  85  86  87  88
  *  90  91  92  93  94  95  96  97  98  99         1)  91  92  93  94  95  96  97  98
  * 100 101 102 103 104 105 106 107 108 109             A   B   C   D   E   F   G   H
  * 110 111 112 113 114 115 116 117 118 119
  * 
  */
  static mailbox64 = new Int8Array([
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
    51, 52, 53, 54, 55, 56, 57, 58,
    61, 62, 63, 64, 65, 66, 67, 68,
    71, 72, 73, 74, 75, 76, 77, 78,
    81, 82, 83, 84, 85, 86, 87, 88,
    91, 92, 93, 94, 95, 96, 97, 98
  ]);

  static mailbox120 = new Int8Array([
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
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  ]);

  /**
   * converts FEN string into data values
   */
  static parseFEN(fen: string) {
    // Object to store output data
    const output = {
      board: new Int8Array(120),
      turn: 0,
      castle: new Int8Array(4),
      enpassant: 0,
      halfmove: 0,
      fullmove: 0
    }

    // Split each segment of FEN
    const [fenBoard, fenTurn, fenCastle, fenEnPassant, fenHalfMove, fenFullMove] = fen.split(" ");

    // Convert halfmove and fullmove to Integers
    output.halfmove = parseInt(fenHalfMove);
    output.fullmove = parseInt(fenFullMove);

    // Convert En Passant Square to 10x12 index
    if (fenEnPassant !== "-") {
      const file = fenEnPassant[0].toLowerCase().charCodeAt(0) - 97;
      const rank = 8 - parseInt(fenEnPassant[1]);
      const index64 = rank * 8 + file;
      output.enpassant = ChessBoard.mailbox64[index64];
    }

    // Convert castle information to an array
    if (fenCastle.includes("K")) output.castle[0] = 1;
    if (fenCastle.includes("Q")) output.castle[1] = 1;
    if (fenCastle.includes("k")) output.castle[2] = 1;
    if (fenCastle.includes("q")) output.castle[3] = 1;

    // Convert turn to data
    output.turn = ChessBoard.SQ[fenTurn as keyof typeof ChessBoard.SQ];

    // Convert board string into array
    const fenBoardFormatted = fenBoard.replace(/\//g, ""); // Remove newlines '/'
    const board64 = new Int8Array(64);  // Initialise an empty array
    for (let i = 0, j = 0; i < fenBoardFormatted.length; i++, j++) {
      const fenCh = fenBoardFormatted[i];
      if (!isNaN(parseInt(fenCh))) { // Skip # of blank sqaures
        j += parseInt(fenCh) - 1;
        continue;
      }

      // Get square information
      const piece = ChessBoard.SQ[fenCh.toUpperCase() as keyof typeof ChessBoard.SQ];
      const colour = fenCh === fenCh.toUpperCase() ? ChessBoard.SQ.w : ChessBoard.SQ.b;
      let flags = 0;

      // Set flags for king castling (set 'can castle' if either king-side or queen-side available)
      if ((fenCh === "K" && (output.castle[0] === 1 || output.castle[1] === 1)) ||
        (fenCh === "k" && (output.castle[2] === 1 || output.castle[3] === 1))) {
        flags = flags | ChessBoard.SQ.c;
      }
      if ((fenCh === "K" && output.castle[0] === 0 && output.castle[1] === 0) ||
        (fenCh === "k" && output.castle[2] === 0 && output.castle[3] === 0)) {
        flags = flags | ChessBoard.SQ.m;
      }

      // Set flags for rook (set to 'piece moved' if castle is unavailable)
      if ((fenCh === "R" && j === 63 && output.castle[0] === 0) ||
        (fenCh === "R" && j === 56 && output.castle[1] === 0) ||
        (fenCh === "r" && j === 7 && output.castle[2] === 0) ||
        (fenCh === "r" && j === 0 && output.castle[3] === 0)) {
        flags = flags | ChessBoard.SQ.m;
      }

      // Encode square
      board64[j] = piece | colour | flags;
    }

    // Pad 64 board into 120
    output.board = ChessBoard.padBoard(board64);

    return output;
  }

  /**
   * converts 10x12 board state array into a FEN string
   */
  static stringifyFEN(board10x12: Int8Array) {
    // TODO
  }

  /**
  * PADS A []64 BOARD WITH -1'S TO MAKE []120
  */
  static padBoard(inpBoard: Int8Array) {
    const outBoard = new Int8Array([...ChessBoard.mailbox120]);
    ChessBoard.mailbox64.forEach((mi, i) => {
      outBoard[mi] = inpBoard[i];
    });
    return outBoard;
  }

  /**
  * PRINTS CURRENT BOARD STATE TO TERMINAL
  * can use decimal, character, or unicode notation
  */
  printBoard(pieceSymbol: "decimal" | "character" | "unicode" = "unicode") {
    process.stdout.write(" +---------------------------+\n");
    process.stdout.write("+-----------------------------+\n| |");

    for (let i = 21; i <= 98; i++) {
      if (i % 10 === 0) { process.stdout.write("| |"); continue; }
      if (i % 10 === 9) { process.stdout.write(" | |\n"); continue; }

      let square = "";
      const piece = this.board[i] & 0b0001_0111;  // get *only* the piece and colour value for lookup

      switch (pieceSymbol) {
        case "decimal":
          square = String(this.board[i]);
          break;
        case "character":
          square = ` ${ChessBoard.PIECE_CH[piece as keyof typeof ChessBoard.PIECE_CH]} `;
          break;
        case "unicode":
          square = ` ${ChessBoard.PIECE_UTF[piece as keyof typeof ChessBoard.PIECE_UTF]} `;
          break;
        default:
          square = "ERR";
          break;
      }

      square = square.padStart(3);
      process.stdout.write(square);
    }

    process.stdout.write(" | |\n+-----------------------------+\n");
    process.stdout.write(" +---------------------------+\n");
  }
}