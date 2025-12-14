import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Settings as SettingsIcon, User, Bell, Lock, Mail, Upload } from 'lucide-react';
import { authAPI } from '../../api/auth';
import { getMediaUrl } from '../../api/utils';
import Loader from '../../components/Loader';

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
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('phone', formData.phone);
      data.append('bio', formData.bio);

      if (profilePhoto) {
        data.append('profile_picture', profilePhoto);
      }

      console.log('Sending profile update with FormData');
      const response = await authAPI.updateProfile(data);
      console.log('Profile update response:', response);

      if (response && response.user) {
        // Update the user in context
        updateProfile(response.user);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setProfilePhoto(null);

        // Update form data with new values
        setFormData({
          first_name: response.user.first_name || '',
          last_name: response.user.last_name || '',
          username: response.user.username || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          bio: response.user.bio || '',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);

      let errorMsg = 'Failed to update profile. Please try again.';

      if (error.response?.data) {
        // Handle field-level errors from backend
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Get first error message from any field
          const firstErrorKey = Object.keys(errorData)[0];
          const firstError = errorData[firstErrorKey];
          if (Array.isArray(firstError)) {
            errorMsg = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMsg = firstError;
          }
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setMessage(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen={true} />;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white backdrop-blur-md border-b border-gray-200 p-6 mb-8 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-900">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'profile'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-700 hover:text-gray-900'
              }`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'security'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-700 hover:text-gray-900'
              }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'notifications'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-700 hover:text-gray-900'
              }`}
          >
            Notifications
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${message.includes('successfully')
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            {message}
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
            <div className="max-w-2xl">
              {!isEditing ? (
                <div>
                  {/* Profile Info Display */}
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-gray-900 text-3xl font-bold overflow-hidden">
                      {user?.profile_picture ? (
                        <img src={getMediaUrl(user.profile_picture)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{formData.first_name?.[0]}{formData.last_name?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.first_name} {formData.last_name}</h2>
                      <p className="text-gray-700">@{formData.username}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                      <p className="text-gray-900">{formData.first_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                      <p className="text-gray-900">{formData.last_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                      <p className="text-gray-900">{formData.username || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{formData.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{formData.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                      <p className="text-gray-900">{formData.bio || 'Not set'}</p>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-gray-900 text-2xl font-bold flex-shrink-0 overflow-hidden">
                        {user?.profile_picture ? (
                          <img src={getMediaUrl(user.profile_picture)} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span>{formData.first_name?.[0]}{formData.last_name?.[0]}</span>
                        )}
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows="4"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
          <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                <Lock className="w-6 h-6 text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h3>
                  <p className="text-gray-700 text-sm mb-4">Update your password to keep your account secure</p>
                  <button className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded-lg transition">
                    Change Password
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <User className="w-6 h-6 text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Two-Factor Authentication</h3>
                  <p className="text-gray-700 text-sm">Add extra security to your account</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white backdrop-blur-md border border-gray-200 rounded-lg p-6">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-700">Receive course updates and announcements</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <Bell className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-700">Get notified about important events</p>
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
