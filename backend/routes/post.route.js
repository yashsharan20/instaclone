import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import upload from "../middleware/multer.js"
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPosts, getCommentofPost, getUserPost, likePost } from "../controllers/post.controller.js";
const router = express.Router();

router.route('/addpost').post(isAuthenticated,upload.single('image'),addNewPost)
router.route("/all").get(isAuthenticated,getAllPosts)
router.route("/userpost/all").get(isAuthenticated,getUserPost)
router.route("/:id/like").get(isAuthenticated,likePost)
router.route("/:id/dislike").get(isAuthenticated,dislikePost)
router.route("/:id/comment").post(isAuthenticated,addComment)
router.route("/:id/comment/all").get(isAuthenticated,getCommentofPost)
router.route("/delete/:id").delete(isAuthenticated,deletePost)
router.route("/:id/bookmark").get(isAuthenticated,bookmarkPost)

export default router