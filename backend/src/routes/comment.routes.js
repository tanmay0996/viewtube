import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { optionalAuth } from "../middleware/optionalAuth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

// Routes for fetching and adding comments for a specific video
router.route("/video/:videoId")
    .get(optionalAuth, getVideoComments)  // GET /api/v1/comment/video/:videoId - Fetch comments (optional auth)
    .post(verifyJWT, upload.none(), addComment); // POST /api/v1/comment/video/:videoId - Add comment (auth required)

// Routes for updating and deleting a specific comment (auth required)
router.route("/:commentId")
    .patch(verifyJWT, upload.none(), updateComment)   // PATCH /api/v1/comment/:commentId
    .delete(verifyJWT, upload.none(), deleteComment); // DELETE /api/v1/comment/:commentId

export default router;