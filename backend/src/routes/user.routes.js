
import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAvatar, 
    updateCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails
} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router()

router.route("/register").post(  //jesehi /register pe jae toh registerUser controller pe jane se pehle upload(multer) wale middleware se mil ke jae, yeh file handle karega
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar) //patch-->to update a specific field/detail
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)//.single q ki file tha files nahi tha

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)//URL se utha rahe data
router.route("/history").get(verifyJWT, getWatchHistory)

export default router // by default export kar rahe-->import karte samay manchaha name de sakte hai

