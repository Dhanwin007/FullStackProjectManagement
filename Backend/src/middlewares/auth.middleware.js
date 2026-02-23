import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/api-error.js';
import { User } from '../models/user.models.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ProjectMember } from '../models/projectmember.models.js';
import { Project } from '../models/project.models.js';
import mongoose from 'mongoose';

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req
      .header('Authorization')
      ?.repalce(
        'Bearer ',
        '',
      ); /*"?" represents optional chaining i.e, if req.cookies are present then th
    access token is accessed if the req.cookies does not exist then it does not throw any error and simply stops chaining
    (not accesing the access token that does not exist) */
  if (!token) {
    throw new ApiError(401, 'Unauthorized request');
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken -emailVerificationToken -emailVerificationExpiry',
    );
    if (!user) {
      throw new ApiError(401, 'Invalid token');
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid access token');
  }
});
const validateProjectPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    if (!projectId) {
      throw new ApiError(400, 'Project ID is missing');
    }

    const membership = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!membership) {
      // If no membership found, they aren't even a member of the project
      throw new ApiError(403, 'You are not a member of this project');
    }

    const userRole = membership.role;
    req.user.role = userRole; // Attach role to user object for controllers

    // FIX: If no specific roles are required (empty array), 
    // any member can proceed (for viewing tasks).
    // Otherwise, check if their role is in the allowed list.
    if (roles.length === 0 || roles.includes(userRole)) {
      next();
    } else {
      throw new ApiError(
        403,
        `Permission denied. Required roles: [${roles.join(', ')}]`,
      );
    }
  });
export { verifyJWT, validateProjectPermission };
