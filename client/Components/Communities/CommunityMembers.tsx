import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import API from '../../Service/service';
import { useLanguage } from '../../src/i18n/LanguageContext';


interface CommunityMember {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  isOnline?: boolean;
  BanStatus?: boolean;
}

const DEFAULT_PROFILE_IMAGE = '/assets/images/Nav-Profile.png';

const CommunityMembers: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { t } = useLanguage();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [editUsers, setEditUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorstate, seterrorstate] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const isOwner = ownerId !== null && String(ownerId) === String(currentUser);
  const canModerate = isAdmin || isOwner;
  const [rightvalue, setrightvalue] = useState(13);
  const [leftvalue, setleftvalue] = useState(0);

  // const Temppfp = Profile;
const navigate = useNavigate();
  const fetchMembers = useCallback(async () => {
    if (!communityId) return;
    try {
      const fetchedMembers = await API.getCommunityMembers(communityId);
      setMembers(fetchedMembers);
    } catch (error) {
      console.error('Error fetching members', error);
    }
  }, [communityId]);

  const fetchAdminStatus = useCallback(async () => {
    if (!communityId) return;
    try {
      const user = await API.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user.userId);
      try {
        const adminStatus = await API.getCommunityAdmins(communityId, user.userId);
        setIsAdmin(!!adminStatus?.admin);
      } catch {
        setIsAdmin(false);
      }

      const communityData = await API.getCommunityById(communityId);
      if (communityData && communityData.createdBy) setOwnerId(communityData.createdBy);
    } catch (error) {
      console.error('Error fetching admin status', error);
    }
  }, [communityId, navigate]);



  useEffect(() => {
    fetchMembers();
    fetchAdminStatus();
  }, [fetchAdminStatus, fetchMembers]);
 
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
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      if (action === 'kick') await API.kickCommunityMember(communityId, member.id, currentUser.userId);
      if (action === 'ban') await API.banCommunityMember(member.id, communityId, currentUser.userId);
      if (action === 'promote') await API.promoteUser(member.id, communityId, currentUser.userId);
      if (action === 'demote') await API.demoteCommunityMember(member.id, communityId, currentUser.userId);
      if (action === 'unban') await API.UnBanCommunityMember(member.id, communityId, currentUser.userId);

      setSelectedUserId(null);
      setEditUsers(false);
      fetchMembers();
    } catch (error) {
      console.error('Error performing action', error);
      seterrorstate(true);
    }
  };

  const leftArrowClick = async () => {
    if(rightvalue > 13) {
      setrightvalue(rightvalue - 13);
    }
    if(leftvalue > 0) {
      setleftvalue(leftvalue - 13);
    }
  }
  const rightarrowclick = async () => {
      setrightvalue(rightvalue + 13);
      setleftvalue(leftvalue + 13);
  }

  return (
    <div className="bg-white shadow-sm md:rounded-xl w-full md:w-1/3 p-4 md:border md:rounded-xl">
      <div className="flex items-center justify-between mb-5">
    {members.length > 10 ? (
         <button
    onClick={leftArrowClick}
    >
      <Icon icon="tabler:arrow-narrow-left" className="mt-1.5 hover:bg-gray-100 rounded-2xl" width="24" height="24" />
    </button>
    ) : (
      <div></div>
    )}
 
  
    
    <h1 className="text-2xl font-bold text-center flex-1">
      {t('communities.members.title')}
    </h1>
    {members.length > 10 ? (
      <button
    onClick={rightarrowclick}
    >
    <Icon icon="tabler:arrow-narrow-right" className="mt-1.5 hover:bg-gray-100 rounded-2xl" width="24" height="24" />
    </button>
    ): (
      <div></div>
    )}
  </div>
      {/* Active Members */}
      <div className="space-y-3">
        {members
          .filter((m) => !m.BanStatus)
          .slice(leftvalue,rightvalue).map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg relative">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={member.profileImageUrl || DEFAULT_PROFILE_IMAGE}
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
                  <p className="text-xs text-gray-500">{member.isOnline ? t('communities.members.online') : t('communities.members.offline')}</p>
                </div>
                {member.role === 'admin' && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 mr-2 rounded">{t('communities.members.admin')}</span>
                )}
                {(member.role === 'owner' || String(member.id) === String(ownerId)) && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 mr-2 rounded">{t('communities.members.owner')}</span>
                )}
              </div>

              {/* Hamburger Menu */}
              <div className="relative">
                {member.role !== 'owner' &&
                  canModerate &&
                  String(member.id) !== String(ownerId) &&
                  String(member.id) !== String(currentUser) &&
                  !(isAdmin && !isOwner && member.role === 'admin') && (
                <button
                  onClick={() => handleClick(member.id)}
                  className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                    editUsers && selectedUserId === member.id ? 'bg-gray-100 text-gray-800' : 'text-gray-500'
                  }`}
                >
                  <Icon icon="mdi:menu" className="w-5 h-5" />
                </button>
                )}
                {/* Popover */}
                {editUsers && selectedUserId === member.id && canModerate && (
                  <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg border z-50 transition ease-out duration-150 transform scale-95 origin-top-right">
                    {isOwner && (
                         member.role === 'admin' ? (
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        onClick={() => handleAction('demote', member)}
                      >
                        {t('communities.members.demote')}
                      </button>
                    ) : (
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        onClick={() => handleAction('promote', member)}
                      >
                        {t('communities.members.promote')}
                      </button>
                    )
                )}
                   
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                      onClick={() => handleAction('kick', member)}
                    >
                      {t('communities.members.kick')}
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-800"
                      onClick={() => handleAction('ban', member)}
                    >
                      {t('communities.members.ban')}
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
          <h2 className="text-lg font-semibold mb-2">{t('communities.members.bannedTitle')}</h2>
          {members
            .filter((m) => m.BanStatus)
            .map((member) => (
              <div key={member.id} className="flex items-center p-3 bg-gray-100 rounded-lg mb-2">
                <img
                  src={member.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-10 h-10 rounded-full object-cover opacity-50"
                />
                     {/* Hamburger Menu */}
                <div className="ml-3">
                  <p className="font-medium line-through">{member.firstName} {member.lastName.substring(0,20)}</p>
                  <p className="text-xs text-gray-500">{t('communities.members.banned')}</p>
                </div>
                      <div className="relative">
                <button
                  onClick={() => handleClick(member.id)}
                  className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                    editUsers && selectedUserId === member.id ? 'bg-gray-100 text-gray-800' : 'text-gray-500'
                  }`}
                >
                        {errorstate && (
                                    <>
                <div className="fixed bg-gray/20 backdrop-invert backdrop-opacity-20 inset-0 flex items-center justify-center ">
               
        <div className="bg-white rounded-xl mb-12 p-6  md:w-90 mx-4">
              <Icon icon="streamline-plump-color:sad-face-flat" className="mb-2 mx-auto" width="72" height="72" />
            <h2 className="text-2xl font-bold mb-6 text-center">{t('communities.members.actionUnavailable')}</h2>
            <div className="flex flex-col gap-3">
            </div>
        </div> 

    </div>
    </>
                    )}
                  <Icon icon="mdi:account-remove" className="w-5 h-5" />
                </button>
                {editUsers && selectedUserId === member.id && canModerate && (
                  <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg border z-50 transition ease-out duration-150 transform scale-95 origin-top-right">
                    {member.role === 'banned' && (
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-red-grey text-red-800 hover:bg-gray-100"
                        onClick={() => handleAction('unban', member)}
                      >
                        {t('communities.members.unban')}
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
