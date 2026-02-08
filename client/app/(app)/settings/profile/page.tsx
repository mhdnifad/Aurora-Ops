'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateUserProfile } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Camera,
  Loader,
  Save,
  CheckCircle,
  Crop as CropIcon,
} from 'lucide-react';
import ImageCropper from '@/components/ui/image-cropper';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const inputClass =
    'h-11 bg-white/70 dark:bg-slate-900/70 border-white/30 dark:border-white/10 focus-visible:ring-emerald-500/40';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarLoading, setAvatarLoading] = useState<'upload' | 'remove' | null>(null);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const handleRemovePhoto = async () => {
    if (!user) return;
    setAvatarLoading('remove');
    // Optimistic UI: clear avatar immediately
    const prevAvatar = avatarPreview;
    setAvatarPreview(null);
    setUser(user ? { ...user, avatar: undefined } : user);
    try {
      await apiClient.removeUserAvatar();
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      await queryClient.refetchQueries({ queryKey: ['currentUser'] });
      toast.success('Profile photo removed');
    } catch (error: any) {
      // Revert UI if failed
      setAvatarPreview(prevAvatar);
      setUser(user ? { ...user, avatar: prevAvatar || undefined } : user);
      toast.error(error?.response?.data?.message || 'Failed to remove photo');
    } finally {
      setAvatarLoading(null);
    }
  };

  // Always sync form and avatar preview with user context, unless a new file is being previewed
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
      if (!avatar) {
        setAvatarPreview((user as any).avatar || null);
      }
    }
  }, [user, avatar]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image too large (max 10MB)');
        return;
      }
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedImageTypes.includes(file.type)) {
        toast.error('Unsupported image type. Allowed: JPG, PNG, WEBP, GIF');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setShowCropper(false);
    setAvatarLoading('upload');
    const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    setAvatar(file);
    // Optimistic UI: show preview immediately
    const previewUrl = URL.createObjectURL(croppedBlob);
    setAvatarPreview(previewUrl);
    // Upload immediately for real-time effect
    (async () => {
      try {
        const avatarRes = await apiClient.uploadUserAvatar(file);
        setUser(user ? { ...user, avatar: avatarRes?.avatar } : user);
        await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        await queryClient.refetchQueries({ queryKey: ['currentUser'] });
        toast.success('Profile photo updated');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to upload photo');
        setAvatarPreview(user?.avatar || null);
      } finally {
        setAvatarLoading(null);
      }
    })();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = await apiClient.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setUser(user ? {
        ...user,
        firstName: data?.firstName || formData.firstName,
        lastName: data?.lastName || formData.lastName,
      } : user);
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      await queryClient.refetchQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Keep your profile up to date across all teams.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 dark:border-emerald-500/30 bg-white/70 dark:bg-slate-900/70 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Live profile
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Avatar Section */}
      <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              user?.firstName?.charAt(0).toUpperCase()
            )}
            {avatarLoading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full z-10">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Profile Picture</h3>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button 
                  onClick={() => fileInputRef?.click()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  type="button"
                  disabled={isSaving || avatarLoading === 'upload'}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                {avatarPreview && (
                  <Button
                    variant="outline"
                    className="border-white/30 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10"
                    onClick={() => setShowCropper(true)}
                    type="button"
                    disabled={isSaving || avatarLoading === 'upload'}
                  >
                    <CropIcon className="w-4 h-4 mr-2" />
                    Adjust
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-red-300/80 text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                  onClick={handleRemovePhoto}
                  disabled={avatarLoading === 'remove' || isSaving || !avatarPreview}
                  type="button"
                >
                  {avatarLoading === 'remove' ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Remove Photo
                </Button>
              </div>
              <input
                ref={setFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Max 10MB. Allowed: JPG, PNG, WEBP, GIF
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-8 border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              autoComplete="given-name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              autoComplete="family-name"
              placeholder="Enter last name"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              className={inputClass}
              disabled
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Account Status */}
      <Card className="p-6 border border-emerald-200/60 dark:border-emerald-500/30 shadow-md bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-emerald-900/20 dark:to-emerald-900/10">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-bold text-green-900 dark:text-emerald-200">Account Active</h3>
            <p className="text-sm text-green-700 dark:text-emerald-300">Your account is active and verified</p>
          </div>
        </div>
      </Card>

      {/* Render cropper modal using React portal for true overlay */}
      {showCropper && cropImage && (
        <ImageCropper
          image={cropImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}

  // (Removed duplicate/conflicting useEffect)
