import ErrorHandler from "../utils/ErrorHandler.util.js";
//404 handler
const notFoundErrHandler = (req, res, next) => {
  const err = new ErrorHandler(`Route ${req.originalUrl} not found`, 404);
  next(err);
};

export default notFoundErrHandler;
