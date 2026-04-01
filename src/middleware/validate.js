import { httpError } from "../utils/httpError.js";

function validate(schema, target = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return next(httpError(400, "Validation failed", details));
    }

    req[target] = result.data;
    return next();
  };
}

export { validate };
