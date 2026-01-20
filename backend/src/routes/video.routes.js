// video.routes.js
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { optionalAuth } from "../middleware/optionalAuth.middleware.js"; // Import optional auth
import { upload } from "../middleware/multer.middleware.js";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
} from "../controllers/video.controller.js";

const router = Router();

// Public routes (with optional auth for logged-in features)
router.route("/").get(optionalAuth, getAllVideos); // Optional auth for personalized results

// Get video by ID - needs optional auth to track watch history for logged-in users
router.route("/v/:videoId").get(optionalAuth, getVideoById);

// Protected routes (require authentication)
router.route("/")
    .post(verifyJWT, upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]), publishAVideo);

router.route("/:videoId")
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo)
    .delete(verifyJWT, deleteVideo);

router.route("/toggle/publish/:videoId")
    .patch(verifyJWT, togglePublishStatus);

export default router;