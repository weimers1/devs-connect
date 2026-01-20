import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import Layout from '../Layout';
import API from '../../Service/service';
import CommunityMembers from './CommunityMembers';

//So our edit community regonzies the API call with role and other data important to the community.
export interface userCommunites {
    role: String,
    userId: String,
    joinedAt: String,
    
}

const EditCommunity: React.FC<userCommunites> = () => {
    const { communityId } = useParams<{ communityId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        color: '',
        isPrivate: false,
        image: ''
    });
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string>('');
    // const [isAdmin, setisAdmin] = useState<userCommunites | Boolean>();
    const iconOptions = [
        { value: 'mdi:react', label: 'React', preview: '⚛️' },
        { value: 'mdi:vuejs', label: 'Vue.js', preview: '🟢' },
        { value: 'mdi:angular', label: 'Angular', preview: '🔺' },
        { value: 'mdi:nodejs', label: 'Node.js', preview: '🟢' },
        { value: 'logos:python', label: 'Python', preview: '🐍' },
        { value: 'mdi:language-javascript', label: 'JavaScript', preview: '📜' },
        { value: 'mdi:language-typescript', label: 'TypeScript', preview: '📘' },
        { value: 'mdi:code-tags', label: 'General Code', preview: '💻' },
        { value: 'mdi:palette', label: 'Design', preview: '🎨' },
        { value: 'mdi:server-network', label: 'DevOps', preview: '🔧' }
    ];

    const colorOptions = [
        { value: 'bg-blue-500', label: 'Blue', color: '#3B82F6' },
        { value: 'bg-green-500', label: 'Green', color: '#10B981' },
        { value: 'bg-purple-500', label: 'Purple', color: '#8B5CF6' },
        { value: 'bg-red-500', label: 'Red', color: '#EF4444' },
        { value: 'bg-yellow-500', label: 'Yellow', color: '#F59E0B' },
        { value: 'bg-pink-500', label: 'Pink', color: '#EC4899' },
        { value: 'bg-indigo-500', label: 'Indigo', color: '#6366F1' },
        { value: 'bg-gray-500', label: 'Gray', color: '#6B7280' }
    ];

    useEffect(() => {
        const fetchCommunity = async () => {
            const user = await API.getCurrentUser();
            const userId = user.userId;
            if(!userId) {
                navigate('/login');
                return;
            }   
            if (!communityId) {
                navigate('/communities');
                return;
            }

            try {
                const data = await API.getCommunityAdmins(communityId, userId); //Only admins can edit community for now     
                    if (!data.admin || data.admin.length === 0) {
                    navigate(`/communities`);
                    return;
                }
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    icon: data.icon || '',
                    color: data.color || '',
                    isPrivate: data.isPrivate || false,
                    image: data.image || ''
                });
                setBannerPreview(data.image || '');

            } catch (error) {
                console.error('Failed to fetch community:', error);
                navigate('/communities');
            } finally {
                setLoading(false);
            }
        };

        fetchCommunity();
    }, [communityId, navigate]);

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const reader = new FileReader();
            reader.onload = () => setBannerPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let imageUrl = formData.image;
            
            if (bannerFile) {
                const uploadResult = await API.uploadCommunityImage(bannerFile);
                imageUrl = uploadResult.imageUrl;
            }

            await API.updateCommunity(communityId!, {
                ...formData,
                image: imageUrl
            });
            navigate(`/community/${communityId}`);
        } catch (error) {
            console.error('Failed to update community:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading community...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
                    <div className="bg-white  rounded-none md:border md:rounded-xl shadow-sm p-8">
                        <div className="flex items-center mb-6">
                            <button
                                onClick={() => navigate(`/community/${communityId}`)}
                                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Community</h1>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Community Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Banner Image
                                </label>
                                <div className="space-y-3">
                                    {bannerPreview && (
                                        <img
                                            src={bannerPreview}
                                            alt="Banner preview"
                                            className="w-full h-32 object-cover rounded-lg border"
                                        />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBannerChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icon
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {iconOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: option.value })}
                                            className={`p-3 border rounded-lg text-center hover:bg-gray-50 ${
                                                formData.icon === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">{option.preview}</div>
                                            <div className="text-xs text-gray-600">{option.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color Theme
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {colorOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: option.value })}
                                            className={`p-3 border rounded-lg flex items-center space-x-2 hover:bg-gray-50 ${
                                                formData.color === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                            }`}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: option.color }}
                                            ></div>
                                            <span className="text-sm">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                                    Private Community
                                </label>
                            </div>

                            <div className="flex space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/community/${communityId}`)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            
                        </form>
                         
                    </div>
                 <CommunityMembers></CommunityMembers>
                </div>
               
            </div>
          
        </Layout>
    );
};

export default EditCommunity;