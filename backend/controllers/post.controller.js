import sharp from "sharp";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js"; // ✅ Fixed here

// Add new post
export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const author = req.id;

        if (!image) return res.status(400).json({ message: "Image is required" });

        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: "inside" })
            .toFormat("jpeg", { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author
        });

        const user = await User.findById(author);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: "-password" });

        return res.status(201).json({
            message: "New Post created successfully",
            success: true,
            post
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Get all posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments', sort: { createdAt: -1 },
                populate: { path: 'author', select: 'username profilePicture' }
            });

        return res.status(200).json({ posts, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
};

// Get logged-in user's posts
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments', sort: { createdAt: -1 },
                populate: { path: 'author', select: 'username profilePicture' }
            });

        return res.status(200).json({ posts, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch user posts" });
    }
};

// Like post
export const likePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await post.updateOne({ $addToSet: { likes: userId } });

        const user = await User.findById(userId).select("username profilePicture");
        const postOwnerId = post.author.toString();

        if (postOwnerId !== userId) {
            const notification = {
                type: 'like',
                userId,
                userDetails: user,
                postId,
                postOwnerId,
                message: 'Your post was liked'
            };

            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            const io = getIO(); // ✅ Corrected

            if (postOwnerSocketId) {
                io.to(postOwnerSocketId).emit('notification', notification);
            }
        }

        return res.status(200).json({ message: "Post liked", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to like post" });
    }
};

// Dislike post
export const dislikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await post.updateOne({ $pull: { likes: userId } });

        const user = await User.findById(userId).select("username profilePicture");
        const postOwnerId = post.author.toString();

        if (postOwnerId !== userId) {
            const notification = {
                type: 'dislike',
                userId,
                userDetails: user,
                postId,
                postOwnerId,
                message: 'Your post was disliked'
            };

            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            const io = getIO(); // ✅ Corrected

            if (postOwnerSocketId) {
                io.to(postOwnerSocketId).emit('notification', notification);
            }
        }

        return
