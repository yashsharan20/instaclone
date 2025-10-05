import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const Signup = ()=>{
    const [input,setInput] = useState({
        username:"",
        email:"",
        password:""
    });
    const [loading,setLoading] = useState(false);
    const navigate = useNavigate();
    const {user} = useSelector(store=>store.auth);
    const changeEventHandler = (e)=>{
        setInput({...input,[e.target.name]:e.target.value});
    }
    useEffect(()=>{
        if(user){
            navigate("/")
        }
    },[]);
    const signupHandler = async(e)=>{
        e.preventDefault();
        try {
            console.log(input);
            setLoading(true);
            const res = await axios.post(`http://localhost:8000/api/v1/user/register`,input,{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                toast.success(res.data.message);
                setInput({
                    username:"",
                    email:"",
                    password:"" 
                });
                navigate('/login');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }finally{
             setLoading(false);
        }
    }
    return (
        <div className="flex items-center w-screen h-screen justify-center">
            <form onSubmit={signupHandler} className="shadow-lg flex flex-col p-8">
               <div className="my-4">
                     <img className="w-40 block mx-auto mb-4" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/2560px-Instagram_logo.svg.png"/>
                    <p className="text-sm text-center">Signup to see photos & videos of your friends</p>
               </div>
               <div>
                    <span className="font-medium">Username</span>
                    <Input type="text" name="username" value={input.username} onChange={changeEventHandler} className="focus-visible:ring-transparent my-2"/>
               </div>
                <div>
                    <span className="font-medium">Email</span>
                    <Input type="email" name="email" value={input.email} onChange={changeEventHandler} className="focus-visible:ring-transparent my-2"/>
               </div>
                 <div>
                    <span className="font-medium">Password</span>
                    <Input type="password" name="password" value={input.password} onChange={changeEventHandler} className="focus-visible:ring-transparent my-2"/>
               </div>
                {
                    loading ?(
                        <Button className="cursor-pointer" disabled={loading}><Loader2 className="h-4 w-4 animate-spin" />Please wait</Button>
                    ):(  <Button className="cursor-pointer">Signup</Button>)
                }
               <span className="text-center">Already have an account? <Link className="text-blue-600" to="/login">Login</Link></span>
            </form>
        </div>
    )
}
export default Signup;