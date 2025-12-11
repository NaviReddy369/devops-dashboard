import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ArrowRight,
  Share2,
  Loader,
  Calendar,
  Target,
  Rocket,
} from 'lucide-react';
import { getTaskerProfile } from '../api/taskerProfiles';
import { TaskerProfile as TaskerProfileType } from '../types';

const Tasker: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<TaskerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

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

  const handleShare = async () => {
    if (navigator.share && profile) {
      try {
        await navigator.share({
          title: `${profile.personalInfo.displayName} - Tasker Profile`,
          text: `Check out ${profile.personalInfo.displayName}'s profile on GNK Continuum`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
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
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center text-5xl md:text-6xl font-bold shadow-2xl shadow-purple-500/50">
                    {avatarInitial}
                  </div>
                  {profile.status === 'active' && (
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-green-500 border-4 border-slate-950 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
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
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
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
                    {profile.portfolio.projects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold">{project.title}</h3>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                        <p className="text-purple-200/70 mb-4">{project.description}</p>
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
                        <div className="flex items-center gap-4 text-sm text-purple-200/60">
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
                        </div>
                      </div>
                    ))}
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
                  <div className="space-y-4">
                    {profile.portfolio.achievements.slice(0, 5).map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-400/50 transition-all"
                      >
                        <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                        <p className="text-purple-200/70 mb-2">{achievement.description}</p>
                        {achievement.metrics && (
                          <div className="flex items-center gap-2 text-sm text-yellow-400">
                            <TrendingUp className="w-4 h-4" />
                            <span>{achievement.metrics}</span>
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
                    Links
                  </h3>
                  <div className="space-y-2">
                    {profile.professionalInfo.linkedInUrl && (
                      <a
                        href={profile.professionalInfo.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                      >
                        <Linkedin className="w-5 h-5 text-blue-400" />
                        <span className="flex-1">LinkedIn</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                    {profile.professionalInfo.githubUrl && (
                      <a
                        href={profile.professionalInfo.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                      >
                        <Github className="w-5 h-5 text-gray-300" />
                        <span className="flex-1">GitHub</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                    {profile.professionalInfo.portfolioUrl && (
                      <a
                        href={profile.professionalInfo.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                      >
                        <Globe className="w-5 h-5 text-purple-400" />
                        <span className="flex-1">Portfolio</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Call to Action */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasker;

