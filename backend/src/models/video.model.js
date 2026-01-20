import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// {
//     "docs": [
//       { "_id": "id1", "title": "Video 1", ... },
//       { "_id": "id2", "title": "Video 2", ... }
//     ],
//     "totalDocs": 50,
//     "limit": 10,
//     "page": 1,
//     "totalPages": 5,
//     "pagingCounter": 1,
//     "hasPrevPage": false,
//     "hasNextPage": true,
//     "prevPage": null,
//     "nextPage": 2
//   }
  

const videoSchema=new mongoose.Schema(
    {
        videoFile:{    //cloudinary
            type:String,
            required:true
        },
        thumbnail:{      //cloudinary
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
    }
    ,{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)