import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../Service/service';

interface CommunityActionBarProps {
    community: {
        id: string;
        description: string;
        createdDate?: string;
        createdAt?: string;
        isOwner?: boolean;
    };
   
}
const CommunityActionBar: React.FC<CommunityActionBarProps> = ({ 
    community, 
   
}) => {

const { communityId } = useParams<{ communityId: string }>(); //Get the community ID FROM Browser
const [membershipStatus, setMembershipStatus] = useState(false);
const [isOwner, setOwnerStatus] = useState(false);
const [isAdmin, setIsAdmin] = useState(false);
const [isReview, setisReview] = useState(false);
const [reviewValue, setreviewValue] = useState(0);
// const [promoteUser, setpromoteUser] = useState(false);
// const [ownerId, setOwnerId] = useState<string | null>();

    //  function handleReviewClick() {

    // }

    const onJoin = async () =>  {
    // Implement join community logic here
    try{    
    const user = await API.getCurrentUser();
        const userId =  user.userId;
        if(!userId) {
            console.log("No user Logged in");
            return;
        }
        if(userId && communityId) {
            const response = await API.joinCommunity(communityId);
            if(!response.success){
                console.log("Failed to join community");
            }
              setMembershipStatus(true);
        }
    } catch(error) {
        console.log("There was some issue with joining community", error);
        navigate('/login'); //No auth = no interactiing
    }
  }

  const LeaveCommunity = async () => {
    try {
        const user = await API.getCurrentUser();
        if(!user) {
            console.log("no user logged in ");
            return;
        }
        // if(isOwner) {
        //     setpromoteUser(true);
        //     return;
        // }
        if(membershipStatus == true && user && communityId) {
            const leavecommunity = await API.LeaveCommunity(user.userId, communityId);
            if(!leavecommunity.success){
                console.log("Failed to leave community");
            }
              setMembershipStatus(false);
        }
    } catch(error) {
        console.log("There was some issue with leaving community", error);
    }
  }

useEffect(() => {
    if (!communityId) return;

    const fetchUserCommunityStatus = async () => {
        const user = await API.getCurrentUser();
        if (!user?.userId) return;

        const [membership, owner, admin] = await Promise.all([
            API.getCommunityMembership(communityId, user.userId),
            API.isCommunityOwner(user.userId, communityId),
            API.getCommunityAdmins(communityId, user.userId),
        ]);

        setMembershipStatus(membership?.isMember ?? false);
        setOwnerStatus(owner?.owner ?? false);
        setIsAdmin(admin?.admin ?? false);

    };

    fetchUserCommunityStatus();
}, [communityId]);

    const navigate = useNavigate();
    const handleEditCommunity = () => {
        if(isOwner == true || isAdmin) {
        navigate(`/edit-community/${communityId}`);
        }else {
            return;
        }
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-gray-600 mb-2">{community.description}</p>
                    <p className="text-sm text-gray-500">
                        Created {new Date(community.createdDate || community.createdAt || Date.now()).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                <div className="flex space-x-3">
                    {(isOwner || isAdmin)  && (
                        <>
                            <button 
                                onClick={handleEditCommunity}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Icon icon="mdi:cog" className="w-4 h-4 mr-2 inline" />
                                Edit Community
                            </button>
                            {/* {isOwner ?(
                                     <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                                <Icon icon="mdi:crown" className="w-4 h-4 mr-2 inline" />
                                Owner
                            </div>
                            ) : (
                                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                                Admin
                                </div>
                            )} */}
                           
                        </>
                    ) }
                        <button
                            
                        onClick={membershipStatus ? LeaveCommunity : onJoin}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                membershipStatus
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            <Icon 
                                icon={membershipStatus ? "mdi:check" : "mdi:plus"} 
                                className="w-4 h-4 mr-2 inline" 
                            />
                            {membershipStatus ? 'Joined' : 'Join Community'}
                        </button>
                        <button className="hover:scale-120 transition-transform"
                        onClick={() =>setisReview(true)}
                        >
                              <Icon

                                                                        icon="mdi:star"
                                                                        className={`w-12 h-12 text-yellow-400`}
                                                                    />
                        </button>
                              {isReview && (
                                                                <>
                                            <div className="fixed bg-gray/20 backdrop-invert backdrop-opacity-20 inset-0 flex items-center justify-center ">
                                           
                                    <div className="bg-white rounded-xl mb-12 p-6  md:w-90 md:h-60  ">
                                        <div className="flex">
                                          <h2 className="text-3xl font-bold  text-center ml-7">{`Leave A Review`}</h2>
                                          <button className="ml-8.5"
                                          onClick={() => setisReview(false)}
                                          ><Icon icon="icomoon-free:cross" width="18" height="18"/></button>
                                          </div>
                                        <div className="flex mt-10  ">
                                             <button  onClick={() => setreviewValue(1)}>
                                                <Icon key={1} icon="mdi:star"  width="60" height="60" className={`mb-2 mx-auto  ${
                                                    reviewValue >= 1 ? "text-yellow-400" : "text-gray-400"
                                                }`} /></button>
                                                 <button onClick={() => setreviewValue(2)}>
                                                     <Icon key={2} icon="mdi:star"  width="60" height="60" className={`mb-2 mx-auto  ${
                                                    reviewValue >= 2 ? "text-yellow-400" : "text-gray-400"
                                                }`} /></button>
                                                     <button  onClick={() => setreviewValue(3)}>
                                                         <Icon key={3} icon="mdi:star"   width="60" height="60" className={`mb-2 mx-auto ${
                                                    reviewValue >= 3 ? "text-yellow-400" : "text-gray-400"
                                                }`} /></button>
                                                        <button  onClick={() => setreviewValue(4)}>
                                                             <Icon key={4} icon="mdi:star"  width="60" height="60" className={`mb-2 mx-auto  ${
                                                    reviewValue >= 4 ? "text-yellow-400" : "text-gray-400"
                                                }`} /></button>
                                                             <button  onClick={() => setreviewValue(5)}>
                                                                <Icon key={5} icon="mdi:star" width="60" height="60" className={`mb-2 mx-auto  ${
                                                    reviewValue >= 5 ? "text-yellow-400" : "text-gray-400"
                                                }`} /></button>
                                        </div>            
                                    </div> 
                                </div>
                                </>
                                                )}
                </div>
            </div>
        </div>
    );
};

export default CommunityActionBar;