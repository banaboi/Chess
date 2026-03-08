const constants = require("../src/constants.js");
require("../src/captures.js");

const { sumCaptureValue, getMaterialBalance, PIECE_VALUES } = window.ChessCaptures;

describe("ChessCaptures.sumCaptureValue", () => {
  test("returns 0 for empty array", () => {
    expect(sumCaptureValue([])).toBe(0);
  });

  test("sums single piece values correctly", () => {
    expect(sumCaptureValue(["pb"])).toBe(1);
    expect(sumCaptureValue(["Nw"])).toBe(3);
    expect(sumCaptureValue(["bb"])).toBe(3);
    expect(sumCaptureValue(["rw"])).toBe(5);
    expect(sumCaptureValue(["qb"])).toBe(9);
    expect(sumCaptureValue(["kw"])).toBe(0);
  });

  test("sums multiple pieces", () => {
    expect(sumCaptureValue(["pb", "pb", "Nb"])).toBe(1 + 1 + 3);
    expect(sumCaptureValue(["qw", "pw"])).toBe(9 + 1);
  });

  test("ignores invalid or unknown codes", () => {
    expect(sumCaptureValue(["pb", "x", ""])).toBe(1);
    expect(sumCaptureValue(["??"])).toBe(0);
  });
});

describe("ChessCaptures.getMaterialBalance", () => {
  test("returns 0 when both lists are empty", () => {
    expect(getMaterialBalance([], [])).toBe(0);
  });

  test("returns 0 when both lists null/undefined (uses default [])", () => {
    expect(getMaterialBalance(null, null)).toBe(0);
    expect(getMaterialBalance(undefined, [])).toBe(0);
  });

  test("positive when White captured more value", () => {
    expect(getMaterialBalance(["qb"], [])).toBe(9);
    expect(getMaterialBalance(["pb", "pb"], ["pb"])).toBe(2 - 1);
  });

  test("negative when Black captured more value", () => {
    expect(getMaterialBalance([], ["qw"])).toBe(-9);
    expect(getMaterialBalance(["pb"], ["Nb", "pb"])).toBe(1 - (3 + 1));
  });

  test("equal material gives 0", () => {
    expect(getMaterialBalance(["Nb"], ["Nb"])).toBe(0);
    expect(getMaterialBalance(["pb", "pb", "pb"], ["Nw"])).toBe(0);
  });
});

describe("PIECE_VALUES single source", () => {
  test("ChessCaptures uses same PIECE_VALUES as ChessConstants", () => {
    expect(PIECE_VALUES).toBe(constants.PIECE_VALUES);
  });

  test("constants.PIECE_VALUES has expected keys", () => {
    expect(constants.PIECE_VALUES).toEqual({
      p: 1,
      N: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    });
  });
});
