import React, { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';

const EditProfile = () => {
    const { user } = useSelector(store => store.auth);
    const imageRef = useRef();
    const [loading,setLoading] = useState(false);
    const [input,setInput] = useState({
        profilePhoto:user?.profilePicture,
        bio:user?.bio,
        gender:user?.gender
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileChangeHandler = (e)=>{
        const file = e.target.files?.[0];
        if(file)setInput({...input,profilePhoto:file});
    }

    const selectChangeHandler = (value)=>{
        setInput({...input,gender:value});
    }

    const editProfileHandler = async()=>{
        const formData = new FormData();
        formData.append("bio",input.bio);
        formData.append("gender",input.gender);
        if(input.profilePhoto){
            formData.append("profilePicture",input.profilePhoto);
        }
        console.log(input);
        try {
            setLoading(true);
            const res = await axios.post(`http://localhost:8000/api/v1/user/profile/edit`,formData,{
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                withCredentials:true
            });
            if(res.data.success){
                const updatedUserData = {
                    ...user,
                    bio:res.data.user.bio,
                    gender:res.data.user.gender,
                    profilePicture:res.data.user.profilePicture
                }
                dispatch(setAuthUser(updatedUserData));
                toast.success(res.data.message);
                navigate(`/profile/${user?._id}`);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }finally{
            setLoading(false);
        }
    }
    return (
        <div className='flex max-w-2xl mx-auto pl-10'>
            <section className='flex flex-col gap-6 my-8 w-full'>
                <h1 className='font-bold text-xl'>Edit Profile</h1>
                <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
                    <div className='flex items-center gap-3'>
                        <Avatar>
                            <AvatarImage src={user?.profilePicture}></AvatarImage>
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-semibold text-sm">{user?.username}</h1>
                            <span className="text-gray-600 text-sm">{user?.bio || 'Bio here...'}</span>
                        </div>
                    </div>
                    <input  onChange={fileChangeHandler} ref={imageRef} type="file" className='hidden'/>
                    <Button onClick={()=>imageRef?.current.click()} className='bg-[#0095F6] h-8 cursor-pointer hover:bg-[#067cca]'>Change photo</Button>
                </div>
                <div>
                    <h1 className='font-semibold mb-2'>Bio</h1>
                    <Textarea value={input.bio} onChange={(e)=>setInput({...input,bio:e.target.value})} name="bio" className="focus-visible:ring-transparent resize-none"/>
                </div>
                <div>
                    <h1 className='font-semibold mb-2'>Gender</h1>
                    <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                </div>
                <div className='flex justify-end'>
                    {
                        loading ? (<Button disabled={true} className="w-fit bg-[#0095F6] hover:bg-[#067cca] cursor-pointer"><Loader2 className='animate-spin'/> Please wait</Button>):(
                              <Button onClick={editProfileHandler} className="w-fit bg-[#0095F6] hover:bg-[#067cca] cursor-pointer">Submit</Button>
                        )
                    }
                  
                </div>
            </section>
        </div>
    )
}
export default EditProfile