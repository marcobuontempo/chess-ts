/**
 * PIECE ENCODINGS
 * Int8 to encode piece information
 * 
 * usage:
 *  white pawn (moved)   -> w | P | m
 *  black king (unmoved) -> b | K | c
 *
 */
const
  P = 0b0000_0001,    //| pawn:               1   
  N = 0b0000_0010,    //| knight:             2
  B = 0b0000_0011,    //| bishop:             3
  R = 0b0000_0100,    //| rook:               4
  Q = 0b0000_0101,    //| queen:              5
  K = 0b0000_0110,    //| king:               6
  w = 0b0000_0000,    //| white:              0
  b = 0b0001_0000,    //| black:              16
  c = 0b0010_0000,    //| can castle (king):  32
  m = 0b0100_0000;    //| piece has moved:    64


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
 * -> A8 = mailbox64[0] = mailbox120[21]
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
const mailbox64 = new Int8Array([
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
  51, 52, 53, 54, 55, 56, 57, 58,
  61, 62, 63, 64, 65, 66, 67, 68,
  71, 72, 73, 74, 75, 76, 77, 78,
  81, 82, 83, 84, 85, 86, 87, 88,
  91, 92, 93, 94, 95, 96, 97, 98
]);

const mailbox120 = new Int8Array([
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
 * MOVE DIRECTIONS
 * index matches piece encoding
 * e.g. king = 6 = MOVES_LIST[6]
 */
const
  NN = -10,
  SS = 10,
  EE = 1,
  WW = -1,
  NE = NN + EE,
  NW = NN + WW,
  SE = SS + EE,
  SW = SS + WW;
  
const MOVES_LIST = [
  /* black pawn */[(SS), (SS + SS), (SE), (SW)],
  /* white pawn */[(NN), (NN + NN), (NE), (NW)],
  /*     knight */[(NN + NE), (NN + NW), (EE + NE), (EE + SE), (SS + SE), (SS + SW), (WW + NW), (WW + SW)],
  /*     bishop */[(NE), (NW), (SE), (SW)],
  /*       rook */[(NN), (SS), (EE), (WW)],
  /*      queen */[(NN), (SS), (EE), (WW), (NE), (NW), (SE), (SW)],
  /*       king */[(NN), (SS), (EE), (WW), (NE), (NW), (SE), (SW)]
];




/**
 * TESTINGS
 */
const startingPosition = new Int8Array([
  b | R, b | N, b | B, b | Q, b | K, b | B, b | N, b | R,
  b | P, b | P, b | P, b | P, b | P, b | P, b | P, b | P,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  w | P, w | P, w | P, w | P, w | P, w | P, w | P, w | P,
  w | R, w | N, w | B, w | Q, w | K, w | B, w | N, w | R
]);


function loadBoard(inpBoard: Int8Array) {
  const outBoard = new Int8Array([...mailbox120]);
  mailbox64.forEach((mi, i) => {
    outBoard[mi] = inpBoard[i];
  });
  return outBoard;
}

function printBoard(board120: Int8Array, pieceSymbol = "number") {
  process.stdout.write(" +---------------------------+\n");
  process.stdout.write("+-----------------------------+\n| |");

  for (let i = 21; i <= 98; i++) {
    if (i % 10 === 0) { process.stdout.write("| |"); continue; }
    if (i % 10 === 9) { process.stdout.write(" | |\n"); continue; }

    let square = "";

    switch (pieceSymbol) {
      case "number":
        square = String(board120[i]).padStart(3);
        break;
      case "character":
        // TODO: ... pnbrkqPNBRQK
        break;
      case "unicode":
        // TODO: ... ♙♘♗♖♕♔♚♛♜♝♞♟
        break;
      default:
        break;
    }

    process.stdout.write(square);
  }

  process.stdout.write(" | |\n+-----------------------------+\n");
  process.stdout.write(" +---------------------------+\n");
}