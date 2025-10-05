
import React from "react";
import { Avatar,AvatarFallback, AvatarImage } from "./ui/avatar";
const Comment = ({comment}) =>{
    console.log("commentdsd",comment);
    return (
        <div className="my-2">
            <div className="flex gap-1 items-center">
                <Avatar>
                    <AvatarImage src={comment?.author?.profilePicture}/>
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h1 className="text-sm font-medium">{comment?.author?.username}</h1>
                <span className="text-sm ">{comment?.text}</span>
            </div>
        </div>
    )
}
export default Comment