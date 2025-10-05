import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'


const Messages = ({selectedUser}) =>{
    useGetAllMessage();
    useGetRTM();
    const {user} = useSelector(store=>store.auth);
    const {messages} = useSelector(store=>store.chat);
    console.log("m bole to ",messages);
    return (
        <div className='overflow-y-auto flex-1 p-4'>
            <div className='flex justify-center'>
                <div className='flex flex-col items-center justify-center'>
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={selectedUser?.profilePicture}/>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className='mt-2'>{selectedUser?.username}</span>
                    <Link to={`/profile/${selectedUser?._id}`}><Button variant="secondary" className="cursor-pointer h-8 mt-2">View Profile</Button></Link>
                </div>
            </div>
            <div className='flex flex-col gap-3'>
               {
                messages && messages?.map((message)=>{
                    return (
                        <div className={`flex ${message.senderId === user?._id ?'justify-end':'justify-start'}`}>
                            <div className={`p-2 rounded-lg max-w-xs break-words ${message.senderId === user?._id ? 'bg-blue-500 text-white':'bg-gray-200'}`}>
                                {message.message}
                            </div>
                        </div>
                    )
                 })
               }
            </div>
        </div>
    )
}
export default Messages