import { User } from '../models/user.models.js';
import { Project } from '../models/project.models.js';
import { ProjectMember } from '../models/projectmember.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { Task } from '../models/task.models.js';      
import { Subtask } from '../models/subtask.models.js'; 
import mongoose from 'mongoose';
import { AvalaibleUserRole, UserRolesEnum } from '../utils/constants.js';

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'projectData',
        pipeline: [
          {
            $lookup: {
              from: 'projectmembers',
              localField: '_id',
              foreignField: 'project',
              as: 'membersList',
            },
          },
          // NEW: Lookup for the User who created the project
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'creatorInfo',
            },
          },
          {
            $addFields: {
              memberCount: { $size: '$membersList' },
              creatorName: { $arrayElemAt: ['$creatorInfo.username', 0] },
            },
          },
        ],
      },
    },
    { $unwind: '$projectData' },
    {
      $project: {
        _id: 0,
        role: 1,
        project: {
          _id: '$projectData._id',
          name: '$projectData.name',
          description: '$projectData.description',
          members: '$projectData.memberCount',
          createdAt: '$projectData.createdAt',
          // Pass the actual name instead of the ID
          createdBy: '$projectData.creatorName', 
        },
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, projects, 'Fetched Successfully'));
});
const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const projectData = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'projectDetails',
      },
    },
    { $unwind: '$projectDetails' },
    {
      $project: {
        _id: 0,
        role: 1, // Fetches the actual role from ProjectMember
        project: {
          _id: '$projectDetails._id',
          name: '$projectDetails.name',
          description: '$projectDetails.description',
          createdAt: '$projectDetails.createdAt',
        },
      },
    },
  ]);

  if (!projectData || projectData.length === 0) {
    throw new ApiError(404, 'Project not found or access denied');
  }

  return res.status(200).json(new ApiResponse(200, projectData[0], 'Success'));
});

const createProject = asyncHandler(async (req, res) => {
  //test
  const { name, description,priority,dueDate } = req.body;
  if (!name || !description) {
    throw new ApiError(400, 'please send required data');
  }
  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
    priority,
    dueDate
  });
  const projectmember = await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  });


  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        project,
        `The project is created successfully by ${projectmember} `,
      ),
    );
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;
  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    { new: true },
  );
  if (!project) {
    throw new ApiError(404, 'Cannot update or cannot find the project');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, 'project updated successfully'));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // 1. Get all task IDs for this project
  const tasks = await Task.find({ project: projectId }).select("_id");
  const taskIds = tasks.map(t => t._id);

  // 2. Delete everything in order
  await Subtask.deleteMany({ task: { $in: taskIds } });
  await Task.deleteMany({ project: projectId });
  await ProjectMember.deleteMany({ project: projectId });
  await Project.findByIdAndDelete(projectId);

  return res.status(200).json(new ApiResponse(200, {}, "Project and all related tasks/subtasks deleted"));
});

const addMembersToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'user not found');
  }
  const newProjMember = await ProjectMember.findOneAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: role,
    },
    {
      new: true,
      upsert: true,
    },
  );
  return res
    .status(201)
    .json(new ApiResponse(200, 'user added or role updated successfully'));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // 1. Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // 2. Aggregate to fetch members and flatten user details
  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    // 3. FLATTEN: Convert user from array [object] to just object
    {
      $addFields: {
        user: { $arrayElemAt: ['$user', 0] },
      },
    },
    {
      $project: {
        user: 1,
        role: 1,
        createdAt: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projectMembers, 'Members fetched successfully'));
});
const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;
  if (!AvalaibleUserRole.includes(newRole)) {
    throw new ApiError(400, 'Invalid Role');
  }
  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });
  if (!projectMember) {
    throw new ApiError(400, 'project member not found');
  }
  const projectMem = await ProjectMember.findByIdAndUpdate(
    projectMember._id,
    {
      $set: { role: newRole },
    },
    { new: true }, //returns the updated document not the collection(not to get confused)
  );
  if (!projectMem) {
    throw new ApiError(400, 'Some Error');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, 'member role updated successfully'));
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });
  if (!projectMember) {
    throw new ApiError(400, 'project member not found');
  }
  const projectMem = await ProjectMember.findByIdAndDelete(projectMember._id);
  if (!projectMem) {
    throw new ApiError(400, 'Some Error');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, 'member role deleted successfully'));
});


export {
  getProjects,
  createProject,
  getProjectById,
  getProjectMembers,
  deleteProject,
  deleteMember,
  updateMemberRole,
  updateProject,
  addMembersToProject,
};
