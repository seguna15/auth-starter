import ErrorHandler from "../utils/ErrorHandler.util.js";
import { getTokenFromHeader, verifyToken } from "../utils/token.util.js";

export const isLoggedIn = (req, res, next) => {
  //get token from header
  const token = getTokenFromHeader(req);

  //verify the token
  const decodedUser = verifyToken(token, process.env.JWT_ACCESS_KEY);

  if (!decodedUser) {
    next(new ErrorHandler("Invalid/Expired token, please login again", 401));
  }

  //save the user into the req obj
  req.userAuthId = decodedUser?.id;
  next();
};
