import * as board from "../src/board";

describe("piece value tests", () => {
    test("white unmoved pawn should equal 1", () => {
        expect(board.P | board.w).toStrictEqual(1);
    });
    test("white moved pawn should equal 65", () => {
        expect(board.P | board.w | board.m).toStrictEqual(65);
    });
    test("white moved knight should equal 2", () => {
        expect(board.N | board.w).toStrictEqual(2);
    });
});