const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const requestOriginGuard = (allowedOrigins = []) => (req, res, next) => {
  if (!STATE_CHANGING_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get("origin");
  const referer = req.get("referer");

  if (!origin && !referer) {
    return res.status(403).json({ message: "Origin validation failed" });
  }

  let sourceOrigin = "";
  try {
    sourceOrigin = new URL(origin || referer).origin;
  } catch {
    return res.status(403).json({ message: "Invalid origin format" });
  }

  const normalizedAllowed = allowedOrigins.map((allowedOrigin) => {
    try {
      return new URL(allowedOrigin).origin;
    } catch {
      return allowedOrigin;
    }
  });
  const isAllowed = normalizedAllowed.includes(sourceOrigin);

  if (!isAllowed) {
    return res.status(403).json({ message: "Origin not allowed" });
  }

  return next();
};
