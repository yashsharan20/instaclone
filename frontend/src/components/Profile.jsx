import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useParams } from "react-router-dom";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { setUserProfile } from "@/redux/authSlice";

const Profile = () => {
    const params = useParams();
    const userId = params.id
    useGetUserProfile(userId);
    const [activeTab,setActiveTab] = useState('posts');

    const { userProfile,user } = useSelector(store => store.auth);
    const isLoggedInUserProfile = user?._id == userProfile?._id;
    const isFollowing = userProfile?.followers?.includes(user?._id)
    const dispatch = useDispatch();
    console.log(userProfile);

    const handleTabChange= (tab)=>{
        setActiveTab(tab);
    }

    const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

    const handleFollowToggle = async()=>{
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/user/followorunfollow/${userProfile?._id}`,{},{withCredentials:true}); 
           
            if(res.data.success){
                toast.success(res.data.message);
                const updateProfile = await axios.get(`http://localhost:8000/api/v1/user/${userProfile?._id}/profile`,{withCredentials:true});
                 console.log(updateProfile);
                dispatch(setUserProfile(updateProfile.data.user));
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

    return (
        <div className="flex max-w-5xl justify-center mx-auto pl-10">
            <div className="flex flex-col gap-20 p-8">
                <div className="grid grid-cols-2">
                    <section className="flex items-center justify-center">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </section>
                    <section>
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{userProfile?.username}</span>
                                {
                                    isLoggedInUserProfile ? (
                                        <>
                                            <Link to="/account/edit"><Button className="hover:bg-gray-200 h-8 cursor-pointer" variant="secondary">Edit Profile</Button></Link>
                                            <Button className="hover:bg-gray-200 h-8 cursor-pointer" variant="secondary">View archive</Button>
                                            <Button className="hover:bg-gray-200 h-8 cursor-pointer" variant="secondary">Add tools</Button>
                                        </>
                                    ) : (
                                        isFollowing ? (
                                           <>
                                            <Button onClick={handleFollowToggle} className="h-8 cursor-pointer" variant="secondary">Unfollow</Button>
                                             <Button className="h-8 cursor-pointer" variant="secondary">Message</Button>
                                           </>
                                        ):(
                                            <Button onClick={handleFollowToggle} className="bg-[#0095F6] hover:bg-[#087fce] h-8 cursor-pointer">Follow</Button>
                                        )
                                        
                                    )
                                }

                            </div>
                            <div className="flex gap-5 items-center">
                                <p className="font-semibold">{userProfile?.posts?.length || 0} <span>posts</span></p>
                                <p className="font-semibold">{userProfile?.followers?.length || 0} <span>followers</span></p>
                                <p className="font-semibold">{userProfile?.following?.length || 0} <span>following</span></p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span>{userProfile?.bio}</span>
                                <Badge className='w-fit' variant="secondary"><AtSign/><span>{userProfile?.username}</span> </Badge>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="border-t border-t-gray-200">
                     <div className="flex items-center justify-center gap-10 text-sm">
                            <span className={`py-3 cursor-pointer ${activeTab == 'posts'?'font-bold':''}`} onClick={()=>handleTabChange('posts')}>
                                POSTS
                            </span>
                            <span className={`py-3 cursor-pointer ${activeTab == 'saved'?'font-bold':''}`} onClick={()=>handleTabChange('saved')}>
                                SAVED
                            </span>
                            <span className="py-3 cursor-pointer">
                                REELS
                            </span>
                            <span className="py-3 cursor-pointer">
                                TAGS
                            </span>
                     </div>

                     <div className="grid grid-cols-3 gap-1">
                        {
                            displayedPost?.map((post)=>{
                                return (
                                    <div key={post?._id} className="relative group cursor-pointer">
                                        <img src={post?.image} alt="postimage" className="rounded-sm w-full aspect-square object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="flex items-center text-white space-x-4">
                                                <button className="flex items-center gap-2 hover:text-gray-300"><Heart/> <span>{post?.likes.length}</span></button>
                                                 <button className="flex items-center gap-2 hover:text-gray-300"><MessageCircle/> <span>{post?.comments.length}</span></button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                     </div>
                </div>  
            </div>
        </div>
    )
}
export default Profile