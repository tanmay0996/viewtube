import mongoose, { isValidObjectId, Schema } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet=asyncHandler(async (req,res) => {

    const {content}=req.body

    if(!content){
        throw new ApiError(400,"content is required")
    }


    const tweet=await Tweet.create({
        content:content,
        owner:req.user?._id,

    })

    if(!tweet){
        throw new ApiError(400,"Unable to create tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"tweet created successfully"))
    
})

const updateTweet=asyncHandler(async (req,res) => {
    const {tweetId}=req.params;
    const {content}=req.body;

    if(!content){
        throw new ApiError(400,"content is required")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweetId")
    }

    const tweet= await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }
    //check if the req came from owner
    if(tweet.owner.toString()!==req.user?._id.toString()){ //yeh owner tweet.model se aa raha
        throw new ApiError(400,"u are not authorized to edit this!!!")
    }
    
    const updatedTweet= await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content:content
            }
        },
        {new:true}
    )

    if(!updatedTweet){
        throw new ApiError(500,"tweet can't be updared")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedTweet,"tweet updated successfully"))

})

const deleteTweet=asyncHandler(async (req,res) => {
    const {tweetId}=req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"tweetId is not valid")
    }

    const tweet= await Tweet.findById(tweetId)

    if(!tweet){
        console.log(`tweet:${tweet}`)
        
        throw new ApiError(404,"tweet not found")

    }

    // if(tweet.owner.toString()!==req.user?._id.toString()){
    //     console.log(`Owner of tweet: ${tweet.owner.toString()}, Logged-in user: ${req.user?._id}`);
    //     throw new ApiError(403,"U are not authorized to delete this tweet")
    // }
    if (!tweet.owner.equals(req.user?._id)) {
        console.log(`Owner of tweet: ${tweet.owner}, Logged-in user: ${req.user?._id}`);
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    
    
    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200,null,"tweet deleted successfully"))
})

const getUserTweets=asyncHandler(async (req,res) => {

    const {userId}=req.params;  //owner ki id 

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"userId is not valid")
    }

    const tweets= await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)  //pipeline may batana padta hai ese
                // owner:userId// WRONG
            }
        },
        {
           $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"ownerdetails",
            pipeline:[
                {
                    $project:{
                        username:1,
                        avatar:1,
                       

                }}
            ]
           } 
        },

        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likedetails",
                pipeline:[
                    {
                        $project:{
                            likedBy:1,
                        }
                    },
                ]
            }
        },
        {
            $addFields:{
                likeCount:{
                    $size:"$likedetails"
                },
                ownerdetails:{
                    $first:"$ownerdetails"
                },
                isLiked:{
                    $cond:{
                        if:{
                            $in:[req.user?._id, "$likedetails.likedBy"] //id of user that liked ur tweet
                        },
                        then:true,
                        else:false
                    },
                },
            },
        },
        {
            $sort: {
                createdAt: -1,
            }
        },
        {
            $project:{
                content:1,
                likeCount:1,
                ownerdetails:1,
                isLiked:1,
                createdAt:1
            },
        },

    ]);

    if(tweets.length===0){
        throw new ApiError(404,"unable to fetch tweets")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweets,"Tweets fetched successfully"))



})

export{
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets

}