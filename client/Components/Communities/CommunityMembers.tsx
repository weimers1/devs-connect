import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import API from '../../Service/service';
import Profile from '/assets/images/Nav-Profile.png';




//Shows A Active List of community Members
interface CommunityMembers {
    id: string, 
    role: string,
    firstName: string, 
    lastName: string ,
    profileImageUrl: string,
    
}
//User Information
export interface UserProfile {
    id: string,
    firstName: string,
    lastName: string,
    pfp: string,
}
export interface communities {
    createdBy: string,
}
const CommunityMembers: React.FC<CommunityMembers> = () => {
const {communityId} = useParams<{communityId: string}>();
const [communityMembers, setCommunityMember] = useState<CommunityMembers[]>([]);
const [editUsers, seteditUsers] = useState(false);
const [currentUserInfo, setCurrentUser] = useState<UserProfile | null>(null); //User Profile Information
const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
const [areyouSure, setareyouSure] = useState(false);
const [isOwner, setisOwner] = useState(''); //is Owner

const [isAdmin, setisAdmin] = useState(false);


const Temppfp = Profile;
useEffect(() => {   
        const fetchMembers = async () => {
            try {
                if(!communityId) return;
            const getMembers = await API.getCommunityMembers(communityId);
            setCommunityMember(getMembers);
            } catch(error) {
                console.log("There was a problem fetching all the members");
            }
        }
        const getAdminStatus = async () => {
            try {
                const userId = await API.getCurrentUser();
                if(communityId && userId) {
                 const checkAdmin = await API.getCommunityAdmins(communityId, userId.userId);   
                 setisAdmin(checkAdmin.admin);
                    //Check is Owner
                  const checkIsOwner = await API.isCommunityOwner(communityId, userId.userId); 
                  setisOwner(checkIsOwner.owner[0]?.createdBy.toString());
                    // console.log(isOwner);
                }
            } catch(error) {
                console.log(error, "error getting admin status");
            }
        }
        getAdminStatus();
        fetchMembers();
    },[])
    // const navigate = useNavigate();
    //Handle Click When clicking on a user
const HandleClick = async (userId: string) => {
    editUsers === false ? seteditUsers(true) : seteditUsers(false);
    if(selectedUserId === userId) {
        setSelectedUserId(null);
        seteditUsers(false);
    } else {
        setSelectedUserId(userId);
        seteditUsers(true);
    }
      try { 
        //Current Selected User
        const currentUser = userId; 
        const getuser = await API.getUserProfile(currentUser);

        //This should never perform simply because how would there be a user in a community without authentication    
        if(!getuser) {
            console.log("There was no user information associated with this user?");
            return; 
        }
         setCurrentUser(getuser)  //user information via object
    } catch(error) {
        console.log(error, "Problem trying to perform operations on current selected user");
    } 
}
    const HandleKick= async () => {
        try {   
            if(!selectedUserId || !communityId || isAdmin != true) {
                console.log("no one selected or no user in community or no community or not an admin"); 
                return;
            }
            const kickMember = await API.kickCommunityMember(communityId, selectedUserId);
            if(!kickMember) {
            console.log(`member with ${selectedUserId} couldn't be kicked from ${communityId}`);
            }
        } catch(error) {
            console.log(error, "the were an error kicking the member");
        }
    }   
//handle Close
const handleClose = () => {
    setareyouSure(false);
}

const areYouSure = () => {
  setareyouSure(true);
  seteditUsers(false);
   
}
    return( 
        <div className="bg-white rounded-none  md:border shadow-sm w-full md:w-1/3 md:rounded-xl ">
            <div className="flex items-center mt-4 justify-center">
                <h1 className="text-2xl font-bold mb-5">Members</h1>
            </div>
                {communityMembers.map((members, index) => (
                    (members.id == isOwner ? ( 
                        <div className="relative" key={index}></div>
                    ) : (
                        <div key={index} className="mt-3 relative">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img key={index} src={members.profileImageUrl || Temppfp} alt="User" className="w-10 h-10 rounded-full object-cover" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>                   
                                     {members.firstName ? ( 
                                     <p className="font-medium" key={index}>{members.firstName}</p>
                                ) :(
                                     <p className="font-medium">John Doe</p>
                                )}
                                <p className="text-xs text-gray-500">Online</p>
                            </div>   
                        </div>
                         {editUsers && selectedUserId === members.id &&  (
                      <div className="absolute rounded-xl flex bg-stone-200 w-25 ml-60 md:ml-46 justify-center z-[9999] h-[16vh] md:h-[11vh] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:-translate-x-full before:w-0 before:h-0 before:border-t-[8px] before:border-b-[8px] before:border-r-[8px] before:border-t-transparent before:border-b-transparent before:border-r-stone-200">
                                <h1 className="items-center flex "></h1>
                            <div className="flex flex-col items-center gap-1.5">
                                <h1 className="text-bold mt-0.5">{members.firstName}</h1>

                                <button className="bg-linear-to-tr from-blue-700 to-slate-950 rounded-xl hover:bg-white-800"
                                   onClick={() => areYouSure()}
                                >
                                    <p className="text-lg font-semibold text-gray-300 color-blue rounded-xl border w-20">Promote</p>
                                </button>
                                <button className="bg-red-600 rounded-xl hover:bg-red-700 "
                                   onClick={() => areYouSure()}
                                >
                                    <p className="text-lg font-semibold text-gray-800 bg-blue border rounded-xl w-20"
                                    >Kick</p>
                                  
                                </button>
                                <button className="bg-red-700 rounded-xl hover:bg-red-800"
                                     onClick={() => areYouSure()}
                                >
                                    <p className="text-lg font-semibold text-gray-800 bg-blue border rounded-xl w-20">Ban</p>
                                </button>
                            </div>
                        </div>
                    )}
                    {areyouSure && (
                            <div className="fixed bg-gray/20 backdrop-invert backdrop-opacity-20 inset-0 flex items-center justify-center ">
        <div className="bg-white rounded-xl p-6 max-w-md md:w-90 mx-4">
            <h2 className="text-xl font-bold mb-6 text-center">{`Are You Sure You Want to Kick ${members.firstName}?`}</h2>
            <div className="flex flex-col gap-3">
                <button 
                    onClick={HandleKick}
                    className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                >
                    Confirm
                </button>
                <button 
                    onClick={handleClose}
                    className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >   
                    Cancel                  
                </button>
            </div>
        </div> 
    </div>
                    )}
                        <button className="text-gray-400 hover:text-gray-600"
                         onClick={() => HandleClick(members.id)}
                        >
                            <Icon icon="mdi:menu" className="w-5 h-5" />
                        </button>
                    </div >
                    <hr className="border-gray-300"></hr>
                </div>
                
                  )))
                  )}
        
        </div>


    )
}

export default CommunityMembers;