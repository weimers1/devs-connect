import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import API from '../../Service/service';
import Profile from '/assets/images/Nav-Profile.png';

interface CommunityMember {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  isOnline?: boolean;
  BanStatus?: boolean;
}

const CommunityMembers: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [editUsers, setEditUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const Temppfp = Profile;
const navigate = useNavigate();
  const fetchMembers = async () => {
    if (!communityId) return;
    try {
      const fetchedMembers = await API.getCommunityMembers(communityId);
      setMembers(fetchedMembers);
    } catch (error) {
      console.error('Error fetching members', error);
    }
  };

  const fetchAdminStatus = async () => {
    if (!communityId) return;
    try {
      const user = await API.getCurrentUser();
      const adminStatus = await API.getCommunityAdmins(communityId, user.userId);
      setIsAdmin(adminStatus.admin);

      const communityData = await API.getCommunityById(communityId);
      if (communityData && communityData.createdBy) setOwnerId(communityData.createdBy);
    } catch (error) {
      console.error('Error fetching admin status', error);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchAdminStatus();
  }, []);

  const handleClick = (userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setEditUsers(false);
    } else {
      setSelectedUserId(userId);
      setEditUsers(true);
    }
  };

  const handleAction = async (action: string, member: CommunityMember) => {
    if (!communityId || !member.id) return;
    const currentUser = await API.getCurrentUser();
    if(!currentUser) {
        navigate('/login');
    }
    try {
      if (action === 'kick') await API.kickCommunityMember(communityId, member.id);
      if (action === 'ban') await API.banCommunityMember(member.id, communityId);
      if (action === 'promote') await API.promoteUser(member.id, communityId);
      if (action === 'demote') await API.demoteCommunityMember(member.id, communityId, currentUser.userId);
      if (action === 'unban') await API.UnBanCommunityMember(member.id, communityId);

      setSelectedUserId(null);
      setEditUsers(false);
      fetchMembers();
    } catch (error) {
      console.error('Error performing action', error);
    }
  };

  return (
    <div className="bg-white shadow-sm md:rounded-xl w-full md:w-1/3 p-4">
      <h1 className="text-2xl font-bold mb-5 text-center">Members</h1>

      {/* Active Members */}
      <div className="space-y-3">
        {members
          .filter((m) => !m.BanStatus && m.id != ownerId)
          .map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg relative">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={member.profileImageUrl || Temppfp}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      member.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium">{member.firstName.substring(0,15) || 'John'} {member.lastName.substring(0,15) || 'Doe'}</p>
                  <p className="text-xs text-gray-500">{member.isOnline ? 'Online' : 'Offline'}</p>
                </div>
                {member.role === 'admin' && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Admin</span>
                )}
              </div>

              {/* Hamburger Menu */}
              <div className="relative">
                <button
                  onClick={() => handleClick(member.id)}
                  className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                    editUsers && selectedUserId === member.id ? 'bg-gray-100 text-gray-800' : 'text-gray-500'
                  }`}
                >
                  <Icon icon="mdi:menu" className="w-5 h-5" />
                </button>

                {/* Popover */}
                {editUsers && selectedUserId === member.id && isAdmin && (
                  <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg border z-50 transition ease-out duration-150 transform scale-95 origin-top-right">
                    {member.role === 'admin' ? (
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        onClick={() => handleAction('demote', member)}
                      >
                        Demote
                      </button>
                    ) : (
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        onClick={() => handleAction('promote', member)}
                      >
                        Promote
                      </button>
                    )}
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                      onClick={() => handleAction('kick', member)}
                    >
                      Kick
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-800"
                      onClick={() => handleAction('ban', member)}
                    >
                      Ban
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Banned Members */}
      {members.some((m) => m.BanStatus) && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Banned Members</h2>
          {members
            .filter((m) => m.BanStatus)
            .map((member) => (
              <div key={member.id} className="flex items-center p-3 bg-gray-100 rounded-lg mb-2">
                <img
                  src={member.profileImageUrl || Temppfp}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-10 h-10 rounded-full object-cover opacity-50"
                />
                     {/* Hamburger Menu */}
                <div className="ml-3">
                  <p className="font-medium line-through">{member.firstName} {member.lastName.substring(0,20)}</p>
                  <p className="text-xs text-gray-500">Banned</p>
                </div>
                      <div className="relative">
                <button
                  onClick={() => handleClick(member.id)}
                  className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                    editUsers && selectedUserId === member.id ? 'bg-gray-100 text-gray-800' : 'text-gray-500'
                  }`}
                >
                        
                  <Icon icon="mdi:account-remove" className="w-5 h-5" />
                </button>
                {editUsers && selectedUserId === member.id && isAdmin && (
                  <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg border z-50 transition ease-out duration-150 transform scale-95 origin-top-right">
                    {member.role === 'banned' && (
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-red-grey text-red-800"
                        onClick={() => handleAction('unban', member)}
                      >
                        unBan
                      </button>
                    )}
                  </div>
                )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CommunityMembers;
