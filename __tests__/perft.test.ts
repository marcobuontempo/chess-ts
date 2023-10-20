import ChessBoard from "../src/board";
import Engine from "../src/engine";


describe("Initial Position", () => {
  test("Depth: 0", () => {
    const engine = new Engine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const nodes = engine.perft(0);
    expect(nodes).toStrictEqual(1);
  });
  test("Depth: 1", () => {
    const engine = new Engine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const nodes = engine.perft(1);
    expect(nodes).toStrictEqual(20);
  });
  // test("Depth: 2", () => {
  //   const engine = new Engine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  //   const nodes = engine.perft(2);
  //   expect(nodes).toStrictEqual(400);
  // });
  // test("Depth: 3", () => {
  //   const engine = new Engine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  //   const nodes = engine.perft(3);
  //   expect(nodes).toStrictEqual(8902);
  // });
});
