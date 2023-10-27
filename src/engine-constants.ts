/* MOVES VALUES
 * binary representation of move information
 *
 * bit 1-8:    [TO]           square from (index of 120[] board)
 * bit 9-16:   [FROM]         square to (index of 120[] board)
 * bit 17-19:  [PROMOTE]      3-bit piece value of what to promote to (in case of pawn promotion. i.e. ChessBoard.SQ.N, B, R or Q)
 * bit 20-27:  [CAPTURE]      complete 8-bit piece value of what was captured (i.e. ChessBoard.SQ.P, N, B, R, Q, including flags)
 * bit 28-29:  [CASTLE]       whether the move was castle (1 = KingSide, 2 = QueenSide)
 * bit 30:     [DOUBLE PUSH]  signifies that the move involved a double-push of a pawn
 * bit 31:     [EN PASSANT]   whether an "en passant" move was played
 * bit 32:     [UNUSUED]      currently unused
 */
export const SQUARE_TO = 0b0000_0000_0000_0000_0000_0000_1111_1111;
export const SQUARE_FROM = 0b0000_0000_0000_0000_1111_1111_0000_0000;
export const PIECE_PROMOTE = 0b0000_0000_0000_0111_0000_0000_0000_0000;
export const PIECE_CAPTURE = 0b0000_0111_1111_1000_0000_0000_0000_0000;
export const CASTLE = 0b001_1000_0000_0000_0000_0000_0000_0000;
export const KS_CASTLE = 0b0000_1000_0000_0000_0000_0000_0000_0000;
export const QS_CASTLE = 0b0001_0000_0000_0000_0000_0000_0000_0000;
export const DOUBLE_PUSH = 0b0010_0000_0000_0000_0000_0000_0000_0000;
export const EN_PASSANT = 0b0100_0000_0000_0000_0000_0000_0000_0000;

/**
 * MOVE DIRECTIONS
 * index matches piece encoding
 * e.g. king = 6 = MOVES_LIST[6]
 */
export const NORTH = -10;
export const SOUTH = 10;
export const EAST = 1;
export const WEST = -1;
export const NORTHEAST = -9;
export const NORTHWEST = -11;
export const SOUTHEAST = 11;
export const SOUTHWEST = 9;


/**
 * THE POSSIBLE DIRECTIONS THAT EACH PIECE CAN GO IN 1-STEP
 * can be accessed using the the piece value (black pawn is special). i.e. knight = 2 = MOVES_LIST[2]
 */
export const MOVES_LIST = [
  /* black pawn */[(SOUTH), (2*SOUTH), (SOUTHEAST), (SOUTHWEST)],
  /* white pawn */[(NORTH), (2*NORTH), (NORTHEAST), (NORTHWEST)],
  /*     knight */[(NORTH+NORTHEAST), (NORTH+NORTHWEST), (EAST+NORTHEAST), (EAST+SOUTHEAST), (SOUTH+SOUTHEAST), (SOUTH+SOUTHWEST), (WEST+NORTHWEST), (WEST+SOUTHWEST)],
  /*     bishop */[(NORTHEAST), (NORTHWEST), (SOUTHEAST), (SOUTHWEST)],
  /*       rook */[(NORTH), (SOUTH), (EAST), (WEST)],
  /*      queen */[(NORTH), (SOUTH), (EAST), (WEST), (NORTHEAST), (NORTHWEST), (SOUTHEAST), (SOUTHWEST)],
  /*       king */[(NORTH), (SOUTH), (EAST), (WEST), (NORTHEAST), (NORTHWEST), (SOUTHEAST), (SOUTHWEST)]
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