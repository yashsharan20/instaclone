import sharp from "sharp";
import {Post} from "../models/post.model.js";
import {Comment} from "../models/comment.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js"
import { getReceiverSocketId, io } from "../socket/socket.js";
export const addNewPost = async(req,res)=>{
    try {
        const {caption} = req.body
        const image = req.file 
        const author = req.id 
        if(!image) return res.status(400).json({message:"Image is required"});
        const optimizedImageBuffer = await sharp(image.buffer)
        .resize({width:800,height:800,fit:"inside"}).toFormat("jpeg",{quality:80}).toBuffer();
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image:cloudResponse.secure_url,
            author
        });
        const user = await User.findById(author);
        if(user){
            user.posts.push(post._id)
            await user.save();
        }
        await post.populate({path:'author',select:"-password"});
        return res.status(201).json({
            message:"New Post created successfully",
            success:true,
            post
        });
    } catch (error) {
        console.log(error);
    }
}
export const getAllPosts = async(req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt:-1})
        .populate({path:'author',select:'username profilePicture'})
        .populate({path:'comments',sort:{createdAt:-1},
         populate:{path:'author',select:'username profilePicture'}});
         return res.status(200).json({
            posts,
            success:true
         });
    } catch (error) {
        console.log(error);
    }
}
export const getUserPost = async(req,res)=>{
    try {
        const authorId = req.id 
        const posts = (await Post.find({author:authorId})).sort({createdAt:-1})
        .populate({path:'author',select:'username profilePicture'})
        .populate({path:'comments',sort:{createdAt:-1},populate:{path:'author',select:'username profilePicture'}});
        return res.status(200).json({
            posts,
            success:true
        });
    } catch (error) {
        console.log(error);
    }
}
export const likePost = async(req,res)=>{
    try {
        const likeKrneWalaUserKiId = req.id
        const postId = req.params.id 
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:"Post not found"});
        await post.updateOne({$addToSet:{likes:likeKrneWalaUserKiId}});

        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            const notification = {
                type:'like',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                postOwnerId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }

        return res.status(200).json({message:"Post liked",success:true});
    } catch (error) {
        console.log(error);
    }
}
export const dislikePost = async(req,res)=>{
    try {
        const likeKrneWalaUserKiId = req.id
        const postId = req.params.id 
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:"Post not found"});
        await post.updateOne({$pull:{likes:likeKrneWalaUserKiId}});

        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            const notification = {
                type:'dislike',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                postOwnerId,
                message:'You post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }

        return res.status(200).json({message:"Post disliked",success:true});
    } catch (error) {
        console.log(error);
    }
}
export const addComment = async(req,res)=>{
    try {
        const postId = req.params.id 
        const commentKrneWalaUserKiId = req.id 
        const {text} = req.body 
        const post = await Post.findById(postId);
        if(!text) return res.status(400).json({message:"Text is required"});
        
        const comment = await Comment.create({
            text,
            author:commentKrneWalaUserKiId,
            post:postId
        });
        await comment.populate({
            path:'author',
            select:'username profilePicture'
        });
         post.comments.push(comment._id);
         await post.save();
         return res.status(201).json({
            message:"Comment added successfully",
            success:true,
            comment
         });
    } catch (error) {
        console.log(error);
    }
}
export const getCommentofPost = async(req,res)=>{
    try {
        const postId = req.params.id 
        const comments = await Comment.find({post:postId}).sort({createdAt:-1})
        .populate('author','username profilePicture');
        if(!comments) return res.status(404).json({message:"No comments found for this post",succes:false});
        return res.status(200).json({
            comments,
            success:true
        });
    } catch (error) {
        console.log(error);
    }
}
export const deletePost = async(req,res)=>{
    try {
        const postId = req.params.id 
        const authorId = req.id 
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:"Post not found",success:false});
        if(post.author.toString() != authorId) return res.status(403).json({message:"Unauthorized",success:false});
        await Post.findByIdAndDelete(postId);
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id=>id.toString() !== postId);
        await user.save();
        await Comment.deleteMany({post:postId});
        return res.status(200).json({
            message:"Post deleted successfully",
            success:true
        });
    } catch (error) {
        console.log(error);
    }
}
export const bookmarkPost = async(req,res)=>{
    try {
        const postId = req.params.id 
        const authorId = req.id
        const post = await Post.findById(postId); 
        if(!post) return res.status(404).json({message:"Post not found",succes:false});
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(postId)){
            await user.updateOne({$pull:{bookmarks:postId}});
            return res.status(200).json({
                type:'unsaved',
                message:"Post removed from bookmark",
                success:true
            });
        }else{
            await user.updateOne({$addToSet:{bookmarks:postId}});
            return res.status(200).json({
                type:'saved',
                message:"Post bookmarked",
                success:true
            });
        }
    } catch (error) {
        console.log(error);
    }
}