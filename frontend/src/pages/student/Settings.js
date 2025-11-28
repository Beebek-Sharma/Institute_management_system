import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Settings as SettingsIcon, User, Bell, Lock, Mail, Upload } from 'lucide-react';
import axios from '../../api/axios';

const Settings = () => {
  const { user, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else {
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
        });
      }
    }
  }, [loading, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      const dataToUpdate = { ...formData };
      
      // Handle photo upload if selected
      if (profilePhoto) {
        const formDataWithPhoto = new FormData();
        Object.keys(dataToUpdate).forEach(key => {
          formDataWithPhoto.append(key, dataToUpdate[key]);
        });
        formDataWithPhoto.append('profile_picture', profilePhoto);
        
        // Would need a specific endpoint for file upload
        // For now, just send the text data
      }

      await updateProfile(dataToUpdate);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setProfilePhoto(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 mb-8 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-gray-200">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/20">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'profile'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-gray-100'
            }`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'security'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-gray-100'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-gray-100'
            }`}
          >
            Notifications
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('successfully')
              ? 'bg-green-500/20 border-green-500/50 text-green-200'
              : 'bg-red-500/20 border-red-500/50 text-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <div className="max-w-2xl">
              {!isEditing ? (
                <div>
                  {/* Profile Info Display */}
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/20">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                      {formData.first_name?.[0]}{formData.last_name?.[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{formData.first_name} {formData.last_name}</h2>
                      <p className="text-gray-300">@{formData.username}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">First Name</label>
                      <p className="text-white">{formData.first_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">Last Name</label>
                      <p className="text-white">{formData.last_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">Username</label>
                      <p className="text-white">{formData.username || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">Email</label>
                      <p className="text-white">{formData.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">Phone</label>
                      <p className="text-white">{formData.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1">Bio</label>
                      <p className="text-white">{formData.bio || 'Not set'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form className="space-y-4">
                  {/* Profile Photo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {formData.first_name?.[0]}{formData.last_name?.[0]}
                      </div>
                      <label className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded-lg cursor-pointer transition flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      {profilePhoto && <p className="text-green-400">{profilePhoto.name}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 bg-white/20 border border-white/40 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows="4"
                      className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setProfilePhoto(null);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-600/30 hover:bg-gray-600/50 text-white font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-white/20">
                <Lock className="w-6 h-6 text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Change Password</h3>
                  <p className="text-gray-300 text-sm mb-4">Update your password to keep your account secure</p>
                  <button className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded-lg transition">
                    Change Password
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <User className="w-6 h-6 text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Two-Factor Authentication</h3>
                  <p className="text-gray-300 text-sm">Add extra security to your account</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-300">Receive course updates and announcements</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="flex items-center gap-4">
                  <Bell className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-300">Get notified about important events</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
