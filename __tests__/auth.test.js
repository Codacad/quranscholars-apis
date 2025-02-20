import { addNumbers } from "../mock_testing/addNumbers";

describe("add numbers", () => {
  it("should return the sum of a random number", () => {
    const n = Math.floor() * 100;
    const expectNumber = (n * (n - 1)) / 2;
    expect(addNumbers(n)).toBe(expectNumber);
  });
});
