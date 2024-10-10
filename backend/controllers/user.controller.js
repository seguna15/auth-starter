import User from "../models/user.model.js"
import ErrorHandler from "../utils/ErrorHandler.util.js"

/**
*   @desc    Fetch user profile
*   @route  POST /api/v1/users/get-user-profile
*   @access Private/User
*/
export const getUserProfile = async (req,res, next) => {
    const user = await User.findById(req.userAuthId)

    if(!user) {
        next(new ErrorHandler("User not found"), 403);
    }

    return res.status(200).json({
        success: true,
        message: "User profile fetched",
        user: {
            ...user._doc,
            password: undefined,
            sessions: undefined,
        }
    })
}

/**
*   @desc   Fetch admin profile
*   @route  POST /api/v1/users/get-admin-profile
*   @access Private/Admin
*/
export const getAdminUserProfile = async (req, res, next) => {
  const user = await User.findById(req.userAuthId);

  if (!user) {
    next(new ErrorHandler("User not found"), 403);
  }

   return res.status(200).json({
     success: true,
     message: "Admin profile fetched",
     user: {
       ...user._doc,
       password: undefined,
       sessions: undefined,
     },
   });
};


