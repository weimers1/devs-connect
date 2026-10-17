import React, { useEffect, useState } from 'react';
import API from '../../Service/service';
import {useNavigate} from 'react-router-dom';

interface CommunityData {
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    verifiedAt: string
    career: string;
    profileImage: string;
}
export function UserData() {


//Storing the Info in communityData Array
const navigate = useNavigate();
const [currentUserData, setCurrentUserData] = useState<CommunityData[]>();

    //Obtaining The User Data
        useEffect(() => {
            const obtainingUserData = async () => {
                  const user = await API.getCurrentUser();
             const userId =  user.userId;
                if(!userId) {
            navigate('/login');
        }
               try{
                setCurrentUserData(await API.getUserInfo(userId));
               }catch(error){
                console.log('an error occured', error)
            } 
            }
          obtainingUserData ()
        }, [])


    return(
        <div className='flex inset-0 h-screen w-screen z-50 bg-slate-900  flex-col gap-2  items-center  '
        style={{
            backgroundColor:'#1f2937'
        }}
        >
            <div className="mt-25">
            {currentUserData  && currentUserData.map((User) => (
                
                    <> 
                   
                    <div className=" ml-10 
                    hidden md:flex  pr-22 px-6 py-2   flex-row 
                    "
                    key={User.email} 
                    >          
            <div className='ml-8 text-x'>{User.firstName}</div>
            <div className='ml-8'>{User.lastName} </div>
            <div className='ml-8'>{User.email}</div>
            <div className='ml-8'>{User.createdAt}</div>
            <div className='ml-8'>{User.career}</div>
            <div className='ml-8'>{User.profileImage}</div>

            
            </div>
            
            
            </>
                
            ))}
           
</div>
        </div>
    )

}
