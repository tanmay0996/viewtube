import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",  // Local development origin
  process.env.CORS_ORIGIN  // Production frontend origin
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., from Postman or server-side)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed origins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true  // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json({limit:"16kb"}))             //json data ko allow karenge(form bharenge toh data aaega)
app.use(express.urlencoded({extended:true,limit:"16kb"}))           //URL se data le rahe
app.use(express.static("public"))                   //public folder may rakhege
app.use(cookieParser())




//importing Routes
import userRouter from "./routes/user.routes.js"  //coustomize name
import tweetRouter from "./routes/tweet.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/likes.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";








//routes declaration
app.use("/api/v1/users",userRouter)         // /users pe userRouter(middleware) ko activate karenge
//http://localhost:8000/api/v1/users/register
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

export { app };
