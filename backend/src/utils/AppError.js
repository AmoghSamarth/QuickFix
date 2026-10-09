/** Operational error that maps cleanly to the API error format. */
class AppError extends Error {
  constructor(status, message, code = 'ERROR', fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
const notFound = (what = 'Resource') => new AppError(404, `${what} not found`, 'NOT_FOUND');

module.exports = { AppError, notFound };
