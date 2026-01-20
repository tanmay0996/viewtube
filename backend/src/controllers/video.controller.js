import mongoose,{isValidObjectId} from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiResponse}from "../utils/ApiResponse.js"
import {
    uploadOnCloudinary,
    deleteOnCloudinary
} from "../utils/cloudinary.js";

const getAllVideos=asyncHandler(async (req,res) => { //filtering finctionality

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline=[]

    if(query){
        pipeline.push({
            $match:{
                $or:[
                    {title: {$regex: query, $options: "i"}},
                    {description: {$regex: query, $options: "i"}},
                ]
            },

        })
    }
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

     // fetch videos only that are set isPublished as true
     pipeline.push({ $match: { isPublished: true } });



      //sortBy can be views, createdAt, duration
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        // //After $lookup, ownerDetails is an array. $unwind converts this array into a single object.
        {   
        $unwind: "$ownerDetails"
        }
    );

    //To show random content when the user hasn't specified pagination or filtering criteria.
    if (!page && !limit) {
        pipeline.push({ $sample: { size: 10 } });
    }


    
    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
    
})

const publishAVideo= asyncHandler(async (req,res) => {
    //for this functionality 4 files are required
    /*1.controller(jismay likh rahe ho)
      2.multer.middleware
      3.cloudinary.js
      4.video.route.js*/

      if (!req.user) {
        return res
          .status(401)
          .json({ status: 401, message: "User is not logged in" });
      }

    const {title,description}=req.body
    if([title,description].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;  //videoFile route se aya
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "videoFileLocalPath is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnailLocalPath is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new ApiError(400, "Video file not found");
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail not found");
    }

    const video= await Video.create({
        title,
        description,
        duration:videoFile.duration,
        // videoFile:{
        //     url:videoFile.url,         // cloudinary response obj se aa raha hai
        //     public_id: videoFile.public_id // cloudinary response obj se aa raha hai
        // },
        // thumbnail:{
        //     url:thumbnail.url,
        //     public_id:thumbnail.public_id
        // },
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,

        owner:req.user?._id,
        isPublished:true

    })

    const videoUpload=await Video.findById(video._id);

    if(!videoUpload){
        throw new ApiError(500,"Video is not uploaded")
    }
    return res
        .status(200)
        .json(new ApiResponse(200,video,"video uploaded successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  // Check if user is authenticated (optional for this route)
  const isAuthenticated = req.user && isValidObjectId(req.user._id);
  const userObjectId = isAuthenticated ? new mongoose.Types.ObjectId(req.user._id) : null;

  const video = await Video.aggregate([
    // Match the requested video.
    { 
      $match: { _id: new mongoose.Types.ObjectId(videoId) } 
    },
    // Lookup likes for the video.
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    // Lookup owner details (including subscriptions).
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: { $ifNull: ["$subscribers", []] } },
              // Only check subscription status if user is authenticated
              isSubscribed: userObjectId ? {
                $in: [userObjectId, "$subscribers.subscriber"],
              } : false,
            },
          },
          {
            $project: {
              username: 1,
              avatar: 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    // Get a single owner object.
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    // Calculate the like count.
    {
      $addFields: {
        likeCount: { $size: { $ifNull: ["$likes", []] } },
      },
    },
    // Extract an array of likedBy ObjectIds.
    {
      $addFields: {
        likedByArray: {
          $map: {
            input: "$likes",
            as: "like",
            in: "$$like.likedBy"
          }
        }
      }
    },
    // Determine if the current user has liked the video (only if authenticated).
    {
      $addFields: {
        isLiked: userObjectId ? { $in: [ userObjectId, "$likedByArray" ] } : false
      }
    },
    // Project the fields for the UI.
    {
      $project: {
        videoFile: 1,
        title: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        comments: 1,
        owner: 1,
        likeCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (!video || video.length === 0) {
    throw new ApiError(500, "failed to fetch video");
  }

  // Increment the view count.
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

  // Update user's watch history only if authenticated.
  if (isAuthenticated) {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { watchHistory: videoId } });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "video details fetched successfully"));
});




  
// update video details like title, description, thumbnail
const updateVideo = asyncHandler(async(req, res) => {
    const {title, description} = req.body;
    const {videoId} = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if (!(title && description)) {
        throw new ApiError(400, "title and description are required");
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "No video found");
    }

    if(video?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(
            400,
            "You can't edit this video as you are not the owner"
        );
    }

    //deleting old thumbnail and updating with new one
    const thumbnailToDelete = video.thumbnail.public_id;

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
    if (!thumbnail) {
        throw new ApiError(400, "thumbnail not found");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: {
                    public_id: thumbnail.public_id,
                    url: thumbnail.url
                }
            },
        },
        {new: true},
    );

    if(!updatedVideo){
        throw new ApiError(500, "Failed to update video please try again");
    }

    if(updatedVideo){
        await deleteOnCloudinary(thumbnailToDelete)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "No video found");
    }

    if(video?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(
            400,
            "You can't delete this video as you are not the owner"
        );
    }

    const videoDeleted = await Video.findByIdAndDelete(video?._id);

    if (!videoDeleted) {
        throw new ApiError(400, "Failed to delete the video please try again");
    }

    await deleteOnCloudinary(video.thumbnail.public_id); // video model has thumbnail public_id stored in it->check videoModel
    await deleteOnCloudinary(video.videoFile.public_id, "video"); // specify video while deleting video

    await Like.deleteMany({
        video: videoId,
    })

    await Comment.deleteMany({
        video: videoId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
})

// toggle publish status of a video
const togglePublishStatus = asyncHandler(async(req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't toogle publish status as you are not the owner"
        );
    }

    const toggleVideoPublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video?.isPublished,
            }
        },
        {new: true}
    );

    if (!toggleVideoPublish) {
        throw new ApiError(500, "Failed to toogle video publish status");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isPublished: toggleVideoPublish.isPublished },
                "Video publish toggled successfully"
            )
        );
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,

}