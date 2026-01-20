
import mongoose  from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema= new mongoose.Schema(
    {
        username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true          //kisi bhi field ko searchable banana ho
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
    
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,  //cloudanary ka URL
            required:true,

        },
        coverImage:{
            type:String
        },
        watchHistory:[
         {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
        ],
        password:{
            type:String,
            required:[true,'Password is required']
        },
        refreshToken:{
            type:String
        },

        
    }
    ,{timestamps:true})

userSchema.pre("save",async function(next) {  //save karne se just pehle kya kro?
    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10)  //this may sari fields aa jaegi userSchema ki
    next()

})

userSchema.methods.isPasswordCorrect=async function(password){     //costomize method, input-> paaword from client
    return await bcrypt.compare(password,this.password)    //compare(pass from client, encryted pass)
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign({
        _id:this._id,              //MDB data store karne baad bydefault ek unique id deta hai
        email:this.email,
        username:this.username,
        fullName:this.fullName     //L->payload name/key  R->DB se aa raha
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign({
        _id:this._id,              //MDB data store karne baad bydefault ek unique id deta hai
                                     //L->payload name/key  R->DB se aa raha
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User= mongoose.model("User",userSchema)