import mongoose from "mongoose";

const subscriptionSchema=new mongoose.Schema(
    {
        subscriber:{//subscriber bhi toh ek user hai
            type:mongoose.Schema.Types.ObjectId,  //one who is subscribing
            ref:"User"
        },
        channel:{//channel bhi toh ek user hai
            type:mongoose.Schema.Types.ObjectId,  //one to whom 'subscriber' is subscribing
            ref:"User"
        },
        
    }
    ,{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)