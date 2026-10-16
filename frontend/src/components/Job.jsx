import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setUser } from '@/redux/authSlice'
import { USER_API_END_POINT } from '@/utils/constant'

const Job = ({job}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const [isSaved, setIsSaved] = useState(
        user?.profile?.savedJobs?.some(savedJob => savedJob.toString() === job?._id) || false
    );

    useEffect(() => {
        setIsSaved(
            user?.profile?.savedJobs?.some(savedJob => savedJob.toString() === job?._id) || false
        );
    }, [job?._id, user?.profile?.savedJobs]);
    // const jobId = "lsekdhjgdsnfvsdkjf";

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference/(1000*24*60*60));
    }

    const toggleSavedJobHandler = async () => {
        if (!user) {
            toast.error("Please login to save jobs.");
            navigate("/login");
            return;
        }

        try {
            const res = await axios.post(`${USER_API_END_POINT}/saved-jobs/${job._id}`, {}, {
                withCredentials: true
            });
            if (res.data.success) {
                setIsSaved(res.data.saved);
                dispatch(setUser({
                    ...user,
                    profile: {
                        ...user.profile,
                        savedJobs: res.data.savedJobs
                    }
                }));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Unable to save this job.");
        }
    }
    
    return (
        <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                <Button
                    type="button"
                    onClick={toggleSavedJobHandler}
                    variant="outline"
                    className="rounded-full"
                    size="icon"
                    aria-label={isSaved ? "Remove saved job" : "Save job"}>
                    {isSaved ? <BookmarkCheck className="text-[#7209b7]" /> : <Bookmark />}
                </Button>
            </div>

            <div className='flex items-center gap-2 my-2'>
                <Button className="p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div>
                    <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                    <p className='text-sm text-gray-500'>India</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='text-sm text-gray-600'>{job?.description}</p>
            </div>
            <div className='flex items-center gap-2 mt-4'>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
                <Badge className={'text-[#F83002] font-bold'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{job?.salary}LPA</Badge>
            </div>
            <div className='flex items-center gap-4 mt-4'>
                <Button onClick={()=> navigate(`/description/${job?._id}`)} variant="outline">Details</Button>
                <Button type="button" onClick={toggleSavedJobHandler} className="bg-[#7209b7]">
                    {isSaved ? "Remove Saved Job" : "Save For Later"}
                </Button>
            </div>
        </div>
    )
}

export default Job