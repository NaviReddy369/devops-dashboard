import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  Briefcase,
  Award,
  Clock,
  Sparkles,
  FolderOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader,
  Save,
  Zap,
  Globe,
  Linkedin,
  Github,
  MapPin,
  Phone,
  Mail,
  Plus,
  X,
  Sparkle,
  Trophy,
  Target,
  TrendingUp,
  Upload,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Calendar,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  TaskerMetaForm,
  ExperienceLevel,
  AvailabilityPreference,
  WorkLocationPreference,
  Language,
} from '../types';
import {
  saveTaskerProfile,
  getTaskerProfileByUserId,
} from '../api/taskerProfiles';
import { calculateProfileMetrics } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Section definitions with conversational prompts
const SECTIONS = [
  {
    id: 'personal',
    title: "Let's start with the basics",
    subtitle: 'Tell us about yourself',
    icon: User,
    color: 'from-purple-500 to-indigo-500',
    prompt: "What's your name?",
  },
  {
    id: 'professional',
    title: 'Your professional journey',
    subtitle: 'Share your experience',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500',
    prompt: 'What do you do?',
  },
  {
    id: 'skills',
    title: 'Your superpowers',
    subtitle: 'What are you great at?',
    icon: Award,
    color: 'from-amber-500 to-orange-500',
    prompt: 'What skills define you?',
  },
  {
    id: 'preferences',
    title: 'How you work',
    subtitle: 'Your preferences',
    icon: Clock,
    color: 'from-emerald-500 to-teal-500',
    prompt: 'How do you like to work?',
  },
  {
    id: 'specialties',
    title: 'Your specialties',
    subtitle: 'What makes you unique?',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-500',
    prompt: 'What are you specialized in?',
  },
  {
    id: 'portfolio',
    title: 'Showcase your work',
    subtitle: 'Your achievements',
    icon: FolderOpen,
    color: 'from-violet-500 to-fuchsia-500',
    prompt: 'Share your portfolio',
  },
] as const;

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; emoji: string }[] = [
  { value: 'entry', label: 'Getting Started', emoji: '🌱' },
  { value: 'junior', label: 'Junior Level', emoji: '🚀' },
  { value: 'mid', label: 'Mid-Level', emoji: '⭐' },
  { value: 'senior', label: 'Senior', emoji: '🎯' },
  { value: 'expert', label: 'Expert', emoji: '🏆' },
];

const AVAILABILITY_OPTIONS: { value: AvailabilityPreference; label: string; emoji: string }[] = [
  { value: 'full-time', label: 'Full-Time', emoji: '💼' },
  { value: 'part-time', label: 'Part-Time', emoji: '⏰' },
  { value: 'contract', label: 'Contract', emoji: '📋' },
  { value: 'freelance', label: 'Freelance', emoji: '🆓' },
  { value: 'on-demand', label: 'On-Demand', emoji: '⚡' },
];

const LOCATION_OPTIONS: { value: WorkLocationPreference; label: string; emoji: string }[] = [
  { value: 'remote', label: 'Remote Only', emoji: '🌐' },
  { value: 'on-site', label: 'On-Site', emoji: '🏢' },
  { value: 'hybrid', label: 'Hybrid', emoji: '🔄' },
  { value: 'flexible', label: 'Flexible', emoji: '✨' },
];

const TIMEZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const initialFormData: TaskerMetaForm = {
  personalInfo: {
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    location: '',
    timezone: 'UTC',
    bio: '',
  },
  professionalInfo: {
    title: '',
    experienceLevel: 'mid',
    yearsOfExperience: 0,
    currentRole: '',
    company: '',
    linkedInUrl: '',
    portfolioUrl: '',
    githubUrl: '',
  },
  skills: {
    primary: [],
    secondary: [],
    certifications: [],
    languages: [{ code: 'en', name: 'English', proficiency: 'native' }],
  },
  workPreferences: {
    availability: 'freelance',
    location: 'remote',
    preferredHoursPerWeek: 20,
    hourlyRate: 0,
    currency: 'USD',
    minimumTaskBudget: 0,
    timezone: 'UTC',
    schedule: {},
    fastTrackAvailable: false,
  },
  specialties: [],
  services: [],
  portfolio: {
    projects: [],
    achievements: [],
  },
};

const TaskerMeta: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [formData, setFormData] = useState<TaskerMetaForm>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [tempSkill, setTempSkill] = useState('');
  const [skillType, setSkillType] = useState<'primary' | 'secondary'>('primary');
  const [tempSpecialty, setTempSpecialty] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadExistingProfile();
  }, [currentUser]);

  const [existingProfile, setExistingProfile] = useState<any>(null);

  const loadExistingProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const profile = await getTaskerProfileByUserId(currentUser.uid);
      if (profile) {
        setExistingProfile(profile);
        console.log('Loaded existing profile:', profile.id, 'Completion:', profile.completionPercentage);
        setFormData({
          personalInfo: profile.personalInfo,
          professionalInfo: profile.professionalInfo,
          skills: profile.skills,
          workPreferences: {
            ...profile.workPreferences,
            schedule: profile.workPreferences.availabilitySchedule?.days || {},
            timezone: profile.workPreferences.availabilitySchedule?.timezone || 'UTC',
          },
          specialties: profile.specialties,
          services: profile.services.map((s) => ({
            title: s.title,
            description: s.description,
            category: s.category,
            hourlyRate: s.hourlyRate,
            fixedRate: s.fixedRate,
            estimatedHours: s.estimatedHours,
          })),
          portfolio: {
            projects: profile.portfolio.projects.map((p) => {
              // Safely convert Firestore Timestamp to Date for completedAt
              let completedAt: Date | null = null;
              const completedAtValue = p.completedAt;
              
              if (completedAtValue) {
                // Check if it's a Firestore Timestamp (has toDate method)
                if (typeof (completedAtValue as any).toDate === 'function') {
                  completedAt = (completedAtValue as any).toDate();
                } else if (completedAtValue instanceof Date) {
                  completedAt = completedAtValue;
                } else {
                  completedAt = new Date(completedAtValue);
                }
                
                // Validate date
                if (completedAt && isNaN(completedAt.getTime())) {
                  completedAt = new Date();
                }
              }
              
              return {
                title: p.title,
                description: p.description,
                category: p.category,
                technologies: p.technologies,
                duration: p.duration,
                role: p.role,
                outcome: p.outcome,
                url: p.url,
                images: p.images,
                completedAt: completedAt || new Date(),
              };
            }),
            achievements: profile.portfolio.achievements.map((a) => {
              // Safely convert Firestore Timestamp to Date
              let date: Date | null = null;
              const dateValue = a.date;
              
              if (dateValue) {
                // Check if it's a Firestore Timestamp (has toDate method)
                if (typeof (dateValue as any).toDate === 'function') {
                  date = (dateValue as any).toDate();
                } else if (dateValue instanceof Date) {
                  date = dateValue;
                } else {
                  date = new Date(dateValue);
                }
                
                // Validate date
                if (date && isNaN(date.getTime())) {
                  date = new Date();
                }
              }
              
              return {
                title: a.title,
                description: a.description,
                category: a.category,
                date: date || new Date(),
                metrics: a.metrics,
                proofUrl: a.proofUrl,
              };
            }),
          },
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!currentUser || saving) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        // Load existing profile first to avoid data loss - if it fails, continue without it
        let currentProfile = existingProfile;
        if (!currentProfile) {
          try {
            currentProfile = await getTaskerProfileByUserId(currentUser.uid);
          } catch (loadErr) {
            // Don't throw - continue without existing profile
            console.warn('Could not load existing profile for auto-save:', loadErr);
            currentProfile = undefined;
          }
        }
        const oldCompletion = currentProfile?.completionPercentage || 0;
        
        const profileId = await saveTaskerProfile(
          currentUser.uid, 
          currentUser.email || '', 
          formData,
          currentProfile
        );
        
        // Update existing profile reference
        const updatedProfile = await getTaskerProfileByUserId(currentUser.uid);
        if (updatedProfile) {
          setExistingProfile(updatedProfile);
          
          // Call cloud function if completion percentage changed significantly
          // This ensures metrics are recalculated server-side
          if (Math.abs((updatedProfile.completionPercentage || 0) - oldCompletion) >= 5) {
            try {
              await calculateProfileMetrics({});
              console.log('Profile metrics updated via cloud function');
            } catch (funcError) {
              console.warn('Cloud function call failed (non-critical):', funcError);
            }
          }
          
          // Dispatch event to notify menu that profile was updated
          if ((updatedProfile.completionPercentage || 0) >= 50) {
            window.dispatchEvent(new CustomEvent('profileUpdated'));
          }
        }
        
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setSaving(false);
      }
    }, 1500);
  }, [currentUser, formData, saving, existingProfile]);

  useEffect(() => {
    autoSave();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, autoSave]);

  const updateFormData = <K extends keyof TaskerMetaForm>(
    section: K,
    data: Partial<TaskerMetaForm[K]> | TaskerMetaForm[K]
  ) => {
    setFormData((prev) => {
      const currentValue = prev[section];
      
      if (Array.isArray(currentValue) && Array.isArray(data)) {
        return { ...prev, [section]: data };
      }
      
      if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
        return { ...prev, [section]: { ...currentValue, ...data } };
      }
      
      return { ...prev, [section]: data };
    });
  };

  const navigateSection = (direction: 'next' | 'prev') => {
    setDirection(direction);
    if (direction === 'next' && activeSection < SECTIONS.length - 1) {
      setActiveSection(activeSection + 1);
    } else if (direction === 'prev' && activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  const handleComplete = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskerMeta.tsx:393',message:'handleComplete started',data:{userId:currentUser.uid,hasExistingProfile:!!existingProfile},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
      // Load existing profile first - if it fails, continue without it (will create new profile)
      let currentProfile = existingProfile;
      if (!currentProfile) {
        try {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskerMeta.tsx:396',message:'Before getTaskerProfileByUserId',data:{userId:currentUser.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          currentProfile = await getTaskerProfileByUserId(currentUser.uid);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskerMeta.tsx:399',message:'After getTaskerProfileByUserId',data:{profileLoaded:!!currentProfile,profileId:currentProfile?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        } catch (loadErr: any) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskerMeta.tsx:402',message:'Error loading profile - continuing without it',data:{error:loadErr?.message,errorCode:loadErr?.code,willCreateNew:true},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          // Don't throw - continue without existing profile (will create new one)
          console.warn('Could not load existing profile, will create new one:', loadErr);
          currentProfile = undefined;
        }
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskerMeta.tsx:407',message:'Before saveTaskerProfile',data:{userId:currentUser.uid,userEmail:currentUser.email,formDataKeys:Object.keys(formData),completionPercentage:formData.personalInfo?.firstName?1:0},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'B,C,D'})}).catch(()=>{});
      // #endregion
      const profileId = await saveTaskerProfile(
        currentUser.uid, 
        currentUser.email || '', 
        formData,
        currentProfile
      );
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskerMeta.tsx:415',message:'After saveTaskerProfile',data:{profileId,success:true},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Call cloud function to recalculate completion percentage and metrics
      try {
        const { calculateProfileMetrics } = await import('../firebase');
        await calculateProfileMetrics({});
        console.log('Profile metrics updated via cloud function');
      } catch (funcError) {
        console.warn('Cloud function call failed (non-critical):', funcError);
        // Continue even if cloud function fails - local calculation is already done
      }
      
      // Dispatch event to notify other components that profile was updated
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      // Redirect to public Tasker profile page
      navigate(`/tasker/${currentUser.uid}`);
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskerMeta.tsx:420',message:'Error caught in handleComplete',data:{errorMessage:err?.message,errorCode:err?.code,errorName:err?.name,stack:err?.stack?.substring(0,500),userId:currentUser?.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = () => {
    let completed = 0;
    let total = 0;

    // Personal
    total += 3;
    if (formData.personalInfo.firstName) completed++;
    if (formData.personalInfo.lastName) completed++;
    if (formData.personalInfo.displayName) completed++;

    // Professional
    total += 2;
    if (formData.professionalInfo.title) completed++;
    if (formData.professionalInfo.yearsOfExperience > 0) completed++;

    // Skills
    total += 1;
    if (formData.skills.primary.length > 0) completed++;

    // Preferences
    total += 2;
    if (formData.workPreferences.availability) completed++;
    if (formData.workPreferences.location) completed++;

    // Specialties
    total += 1;
    if (formData.specialties.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const isSectionComplete = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'personal':
        return !!(formData.personalInfo.firstName && formData.personalInfo.lastName && formData.personalInfo.displayName);
      case 'professional':
        return !!(formData.professionalInfo.title && formData.professionalInfo.yearsOfExperience > 0);
      case 'skills':
        return formData.skills.primary.length > 0;
      case 'preferences':
        return !!(formData.workPreferences.availability && formData.workPreferences.location);
      case 'specialties':
        return formData.specialties.length > 0;
      case 'portfolio':
        return true; // Optional
      default:
        return false;
    }
  };

  // File upload handler - must be defined before render functions and return statement
  const handleFileUpload = async (file: File, projectIndex: number, fileType: 'image' | 'document') => {
    if (!currentUser) {
      return;
    }

    const uploadKey = `project-${projectIndex}-${fileType}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    try {
      // Map fileType to storage folder name matching rules
      let folderName: string = fileType;
      if (fileType === 'image') {
        folderName = 'images'; // Storage rules expect plural 'images'
      } else if (fileType === 'document') {
        // Determine document type from file extension
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'csv') {
          folderName = 'data';
        } else if (ext === 'py') {
          folderName = 'code';
        } else if (ext === 'pdf') {
          folderName = 'docs';
        }
      }
      
      // Use projectIndex as projectId (since projects don't have IDs yet during creation)
      // Convert to string to match storage rules pattern
      const projectId = projectIndex.toString();
      const storagePath = `taskerProfiles/${currentUser.uid}/projects/${projectId}/${folderName}/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, storagePath);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      const projects = [...formData.portfolio.projects];
      if (fileType === 'image') {
        projects[projectIndex] = {
          ...projects[projectIndex],
          images: [...(projects[projectIndex].images || []), downloadURL],
        };
      }

      updateFormData('portfolio', { projects });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const currentSection = SECTIONS[activeSection];
  const SectionIcon = currentSection.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
            Build Your Tasker Profile
          </h1>
          <p className="text-purple-200/70 text-lg">Let's create something amazing together</p>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                className="transition-all duration-500 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{progress}%</div>
                <div className="text-xs text-purple-200/70">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Indicators */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {SECTIONS.map((section, index) => {
            const Icon = section.icon;
            const isComplete = isSectionComplete(section.id);
            const isActive = index === activeSection;
            
            return (
              <button
                key={section.id}
                onClick={() => {
                  setDirection(index > activeSection ? 'next' : 'prev');
                  setActiveSection(index);
                }}
                title={section.title}
                className={`relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r ' + section.color + ' shadow-lg scale-110'
                    : isComplete
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : isComplete ? 'text-green-400' : 'text-purple-300'}`} />
                {isComplete && !isActive && (
                  <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 text-green-400 bg-slate-950 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Card */}
        <div className="relative max-w-3xl mx-auto">
          <div
            key={activeSection}
            className={`
              relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10
              shadow-2xl p-8 md:p-12
              transition-all duration-500 ease-out
              ${direction === 'next' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
            `}
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
            }}
          >
            {/* Card glow */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentSection.color} opacity-10 rounded-3xl blur-2xl -z-10`} />

            {/* Section Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${currentSection.color} mb-4 shadow-lg`}>
                <SectionIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">{currentSection.title}</h2>
              <p className="text-purple-200/70">{currentSection.subtitle}</p>
              <p className="mt-4 text-purple-300/80 text-lg">{currentSection.prompt}</p>
            </div>

            {/* Card Content */}
            <div className="space-y-6">
              {renderSectionContent(currentSection.id)}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => navigateSection('prev')}
                disabled={activeSection === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  activeSection === 0
                    ? 'opacity-50 cursor-not-allowed bg-white/5'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-3">
                {lastSaved && (
                  <span className="text-xs text-purple-200/50 flex items-center gap-1">
                    <Save className="w-3 h-3" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {saving && (
                  <span className="text-xs text-purple-200/50 flex items-center gap-1">
                    <Loader className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                )}
              </div>

              {activeSection < SECTIONS.length - 1 ? (
                <button
                  onClick={() => navigateSection('next')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${currentSection.color} hover:shadow-lg transition-all`}
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Complete Profile</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
      `}</style>
    </div>
  );

  function renderSectionContent(sectionId: string) {
    switch (sectionId) {
      case 'personal':
        return renderPersonalSection();
      case 'professional':
        return renderProfessionalSection();
      case 'skills':
        return renderSkillsSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'specialties':
        return renderSpecialtiesSection();
      case 'portfolio':
        return renderPortfolioSection();
      default:
        return null;
    }
  }

  function renderPersonalSection() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">First Name *</label>
            <input
              type="text"
              value={formData.personalInfo.firstName}
              onChange={(e) => updateFormData('personalInfo', { firstName: e.target.value })}
              onBlur={autoSave}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white transition-all"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">Last Name *</label>
            <input
              type="text"
              value={formData.personalInfo.lastName}
              onChange={(e) => updateFormData('personalInfo', { lastName: e.target.value })}
              onBlur={autoSave}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white transition-all"
              placeholder="Doe"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">Display Name *</label>
          <input
            type="text"
            value={formData.personalInfo.displayName}
            onChange={(e) => updateFormData('personalInfo', { displayName: e.target.value })}
            onBlur={autoSave}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white transition-all"
            placeholder="john_doe"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">Location</label>
            <input
              type="text"
              value={formData.personalInfo.location}
              onChange={(e) => updateFormData('personalInfo', { location: e.target.value })}
              onBlur={autoSave}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white transition-all"
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">Timezone</label>
            <select
              value={formData.personalInfo.timezone}
              onChange={(e) => updateFormData('personalInfo', { timezone: e.target.value })}
              onBlur={autoSave}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white transition-all"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz} className="bg-slate-900">
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">Bio</label>
          <textarea
            value={formData.personalInfo.bio}
            onChange={(e) => updateFormData('personalInfo', { bio: e.target.value })}
            onBlur={autoSave}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white resize-none transition-all"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    );
  }

  function renderProfessionalSection() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">Professional Title *</label>
          <input
            type="text"
            value={formData.professionalInfo.title}
            onChange={(e) => updateFormData('professionalInfo', { title: e.target.value })}
            onBlur={autoSave}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white transition-all"
            placeholder="e.g., Senior DevOps Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-3 text-purple-200">Experience Level *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => updateFormData('professionalInfo', { experienceLevel: level.value })}
                onBlur={autoSave}
                className={`p-4 rounded-xl border transition-all text-left ${
                  formData.professionalInfo.experienceLevel === level.value
                    ? 'bg-blue-500/20 border-blue-400 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:border-blue-400/50'
                }`}
              >
                <div className="text-2xl mb-1">{level.emoji}</div>
                <div className="font-medium text-sm">{level.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">Years of Experience *</label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.professionalInfo.yearsOfExperience || ''}
            onChange={(e) => updateFormData('professionalInfo', { yearsOfExperience: parseInt(e.target.value) || 0 })}
            onBlur={autoSave}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white transition-all"
            placeholder="5"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">LinkedIn</label>
            <input
              type="url"
              value={formData.professionalInfo.linkedInUrl}
              onChange={(e) => updateFormData('professionalInfo', { linkedInUrl: e.target.value })}
              onBlur={autoSave}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white transition-all"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">Portfolio</label>
            <input
              type="url"
              value={formData.professionalInfo.portfolioUrl}
              onChange={(e) => updateFormData('professionalInfo', { portfolioUrl: e.target.value })}
              onBlur={autoSave}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white transition-all"
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </div>
    );
  }

  function renderSkillsSection() {
    const addSkill = () => {
      if (!tempSkill.trim()) return;
      const currentSkills = formData.skills[skillType];
      if (currentSkills.includes(tempSkill.trim())) return;
      
      updateFormData('skills', {
        [skillType]: [...currentSkills, tempSkill.trim()],
      });
      setTempSkill('');
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSkillType('primary')}
            className={`flex-1 px-4 py-2 rounded-xl transition-all ${
              skillType === 'primary'
                ? 'bg-amber-500/20 border-2 border-amber-400'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            Primary Skills
          </button>
          <button
            type="button"
            onClick={() => setSkillType('secondary')}
            className={`flex-1 px-4 py-2 rounded-xl transition-all ${
              skillType === 'secondary'
                ? 'bg-amber-500/20 border-2 border-amber-400'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            Secondary Skills
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tempSkill}
            onChange={(e) => setTempSkill(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 text-white transition-all"
            placeholder={`Add ${skillType === 'primary' ? 'primary' : 'secondary'} skill...`}
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills[skillType].map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/30 text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => {
                  updateFormData('skills', {
                    [skillType]: formData.skills[skillType].filter((s) => s !== skill),
                  });
                }}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  }

  function renderPreferencesSection() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 text-purple-200">Availability *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateFormData('workPreferences', { availability: option.value })}
                onBlur={autoSave}
                className={`p-4 rounded-xl border transition-all ${
                  formData.workPreferences.availability === option.value
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:border-emerald-400/50'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="font-medium text-sm">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-3 text-purple-200">Location Preference *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LOCATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateFormData('workPreferences', { location: option.value })}
                onBlur={autoSave}
                className={`p-4 rounded-xl border transition-all ${
                  formData.workPreferences.location === option.value
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 hover:border-emerald-400/50'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="font-medium text-sm">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">Hourly Rate</label>
            <div className="flex gap-2">
              <select
                value={formData.workPreferences.currency}
                onChange={(e) => updateFormData('workPreferences', { currency: e.target.value })}
                onBlur={autoSave}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-400 focus:outline-none text-white"
              >
                <option value="USD" className="bg-slate-900">USD</option>
                <option value="EUR" className="bg-slate-900">EUR</option>
                <option value="GBP" className="bg-slate-900">GBP</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.workPreferences.hourlyRate || ''}
                onChange={(e) => updateFormData('workPreferences', { hourlyRate: parseFloat(e.target.value) || 0 })}
                onBlur={autoSave}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 text-white transition-all"
                placeholder="50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">Hours Per Week</label>
            <input
              type="number"
              min="1"
              max="80"
              value={formData.workPreferences.preferredHoursPerWeek || ''}
              onChange={(e) => updateFormData('workPreferences', { preferredHoursPerWeek: parseInt(e.target.value) || undefined })}
              onBlur={autoSave}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 text-white transition-all"
              placeholder="20"
            />
          </div>
        </div>
      </div>
    );
  }

  function renderSpecialtiesSection() {
    const addSpecialty = () => {
      if (!tempSpecialty.trim()) return;
      if (formData.specialties.includes(tempSpecialty.trim())) return;
      
      updateFormData('specialties', [...formData.specialties, tempSpecialty.trim()]);
      setTempSpecialty('');
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={tempSpecialty}
            onChange={(e) => setTempSpecialty(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSpecialty();
              }
            }}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 text-white transition-all"
            placeholder="Add a specialty..."
          />
          <button
            type="button"
            onClick={addSpecialty}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.specialties.map((specialty) => (
            <span
              key={specialty}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 border border-pink-400/30 text-sm"
            >
              <Sparkle className="w-4 h-4" />
              {specialty}
              <button
                type="button"
                onClick={() => {
                  updateFormData('specialties', formData.specialties.filter((s) => s !== specialty));
                }}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  }

  function renderPortfolioSection() {
    return (
      <div className="space-y-8">
        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Your Projects</h3>
              <p className="text-sm text-purple-200/70">Showcase your best work</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const projects = [...formData.portfolio.projects];
                projects.push({
                  title: '',
                  description: '',
                  category: '',
                  technologies: [],
                  duration: '',
                  role: '',
                  outcome: '',
                  url: '',
                  images: [],
                  completedAt: new Date(),
                });
                updateFormData('portfolio', { projects });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="space-y-6">
            {formData.portfolio.projects.map((project, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Project #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const projects = formData.portfolio.projects.filter((_, i) => i !== index);
                      updateFormData('portfolio', { projects });
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => {
                        const projects = [...formData.portfolio.projects];
                        projects[index] = { ...projects[index], title: e.target.value };
                        updateFormData('portfolio', { projects });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 text-white transition-all"
                      placeholder="e.g., E-commerce Platform Redesign"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Category
                    </label>
                    <input
                      type="text"
                      value={project.category}
                      onChange={(e) => {
                        const projects = [...formData.portfolio.projects];
                        projects[index] = { ...projects[index], category: e.target.value };
                        updateFormData('portfolio', { projects });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 text-white transition-all"
                      placeholder="e.g., Web Development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={project.duration}
                      onChange={(e) => {
                        const projects = [...formData.portfolio.projects];
                        projects[index] = { ...projects[index], duration: e.target.value };
                        updateFormData('portfolio', { projects });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 text-white transition-all"
                      placeholder="e.g., 3 months"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Your Role
                    </label>
                    <input
                      type="text"
                      value={project.role}
                      onChange={(e) => {
                        const projects = [...formData.portfolio.projects];
                        projects[index] = { ...projects[index], role: e.target.value };
                        updateFormData('portfolio', { projects });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 text-white transition-all"
                      placeholder="e.g., Lead Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Project URL
                    </label>
                    <input
                      type="url"
                      value={project.url}
                      onChange={(e) => {
                        const projects = [...formData.portfolio.projects];
                        projects[index] = { ...projects[index], url: e.target.value };
                        updateFormData('portfolio', { projects });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 text-white transition-all"
                      placeholder="https://yourproject.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Technologies Used
                    </label>
                    <input
                      type="text"
                      value={project.technologies.join(', ')}
                      onChange={(e) => {
                        const projects = [...formData.portfolio.projects];
                        projects[index] = {
                          ...projects[index],
                          technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                        };
                        updateFormData('portfolio', { projects });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 text-white transition-all"
                      placeholder="React, Node.js, MongoDB (comma separated)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Description *
                    </label>
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const projects = [...formData.portfolio.projects];
                        projects[index] = { ...projects[index], description: e.target.value };
                        updateFormData('portfolio', { projects });
                      }}
                      onBlur={autoSave}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 text-white resize-none transition-all"
                      placeholder="Describe the project, challenges, and your contributions..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Key Outcomes / Results
                    </label>
                    <textarea
                      value={project.outcome || ''}
                      onChange={(e) => {
                        const projects = [...formData.portfolio.projects];
                        projects[index] = { ...projects[index], outcome: e.target.value };
                        updateFormData('portfolio', { projects });
                      }}
                      onBlur={autoSave}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 text-white resize-none transition-all"
                      placeholder="e.g., Increased user engagement by 40%, reduced load time by 50%"
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Project Images / Screenshots
                    </label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {project.images?.map((imageUrl, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Project ${index + 1} image ${imgIndex + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const projects = [...formData.portfolio.projects];
                              projects[index] = {
                                ...projects[index],
                                images: projects[index].images?.filter((_, i) => i !== imgIndex) || [],
                              };
                              updateFormData('portfolio', { projects });
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-violet-400/50 transition-colors bg-white/5">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploadingFiles[`project-${index}-image`] ? (
                          <Loader className="w-8 h-8 text-violet-400 animate-spin mb-2" />
                        ) : (
                          <Upload className="w-8 h-8 text-violet-400 mb-2" />
                        )}
                        <p className="mb-2 text-sm text-purple-200">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-purple-200/70">PNG, JPG, GIF (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size must be less than 5MB');
                              return;
                            }
                            handleFileUpload(file, index, 'image');
                          }
                        }}
                        disabled={uploadingFiles[`project-${index}-image`]}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {formData.portfolio.projects.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-2xl">
                <FolderOpen className="w-16 h-16 text-violet-400 mx-auto mb-4 opacity-50" />
                <p className="text-purple-200/70 mb-4">No projects added yet</p>
                <button
                  type="button"
                  onClick={() => {
                    updateFormData('portfolio', {
                      projects: [{
                        title: '',
                        description: '',
                        category: '',
                        technologies: [],
                        duration: '',
                        role: '',
                        outcome: '',
                        url: '',
                        images: [],
                        completedAt: new Date(),
                      }],
                    });
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-lg transition-all"
                >
                  Add Your First Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Key Achievements</h3>
              <p className="text-sm text-purple-200/70">Highlight your major accomplishments</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const achievements = [...formData.portfolio.achievements];
                achievements.push({
                  title: '',
                  description: '',
                  category: '',
                  date: new Date(),
                  metrics: '',
                  proofUrl: '',
                });
                updateFormData('portfolio', { achievements });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Achievement</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.portfolio.achievements.map((achievement, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Achievement #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const achievements = formData.portfolio.achievements.filter((_, i) => i !== index);
                      updateFormData('portfolio', { achievements });
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Achievement Title *
                    </label>
                    <input
                      type="text"
                      value={achievement.title}
                      onChange={(e) => {
                        const achievements = [...formData.portfolio.achievements];
                        achievements[index] = { ...achievements[index], title: e.target.value };
                        updateFormData('portfolio', { achievements });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-white transition-all"
                      placeholder="e.g., Reduced System Downtime by 90%"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Category
                    </label>
                    <input
                      type="text"
                      value={achievement.category}
                      onChange={(e) => {
                        const achievements = [...formData.portfolio.achievements];
                        achievements[index] = { ...achievements[index], category: e.target.value };
                        updateFormData('portfolio', { achievements });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-white transition-all"
                      placeholder="e.g., Performance"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Date
                    </label>
                    <input
                      type="date"
                      value={(() => {
                        if (!achievement.date) return '';
                        try {
                          const date = achievement.date instanceof Date 
                            ? achievement.date 
                            : new Date(achievement.date);
                          if (isNaN(date.getTime())) return '';
                          return date.toISOString().split('T')[0];
                        } catch (e) {
                          return '';
                        }
                      })()}
                      onChange={(e) => {
                        const achievements = [...formData.portfolio.achievements];
                        achievements[index] = { ...achievements[index], date: new Date(e.target.value) };
                        updateFormData('portfolio', { achievements });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-white transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Description *
                    </label>
                    <textarea
                      value={achievement.description}
                      onChange={(e) => {
                        const achievements = [...formData.portfolio.achievements];
                        achievements[index] = { ...achievements[index], description: e.target.value };
                        updateFormData('portfolio', { achievements });
                      }}
                      onBlur={autoSave}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-white resize-none transition-all"
                      placeholder="Describe what you achieved and how..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Metrics / Results
                    </label>
                    <input
                      type="text"
                      value={achievement.metrics || ''}
                      onChange={(e) => {
                        const achievements = [...formData.portfolio.achievements];
                        achievements[index] = { ...achievements[index], metrics: e.target.value };
                        updateFormData('portfolio', { achievements });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-white transition-all"
                      placeholder="e.g., 90% improvement, $50K saved"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-200">
                      Proof URL (optional)
                    </label>
                    <input
                      type="url"
                      value={achievement.proofUrl || ''}
                      onChange={(e) => {
                        const achievements = [...formData.portfolio.achievements];
                        achievements[index] = { ...achievements[index], proofUrl: e.target.value };
                        updateFormData('portfolio', { achievements });
                      }}
                      onBlur={autoSave}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-white transition-all"
                      placeholder="Link to certificate, article, etc."
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.portfolio.achievements.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-2xl">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3 opacity-50" />
                <p className="text-purple-200/70 mb-4">No achievements added yet</p>
                <button
                  type="button"
                  onClick={() => {
                    updateFormData('portfolio', {
                      achievements: [{
                        title: '',
                        description: '',
                        category: '',
                        date: new Date(),
                        metrics: '',
                        proofUrl: '',
                      }],
                    });
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:shadow-lg transition-all"
                >
                  Add Your First Achievement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default TaskerMeta;
