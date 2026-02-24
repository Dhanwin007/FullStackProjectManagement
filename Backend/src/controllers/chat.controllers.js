import { ChatMessage } from "../models/chat.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * @description Save a new chat message to the database
 * @route POST /api/v1/chat/:projectId
 */
const saveMessage = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

    // 1. Validation
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Message content cannot be empty");
    }

    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    // 2. Create the message in MongoDB
    const message = await ChatMessage.create({
        content: content.trim(),
        project: projectId,
        sender: req.user._id // Provided by verifyJWT middleware
    });

    // 3. Fetch the message again with Sender details populated
    // This ensures the frontend gets the username and avatar immediately
    const fullMessage = await ChatMessage.findById(message._id)
        .populate("sender", "username avatar");

    if (!fullMessage) {
        throw new ApiError(500, "Internal Server Error while saving message");
    }

    // 4. Return the response
    return res.status(201).json(
        new ApiResponse(
            201, 
            fullMessage, 
            "Message saved and sent successfully"
        )
    );
});

/**
 * @description Get all chat history for a specific project
 * @route GET /api/v1/chat/:projectId
 */
const getChatHistory = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const history = await ChatMessage.find({ project: projectId })
        .populate("sender", "username avatar")
        .sort({ createdAt: 1 }); // Sort by time (oldest to newest)

    return res.status(200).json(
        new ApiResponse(200, history, "Chat history retrieved")
    );
});

export { 
    saveMessage, 
    getChatHistory 
};