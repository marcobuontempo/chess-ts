/**
 * PIECE ENCODINGS
 * Int8 to encode piece information
 */
const pc = {
  w: 0b0000_0000, // white: 0
  b: 0b0000_0001, // black: 1
  P: 0b0000_0010, // pawn: 2
  N: 0b0000_0100, // knight: 4
  B: 0b0000_0110, // bishop: 6
  R: 0b0000_1000, // rook: 8
  Q: 0b0000_1010, // queen: 10
  K: 0b0000_1110, // king: 14
  c: 0b0001_0000, // can castle (king only): 16
  m: 0b0010_0000  // piece has moved: 32
};

/**
 * PIECE LOOKUPS
 * Int8 are assigned to each piece based on the encodings above
 * p -> pawn
 * n -> knight
 * b -> bishop
 * r -> rook
 * q -> queen
 * k -> king
 */
// black ->
const p = pc.P | pc.b;
const n = pc.N | pc.b;
const b = pc.B | pc.b;
const r = pc.R | pc.b;
const q = pc.Q | pc.b;
const k = pc.K | pc.b;
// white ->
const P = pc.P | pc.w;
const N = pc.N | pc.w;
const B = pc.B | pc.w;
const R = pc.R | pc.w;
const Q = pc.Q | pc.w;
const K = pc.K | pc.w;


/**
 * "MAILBOX" BOARD STRUCTURES
 * 64  -> inner-board *indexes*, that the actual pieces are on
 * 120 -> outer-board, includes additional padding (+2 cols, +4 rows) of illegal squares
 *        improves move generation
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
  -1, 21, 22, 23, 24, 25, 26, 27, 28, -1,
  -1, 31, 32, 33, 34, 35, 36, 37, 38, -1,
  -1, 41, 42, 43, 44, 45, 46, 47, 48, -1,
  -1, 51, 52, 53, 54, 55, 56, 57, 58, -1,
  -1, 61, 62, 63, 64, 65, 66, 67, 68, -1,
  -1, 71, 72, 73, 74, 75, 76, 77, 78, -1,
  -1, 81, 82, 83, 84, 85, 86, 87, 88, -1,
  -1, 91, 92, 93, 94, 95, 96, 97, 98, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
]);