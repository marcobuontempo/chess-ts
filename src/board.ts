/**
 * SQUARE ENCODINGS
 * binary representation used to encode piece information
 * 
 * usage:
 *  white pawn (moved)                  ->  w|P|m  -> 65
 *  black king (unmoved, can castle)    ->  b|K|c  -> 54
 *  empty square                        ->         -> 0
 */
export const SQ = {
  /* PIECES (bits 0-2)*/
  P: 0b0000_0001,    //| pawn:               1   
  N: 0b0000_0010,    //| knight:             2
  B: 0b0000_0011,    //| bishop:             3
  R: 0b0000_0100,    //| rook:               4
  Q: 0b0000_0101,    //| queen:              5
  K: 0b0000_0110,    //| king:               6

  /* FLAGS (bits 4-6) */
  w: 0b0000_0000,    //| white:              0
  b: 0b0001_0000,    //| black:              16
  c: 0b0010_0000,    //| can castle (king):  32
  m: 0b0100_0000,    //| piece has moved:    64
}

/** REVERSE SQ LOOKUP */
export const SQ_R = {
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
}

/**
* MOVE DIRECTIONS
* index matches piece encoding
* e.g. king = 6 = MOVES_LIST[6]
*/
export const NESW = {
  N: -10,
  S: 10,
  E: 1,
  W: -1,
  NE: -9,
  NW: -11,
  SE: 11,
  SW: 9,
}


/**
* THE POSSIBLE DIRECTIONS THAT EACH PIECE CAN GO IN 1-STEP
* can be accessed using the the piece value (excl. black pawn). i.e. knight = 2 = MOVES_LIST[2]
*/
export const MOVES_LIST = [
/* black pawn */ [(NESW.S), (NESW.S + NESW.S), (NESW.SE), (NESW.SW)],
/* white pawn */ [(NESW.N), (NESW.N + NESW.N), (NESW.NE), (NESW.NW)],
/*     knight */ [(NESW.N + NESW.NE), (NESW.N + NESW.NW), (NESW.E + NESW.NE), (NESW.E + NESW.SE), (NESW.S + NESW.SE), (NESW.S + NESW.SW), (NESW.W + NESW.NW), (NESW.W + NESW.SW)],
/*     bishop */ [(NESW.NE), (NESW.NW), (NESW.SE), (NESW.SW)],
/*       rook */ [(NESW.N), (NESW.S), (NESW.E), (NESW.W)],
/*      queen */ [(NESW.N), (NESW.S), (NESW.E), (NESW.W), (NESW.NE), (NESW.NW), (NESW.SE), (NESW.SW)],
/*       king */ [(NESW.N), (NESW.S), (NESW.E), (NESW.W), (NESW.NE), (NESW.NW), (NESW.SE), (NESW.SW)]
];


/**
* WHETHER A PIECE IS A SLIDER OR NOT (I.E. WHETHER IT CAN GO MORE THAN 1-STEP)
* can be accessed using the the piece value (excl. black pawn). i.e. knight = 2 = MOVES_LIST[2]
*/
export const SLIDERS = [
/* black pawn */ false,
/* white pawn */ false,
/*     knight */ false,
/*     bishop */ true,
/*       rook */ true,
/*      queen */ true,
/*       king */ false
];


/**
 *  MAILBOX BOARD STRUCTURES
 * 
 * [64]  -> a lookup table to get the index value of the outer board
 * 
 * [120] -> used for efficient move generation
 *       -> actual board embedded in centre
 *       -> board edges padded with '-1' values (+1 col E&W, +2 rows N&S)
 *  
 * Usage
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
export const mailbox64 = new Int8Array([
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
  51, 52, 53, 54, 55, 56, 57, 58,
  61, 62, 63, 64, 65, 66, 67, 68,
  71, 72, 73, 74, 75, 76, 77, 78,
  81, 82, 83, 84, 85, 86, 87, 88,
  91, 92, 93, 94, 95, 96, 97, 98
]);
export const mailbox120 = new Int8Array([
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1,  0,  0,  0,  0,  0,  0,  0,  0, -1,
  -1,  0,  0,  0,  0,  0,  0,  0,  0, -1,
  -1,  0,  0,  0,  0,  0,  0,  0,  0, -1,
  -1,  0,  0,  0,  0,  0,  0,  0,  0, -1,
  -1,  0,  0,  0,  0,  0,  0,  0,  0, -1,
  -1,  0,  0,  0,  0,  0,  0,  0,  0, -1,
  -1,  0,  0,  0,  0,  0,  0,  0,  0, -1,
  -1,  0,  0,  0,  0,  0,  0,  0,  0, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
]);




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


/**
 * PADS A []64 BOARD WITH -1'S TO MAKE []120
 */
function padBoard(inpBoard: Int8Array) {
  const outBoard = new Int8Array([...mailbox120]);
  mailbox64.forEach((mi, i) => {
    outBoard[mi] = inpBoard[i];
  });
  return outBoard;
}


/** CHARACTER MAPPINGS */
export const PIECE_CH = {
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
}

/** UNICODE MAPPINGS */
export const PIECE_UTF = {
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
}


/**
 * PRINTS BOARD TO TERMINAL
 * can use decimal, character, or unicode notation
 */
function printBoard(board120: Int8Array, pieceSymbol: "decimal" | "character" | "unicode" = "unicode") {
  process.stdout.write(" +---------------------------+\n");
  process.stdout.write("+-----------------------------+\n| |");

  for (let i = 21; i <= 98; i++) {
    if (i % 10 === 0) { process.stdout.write("| |"); continue; }
    if (i % 10 === 9) { process.stdout.write(" | |\n"); continue; }

    let square = "";
    let piece = board120[i] & 0b0001_0111;  // get *only* the piece and colour value for lookup

    switch (pieceSymbol) {
      case "decimal":
        square = String(board120[i]);
        break;
      case "character":
        square = ` ${PIECE_CH[piece as keyof typeof PIECE_CH]} `;
        break;
      case "unicode":
        square = ` ${PIECE_UTF[piece as keyof typeof PIECE_UTF]} `;
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



/**
 * USAGE & TESTING
 */
const board = padBoard(INITIAL_BOARD);
printBoard(board, "unicode");