import ChessBoard from "../src/board";
import Engine from "../src/engine";

describe("Encode Move Data", () => {
  test("Castle[No], Capture[No], Promotion[No], From[21], To[22]", () => {
    expect(Engine.encodeMoveData(0,0,0,21,22)).toStrictEqual(0b0000_0000_0000_0000_0001_0101_0001_0110);
  });
  test("Castle[No], Capture[Rook], Promotion[No], From[98], To[28]", () => {
    expect(Engine.encodeMoveData(0,ChessBoard.SQ.R,0,98,28)).toStrictEqual(0b0000_0000_0100_0000_0110_0010_0001_1100);
  });
  test("Castle[Yes], Capture[No], Promotion[No], From[25], To[21]", () => {
    expect(Engine.encodeMoveData(1,0,0,25,21)).toStrictEqual(0b0000_0001_0000_0000_0001_1001_0001_0101);
  });
  test("Castle[No], Capture[Knight], Promotion[Queen], From[87], To[96]", () => {
    expect(Engine.encodeMoveData(0,ChessBoard.SQ.N,ChessBoard.SQ.Q,87,96)).toStrictEqual(0b0000_0000_0010_0101_0101_0111_0110_0000);
  });
  test("Castle[Yes], Capture[No], Promotion[No], From[95], To[98]", () => {
    expect(Engine.encodeMoveData(1,0,0,95,98)).toStrictEqual(0b0000_0001_0000_0000_0101_1111_0110_0010);
  });
});

// decode move data

// king is in check

// evaluate position

// make move

// unmake move