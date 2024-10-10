import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.util.js";

const isAdmin = async (req, res, next) => {
  //find the logged in user
  const user = await User.findById(req.userAuthId);

  //check if admin
  if (user?.isAdmin) {
    next();
  } else {
    next(new ErrorHandler("Access denied, admin only", 403));
  }
};

export default isAdmin;
