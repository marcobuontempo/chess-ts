/**
 * PIECE INFORMATION ENCODINGS
 * binary representation to encode piece information
 * 
 * bit 1-3: piece information
 * bit 4:   unused
 * bit 5:   colour (0 white, 1 black)
 * bit 6:   piece can castle (for king only)
 * bit 7:   piece has moved
 * bit 8:   unused
 */

export const PAWN = 0b0000_0001;        // = 1
export const KNIGHT = 0b0000_0010;      // = 2
export const BISHOP = 0b0000_0011;      // = 3
export const ROOK = 0b0000_0100;        // = 4
export const QUEEN = 0b0000_0101;       // = 5
export const KING = 0b0000_0110;        // = 6
export const WHITE = 0b0000_0000;       // = 0
export const BLACK = 0b0001_0000;       // = 16
export const CAN_CASTLE = 0b0010_0000;  // = 32
export const HAS_MOVED = 0b0100_0000;   // = 64