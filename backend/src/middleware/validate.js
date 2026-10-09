/** validate(schema, 'body' | 'query') -> replaces req[source] with the parsed (trimmed/coerced) value. */
module.exports = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return next(result.error);
  // req.query is a getter in newer Express versions, so store parsed values separately
  if (source === 'query') req.validQuery = result.data;
  else req[source] = result.data;
  next();
};
