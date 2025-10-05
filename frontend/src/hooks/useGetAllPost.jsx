import { setPost } from "@/redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllPost =()=>{
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchAllPost = async()=>{
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/post/all`, { withCredentials: true });
                console.warn(res);
                if(res.data.success){
                    dispatch(setPost(res.data.posts));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPost();
    },[]);
}
export default useGetAllPost;