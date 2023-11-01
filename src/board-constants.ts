import { BISHOP, KING, KNIGHT, PAWN, QUEEN, ROOK } from "./piece-constants";

// DEFAULT FEN - INITIAL STARTING POSITION
export const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// EMPTY & EDGE SQUARES
export const EMPTY = 0;
export const EDGE = -1;

// BIT MASK TO FIND WHAT PIECE IS ON SQUARE (`SQUARE & PIECE_MASK` TO GET ONLY THE PIECE WITHOUT ITS FLAGS)
export const PIECE_MASK = 0b0000_0111;

// COLOUR MASK TO FIND WHAT COLOUR PIECE IS (`SQUARE & COLOUR_MASK` TO GET THE PIECE COLOUR)
export const COLOUR_MASK = 0b0001_0000;

// LOOKUP FOR SQUARE VALUES
export const PIECE_LOOKUP: {[key:string]:number} = {
  P: PAWN,
  N: KNIGHT,
  B: BISHOP,
  R: ROOK,
  Q: QUEEN,
  K: KING,
};

// LOOKUP FOR SQUARE PIECE - ALPHA REPRESENTATION
export const SQUARE_ALPHAS: {[key:number]:string} = {
  0b0000_0000: ".",   // Empty
  0b0000_0001: "P",   // Pawn White
  0b0000_0010: "N",   // Knight White
  0b0000_0011: "B",   // Bishop White
  0b0000_0100: "R",   // Rook White
  0b0000_0101: "Q",   // Queen White
  0b0000_0110: "K",   // King White
  0b0001_0001: "p",   // Pawn Black
  0b0001_0010: "n",   // Knight Black
  0b0001_0011: "b",   // Bishop Black
  0b0001_0100: "r",   // Rook Black
  0b0001_0101: "q",   // Queen Black
  0b0001_0110: "k",   // King Black
};

// LOOKUP FOR SQUARE PIECE - UNICODE REPRESENTATION
export const SQUARE_UTF: {[key:number]:string} = {
  0b0000_0000: ".", // Empty
  0b0000_0001: "♙",  // Pawn White
  0b0000_0010: "♘",  // Knight White
  0b0000_0011: "♗",  // Bishop White
  0b0000_0100: "♖",  // Rook White
  0b0000_0101: "♕",  // Queen White
  0b0000_0110: "♔",  // King White
  0b0001_0001: "♟",  // Pawn Black
  0b0001_0010: "♞",  // Knight Black
  0b0001_0011: "♝",  // Bishop Black
  0b0001_0100: "♜",  // Rook Black
  0b0001_0101: "♛",  // Queen Black
  0b0001_0110: "♚",  // King Black
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
export const MAILBOX64 = new Int8Array([
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
  51, 52, 53, 54, 55, 56, 57, 58,
  61, 62, 63, 64, 65, 66, 67, 68,
  71, 72, 73, 74, 75, 76, 77, 78,
  81, 82, 83, 84, 85, 86, 87, 88,
  91, 92, 93, 94, 95, 96, 97, 98
]);
export const MAILBOX120 = new Int8Array([
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, 0, 1, 2, 3, 4, 5, 6, 7, -1,
  -1, 8, 9, 10, 11, 12, 13, 14, 15, -1,
  -1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
  -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
  -1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
  -1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
  -1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
  -1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
]);


/**
 * BOARD STATES
 * binary representation of board state
 * 
 * bits 1-4:   [CASTLE_RIGHTS]      whether castle is available KQkq=1111, Kkq=1011, ..., None=0000
 * bit 5:      [TURN]               0=white, 1=black
 * bits 6-8:   [UNUSED]             currently unused
 * bits 9-16:  [ENPASSANT_SQUARE]   the 120[] index of the enpassant square
 * bits 17-24: [HALFMOVE]           halfmove clock counter, up to 100 (=draw)
 * bits 25-32: [PREV_PIECE]         the full 8-bit encoding of the last piece moved, with flags (i.e. KNIGHT|BLACK|HAS_MOVED)
 * 
 */
export const CASTLE_RIGHTS = 0b0000_0000_0000_0000_0000_0000_0000_1111;
export const CURRENT_TURN = 0b0000_0000_0000_0000_0000_0000_0001_0000;
export const ENPASSANT_SQUARE = 0b0000_0000_0000_0000_1111_1111_0000_0000;
export const HALFMOVE_COUNT = 0b0000_0000_1111_1111_0000_0000_0000_0000;
export const PREV_PIECE = 0b1111_1111_0000_0000_0000_0000_0000_0000;