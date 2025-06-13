import asyncHandler from "./../utils/asyncHandler.js";
import ApiError from "../utils/ApiErrors.js";
import cloudinaryUpload from "../utils/cloudinary.js";
import userModel from "../models/user.models.js";
import { createUser } from "../services/user.services.js";
import ApiResponse from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import fs from "fs";
import JWT from "jsonwebtoken";
import { console } from "inspector";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const userExists = await userModel.findById(userId);
    const accessToken = userExists.generate_JWT_Token();
    const refreshToken = userExists.generate_Refresh_Token();

    userExists.refreshToken = refreshToken;
    await userExists.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, [], "Failed to generate tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      errors.array().map((err) => ({
        param: err.param,
        msg: err.msg,
      })),
      "Validation Error"
    );
  }

  const { userName, fullName, email, password } = req.body;

  const avatarfilepath = req.files?.avatar[0].path;
  if (!avatarfilepath) {
    throw new ApiError(400, [], "Avatar is required");
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!userName || !fullName || !email || !password || !avatarfilepath) {
    throw new ApiError(400, [], "All fields are required");
  }

  const userExists = await userModel.findOne({
    $or: [{ userName }, { email }],
  });

  if (userExists) {
    throw new ApiError(
      400,
      [],
      "User already exists with this username or email"
    );
  }

  const avatarURL = await cloudinaryUpload(avatarfilepath);
  let coverImageURL;
  if (coverImageLocalPath) {
    coverImageURL = await cloudinaryUpload(coverImageLocalPath);
  }
  if (!avatarURL) {
    throw new ApiError(500, [], "Failed to upload avatar image");
  }

  try {
    const user = await createUser(
      userName,
      fullName,
      email,
      password,
      avatarURL.url,
      coverImageURL ? coverImageURL.url : " "
    );

    const createdUser = await userModel
      .findById(user._id)
      .select("-password -refreshToken");
    if (!createdUser) {
      throw new ApiError(500, "Failed to create user");
    }
    fs.unlinkSync(avatarfilepath);
    if (coverImageLocalPath) {
      fs.unlinkSync(coverImageLocalPath);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, "User registered successfully", createdUser));
  } catch (error) {
    throw new ApiError(
      500,
      error.array,
      `Failed to register user: ${error.message}`
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new ApiError(
      400,
      error.array().map((err) => ({
        param: err.param,
        msg: err.msg,
      })),
      "Validation Error"
    );
  }

  const { userName, email, password } = req.body;

  if ((!userName && !email) || !password) {
    throw new ApiError(400, [], "All fields are required");
  }

  const isUserExist = await userModel.findOne({
    $or: [{ userName }, { email }],
  });

  if (!isUserExist) {
    throw new ApiError(
      400,
      [],
      "User does not exist with this email or username"
    );
  }

  const isPasswordCorrect = await isUserExist.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, [], "Incorrect password");
  }

  const user = await userModel
    .findById(isUserExist._id)
    .select("-password -refreshToken");
  if (!user) {
    throw new ApiError(500, [], "Failed to login user");
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
    user._id
  );
  const refreshTokenFromDB = await userModel.findById(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, "User logged out successfully", {}));
});

const updateRefreshToken = asyncHandler(async (req, res) => {
  try {
    const obtainedRefreshToken =
      req.cookies?.refreshToken || req.headers.authorization?.split(" ")[1];

    if (!obtainedRefreshToken) {
      throw new ApiError(401, [], "Refresh token is required");
    }

    const decodedToken = JWT.verify(
      obtainedRefreshToken,
      process.env.REFRESH_SECRET_KEY
    );

    if (!decodedToken) {
      throw new ApiError(401, [], "Invalid refresh token");
    }

    const User = await userModel.findById(decodedToken?._id);

    if (!User) {
      throw new ApiError(401, [], "User not found");
    }

    if (User.refreshToken !== obtainedRefreshToken) {
      throw new ApiError(401, [], "Refresh token does not match");
    }
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
      User._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(200, "Tokens updated successfully", {
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(
      500,
      [],
      `Failed to update refresh token: ${error.message}`
    );
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(
        400,
        [],
        "Current password and new password are required"
      );
    }

    if (currentPassword === newPassword) {
      throw new ApiError(
        400,
        [],
        "New password must be different from current password"
      );
    }

    const User = await userModel.findById(req.user._id);
    if (!User) {
      throw new ApiError(404, [], "User not found");
    }

    const isPasswordCorrect = await User.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      throw new ApiError(400, [], "Current password is incorrect");
    }

    User.password = newPassword;
    await User.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, "Password updated successfully", {}));
  } catch (error) {
    throw new ApiError(500, [], `Failed to update password: ${error.message}`);
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(404, [], "Unauthorized access");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Current user retrieved successfully", req.user)
    );
});

const updateUserDetails = asyncHandler(async (req, res) => {
  try {
    let { fullName, email } = req.body;
    const updatedFullName = fullName?fullName:req.user?.fullName;
    const updatedEmail = email?email:req.user?.email;
    let avatarfilepath;
    let coverImagefilepath;

    if (!fullName && !email && !(req.files && req.files.avatar && req.files.avatar[0].path) && !(req.files && req.files.coverImage && req.files.coverImage[0].path)) {
      throw new ApiError(400, [], "No details provided to update");
    }
    
    if(req.files && req.files.avatar && req.files.avatar[0].path)
    {
        try {
            avatarfilepath = req.files.avatar[0].path
            const avatarURL = await cloudinaryUpload(avatarfilepath);
            const user = await userModel.findByIdAndUpdate(
                req.user._id,
                {
                    $set:{avatar:avatarURL.secure_url},
                    validateBeforeSave:false
                }
            )
            fs.unlinkSync(avatarfilepath);
        } catch (error) {
            fs.unlinkSync(avatarfilepath);
            throw new ApiError(400,error,"Error in updating avatar")
        }
    }
    if(req.files && req.files.coverImage && req.files.coverImage[0].path)
    {
        try {
            coverImagefilepath = req.files.coverImage[0].path
            const coverImageUrl = await cloudinaryUpload(coverImagefilepath);
            const user = await userModel.findByIdAndUpdate(
                req.user._id,
                {
                  $set:{coverImage:coverImageUrl.secure_url},
                  validateBeforeSave:false
                }
            )
            fs.unlinkSync(coverImagefilepath);
        } catch (error) {
            fs.unlinkSync(coverImagefilepath);
            throw new ApiError(400,error,"Error in updating cover image")
        }
    }    

    const updatedUser = await userModel
      .findByIdAndUpdate(req.user._id, {
        $set: { fullName: updatedFullName, email: updatedEmail },
        validateBeforeSave:false
      })
      .select("-password -refreshToken");
    
    

    return res
      .status(200)
      .json(
        new ApiResponse(200, "User details updated successfully", updatedUser)
      );
  } catch (error) {
    throw new ApiError(400, [], `Error in updating user : ${error}`);
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  updateRefreshToken,
  updatePassword,
  getCurrentUser,
  updateUserDetails,
};
