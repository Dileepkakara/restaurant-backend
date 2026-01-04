// NOTE: Avoid importing Zod types at runtime (type-only). Schemas are passed at runtime.
export default function validate(schema) {
  return (req, res, next) => {
    try {
      // parse returns typed object - for multipart/form-data express uses strings in req.body
      if (schema && typeof schema.parse === 'function') {
        // If it's a multipart form (register), req.body fields will be strings; pass as-is
        schema.parse(req.body || {});
      }
      next();
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };
}
