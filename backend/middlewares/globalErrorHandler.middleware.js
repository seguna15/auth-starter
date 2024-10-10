
const globalErrHandler = (err, req, res, next) => {
  //stack
  //statusCode
  //message
  const stack = err?.stack;
  const statusCode = err?.statusCode ? err?.statusCode : 500;
  const message = err?.message ? err?.message : "Oops something went wrong";

  console.log(stack);
  console.log(message);

  res.status(statusCode).json({
    success: false,
    stack,
    message,
  });
};


export default globalErrHandler