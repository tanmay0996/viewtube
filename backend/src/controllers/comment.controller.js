import mongoose, { Schema } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    // Prepare user ID for aggregation (null if not logged in)
    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;
    
    console.log("=== Comment Fetch Debug ===");
    console.log("Logged in user ID:", userId ? userId.toString() : "No user");
  
    const commentsAggregate = Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $addFields: {
          // Store original owner ObjectId before lookup
          originalOwnerId: "$owner",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likes",
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          owner: { $first: "$owner" },
          // Check if current user liked this comment
          isLiked: userId ? {
            $in: [userId, "$likes.likedBy"]
          } : false,
          // Check if current user owns this comment using the original owner ID
          isOwner: userId ? {
            $eq: [userId, "$originalOwnerId"]
          } : false,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          likesCount: 1,
          owner: {
            _id: 1, 
            username: 1,
            fullName: 1,
            avatar: 1,
          },
          isLiked: 1,
          isOwner: 1,
        },
      },
    ]);
  
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
  
    const comments = await Comment.aggregatePaginate(commentsAggregate, options);
    
    console.log("Sample comment data:");
    if (comments.docs && comments.docs.length > 0) {
      const firstComment = comments.docs[0];
      console.log("First comment owner ID:", firstComment.owner._id);
      console.log("First comment isOwner:", firstComment.isOwner);
      console.log("Match:", userId ? userId.toString() === firstComment.owner._id.toString() : false);
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, comments, "Comments fetched successfully")
      );
});

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;
  
    if (!content) {
      throw new ApiError(400, "Content is required");
    }
  
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
  
    // Create the comment
    let comment = await Comment.create({
      content,
      video: videoId,
      owner: req.user?._id,
    });
  
    if (!comment) {
      throw new ApiError(500, "Failed to add comment please try again");
    }
  
    // Populate the owner details (assuming your Comment model has a ref to User)
    comment = await comment.populate("owner", "username fullName avatar");
  
    // Convert to a plain object so we can add additional fields
    const commentObj = comment.toObject();
  
    // Add isOwner field to indicate if the logged-in user is the comment owner
    commentObj.isOwner =
      commentObj.owner._id.toString() === req.user._id.toString();
  
    return res
      .status(201)
      .json(new ApiResponse(201, commentObj, "Comment added successfully"));
  });
  

const updateComment = asyncHandler(async(req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "only comment owner can edit their comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set: {
                content,
            }
        },
        {new: true},
    )

    if (!updatedComment) {
        throw new ApiError(500, "Failed to edit comment please try again");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment edited successfully")
        );
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only comment owner can delete their comment");
    }

    await Comment.findByIdAndDelete(commentId);

    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { commentId }, "Comment deleted successfully")
        );
});

export { getVideoComments, addComment, updateComment, deleteComment };