import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import Layout from '../Layout';
import API from '../../Service/service';

const CreateCommunity: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        tags: '',
        rules: '',
        isPrivate: false
    });
    const [selectedIcon, setSelectedIcon] = useState('mdi:account-group');
    const [selectedColor, setSelectedColor] = useState('bg-gradient-to-r from-blue-400 to-cyan-500');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories = [
        'Frontend Development',
        'Backend Development',
        'Full Stack Development',
        'Mobile Development',
        'DevOps & Infrastructure',
        'Data Science & AI',
        'Design & UX',
        'Game Development',
        'Cybersecurity',
        'Other'
    ];

    const iconOptions = [
        'mdi:account-group',
        'mdi:code-tags',
        'mdi:laptop',
        'mdi:rocket',
        'mdi:lightbulb',
        'mdi:brain',
        'mdi:palette',
        'mdi:gamepad-variant',
        'mdi:shield-check',
        'mdi:star'
    ];

    const colorOptions = [
        'bg-gradient-to-r from-blue-400 to-cyan-500',
        'bg-gradient-to-r from-purple-400 to-pink-500',
        'bg-gradient-to-r from-green-400 to-blue-500',
        'bg-gradient-to-r from-yellow-400 to-orange-500',
        'bg-gradient-to-r from-red-400 to-pink-500',
        'bg-gradient-to-r from-indigo-400 to-purple-500',
        'bg-gradient-to-r from-teal-400 to-green-500',
        'bg-gradient-to-r from-gray-400 to-gray-600'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let imageUrl = null;
            if (selectedImage) {
                const uploadResult = await API.uploadCommunityImage(selectedImage);
                imageUrl = uploadResult.imageUrl;
            }
            
            const result = await API.createCommunity({
                ...formData,
                icon: selectedIcon,
                color: selectedColor,
                image: imageUrl
            });
            navigate(`/community/${result.community.id}`);
        } catch (error) {
            console.error('Failed to create community:', error);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('/communities')}
                            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-2" />
                            Back to Communities
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Community</h1>
                        <p className="text-gray-600">Build a space for developers to connect, learn, and collaborate</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Community Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., React Developers"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe what your community is about..."
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        placeholder="e.g., javascript, react, frontend"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
                                </div>
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Community Appearance</h2>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Custom Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Custom Image (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                                    />
                                    {imagePreview && (
                                        <div className="w-24 h-24 rounded-lg overflow-hidden border">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                {/* Preset Options */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Or Choose Preset
                                    </label>
                                    
                                    {/* Icon Selection */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-2">Icon</p>
                                        <div className="flex flex-wrap gap-2">
                                            {iconOptions.slice(0, 6).map(icon => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setSelectedIcon(icon)}
                                                    className={`p-2 rounded-lg border transition-colors ${
                                                        selectedIcon === icon
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <Icon icon={icon} className="w-5 h-5 text-gray-700" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Selection */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Color</p>
                                        <div className="flex flex-wrap gap-2">
                                            {colorOptions.slice(0, 6).map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${color} ${
                                                        selectedColor === color
                                                            ? 'border-gray-800 scale-110'
                                                            : 'border-gray-200 hover:scale-105'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-6 pt-6 border-t">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Preview
                                </label>
                                <div className="bg-gray-50 rounded-lg p-4 max-w-sm">
                                    <div className="flex items-center space-x-3">
                                        {imagePreview ? (
                                            <div className="w-12 h-12 rounded-xl overflow-hidden">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className={`w-12 h-12 ${selectedColor} rounded-xl flex items-center justify-center`}>
                                                <Icon icon={selectedIcon} className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {formData.name || 'Community Name'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {formData.category || 'Category'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/communities')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Community
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default CreateCommunity;