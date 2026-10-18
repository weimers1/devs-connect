import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedirect } from '../Auth/useAuthRedirect';
import API from '../../Service/service';
import { Icon } from '@iconify/react/dist/iconify.js';
import Profile from '/assets/images/Nav-Profile.png';
import { useLanguage } from '../../src/i18n/LanguageContext';

interface CommunitySidebarMember {
    id: string | number;
    publicId: string;
    role: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string | null;
    isOnline?: boolean;
}

interface CommunitySidebarProps {
    community: {
        membersTotal: string;
        membersOnline: string;
        category: string;
        rules: string;
        members?: CommunitySidebarMember[];
    };
    showMembersCenter: boolean;
    setShowMembersCenter?: React.Dispatch<React.SetStateAction<boolean>>;
}


const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ community, setShowMembersCenter, showMembersCenter }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { requireAuth } = useAuthRedirect();

    const Temppfp = Profile;   
  const handleShowMembersClick = () => {
    if (setShowMembersCenter) {
        setShowMembersCenter(true);
    }
};

    const handleProfileClick = async (userId: string, publicId: string) => {
        requireAuth(async () => {
            try {
                const currentUser = await API.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                if (userId === String(currentUser.userId)) {
                        navigate('/profile');
                    } else
                    navigate(`/profile/${publicId}`);
            } catch (error) {
                console.error('Failed to get current user:', error);
                // Fallback to other user profile
                navigate(`/profile/${publicId}`);
            }
        });
    };
    return (
      
        <div className="space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{t('communities.sidebar.stats')}</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('communities.sidebar.totalMembers')}</span>
                        <span className="font-semibold">{community.membersTotal}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('communities.sidebar.onlineNow')}</span>
                        <span className="font-semibold text-green-600">{community.membersOnline}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t('communities.sidebar.category')}</span>
                        <span className="font-semibold">{community.category}</span>
                    </div>
                </div>
            </div>

            {/* Community Rules */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{t('communities.sidebar.rules')}</h3>
                <div className="space-y-3 w-full">
                        <div  className="flex space-x-2">
                            <p  className="rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">{community.rules}</p>
                        </div>
                   
                </div>
            </div>

            {/* Active Members */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
  <h3 className="font-semibold text-gray-900 mb-4">{t('communities.sidebar.members')}</h3>

  <div className="space-y-3">
    {community.members && community.members.length > 0 ? (
      community.members.filter(member => member.role !== "banned").slice(0, 5).map((member) => (
        <div key={member.id} className="flex items-center space-x-3">
          <div className="relative">
              <>
                <img
                  src={
                    member.profileImageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.firstName + " " + member.lastName
                    )}&background=random`
                  }
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-blue-500 cursor-pointer"
                  onClick={() => handleProfileClick(String(member.id), member.publicId)}
                />

                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    member.isOnline ? "bg-green-400" : "bg-gray-400"
                  }`}
                />
              </>
          </div>

          <div className="flex-1">
            <span
              className="text-sm text-gray-700 hover:text-blue-500 cursor-pointer"
              onClick={() => handleProfileClick(String(member.id), member.publicId)}
            >
              {member.firstName} {member.lastName}
            </span>

            {member.role === "admin" && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                {t('communities.sidebar.admin')}
              </span>
            )}
             {member.role === "owner" && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                 <Icon icon="mdi:crown" className="w-4 h-4 mr-1 inline" />
                {t('communities.sidebar.owner')}
              </span>
            )}
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-sm">{t('communities.sidebar.noMembers')}</p>
    )}

    {community.members && community.members.length > 5 && (
      <button className="text-sm text-blue-500 cursor-pointer"
      onClick={handleShowMembersClick}
      >
        {t('communities.sidebar.viewAll')}
      </button>
    )}
  
  </div>
</div>
{showMembersCenter && (
  <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/20">
    <div className="bg-white w-full max-w-xl rounded-xl mt-20 shadow-xl p-6 overflow-hidden relative">
      
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        onClick={() => setShowMembersCenter && setShowMembersCenter(false)}
      >
        X
      </button>

      {/* Modal Title */}
      <h2 className="text-2xl font-bold mb-4 text-center">{t('communities.sidebar.members')}</h2>

      {/* Members List */}
      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
        {community.members && community.members.length > 0 ? (
          community.members
            .filter(member => member.role !== "banned")
            .map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    onClick={() => handleProfileClick(String(member.id), member.publicId)}
                    src={member.profileImageUrl || Temppfp}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium truncate"
                     onClick={() => handleProfileClick(String(member.id), member.publicId)}
                    >{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-gray-500">{member.isOnline ? t('communities.sidebar.online') : t('communities.sidebar.offline')}</p>
                  </div>
                  {member.role === "admin" && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{t('communities.sidebar.admin')}</span>
                  )}
                  {member.role === "owner" && (
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">{t('communities.sidebar.owner')}</span>
                  )}
                </div>
              </div>
            ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-4">{t('communities.sidebar.noMembers')}</p>
        )}
      </div>
    </div>
  </div>
)}
        </div>
        
    );
};

export default CommunitySidebar;