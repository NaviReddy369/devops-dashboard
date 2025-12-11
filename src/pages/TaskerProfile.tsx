import React, { useState, useEffect } from 'react';
import {
  BadgeCheck,
  Briefcase,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  Zap,
  Edit,
  Loader,
  Trophy,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Linkedin,
  Github,
  Globe,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getTaskerProfileByUserId } from '../api/taskerProfiles';
import { TaskerProfile as TaskerProfileType } from '../types';

const TaskerProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TaskerProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getTaskerProfileByUserId(currentUser.uid);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Use profile data if available, otherwise use defaults
  const displayName =
    profile?.personalInfo.displayName ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Tasker';
  const email = profile?.userEmail || currentUser?.email || 'tasker@example.com';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const specialties = profile?.specialties || [];
  const stats = profile
    ? [
        {
          label: 'Tasks delivered',
          value: profile.metrics.tasksCompleted.toString(),
          icon: Briefcase,
        },
        {
          label: 'SLA reliability',
          value: `${profile.metrics.slaReliability}%`,
          icon: Shield,
        },
        {
          label: 'Avg. turnaround',
          value: `${profile.metrics.averageTurnaroundHours.toFixed(1)}h`,
          icon: Clock3,
        },
        {
          label: 'Quality score',
          value: `${profile.metrics.qualityScore.toFixed(1)}/5`,
          icon: Star,
        },
      ]
    : [
        { label: 'Tasks delivered', value: '0', icon: Briefcase },
        { label: 'SLA reliability', value: 'N/A', icon: Shield },
        { label: 'Avg. turnaround', value: 'N/A', icon: Clock3 },
        { label: 'Quality score', value: 'N/A', icon: Star },
      ];

  const getStatusBadge = () => {
    if (!profile) return null;
    
    const statusColors = {
      incomplete: 'bg-yellow-500/10 border-yellow-400/30 text-yellow-200',
      pending: 'bg-blue-500/10 border-blue-400/30 text-blue-200',
      approved: 'bg-green-500/10 border-green-400/30 text-green-200',
      active: 'bg-green-500/10 border-green-400/30 text-green-200',
      suspended: 'bg-red-500/10 border-red-400/30 text-red-200',
    };

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border capitalize ${
          statusColors[profile.status]
        }`}
      >
        {profile.status === 'incomplete' && <AlertCircle className="w-4 h-4" />}
        {profile.status === 'pending' && <Loader className="w-4 h-4 animate-spin" />}
        {(profile.status === 'approved' || profile.status === 'active') && (
          <CheckCircle2 className="w-4 h-4" />
        )}
        {profile.status === 'suspended' && <XCircle className="w-4 h-4" />}
        {profile.status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/30">
              {avatarInitial}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-sm text-purple-200/70">Tasker profile</p>
                {getStatusBadge()}
                {profile?.completionPercentage && (
                  <span className="text-xs text-purple-200/70">
                    {profile.completionPercentage}% Complete
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
              {profile?.professionalInfo.title && (
                <p className="text-purple-200/80 mt-1">{profile.professionalInfo.title}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm text-purple-200/80 mt-2">
                {profile?.personalInfo.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.personalInfo.location}
                  </span>
                )}
                {profile?.workPreferences.location && (
                  <span className="inline-flex items-center gap-1 capitalize">
                    <Globe className="w-4 h-4" />
                    {profile.workPreferences.location.replace('-', ' ')}
                  </span>
                )}
                {profile?.status === 'active' && (
                  <span className="inline-flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Verified
                  </span>
                )}
                {profile?.workPreferences.fastTrackAvailable && (
                  <span className="inline-flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Fast-track available
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-purple-200/80">
            {profile?.personalInfo.phone && (
              <a
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                href={`tel:${profile.personalInfo.phone}`}
              >
                <Phone className="w-4 h-4" />
                {profile.personalInfo.phone}
              </a>
            )}
            <a
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
              href={`mailto:${email}`}
            >
              <Mail className="w-4 h-4" />
              {email}
            </a>
            <button
              onClick={() => navigate('/tasker-meta')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-400/30 hover:bg-purple-500/30 transition"
            >
              <Edit className="w-4 h-4" />
              {profile ? 'Edit Profile' : 'Complete Profile'}
            </button>
          </div>
        </div>

        {!profile && (
          <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-400/30">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-200">Profile Not Started</h3>
            </div>
            <p className="text-yellow-200/80 mb-4">
              You haven't created your tasker profile yet. Complete your profile to start getting matched with tasks.
            </p>
            <button
              onClick={() => navigate('/tasker-meta')}
              className="px-6 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 transition-all text-yellow-200"
            >
              Get Started
            </button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            {profile?.personalInfo.bio && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-purple-500/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Profile overview</h2>
                  {profile.workPreferences.fastTrackAvailable && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-purple-500/10 border border-purple-400/20 text-purple-100">
                      <Zap className="w-4 h-4" />
                      Available for fast-track tasks
                    </span>
                  )}
                </div>
                <p className="text-sm text-purple-100/80 leading-relaxed whitespace-pre-line">
                  {profile.personalInfo.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {(profile?.skills.primary.length || profile?.skills.secondary.length) && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
                <h3 className="text-lg font-semibold mb-3">Skills & Expertise</h3>
                {profile.skills.primary.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-purple-200/70 mb-2">Primary Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.primary.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-sm"
                        >
                          <Star className="w-3 h-3 text-purple-200" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.skills.secondary.length > 0 && (
                  <div>
                    <p className="text-xs text-purple-200/70 mb-2">Secondary Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.secondary.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-sm"
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
            {specialties.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
                <h3 className="text-lg font-semibold mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-3">
                  {specialties.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 text-sm"
                    >
                      <Star className="w-4 h-4 text-purple-200" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile?.portfolio.achievements && profile.portfolio.achievements.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
                <h3 className="text-lg font-semibold mb-3">Key Achievements</h3>
                <div className="space-y-4 text-sm text-purple-100/80">
                  {profile.portfolio.achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-400/20 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{achievement.title}</p>
                        <p className="text-purple-200/70">{achievement.description}</p>
                        {achievement.metrics && (
                          <p className="text-xs text-purple-300/60 mt-1">{achievement.metrics}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {(profile?.professionalInfo.linkedInUrl ||
              profile?.professionalInfo.githubUrl ||
              profile?.professionalInfo.portfolioUrl) && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
                <h3 className="text-lg font-semibold mb-3">Links</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.professionalInfo.linkedInUrl && (
                    <a
                      href={profile.professionalInfo.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 transition-all"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {profile.professionalInfo.githubUrl && (
                    <a
                      href={profile.professionalInfo.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 border border-gray-400/30 transition-all"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {profile.professionalInfo.portfolioUrl && (
                    <a
                      href={profile.professionalInfo.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 transition-all"
                    >
                      <Globe className="w-4 h-4" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Work Preferences */}
            {profile && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-purple-500/10">
                <h3 className="text-lg font-semibold mb-3">Work Preferences</h3>
                <div className="space-y-3 text-sm text-purple-100/90">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200/70">Availability</span>
                    <span className="capitalize text-purple-200">
                      {profile.workPreferences.availability.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200/70">Location</span>
                    <span className="capitalize text-purple-200">
                      {profile.workPreferences.location.replace('-', ' ')}
                    </span>
                  </div>
                  {profile.workPreferences.hourlyRate && (
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200/70">Hourly Rate</span>
                      <span className="text-purple-200">
                        {profile.workPreferences.currency || 'USD'} {profile.workPreferences.hourlyRate}
                      </span>
                    </div>
                  )}
                  {profile.workPreferences.preferredHoursPerWeek && (
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200/70">Hours/Week</span>
                      <span className="text-purple-200">
                        {profile.workPreferences.preferredHoursPerWeek}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metrics */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
              <h3 className="text-lg font-semibold mb-4">Key metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-2"
                  >
                    <item.icon className="w-4 h-4 text-purple-200" />
                    <span className="text-lg font-semibold text-white">{item.value}</span>
                    <span className="text-xs text-purple-200/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TaskAchiever Eligibility */}
            {profile && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold">TaskAchiever Status</h3>
                </div>

                {profile.isTaskAchieverEligible ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="font-medium text-green-200">You're Eligible!</span>
                      </div>
                      <p className="text-sm text-green-200/80">
                        You meet all the criteria to become a TaskAchiever. Apply now to unlock premium features
                        and priority task matching.
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200/70">Status</span>
                        <span className="capitalize text-purple-200">
                          {profile.taskAchieverStatus.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200/70">Tasks Completed</span>
                        <span className="text-purple-200">
                          {profile.metrics.tasksCompleted} / {profile.taskAchieverCriteria.minimumTasksCompleted}
                        </span>
                      </div>
                      {profile.metrics.averageRating > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-purple-200/70">Rating</span>
                          <span className="text-purple-200">
                            {profile.metrics.averageRating.toFixed(1)} / {profile.taskAchieverCriteria.minimumRating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium text-yellow-200">Work in Progress</span>
                      </div>
                      <p className="text-sm text-yellow-200/80 mb-3">
                        Complete the following criteria to become eligible for TaskAchiever status:
                      </p>
                      <ul className="space-y-1 text-xs text-yellow-200/70">
                        {profile.taskAchieverCriteria.minimumTasksCompleted > profile.metrics.tasksCompleted && (
                          <li className="flex items-center gap-2">
                            <XCircle className="w-3 h-3" />
                            Complete {profile.taskAchieverCriteria.minimumTasksCompleted} tasks
                            (currently: {profile.metrics.tasksCompleted})
                          </li>
                        )}
                        {profile.completionPercentage < 90 && (
                          <li className="flex items-center gap-2">
                            <XCircle className="w-3 h-3" />
                            Complete 90% of your profile (currently: {profile.completionPercentage}%)
                          </li>
                        )}
                        {profile.skills.primary.length < 3 && (
                          <li className="flex items-center gap-2">
                            <XCircle className="w-3 h-3" />
                            Add at least 3 primary skills
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Certifications */}
            {profile?.skills.certifications && profile.skills.certifications.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-indigo-500/10">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
                </h3>
                <div className="space-y-2">
                  {profile.skills.certifications.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="font-medium text-sm">{cert.name}</div>
                      <div className="text-xs text-purple-200/70">{cert.issuer}</div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block"
                        >
                          Verify →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskerProfile;


