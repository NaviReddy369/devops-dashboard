import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Award,
  Clock,
  Sparkles,
  FolderOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader,
  AlertCircle,
  Plus,
  X,
  Globe,
  Linkedin,
  Github,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  TaskerMetaForm,
  ExperienceLevel,
  AvailabilityPreference,
  WorkLocationPreference,
  Language,
  Certification,
  DaySchedule,
} from '../types';
import {
  saveTaskerProfile,
  getTaskerProfileByUserId,
} from '../api/taskerProfiles';
import { useNavigate } from 'react-router-dom';

const TOTAL_STEPS = 6;

const STEP_TITLES = [
  'Personal Information',
  'Professional Details',
  'Skills & Expertise',
  'Work Preferences',
  'Specialties & Services',
  'Portfolio & Achievements',
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'entry', label: 'Entry Level', desc: '0-2 years' },
  { value: 'junior', label: 'Junior', desc: '2-4 years' },
  { value: 'mid', label: 'Mid-Level', desc: '4-7 years' },
  { value: 'senior', label: 'Senior', desc: '7-10 years' },
  { value: 'expert', label: 'Expert', desc: '10+ years' },
];

const AVAILABILITY_OPTIONS: { value: AvailabilityPreference; label: string; desc: string }[] = [
  { value: 'full-time', label: 'Full-Time', desc: '40+ hours/week' },
  { value: 'part-time', label: 'Part-Time', desc: '20-40 hours/week' },
  { value: 'contract', label: 'Contract', desc: 'Project-based' },
  { value: 'freelance', label: 'Freelance', desc: 'Flexible hours' },
  { value: 'on-demand', label: 'On-Demand', desc: 'As needed' },
];

const LOCATION_OPTIONS: { value: WorkLocationPreference; label: string; icon: any }[] = [
  { value: 'remote', label: 'Remote Only', icon: Globe },
  { value: 'on-site', label: 'On-Site', icon: MapPin },
  { value: 'hybrid', label: 'Hybrid', icon: Calendar },
  { value: 'flexible', label: 'Flexible', icon: Clock },
];

const TIMEZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
];

const LANGUAGE_PROFICIENCIES = ['basic', 'conversational', 'professional', 'native'] as const;

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TaskerMetaForm>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tempSkill, setTempSkill] = useState('');
  const [tempSpecialty, setTempSpecialty] = useState('');

  useEffect(() => {
    loadExistingProfile();
  }, [currentUser]);

  const loadExistingProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const profile = await getTaskerProfileByUserId(currentUser.uid);
      if (profile) {
        // Populate form with existing data
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
            projects: profile.portfolio.projects.map((p) => ({
              title: p.title,
              description: p.description,
              category: p.category,
              technologies: p.technologies,
              duration: p.duration,
              role: p.role,
              outcome: p.outcome,
              url: p.url,
              images: p.images,
              completedAt: p.completedAt,
            })),
            achievements: profile.portfolio.achievements.map((a) => ({
              title: a.title,
              description: a.description,
              category: a.category,
              date: a.date,
              metrics: a.metrics,
              proofUrl: a.proofUrl,
            })),
          },
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = <K extends keyof TaskerMetaForm>(
    section: K,
    data: Partial<TaskerMetaForm[K]> | TaskerMetaForm[K]
  ) => {
    setFormData((prev) => {
      const currentValue = prev[section];
      
      // Handle array types (services, specialties, etc.)
      if (Array.isArray(currentValue) && Array.isArray(data)) {
        return {
          ...prev,
          [section]: data,
        };
      }
      
      // Handle object types
      if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
        return {
          ...prev,
          [section]: { ...currentValue, ...data },
        };
      }
      
      // Fallback for primitive types
      return {
        ...prev,
        [section]: data,
      };
    });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
        setError('');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const validateCurrentStep = (): boolean => {
    setError('');
    
    switch (currentStep) {
      case 1:
        if (!formData.personalInfo.firstName || !formData.personalInfo.lastName || !formData.personalInfo.displayName) {
          setError('Please fill in all required fields: First Name, Last Name, and Display Name.');
          return false;
        }
        break;
      case 2:
        if (!formData.professionalInfo.title || formData.professionalInfo.yearsOfExperience <= 0) {
          setError('Please provide your professional title and years of experience.');
          return false;
        }
        break;
      case 3:
        if (formData.skills.primary.length === 0) {
          setError('Please add at least one primary skill.');
          return false;
        }
        break;
      case 4:
        if (!formData.workPreferences.availability || !formData.workPreferences.location) {
          setError('Please select your availability and location preferences.');
          return false;
        }
        break;
      case 5:
        if (formData.specialties.length === 0) {
          setError('Please add at least one specialty.');
          return false;
        }
        break;
      case 6:
        // Portfolio is optional, but we'll still validate basic fields if they added projects
        break;
    }
    
    return true;
  };

  const handleSave = async (final = false) => {
    if (!currentUser) {
      setError('Please log in to save your profile.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await saveTaskerProfile(currentUser.uid, currentUser.email || '', formData);
      
      if (final) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/tasker-profile');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (isPrimary: boolean) => {
    if (!tempSkill.trim()) return;
    
    setFormData((prev) => {
      const skills = isPrimary ? prev.skills.primary : prev.skills.secondary;
      if (skills.includes(tempSkill.trim())) return prev;
      
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [isPrimary ? 'primary' : 'secondary']: [...skills, tempSkill.trim()],
        },
      };
    });
    
    setTempSkill('');
  };

  const removeSkill = (skill: string, isPrimary: boolean) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [isPrimary ? 'primary' : 'secondary']: prev.skills[isPrimary ? 'primary' : 'secondary'].filter((s) => s !== skill),
      },
    }));
  };

  const addSpecialty = () => {
    if (!tempSpecialty.trim()) return;
    
    setFormData((prev) => {
      if (prev.specialties.includes(tempSpecialty.trim())) return prev;
      return {
        ...prev,
        specialties: [...prev.specialties, tempSpecialty.trim()],
      };
    });
    
    setTempSpecialty('');
  };

  const removeSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const stepIcons = [User, Briefcase, Award, Clock, Sparkles, FolderOpen];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Tasker Profile</h1>
          <p className="text-purple-200/80">
            Fill in your information to become a tasker and start getting matched with tasks.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-200">Step {currentStep} of {TOTAL_STEPS}</span>
            <span className="text-sm text-purple-200">{Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
          {STEP_TITLES.map((title, index) => {
            const stepNum = index + 1;
            const Icon = stepIcons[index];
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            
            return (
              <div
                key={stepNum}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-500/20 border-2 border-purple-400'
                    : isCompleted
                    ? 'bg-purple-500/10 border border-purple-400/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-300' : isCompleted ? 'text-purple-400' : 'text-purple-200/50'}`} />
                <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-white' : isCompleted ? 'text-purple-300' : 'text-purple-200/50'}`}>
                  {title}
                </span>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </div>
            );
          })}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-200">
            <CheckCircle2 className="w-5 h-5" />
            <span>Profile saved successfully! Redirecting...</span>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              currentStep === 1
                ? 'bg-white/5 text-purple-200/50 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all disabled:opacity-50"
            >
              {saving ? <Loader className="w-5 h-5 animate-spin" /> : 'Save Draft'}
            </button>

            {currentStep < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderProfessionalInfo();
      case 3:
        return renderSkills();
      case 4:
        return renderWorkPreferences();
      case 5:
        return renderSpecialties();
      case 6:
        return renderPortfolio();
      default:
        return null;
    }
  }

  function renderPersonalInfo() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.personalInfo.firstName}
              onChange={(e) => updateFormData('personalInfo', { firstName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.personalInfo.lastName}
              onChange={(e) => updateFormData('personalInfo', { lastName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.personalInfo.displayName}
              onChange={(e) => updateFormData('personalInfo', { displayName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="john_doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(e) => updateFormData('personalInfo', { phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                value={formData.personalInfo.location}
                onChange={(e) => updateFormData('personalInfo', { location: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
                placeholder="City, Country"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Timezone
            </label>
            <select
              value={formData.personalInfo.timezone}
              onChange={(e) => updateFormData('personalInfo', { timezone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
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
          <label className="block text-sm font-medium mb-2 text-purple-200">
            Bio
          </label>
          <textarea
            value={formData.personalInfo.bio}
            onChange={(e) => updateFormData('personalInfo', { bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    );
  }

  function renderProfessionalInfo() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold">Professional Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Professional Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.professionalInfo.title}
              onChange={(e) => updateFormData('professionalInfo', { title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="e.g., Senior DevOps Engineer, Full Stack Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Experience Level <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateFormData('professionalInfo', { experienceLevel: level.value })}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    formData.professionalInfo.experienceLevel === level.value
                      ? 'bg-purple-500/20 border-purple-400'
                      : 'bg-white/5 border-white/10 hover:border-purple-400/50'
                  }`}
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-xs text-purple-200/70">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Years of Experience <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.professionalInfo.yearsOfExperience || ''}
              onChange={(e) => updateFormData('professionalInfo', { yearsOfExperience: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Current Role
            </label>
            <input
              type="text"
              value={formData.professionalInfo.currentRole}
              onChange={(e) => updateFormData('professionalInfo', { currentRole: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="Senior Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Company
            </label>
            <input
              type="text"
              value={formData.professionalInfo.company}
              onChange={(e) => updateFormData('professionalInfo', { company: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              LinkedIn URL
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="url"
                value={formData.professionalInfo.linkedInUrl}
                onChange={(e) => updateFormData('professionalInfo', { linkedInUrl: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Portfolio URL
            </label>
            <input
              type="url"
              value={formData.professionalInfo.portfolioUrl}
              onChange={(e) => updateFormData('professionalInfo', { portfolioUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              GitHub URL
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="url"
                value={formData.professionalInfo.githubUrl}
                onChange={(e) => updateFormData('professionalInfo', { githubUrl: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSkills() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold">Skills & Expertise</h2>
        </div>

        {/* Primary Skills */}
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">
            Primary Skills <span className="text-red-400">*</span>
            <span className="text-xs text-purple-200/70 ml-2">Your core competencies</span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(true);
                }
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="e.g., Kubernetes, Docker, AWS"
            />
            <button
              type="button"
              onClick={() => addSkill(true)}
              className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.primary.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill, true)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Secondary Skills */}
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">
            Secondary Skills
            <span className="text-xs text-purple-200/70 ml-2">Additional skills you have</span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(false);
                }
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="e.g., Python, React, MongoDB"
            />
            <button
              type="button"
              onClick={() => addSkill(false)}
              className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.secondary.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill, false)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">
            Certifications
          </label>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                skills: {
                  ...prev.skills,
                  certifications: [
                    ...prev.skills.certifications,
                    {
                      name: '',
                      issuer: '',
                      issueDate: new Date(),
                      credentialId: '',
                      credentialUrl: '',
                    },
                  ],
                },
              }));
            }}
            className="mb-3 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </button>
          <div className="space-y-4">
            {formData.skills.certifications.map((cert, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => {
                      const certs = [...formData.skills.certifications];
                      certs[index] = { ...certs[index], name: e.target.value };
                      updateFormData('skills', { certifications: certs });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Certification Name"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => {
                      const certs = [...formData.skills.certifications];
                      certs[index] = { ...certs[index], issuer: e.target.value };
                      updateFormData('skills', { certifications: certs });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Issuing Organization"
                  />
                  <input
                    type="date"
                    value={cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const certs = [...formData.skills.certifications];
                      certs[index] = { ...certs[index], issueDate: new Date(e.target.value) };
                      updateFormData('skills', { certifications: certs });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                  />
                  <input
                    type="url"
                    value={cert.credentialUrl}
                    onChange={(e) => {
                      const certs = [...formData.skills.certifications];
                      certs[index] = { ...certs[index], credentialUrl: e.target.value };
                      updateFormData('skills', { certifications: certs });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Verification URL (optional)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const certs = formData.skills.certifications.filter((_, i) => i !== index);
                    updateFormData('skills', { certifications: certs });
                  }}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">
            Languages
          </label>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                skills: {
                  ...prev.skills,
                  languages: [
                    ...prev.skills.languages,
                    { code: '', name: '', proficiency: 'professional' },
                  ],
                },
              }));
            }}
            className="mb-3 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Language
          </button>
          <div className="space-y-3">
            {formData.skills.languages.map((lang, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) => {
                    const langs = [...formData.skills.languages];
                    langs[index] = { ...langs[index], name: e.target.value, code: e.target.value.toLowerCase().substring(0, 2) };
                    updateFormData('skills', { languages: langs });
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                  placeholder="Language"
                />
                <select
                  value={lang.proficiency}
                  onChange={(e) => {
                    const langs = [...formData.skills.languages];
                    langs[index] = { ...langs[index], proficiency: e.target.value as Language['proficiency'] };
                    updateFormData('skills', { languages: langs });
                  }}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                >
                  {LANGUAGE_PROFICIENCIES.map((prof) => (
                    <option key={prof} value={prof} className="bg-slate-900 capitalize">
                      {prof}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const langs = formData.skills.languages.filter((_, i) => i !== index);
                    updateFormData('skills', { languages: langs });
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderWorkPreferences() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold">Work Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-purple-200">
              Availability <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFormData('workPreferences', { availability: option.value })}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    formData.workPreferences.availability === option.value
                      ? 'bg-purple-500/20 border-purple-400'
                      : 'bg-white/5 border-white/10 hover:border-purple-400/50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-purple-200/70">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-purple-200">
              Location Preference <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {LOCATION_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateFormData('workPreferences', { location: option.value })}
                    className={`w-full p-4 rounded-lg border transition-all flex items-center gap-3 ${
                      formData.workPreferences.location === option.value
                        ? 'bg-purple-500/20 border-purple-400'
                        : 'bg-white/5 border-white/10 hover:border-purple-400/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-purple-300" />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Preferred Hours Per Week
            </label>
            <input
              type="number"
              min="1"
              max="80"
              value={formData.workPreferences.preferredHoursPerWeek || ''}
              onChange={(e) => updateFormData('workPreferences', { preferredHoursPerWeek: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Hourly Rate
            </label>
            <div className="flex gap-2">
              <select
                value={formData.workPreferences.currency}
                onChange={(e) => updateFormData('workPreferences', { currency: e.target.value })}
                className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              >
                <option value="USD" className="bg-slate-900">USD ($)</option>
                <option value="EUR" className="bg-slate-900">EUR (€)</option>
                <option value="GBP" className="bg-slate-900">GBP (£)</option>
                <option value="INR" className="bg-slate-900">INR (₹)</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.workPreferences.hourlyRate || ''}
                onChange={(e) => updateFormData('workPreferences', { hourlyRate: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Minimum Task Budget
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.workPreferences.minimumTaskBudget || ''}
              onChange={(e) => updateFormData('workPreferences', { minimumTaskBudget: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-purple-200">
              Timezone
            </label>
            <select
              value={formData.workPreferences.timezone}
              onChange={(e) => updateFormData('workPreferences', { timezone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz} className="bg-slate-900">
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
          <input
            type="checkbox"
            id="fastTrack"
            checked={formData.workPreferences.fastTrackAvailable}
            onChange={(e) => updateFormData('workPreferences', { fastTrackAvailable: e.target.checked })}
            className="w-5 h-5 rounded bg-white/5 border border-white/10 text-purple-500 focus:ring-purple-400"
          />
          <label htmlFor="fastTrack" className="text-purple-200 cursor-pointer">
            Available for fast-track tasks (urgent, quick turnaround)
          </label>
        </div>
      </div>
    );
  }

  function renderSpecialties() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold">Specialties & Services</h2>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">
            Specialties <span className="text-red-400">*</span>
            <span className="text-xs text-purple-200/70 ml-2">What you're best at</span>
          </label>
          <div className="flex gap-2 mb-3">
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
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white"
              placeholder="e.g., Kubernetes automation, CI/CD hardening"
            />
            <button
              type="button"
              onClick={addSpecialty}
              className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.specialties.map((specialty) => (
              <span
                key={specialty}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-sm"
              >
                {specialty}
                <button
                  type="button"
                  onClick={() => removeSpecialty(specialty)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">
            Service Offerings
            <span className="text-xs text-purple-200/70 ml-2">Specific services you provide</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                services: [
                  ...prev.services,
                  {
                    title: '',
                    description: '',
                    category: '',
                    hourlyRate: undefined,
                    fixedRate: undefined,
                    estimatedHours: undefined,
                  },
                ],
              }));
            }}
            className="mb-3 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => {
                    const services = [...formData.services];
                    services[index] = { ...services[index], title: e.target.value };
                    updateFormData('services', services);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                  placeholder="Service Title"
                />
                <textarea
                  value={service.description}
                  onChange={(e) => {
                    const services = [...formData.services];
                    services[index] = { ...services[index], description: e.target.value };
                    updateFormData('services', services);
                  }}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm resize-none"
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={service.category}
                    onChange={(e) => {
                      const services = [...formData.services];
                      services[index] = { ...services[index], category: e.target.value };
                      updateFormData('services', services);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Category"
                  />
                  <input
                    type="number"
                    min="0"
                    value={service.estimatedHours || ''}
                    onChange={(e) => {
                      const services = [...formData.services];
                      services[index] = { ...services[index], estimatedHours: parseInt(e.target.value) || undefined };
                      updateFormData('services', services);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Est. Hours"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const services = formData.services.filter((_, i) => i !== index);
                    updateFormData('services', services);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderPortfolio() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <FolderOpen className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold">Portfolio & Achievements</h2>
          <span className="text-sm text-purple-200/70">(Optional but recommended)</span>
        </div>

        {/* Projects */}
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">
            Projects
          </label>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                portfolio: {
                  ...prev.portfolio,
                  projects: [
                    ...prev.portfolio.projects,
                    {
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
                    },
                  ],
                },
              }));
            }}
            className="mb-3 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
          <div className="space-y-4">
            {formData.portfolio.projects.map((project, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => {
                    const projects = [...formData.portfolio.projects];
                    projects[index] = { ...projects[index], title: e.target.value };
                    updateFormData('portfolio', { projects });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm font-medium"
                  placeholder="Project Title"
                />
                <textarea
                  value={project.description}
                  onChange={(e) => {
                    const projects = [...formData.portfolio.projects];
                    projects[index] = { ...projects[index], description: e.target.value };
                    updateFormData('portfolio', { projects });
                  }}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm resize-none"
                  placeholder="Project description and key achievements"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={project.category}
                    onChange={(e) => {
                      const projects = [...formData.portfolio.projects];
                      projects[index] = { ...projects[index], category: e.target.value };
                      updateFormData('portfolio', { projects });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Category"
                  />
                  <input
                    type="text"
                    value={project.duration}
                    onChange={(e) => {
                      const projects = [...formData.portfolio.projects];
                      projects[index] = { ...projects[index], duration: e.target.value };
                      updateFormData('portfolio', { projects });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Duration (e.g., 3 months)"
                  />
                  <input
                    type="text"
                    value={project.role}
                    onChange={(e) => {
                      const projects = [...formData.portfolio.projects];
                      projects[index] = { ...projects[index], role: e.target.value };
                      updateFormData('portfolio', { projects });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Your Role"
                  />
                  <input
                    type="url"
                    value={project.url}
                    onChange={(e) => {
                      const projects = [...formData.portfolio.projects];
                      projects[index] = { ...projects[index], url: e.target.value };
                      updateFormData('portfolio', { projects });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Project URL"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const projects = formData.portfolio.projects.filter((_, i) => i !== index);
                    updateFormData('portfolio', { projects });
                  }}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <label className="block text-sm font-medium mb-2 text-purple-200">
            Key Achievements
          </label>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                portfolio: {
                  ...prev.portfolio,
                  achievements: [
                    ...prev.portfolio.achievements,
                    {
                      title: '',
                      description: '',
                      category: '',
                      date: new Date(),
                      metrics: '',
                      proofUrl: '',
                    },
                  ],
                },
              }));
            }}
            className="mb-3 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Achievement
          </button>
          <div className="space-y-4">
            {formData.portfolio.achievements.map((achievement, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <input
                  type="text"
                  value={achievement.title}
                  onChange={(e) => {
                    const achievements = [...formData.portfolio.achievements];
                    achievements[index] = { ...achievements[index], title: e.target.value };
                    updateFormData('portfolio', { achievements });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm font-medium"
                  placeholder="Achievement Title"
                />
                <textarea
                  value={achievement.description}
                  onChange={(e) => {
                    const achievements = [...formData.portfolio.achievements];
                    achievements[index] = { ...achievements[index], description: e.target.value };
                    updateFormData('portfolio', { achievements });
                  }}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm resize-none"
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={achievement.category}
                    onChange={(e) => {
                      const achievements = [...formData.portfolio.achievements];
                      achievements[index] = { ...achievements[index], category: e.target.value };
                      updateFormData('portfolio', { achievements });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                    placeholder="Category"
                  />
                  <input
                    type="date"
                    value={achievement.date ? new Date(achievement.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const achievements = [...formData.portfolio.achievements];
                      achievements[index] = { ...achievements[index], date: new Date(e.target.value) };
                      updateFormData('portfolio', { achievements });
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const achievements = formData.portfolio.achievements.filter((_, i) => i !== index);
                    updateFormData('portfolio', { achievements });
                  }}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

export default TaskerMeta;

