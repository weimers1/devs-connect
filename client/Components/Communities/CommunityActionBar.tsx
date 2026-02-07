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
    //Function to find if a user has const the commmunity;
    const fetchHasUserJoined = async () => {
        try{  
            const user  = await API.getCurrentUser();
            const userId = user.userId;
            if(!userId) {
                console.log("No user Logged in");
                return;
            }
        if (userId && communityId) {
            const membershipStatus = await API.getCommunityMembership(communityId, userId);
             setMembershipStatus(membershipStatus.isMember);       
        }
        } catch (error) {
            console.error("Error Fetching membership status:", error);
        }
    };
    //Function to find if a user is an owner of a community 
    const fetchIsOwner = async () => {
             try{  
            const user  = await API.getCurrentUser();
            const userId = user.userId;  
            if(!userId) {
                console.log("No user Logged in");
                return;
            }
        if (userId && communityId) {
            const OwnerStatus = await API.getCommunityAdmins(communityId, userId);
                setOwnerStatus(OwnerStatus.admin);      
            }
        
        } catch (error) {
            console.error("Error Fetching membership status:", error);
        }
    }
    fetchHasUserJoined();
    fetchIsOwner();
} ,[]);
    const navigate = useNavigate();
    const handleEditCommunity = () => {
        if(isOwner === true) {
        navigate(`/edit-community/${community.id}`);
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
                    {isOwner ? (
                        <>
                            <button 
                                onClick={handleEditCommunity}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Icon icon="mdi:cog" className="w-4 h-4 mr-2 inline" />
                                Edit Community
                            </button>
                            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                                <Icon icon="mdi:crown" className="w-4 h-4 mr-2 inline" />
                                Owner
                            </div>
                        </>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityActionBar;