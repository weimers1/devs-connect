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
    BanStatus?: boolean;
    
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
const [currentUserStatus, setSelectedtUser] = useState(false); //User Profile Information
const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
const [errorState, seterrorState] = useState(false);
const [areyouSure, setareyouSure] = useState({
    state: false,
    value: "",
});
const [ownerId, setOwnerId] = useState<string | null>(null); //Owner's userId
const [isAdmin, setisAdmin] = useState(false);


const Temppfp = Profile;
    const fetchMembers = async () => {
            try {
                if(!communityId) return;
            const getMembers = await API.getCommunityMembers(communityId);
            setCommunityMember(getMembers);
            } catch(error) {
                console.log("There was a problem fetching all the members");
            }
        }
useEffect(() => {   
    
        const getAdminStatus = async () => {
            try {
                const userId = await API.getCurrentUser();
                if(communityId && userId) {
                    //Current User
                 const checkAdmin = await API.getCommunityAdmins(communityId, userId.userId);   
                 setisAdmin(checkAdmin.admin);
 
                   //Get community data to find owner
                  const communityData = await API.getCommunityById(communityId); 
                  if(communityData && communityData.createdBy) {
                      setOwnerId(communityData.createdBy.toString());
                  }
                }
            } catch(error) {
                console.log(error, "error getting admin status");
            }
        }
    // Cleanup function to clear the timeout if the component unmounts
   
        getAdminStatus();
        fetchMembers();
    },[])
const HandleClick = async (userId: string) => {
    if(selectedUserId === userId) {
        setSelectedUserId(null);
        seteditUsers(false);
    } else {
        setSelectedUserId(userId);
        seteditUsers(true);
    }
      try { 
        //Current Selected User
        const selectedUser = userId; 
        if(!communityId) return;
        const getuser = await API.getCommunityAdmins(communityId, selectedUser);

        //This should never perform simply because how would there be a user in a community without authentication    
        if(!getuser) {
            console.log("There was no user information associated with this user?");
            return; 
        }
         setSelectedtUser(getuser.admin)  //user information via object
    } catch(error) {
        console.log(error, "Problem trying to perform operations on current selected user");
    } 
}

    //Handle Close
const handleClose = () => {
    setareyouSure({state: false, value: ""});
    seteditUsers(false);
    

}

    const HandleUserKPB = async (value: string) => {
        try {   
            const currentUserId = await API.getCurrentUser();
            
            if(!selectedUserId || !communityId || isAdmin != true || value == null || !currentUserId || currentUserId == selectedUserId) {
                console.log("no one selected or no user in community or no community or not an admin");
                seterrorState(true); 
                
               setTimeout(() => {
                seterrorState(false);
            }, 3000);
            handleClose();
            return 
        }
           
            if(value.toLowerCase() == "kick" && isAdmin) {
            const kickMember = await API.kickCommunityMember(communityId, selectedUserId);
            if(!kickMember) {
            console.log(`member with ${selectedUserId} couldn't be kicked from ${communityId}`);
                return;
        }
        }
            if(value.toLowerCase() == "promote" && isAdmin){
            const userId = selectedUserId;
            const promoteMember = await API.promoteUser(userId, communityId);
            if(!promoteMember) {
                console.log(`member with ${selectedUserId} couldn't be promoted from ${communityId}`);
                return
            }
             fetchMembers();
             setSelectedtUser(true);
        }
            if(value.toLowerCase() == "demote" && isAdmin) {
            const demmoteMember = await API.demoteCommunityMember(selectedUserId, communityId, currentUserId.userId);
            if(demmoteMember != null) {
                console.log("problem demoting user member");
            }
             fetchMembers();
            setSelectedtUser(false);
        }
           if(value.toLowerCase() == "ban" && isAdmin) {
            const banMember = await API.banCommunityMember(selectedUserId, communityId);
            if(!banMember) {
            console.log(`member with ${selectedUserId} couldn't be banned from ${communityId}`);
                return;
        }
             fetchMembers();
    }
            handleClose();
            setSelectedUserId(null);
            setareyouSure({state: false, value: ""});
        }  catch(error) {
            console.log(error, "the were an error with operating on the member");
            handleClose();
            seterrorState(true);
            seteditUsers(false);
        }
    }   

  

const areYouSure = (value: string) => {
  setareyouSure({state:true, value: value.toLowerCase()});
  seteditUsers(false);
   
}

       
    return( 
        <div className="bg-white rounded-none  md:border shadow-sm w-full md:w-1/3 md:rounded-xl ">
            <div className="flex items-center mt-4 justify-center">
                <h1 className="text-2xl font-bold mb-5">Members</h1>
            </div>
                {communityMembers.map((members, index) => {
                    return (members.id.toString() === ownerId || members.BanStatus === true ? ( 
                        <div className="hidden border bg-black " key={index}></div>
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
                             {members.role === 'admin' && (
                                        <span className=" text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Admin</span>
                                    )} 
                        </div>
                         {editUsers && selectedUserId === members.id &&  (
                      <div className="absolute rounded-xl flex bg-stone-200 w-25 ml-60 md:ml-46 justify-center z-[9999] h-[16vh] md:h-[11vh] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:-translate-x-full before:w-0 before:h-0 before:border-t-[8px] before:border-b-[8px] before:border-r-[8px] before:border-t-transparent before:border-b-transparent before:border-r-stone-200">
                                <h1 className="items-center flex "></h1>
                            <div className="flex flex-col items-center gap-1.5">
                                <h1 className="text-bold mt-0.5">{members.firstName}</h1>
                                 {members.role == "admin" ? (
                                <button className="bg-linear-to-tr from-blue-700 to-slate-950 rounded-xl hover:bg-white-800"
                                   onClick={() => members.role == "admin" ? areYouSure("Demote") : null}
                                >  <p className="text-lg font-semibold text-gray-300 color-blue rounded-xl border w-20">Demote</p></button>
                                 ) : (<>
                                     <button className="bg-linear-to-tr from-blue-700 to-slate-950 rounded-xl hover:bg-white-800"
                                   onClick={() => members.role == "member" ? areYouSure("Promote") : null}>
                                    <p className="text-lg font-semibold text-gray-300 color-blue rounded-xl border w-20">Promote</p>
                                    </button>
                                             </>
                                    )}
                                <button className="bg-red-600 rounded-xl hover:bg-red-700 "
                                   onClick={() => areYouSure("Kick")}
                                >
                                    <p className="text-lg font-semibold text-gray-800 bg-blue border rounded-xl w-20"
                                    >Kick</p>
                                  
                                </button>
                                <button className="bg-red-700 rounded-xl hover:bg-red-800"
                                     onClick={() => areYouSure("Ban")}
                                >
                                    <p className="text-lg font-semibold text-gray-800 bg-blue border rounded-xl w-20">Ban</p>
                                </button>
                            </div>
                        </div>
                    )}
                    {areyouSure.state && (
                            <div className="fixed bg-gray/20 backdrop-invert backdrop-opacity-20 inset-0 flex items-center justify-center ">
        <div className="bg-white rounded-xl p-6  md:w-90 mx-4">
            <h2 className="text-xl font-bold mb-6 text-center">{`Are You Sure You Want to ${areyouSure.value} ${members.firstName}?`}</h2>
            <div className="flex flex-col gap-3">
                <button 
                    onClick={() => HandleUserKPB(areyouSure.value.toLowerCase())}
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
                                {errorState && (
                                    <>
                <div className="fixed bg-gray/20 backdrop-invert backdrop-opacity-20 inset-0 flex items-center justify-center ">
               
        <div className="bg-white rounded-xl mb-12 p-6  md:w-90 mx-4">
              <Icon icon="streamline-plump-color:sad-face-flat" className="mb-2 mx-auto" width="72" height="72" />
            <h2 className="text-2xl font-bold mb-6 text-center">{`You Are Unable To Perform That Action At This Time`}</h2>
            <div className="flex flex-col gap-3">
            </div>
        </div> 

    </div>
    </>
                    )}
                        <button className="text-gray-400 hover:text-gray-600"
                         onClick={() => HandleClick(members.id)}
                        >
                            <Icon icon="mdi:menu" className="w-5 h-5" />
                        </button>
                    </div >
                    <hr className="border-gray-300"></hr>
                </div>
                ));
                })}
        
        </div>


    )
}

export default CommunityMembers;