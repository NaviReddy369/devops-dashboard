import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  Award,
  Clock,
  Sparkles,
  FolderOpen,
  Mail,
  MapPin,
  Phone,
  Linkedin,
  Github,
  Globe,
  Star,
  Trophy,
  TrendingUp,
  Zap,
  Shield,
  CheckCircle2,
  BadgeCheck,
  ArrowRight,
  Share2,
  Loader,
  Calendar,
  Target,
  Rocket,
  Edit,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  FileCode,
  FileSpreadsheet,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Eye,
  ExternalLink,
  Download,
  Link as LinkIcon,
  Sparkle,
} from 'lucide-react';
import { getTaskerProfile } from '../api/taskerProfiles';
import { TaskerProfile as TaskerProfileType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { generateDashboardData } from '../firebase';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateDocument, COLLECTIONS } from '../api/firestore';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Tasker: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TaskerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (profile && isOwnProfile) {
      loadAnalytics();
    }
  }, [profile, isOwnProfile]);

  const loadProfile = async () => {
    if (!userId) {
      setError('No user ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getTaskerProfile(userId);
      if (data) {
        setProfile(data);
        if (data.personalInfo.profilePhoto) {
          setImagePreview(data.personalInfo.profilePhoto);
        }
      } else {
        setError('Profile not found');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!profile) return;
    
    try {
      setLoadingAnalytics(true);
      const result = await generateDashboardData({});
      const data = result.data as any;
      if (data && data.success) {
        setDashboardData(data.data);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && profile) {
      try {
        await navigator.share({
          title: `${profile.personalInfo.displayName} - Tasker Profile`,
          text: `Check out ${profile.personalInfo.displayName}'s profile on GNK Continuum`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!currentUser || !selectedImage || !profile) return;

    try {
      setUploadingPhoto(true);
      const fileRef = ref(storage, `taskerProfiles/${currentUser.uid}/profilePhoto/${Date.now()}_${selectedImage.name}`);
      await uploadBytes(fileRef, selectedImage);
      const downloadURL = await getDownloadURL(fileRef);

      // Update profile with new photo URL using direct Firestore update
      await updateDocument(
        COLLECTIONS.TASKER_PROFILES,
        profile.id,
        {
          personalInfo: {
            ...profile.personalInfo,
            profilePhoto: downloadURL,
          },
          updatedAt: new Date(),
        }
      );

      // Reload profile to get updated data
      await loadProfile();
      setShowEditModal(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!currentUser || !profile?.personalInfo.profilePhoto) return;

    try {
      setUploadingPhoto(true);
      
      // Delete from storage
      try {
        const oldPhotoRef = ref(storage, profile.personalInfo.profilePhoto);
        await deleteObject(oldPhotoRef);
      } catch (err) {
        console.log('Photo not found in storage, continuing...');
      }

      // Update profile - remove photo
      const { profilePhoto, ...personalInfoWithoutPhoto } = profile.personalInfo;
      
      await updateDocument(
        COLLECTIONS.TASKER_PROFILES,
        profile.id,
        {
          personalInfo: personalInfoWithoutPhoto,
          updatedAt: new Date(),
        }
      );

      // Reload profile to get updated data
      await loadProfile();
      setImagePreview(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('Failed to remove photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Badge component for links
  const LinkBadge: React.FC<{ url: string; label: string; icon?: React.ReactNode }> = ({ url, label, icon }) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 transition-all group"
    >
      {icon || <LinkIcon className="w-4 h-4 text-purple-400" />}
      <span className="text-sm font-medium">{label}</span>
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );

  // File badge component
  const FileBadge: React.FC<{ url: string; fileName: string; type: 'csv' | 'py' | 'pdf' | 'image' }> = ({ url, fileName, type }) => {
    const icons = {
      csv: FileSpreadsheet,
      py: FileCode,
      pdf: FileText,
      image: ImageIcon,
    };
    const colors = {
      csv: 'text-green-400',
      py: 'text-blue-400',
      pdf: 'text-red-400',
      image: 'text-purple-400',
    };
    const Icon = icons[type];
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 transition-all group"
      >
        <Icon className={`w-4 h-4 ${colors[type]}`} />
        <span className="text-xs font-medium truncate max-w-[150px]">{fileName}</span>
        <Download className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">Profile Not Found</h1>
          <p className="text-purple-200/70 mb-6">{error || 'This profile does not exist or is not available.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-lg transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.personalInfo.displayName;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const completionPercentage = profile.completionPercentage;
  const profilePhoto = profile.personalInfo.profilePhoto || imagePreview;

  // Extract file URLs from projects (assuming they're stored in a structured way)
  const getProjectFiles = (project: any) => {
    const files: Array<{ url: string; fileName: string; type: 'csv' | 'py' | 'pdf' | 'image' }> = [];
    
    // Project images
    if (project.images && Array.isArray(project.images)) {
      project.images.forEach((img: string, idx: number) => {
        files.push({ url: img, fileName: `Image ${idx + 1}`, type: 'image' });
      });
    }
    
    // Note: CSV, PY, PDF files would need to be stored in project data
    // For now, we'll extract them from URLs if they match patterns
    if (project.url) {
      const url = project.url.toLowerCase();
      if (url.includes('.csv')) files.push({ url: project.url, fileName: 'Data File', type: 'csv' });
      if (url.includes('.py')) files.push({ url: project.url, fileName: 'Code File', type: 'py' });
      if (url.includes('.pdf')) files.push({ url: project.url, fileName: 'Documentation', type: 'pdf' });
    }
    
    return files;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Avatar & Basic Info */}
              <div className="flex-shrink-0 relative group">
                <div className="relative">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={displayName}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover shadow-2xl shadow-purple-500/50 border-4 border-purple-500/30"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center text-5xl md:text-6xl font-bold shadow-2xl shadow-purple-500/50">
                      {avatarInitial}
                    </div>
                  )}
                  {profile.status === 'active' && (
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-green-500 border-4 border-slate-950 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 border-2 border-white/20 flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Edit Profile Photo"
                  >
                    <Edit className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2 flex-wrap">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                    {displayName}
                  </h1>
                  {profile.isTaskAchieverEligible && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      TaskAchiever
                    </span>
                  )}
                </div>
                <p className="text-2xl md:text-3xl text-purple-200 mb-4">{profile.professionalInfo.title}</p>
                <p className="text-purple-200/70 text-lg mb-6 max-w-2xl">{profile.personalInfo.bio || 'No bio available'}</p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                  {profile.personalInfo.location && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <MapPin className="w-4 h-4 text-purple-300" />
                      <span className="text-sm">{profile.personalInfo.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Clock className="w-4 h-4 text-purple-300" />
                    <span className="text-sm capitalize">{profile.workPreferences.availability.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Globe className="w-4 h-4 text-purple-300" />
                    <span className="text-sm capitalize">{profile.workPreferences.location.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Target className="w-4 h-4 text-purple-300" />
                    <span className="text-sm">{completionPercentage}% Complete</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/tasker-meta')}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-lg transition-all"
                    >
                      <Edit className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share Profile</span>
                  </button>
                  {profile.personalInfo.phone && (
                    <a
                      href={`tel:${profile.personalInfo.phone}`}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Contact</span>
                    </a>
                  )}
                  <a
                    href={`mailto:${profile.userEmail}`}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Analytics & Insights Section (Own Profile Only) */}
              {isOwnProfile && dashboardData && (
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Profile Insights & Analytics</h2>
                  </div>
                  
                  {loadingAnalytics ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-8 h-8 text-purple-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Skills Distribution */}
                      {dashboardData.analytics?.skillsDistribution && Object.keys(dashboardData.analytics.skillsDistribution).length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-cyan-400" />
                            Skills Distribution
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={Object.entries(dashboardData.analytics.skillsDistribution).map(([name, value]) => ({
                                    name,
                                    value: Number(value),
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {Object.keys(dashboardData.analytics.skillsDistribution).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={['#a855f7', '#ec4899', '#8b5cf6', '#d946ef', '#06b6d4'][index % 5]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Performance Trends */}
                      {dashboardData.performanceTrends && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-400" />
                            Performance Trends
                          </h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={dashboardData.performanceTrends.tasksCompleted || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="#a855f7" />
                                <YAxis stroke="#a855f7" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} name="Tasks Completed" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* TaskAchiever Progress */}
                      {dashboardData.taskAchieverProgress && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            TaskAchiever Progress
                          </h3>
                          <div className="space-y-4">
                            {Object.entries(dashboardData.taskAchieverProgress).map(([key, progress]: [string, any]) => (
                              <div key={key}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-purple-200/70 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className="font-medium">{progress.current} / {progress.required}</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                                    style={{ width: `${Math.min((progress.current / progress.required) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Skills Section */}
              {(profile.skills.primary.length > 0 || profile.skills.secondary.length > 0) && (
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Skills & Expertise</h2>
                  </div>
                  {profile.skills.primary.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-purple-200/70 mb-3">Primary Skills</h3>
                      <div className="flex flex-wrap gap-3">
                        {profile.skills.primary.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-sm font-medium flex items-center gap-2"
                          >
                            <Star className="w-4 h-4 text-amber-400" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.skills.secondary.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-purple-200/70 mb-3">Secondary Skills</h3>
                      <div className="flex flex-wrap gap-3">
                        {profile.skills.secondary.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specialties */}
              {profile.specialties.length > 0 && (
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Specialties</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {profile.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-400/30 text-sm font-medium flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Projects */}
              {profile.portfolio.projects.length > 0 && (
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Portfolio</h2>
                  </div>
                  <div className="space-y-6">
                    {profile.portfolio.projects.map((project) => {
                      const projectFiles = getProjectFiles(project);
                      const isExpanded = expandedProject === project.id;
                      
                      return (
                        <div
                          key={project.id}
                          className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-1">{project.title}</h3>
                              {project.category && (
                                <span className="inline-block px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium mb-2">
                                  {project.category}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {project.url && (
                                <LinkBadge url={project.url} label="View Project" icon={<Globe className="w-4 h-4" />} />
                              )}
                              {projectFiles.length > 0 && (
                                <button
                                  onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                                >
                                  <Eye className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-purple-200/70 mb-4">{project.description}</p>
                          
                          {/* Project Images */}
                          {project.images && project.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                              {project.images.slice(0, isExpanded ? project.images.length : 3).map((img: string, idx: number) => (
                                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video bg-white/5">
                                  <img
                                    src={img}
                                    alt={`${project.title} ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                  <a
                                    href={img}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                  >
                                    <Eye className="w-6 h-6 text-white" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Project Files */}
                          {isExpanded && projectFiles.length > 0 && (
                            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-purple-400" />
                                Project Files
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {projectFiles.map((file, idx) => (
                                  <FileBadge key={idx} {...file} />
                                ))}
                              </div>
                            </div>
                          )}

                          {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-purple-200/60 flex-wrap">
                            {project.role && (
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {project.role}
                              </span>
                            )}
                            {project.duration && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {project.duration}
                              </span>
                            )}
                            {project.outcome && (
                              <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {project.outcome}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {profile.portfolio.achievements.length > 0 && (
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Key Achievements</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.portfolio.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-400/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg">{achievement.title}</h3>
                          {achievement.proofUrl && (
                            <LinkBadge url={achievement.proofUrl} label="Proof" icon={<Shield className="w-4 h-4" />} />
                          )}
                        </div>
                        {achievement.category && (
                          <span className="inline-block px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs font-medium mb-2">
                            {achievement.category}
                          </span>
                        )}
                        <p className="text-purple-200/70 mb-2 text-sm">{achievement.description}</p>
                        {achievement.metrics && (
                          <div className="flex items-center gap-2 text-sm text-yellow-400">
                            <TrendingUp className="w-4 h-4" />
                            <span>{achievement.metrics}</span>
                          </div>
                        )}
                        {achievement.date && (
                          <div className="flex items-center gap-2 text-xs text-purple-200/50 mt-2">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(achievement.date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              {/* Metrics Card */}
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-purple-200/70">Tasks Completed</span>
                    <span className="text-xl font-bold">{profile.metrics.tasksCompleted}</span>
                  </div>
                  {profile.metrics.averageRating > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-sm text-purple-200/70">Average Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xl font-bold">{profile.metrics.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                  {profile.metrics.slaReliability > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-sm text-purple-200/70">SLA Reliability</span>
                      <span className="text-xl font-bold text-green-400">{profile.metrics.slaReliability}%</span>
                    </div>
                  )}
                  {profile.metrics.averageTurnaroundHours > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-sm text-purple-200/70">Avg. Turnaround</span>
                      <span className="text-xl font-bold">{profile.metrics.averageTurnaroundHours.toFixed(1)}h</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-purple-200/70">Profile Complete</span>
                    <span className="text-xl font-bold">{completionPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Work Preferences */}
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Work Preferences
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200/70">Availability</span>
                    <span className="font-medium capitalize">{profile.workPreferences.availability.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200/70">Location</span>
                    <span className="font-medium capitalize">{profile.workPreferences.location.replace('-', ' ')}</span>
                  </div>
                  {profile.workPreferences.hourlyRate && (
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200/70">Hourly Rate</span>
                      <span className="font-medium">
                        {profile.workPreferences.currency || 'USD'} {profile.workPreferences.hourlyRate}
                      </span>
                    </div>
                  )}
                  {profile.workPreferences.fastTrackAvailable && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-400/30">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-300">Available for fast-track tasks</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(profile.professionalInfo.linkedInUrl ||
                profile.professionalInfo.githubUrl ||
                profile.professionalInfo.portfolioUrl) && (
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Links & Resources
                  </h3>
                  <div className="space-y-2">
                    {profile.professionalInfo.linkedInUrl && (
                      <LinkBadge
                        url={profile.professionalInfo.linkedInUrl}
                        label="LinkedIn"
                        icon={<Linkedin className="w-4 h-4 text-blue-400" />}
                      />
                    )}
                    {profile.professionalInfo.githubUrl && (
                      <LinkBadge
                        url={profile.professionalInfo.githubUrl}
                        label="GitHub"
                        icon={<Github className="w-4 h-4 text-gray-300" />}
                      />
                    )}
                    {profile.professionalInfo.portfolioUrl && (
                      <LinkBadge
                        url={profile.professionalInfo.portfolioUrl}
                        label="Portfolio Website"
                        icon={<Globe className="w-4 h-4 text-purple-400" />}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profile.skills.certifications && profile.skills.certifications.length > 0 && (
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-green-400" />
                    Certifications
                  </h3>
                  <div className="space-y-2">
                    {profile.skills.certifications.map((cert) => (
                      <div key={cert.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{cert.name}</h4>
                            {cert.issuer && <p className="text-xs text-purple-200/60 mt-1">{cert.issuer}</p>}
                          </div>
                          {cert.verified && (
                            <BadgeCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                        {cert.issueDate && (
                          <p className="text-xs text-purple-200/50 mt-2">
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          </p>
                        )}
                        {cert.credentialUrl && (
                          <LinkBadge url={cert.credentialUrl} label="View Certificate" icon={<Eye className="w-3 h-3" />} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              {!isOwnProfile && (
                <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-2xl rounded-3xl border border-purple-400/30 p-6 shadow-2xl">
                  <div className="text-center">
                    <Rocket className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">Join GNK Continuum</h3>
                    <p className="text-sm text-purple-200/70 mb-4">
                      Create your own tasker profile and start getting matched with exciting projects
                    </p>
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-lg transition-all font-medium"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Photo Modal */}
      {showEditModal && isOwnProfile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-3xl border border-white/10 p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Edit Profile Photo</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedImage(null);
                  setImagePreview(profile?.personalInfo.profilePhoto || null);
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Preview */}
              <div className="flex justify-center">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-purple-500/30"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center text-4xl font-bold">
                      {avatarInitial}
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-400/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-purple-400" />
                <span className="text-sm font-medium">Choose New Photo</span>
                <span className="text-xs text-purple-200/60">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {profile?.personalInfo.profilePhoto && (
                  <button
                    onClick={handlePhotoRemove}
                    disabled={uploadingPhoto}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                )}
                <button
                  onClick={handlePhotoUpload}
                  disabled={uploadingPhoto || !selectedImage}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Save Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasker;
