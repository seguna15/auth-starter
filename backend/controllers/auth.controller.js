import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.util.js";
import bcrypt from "bcryptjs"
import crypto from "node:crypto";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/token.util.js";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mail/email.js";
import cookieOptions from "../utils/cookieOptions.util.js";
import { OAuth2Client } from "google-auth-library";

/**
*   @desc   Create new user
*   @route  POST /api/v1/auth/register
*   @access Public
*/
export const register =  async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    next(new ErrorHandler("Kindly fill username, email & password", 400));

  // check if user exist
  const userExist = await User.findOne({ email });
  if (userExist) {
    next(new ErrorHandler("User already exists", 409));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000, //15 minutes
  });

  if (!user) {
    next(new ErrorHandler("User could not be created"));
  }

  // generate refreshToken and save to token list
  const token = generateRefreshToken(user._id);
  user.sessions.push(token);
  await user.save();

  //send verification email
  await sendVerificationEmail(user.email, verificationToken, next);

  return res.status(201).cookie("refreshTokenCookie", token, cookieOptions).json({
    success: true,
    message: "User created successfully",
    user: {
      ...user._doc,
      password: undefined,
      sessions: undefined
    },
  });
}


/**
*   @desc   Verify user's email
*   @route  POST /api/v1/auth/verify-email
*   @access Public
*/
export const verifyEmail = async (req, res, next) => {
    const {code} = req.body;

    const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: {$gt: Date.now()}
    })

    if(!user) next(new ErrorHandler("Invalid or expired verification code", 400));

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.username, `${process.env.CLIENT_URL}/auth/login`, next)

    return res.status(200).json({
      success: true,
      message: "Welcome Email Sent",
      user: {
        ...user._doc,
        password: undefined,
        sessions: undefined,
      },
    });
}

/**
*   @desc   Login user
*   @route  POST /api/v1/auth/login
*   @access Public
*/
export const login =  async (req, res, next) => {
    const cookies = req.cookies;
  
    const { email, password } = req.body;

    //Find the user by email
    const userFound = await User.findOne({ email });

    if (userFound && (await bcrypt.compare(password, userFound?.password))) {
      // generate access token
      const newRefreshToken = generateRefreshToken(userFound._id);

      // if no token was sent during login maintain the current refreshToken list but if there is token maintain the token list without the current token

      let newSessionArray = !cookies?.refreshTokenCookie
        ? userFound.sessions
        : userFound.sessions.filter(
            (session) => session !== cookies?.refreshTokenCookie
          );

      // if auth cookies exist
      if (cookies?.refreshTokenCookie) {
        //check if it in the list and if not delete all tokens to prevent fraud attempt
        const refreshToken = cookies?.refreshTokenCookie;
        const userWithToken = await User.findOne({ sessions: refreshToken });

        if (!userWithToken) {
          newSessionArray = [];
          res.clearCookie("refreshTokenCookie", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          //Save refresh Token
       
          userFound.sessions.push(newRefreshToken);
          
        }else{

          newSessionArray = userWithToken?.sessions?.filter(
            (session) => session !== refreshToken
          );

          res.clearCookie("refreshTokenCookie", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          //Save refresh Token
          userFound.sessions = [...newSessionArray, newRefreshToken];
         
        }

      }

      userFound.lastLogin = new Date();
      await userFound.save();
      return res
        .status(200)
        .cookie("refreshTokenCookie", newRefreshToken, cookieOptions)
        .json({
          success: true,
          message: "User logged in successfully",
          user: {
            ...userFound._doc,
            sessions: undefined,
            password: undefined,
            token: generateAccessToken(userFound._id)
          }
        });
    }

    next(new ErrorHandler("Invalid login credential", 403));
  
}


/**
*   @desc   Logout user
*   @route  POST /api/v1/auth/logout
*   @access Public
*/
export const logout =  async (req, res, next) => {
  const cookies = req.cookies;
  
  //if no cookie comes with the request logout the user
  if (!cookies?.refreshTokenCookie) {
    return res
      .status(200)
      .json({ success: true, message: "user logged out successfully" });
  }

  //get cookie and find the user with the cookies
  const refreshToken = cookies.refreshTokenCookie;
  const userFound = await User.findOne({ sessions: refreshToken });

  // if no user is found  with the token clear cookies and send response to consuming service
  if (!userFound) {
    return res
      .clearCookie("refreshTokenCookie", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({ success: true, message: "user logged out successfully" });
  }

  //remove the cookies from a list of session cookies
  userFound.sessions = userFound.sessions.filter(
    (session) => session !== refreshToken
  );

  await userFound.save();
  
  // clearCookie
  return res
    .clearCookie("refreshTokenCookie", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({ success: true, message: "user logged out successfully" });
}


/**
*   @desc   refresh access token 
*   @route  POST /api/v1/auth/refresh
*   @access Public
*/
export const refresh = async (req, res, next) => {
  const cookies = req.cookies;
  //return forbidden if cookies is not present
  if (!cookies?.refreshTokenCookie)
    next(new ErrorHandler("No cookie found", 403));

  const refreshToken = cookies?.refreshTokenCookie;

  const userFound = await User.findOne({ sessions: refreshToken });

  //detect reuse of token which does not exist on db
  if (!userFound) {
    const verifiedFakeToken = verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_KEY
    );

    // if token is invalid and just clear token
    if (!verifiedFakeToken) {
      res.clearCookie("refreshTokenCookie", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      next(new ErrorHandler("Token is invalid", 403));
    }

    // finding hacked user
    const hackedUser = await User.findOne({ _id: verifiedFakeToken.id });

    hackedUser.sessions = [];
    await hackedUser.save();
    res.clearCookie("refreshTokenCookie", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    next(new ErrorHandler("Token is invalid", 403));
  }

  // Verify the token sent by the found user
  const verifiedUserToken = verifyToken(
    refreshToken,
    process.env.JWT_REFRESH_KEY
  );

  // delete the token from the list of refresh token  if it is invalid
  if (!verifiedUserToken) {
    userFound.sessions = userFound.sessions.filter(
      (session) => session !== refreshToken
    );
    await userFound.save();
    res.clearCookie("refreshTokenCookie", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    next(new ErrorHandler("Token is invalid", 403));
  }

  const accessToken = generateAccessToken(userFound._id);

  return res.status(200).json({ success: true, accessToken });
};


/**
*   @desc    Send password reset email to user
*   @route  POST /api/v1/auth/forgot-password
*   @access Public
*/
export const forgotPassword = async(req, res, next) => {
    const {email} = req.body;
    
    const user = await User.findOne({email});

    if(!user){
       next(new ErrorHandler("User not found", 404));
    }

    const resetToken =  crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    //send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`, 
      next
    );

    res.status(200).json({success: true, message: "Password reset link has been sent to your email"})
}


/**
*   @desc    Reset user password with token sent to email
*   @route  POST /api/v1/auth/reset-password/:token
*   @access Public
*/
export const resetPassword = async(req, res, next) => {
    const {token} = req.params;
    const {password} = req.body;
    console.log(password)
    const user = await User.findOne({
        resetPasswordToken: token, resetPasswordExpiresAt: {$gt: Date.now()}
    });
    
    //return error if user is not found
    if(!user) next(new ErrorHandler("User not found", 404));

   
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    //send email
    await sendResetSuccessEmail(
      user.email,
      next
    );

    res.status(200).json({success: true, message: "Password reset successful"})
}


//Google OAuth Request
export const googleOathRequest = async (req, res, next) => {
  if(req?.cookies){
    const refreshToken = req.cookies.refreshTokenCookie;

    const userFound = await User.findOne({ sessions: refreshToken });
    if(userFound){
      userFound.sessions = userFound.sessions.filter(
        (session) => session !== refreshToken
      );
      res.clearCookie("refreshTokenCookie", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
    }else{
      
      res.clearCookie("refreshTokenCookie", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
    
  }
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  const redirectUrl = "http://127.0.0.1:8000/api/v1/auth/oauth";

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl
  );

  const authorizeURL = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope:
      "https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/userinfo.profile",
    prompt: "consent",
  });

  res.json({url: authorizeURL})
}


//Google OAuth callback
export const googleOAuth = async (req, res, next) => {
  const code = req.query.code;
  
  try {
    const redirectUrl = "http://127.0.0.1:8000/api/v1/auth/oauth"
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl
    );
    const response = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(response.tokens);
   
    const user = oAuth2Client.credentials;
    
    
    const ticket = await oAuth2Client.verifyIdToken({idToken: user.id_token, audience: process.env.GOOGLE_CLIENT_ID});
    const payload = ticket.getPayload();
    
    //const userId = payload["sub"];
    const name = payload["name"].replace(" ","").toLowerCase();
    const email = payload["email"];
    const isVerified = payload["email_verified"];
    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash(Date.now().toString(), salt)

    const foundUser = await User.findOne({email})
    if(foundUser && foundUser?.authProvider === "google"){
         return res
           .status(303)
           .redirect(
             `${process.env.CLIENT_URL}/auth/oauth-success/${foundUser.email}`
           );
    }
    
    const newUser = await User.create({
      username: name,
      email,
      password: password,
      isVerified,
      lastLogin: new Date(),
      authProvider: "google",
      
    });

    await newUser.save();
     return res
       .status(303)
       .redirect(
         `${process.env.CLIENT_URL}/auth/oauth-success/${newUser.email}`
       );
  } catch (error) {
    console.log(error)
    return res.status(303).redirect(`${process.env.CLIENT_URL}/auth/login`);
  }
}

/**
*   @desc    Fetch user after oauth success
*   @route  POST /api/v1/auth/google-auth-successful/:email
*   @access Public
*/
export const onOauthSuccess = async (req,  res, next) => {
  const cookies = req.cookies;
  
  const { email } = req.body;

  //Find the user by email
  const userFound = await User.findOne({ email });

  if (userFound && userFound.authProvider === "google") {
    // generate access token
    const newRefreshToken = generateRefreshToken(userFound._id);

    // if no token was sent during login maintain the current refreshToken list but if there is token maintain the token list without the current token

    let newSessionArray = !cookies?.refreshTokenCookie
      ? userFound.sessions
      : userFound.sessions.filter(
          (session) => session !== cookies?.refreshTokenCookie
        );

    // if auth cookies exist
    if (cookies?.refreshTokenCookie) {
      //check if it in the list and if not delete all tokens to prevent fraud attempt
      const refreshToken = cookies?.refreshTokenCookie;
      const userWithToken = await User.findOne({ sessions: refreshToken });

      if (!userWithToken) {
        newSessionArray = [];
        res.clearCookie("refreshTokenCookie", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        //Save refresh Token

        userFound.sessions.push(newRefreshToken);
      } else {
        newSessionArray = userWithToken?.sessions?.filter(
          (session) => session !== refreshToken
        );

        res.clearCookie("refreshTokenCookie", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        //Save refresh Token
        userFound.sessions = [...newSessionArray, newRefreshToken];
      }
    }else{
      //Save refresh Token
      userFound.sessions.push(newRefreshToken);
    }
    
    userFound.lastLogin = new Date();
    await userFound.save();
    
    return res
      .status(200)
      .cookie("refreshTokenCookie", newRefreshToken, cookieOptions)
      .json({
        success: true,
        message: "User logged in successfully",
        user: {
          ...userFound._doc,
          sessions: undefined,
          password: undefined,
          token: generateAccessToken(userFound._id),
        },
      });
  }

  next(new ErrorHandler("Invalid login credential", 403));
};