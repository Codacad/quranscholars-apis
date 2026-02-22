import { isAdmin } from "../middlewares/isAdmin.js";
import { requestOriginGuard } from "../middlewares/requestOriginGuard.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("isAdmin middleware", () => {
  test("returns 401 when req.user is missing", () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 for non-admin users", () => {
    const req = { user: { role: "user" } };
    const res = mockRes();
    const next = jest.fn();
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next for admin users", () => {
    const req = { user: { role: "admin" } };
    const res = mockRes();
    const next = jest.fn();
    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("requestOriginGuard middleware", () => {
  test("allows read-only methods without origin", () => {
    const guard = requestOriginGuard(["http://localhost:3001"]);
    const req = { method: "GET", get: jest.fn() };
    const res = mockRes();
    const next = jest.fn();
    guard(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("blocks state-changing requests when origin/referer missing", () => {
    const guard = requestOriginGuard(["http://localhost:3001"]);
    const req = { method: "POST", get: jest.fn().mockReturnValue(undefined) };
    const res = mockRes();
    const next = jest.fn();
    guard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("allows state-changing requests from allowed origin", () => {
    const guard = requestOriginGuard(["http://localhost:3001"]);
    const req = {
      method: "PATCH",
      get: jest.fn((name) => (name === "origin" ? "http://localhost:3001" : undefined)),
    };
    const res = mockRes();
    const next = jest.fn();
    guard(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

