import { SQ } from "../src/board";

describe("piece value tests", () => {
    test("white unmoved pawn should equal 1", () => {
        expect(SQ.P | SQ.w).toStrictEqual(1);
    });
    test("white moved pawn should equal 65", () => {
        expect(SQ.P | SQ.w | SQ.m).toStrictEqual(65);
    });
    test("white moved knight should equal 2", () => {
        expect(SQ.N | SQ.w).toStrictEqual(2);
    });
});