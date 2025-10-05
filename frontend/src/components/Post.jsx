
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { LuMessageCircle } from "react-icons/lu";
import { IoIosSend } from "react-icons/io";
import { FaRegBookmark } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPost, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";


const Post = ({ post }) => {
    console.log(post);
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();
    console.log("posts", posts);
    console.warn("user", user);

    const changeEventHandler = (e) => {
        const inputText = e.target.value
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }
    const deletePostHandler = async (e) => {
        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, { withCredentials: true });
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem._id !== post?._id);
                dispatch(setPost(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    const likeOrDislikeHandler = async () => {

        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/${action}`, { withCredentials: true });
            // console.warn(res);
            if (res.data.success) {
                toast.success(res.data.message);
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                const updatedPostData = posts.map(p =>
                    p._id == post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p)

                dispatch(setPost(updatedPostData));
            }

        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/post/${post?._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);
                const updatedPostData = posts.map(p =>
                    p._id == post._id ? {
                        ...p, comments: updatedCommentData
                    } : p
                )
                dispatch(setPost(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const bookmarkHandler = async()=>{
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`,{
                withCredentials:true
            });
            if(res.data.success){
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="my-8 w-full max-w-sm mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src={post?.author?.profilePicture}></AvatarImage>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-3">
                        <h1>{post?.author?.username}</h1>
                        {user?._id == post.author._id && <Badge variant="secondary">Admin</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className="cursor-pointer" />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center">
                        {post?.author?._id !== user?._id && (
                         <Button variant="ghost" className="cursor-pointer w-fit text-[#ED4956] font-bold">Unfollow</Button>
                        )}
                        <Button variant="ghost" className="cursor-pointer w-fit">Add to favorites</Button>
                        {
                            user && user?._id == post?.author?._id && (
                                <Button variant="ghost" onClick={deletePostHandler} className="cursor-pointer w-fit ">Delete</Button>
                            )
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <img src={post?.image} className="rounded-sm my-2 w-full aspect-square object-cover" alt="Instagram photo" />
            <div className="flex items-center justify-between my-2">
                <div className="flex items-center gap-3">
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size={'20px'} className="cursor-pointer text-red-600" /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'20px'} className="cursor-pointer" />
                    }
                    <LuMessageCircle onClick={() => {
                        setOpen(true)
                        dispatch(setSelectedPost(post));
                    }
                    } size={'20px'} className="cursor-pointer hover:text-gray-600" />
                    <IoIosSend size={'20px'} className="cursor-pointer hover:text-gray-600" />
                </div>
                <FaRegBookmark onClick={bookmarkHandler} size={'20px'} className="cursor-pointer hover:text-gray-600" />
            </div>
            <div className="text-sm">
                <span className="font-medium">{postLike} likes</span>
                <p className="flex">
                    <span className="font-medium mr-2">{post?.author?.username}</span>
                    {post?.caption}
                </p>
                {comment.length > 0 && (
                    <span className="cursor-pointer text-gray-400" onClick={() => {
                        setOpen(true)
                        dispatch(setSelectedPost(post));
                    }}>View all {comment.length} comments</span>
                )}

            </div>
            <CommentDialog open={open} setOpen={setOpen} />
            <div className="flex items-center justify-between">
                <input type="text" value={text} onChange={changeEventHandler} placeholder="Add a comment..." className="outline-none w-100 text-sm" />
                {
                    text && <span onClick={commentHandler} className="text-[#38ADF8] text-sm cursor-pointer">Post</span>
                }
            </div>
        </div>
    )
}
export default Post