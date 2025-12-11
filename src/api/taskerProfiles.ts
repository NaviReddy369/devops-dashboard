/**
 * Tasker Profile API Functions
 * Handles all operations related to tasker profiles
 */

import { Timestamp, where } from 'firebase/firestore';
import {
  getDocument,
  createDocument,
  updateDocument,
  getDocuments,
  queryByUserId,
  orderByCreatedDesc,
  COLLECTIONS,
} from './firestore';
import { TaskerProfile, TaskerMetaForm } from '../types';

// ============================================================================
// GET OPERATIONS
// ============================================================================

/**
 * Get a tasker profile by user ID
 */
export async function getTaskerProfileByUserId(userId: string): Promise<TaskerProfile | null> {
  try {
    const profiles = await getDocuments<TaskerProfile>(
      COLLECTIONS.TASKER_PROFILES,
      [queryByUserId(userId)]
    );
    return profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error getting tasker profile by user ID:', error);
    throw error;
  }
}

/**
 * Get a tasker profile by profile ID
 */
export async function getTaskerProfile(profileId: string): Promise<TaskerProfile | null> {
  return getDocument<TaskerProfile>(COLLECTIONS.TASKER_PROFILES, profileId);
}

/**
 * Get all tasker profiles (with optional filters)
 */
export async function getAllTaskerProfiles(
  filters?: { status?: string; isTaskAchieverEligible?: boolean }
): Promise<TaskerProfile[]> {
  const constraints = [];
  
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }
  
  if (filters?.isTaskAchieverEligible !== undefined) {
    constraints.push(where('isTaskAchieverEligible', '==', filters.isTaskAchieverEligible));
  }
  
  return getDocuments<TaskerProfile>(COLLECTIONS.TASKER_PROFILES, constraints);
}

// ============================================================================
// CREATE/UPDATE OPERATIONS
// ============================================================================

/**
 * Calculate profile completion percentage
 */
function calculateCompletionPercentage(formData: TaskerMetaForm): number {
  let completedFields = 0;
  let totalFields = 0;

  // Personal Info (6 fields)
  totalFields += 6;
  if (formData.personalInfo.firstName) completedFields++;
  if (formData.personalInfo.lastName) completedFields++;
  if (formData.personalInfo.displayName) completedFields++;
  if (formData.personalInfo.phone) completedFields++;
  if (formData.personalInfo.location) completedFields++;
  if (formData.personalInfo.timezone) completedFields++;

  // Professional Info (6 fields)
  totalFields += 6;
  if (formData.professionalInfo.title) completedFields++;
  if (formData.professionalInfo.experienceLevel) completedFields++;
  if (formData.professionalInfo.yearsOfExperience) completedFields++;
  if (formData.professionalInfo.currentRole) completedFields++;
  if (formData.professionalInfo.linkedInUrl) completedFields++;
  if (formData.professionalInfo.portfolioUrl) completedFields++;

  // Skills (primary skills are required)
  totalFields += 2;
  if (formData.skills.primary.length > 0) completedFields++;
  if (formData.skills.certifications.length > 0 || formData.skills.secondary.length > 0) completedFields++;

  // Work Preferences (required fields)
  totalFields += 4;
  if (formData.workPreferences.availability) completedFields++;
  if (formData.workPreferences.location) completedFields++;
  if (formData.workPreferences.hourlyRate) completedFields++;
  if (formData.workPreferences.currency) completedFields++;

  // Specialties (required)
  totalFields += 1;
  if (formData.specialties.length > 0) completedFields++;

  // Portfolio (at least one project)
  totalFields += 1;
  if (formData.portfolio.projects.length > 0) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}

/**
 * Check TaskAchiever eligibility
 */
function checkTaskAchieverEligibility(
  formData: TaskerMetaForm,
  existingMetrics?: TaskerProfile['metrics']
): {
  isEligible: boolean;
  criteria: TaskerProfile['taskAchieverCriteria'];
  reasons: string[];
} {
  const reasons: string[] = [];
  const criteria = {
    minimumTasksCompleted: 10,
    minimumRating: 4.5,
    minimumSlaReliability: 95,
    minimumCompletionRate: 90,
    verifiedSkills: formData.skills.primary.slice(0, 3), // Top 3 skills
    certificationsRequired: [],
    isVerified: false,
  };

  // Use existing metrics if available, otherwise use defaults
  const metrics = existingMetrics || {
    tasksCompleted: 0,
    tasksInProgress: 0,
    averageRating: 0,
    totalRatings: 0,
    slaReliability: 0,
    averageTurnaroundHours: 0,
    qualityScore: 0,
    responseTimeHours: 0,
  };

  // Check criteria
  if (metrics.tasksCompleted < criteria.minimumTasksCompleted) {
    reasons.push(
      `Complete at least ${criteria.minimumTasksCompleted} tasks (currently: ${metrics.tasksCompleted})`
    );
  }

  if (metrics.averageRating < criteria.minimumRating && metrics.totalRatings > 0) {
    reasons.push(
      `Maintain a ${criteria.minimumRating}+ rating (currently: ${metrics.averageRating.toFixed(1)})`
    );
  }

  if (metrics.slaReliability < criteria.minimumSlaReliability) {
    reasons.push(
      `Maintain ${criteria.minimumSlaReliability}%+ SLA reliability (currently: ${metrics.slaReliability}%)`
    );
  }

  // Profile completeness requirement
  const completionPercentage = calculateCompletionPercentage(formData);
  if (completionPercentage < 90) {
    reasons.push(`Complete at least 90% of your profile (currently: ${completionPercentage}%)`);
  }

  // Skills requirement
  if (formData.skills.primary.length < 3) {
    reasons.push('Add at least 3 primary skills');
  }

  // Certifications (optional but recommended)
  if (formData.skills.certifications.length === 0) {
    reasons.push('Consider adding certifications to enhance your profile');
  }

  const isEligible = reasons.length === 0 || 
    (reasons.length === 1 && reasons[0].includes('certifications'));

  return { isEligible, criteria, reasons };
}

/**
 * Create or update tasker profile from TaskerMeta form data
 */
export async function saveTaskerProfile(
  userId: string,
  userEmail: string,
  formData: TaskerMetaForm,
  existingProfile?: TaskerProfile
): Promise<string> {
  try {
    const completionPercentage = calculateCompletionPercentage(formData);
    const eligibility = checkTaskAchieverEligibility(
      formData,
      existingProfile?.metrics
    );

    // Prepare availability schedule
    const availabilitySchedule = {
      timezone: formData.workPreferences.timezone || 'UTC',
      days: formData.workPreferences.schedule,
    };

    // Prepare portfolio data
    const portfolio = {
      projects: formData.portfolio.projects.map((p) => ({
        ...p,
        id: `${Date.now()}-${Math.random()}`,
        isPublic: true,
        completedAt: p.completedAt || new Date(),
      })),
      achievements: formData.portfolio.achievements.map((a) => ({
        ...a,
        id: `${Date.now()}-${Math.random()}`,
        date: a.date || new Date(),
      })),
      testimonials: existingProfile?.portfolio.testimonials || [],
    };

    // Prepare services
    const services = formData.services.map((s) => ({
      ...s,
      id: `${Date.now()}-${Math.random()}`,
      isActive: true,
    }));

    const profileData: Omit<TaskerProfile, 'id'> = {
      userId,
      userEmail,
      
      status: completionPercentage >= 80 ? 'pending' : 'incomplete',
      taskAchieverStatus: eligibility.isEligible ? 'eligible' : 'not-eligible',
      completionPercentage,
      isTaskAchieverEligible: eligibility.isEligible,
      
      personalInfo: formData.personalInfo,
      professionalInfo: formData.professionalInfo,
      
      skills: {
        ...formData.skills,
        certifications: formData.skills.certifications.map((c) => ({
          ...c,
          id: `${Date.now()}-${Math.random()}`,
          verified: false, // Will be verified manually or via API
        })),
      },
      
      workPreferences: {
        ...formData.workPreferences,
        availabilitySchedule,
        minimumTaskBudget: formData.workPreferences.minimumTaskBudget || 0,
      },
      
      specialties: formData.specialties,
      services,
      portfolio,
      
      metrics: existingProfile?.metrics || {
        tasksCompleted: 0,
        tasksInProgress: 0,
        averageRating: 0,
        totalRatings: 0,
        slaReliability: 0,
        averageTurnaroundHours: 0,
        qualityScore: 0,
        responseTimeHours: 0,
      },
      
      taskAchieverCriteria: eligibility.criteria,
      
      createdAt: existingProfile?.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastActiveAt: Timestamp.now(),
      ...(completionPercentage >= 80 ? { profileCompletedAt: Timestamp.now() } : {}),
    };

    if (existingProfile) {
      // Update existing profile
      await updateDocument<TaskerProfile>(
        COLLECTIONS.TASKER_PROFILES,
        existingProfile.id,
        profileData
      );
      return existingProfile.id;
    } else {
      // Create new profile
      const profileId = await createDocument<TaskerProfile>(
        COLLECTIONS.TASKER_PROFILES,
        profileData,
        userId // Use userId as document ID for easy lookup
      );
      return profileId;
    }
  } catch (error: any) {
    console.error('Error saving tasker profile:', error);
    throw error;
  }
}

/**
 * Update tasker profile status
 */
export async function updateTaskerProfileStatus(
  profileId: string,
  status: TaskerProfile['status']
): Promise<void> {
  await updateDocument<TaskerProfile>(
    COLLECTIONS.TASKER_PROFILES,
    profileId,
    { status, updatedAt: Timestamp.now() }
  );
}

/**
 * Update TaskAchiever status
 */
export async function updateTaskAchieverStatus(
  profileId: string,
  status: TaskerProfile['taskAchieverStatus']
): Promise<void> {
  const updateData: Partial<TaskerProfile> = {
    taskAchieverStatus: status,
    updatedAt: Timestamp.now(),
  };

  if (status === 'approved') {
    updateData.taskAchieverApprovedAt = Timestamp.now();
  }

  await updateDocument<TaskerProfile>(
    COLLECTIONS.TASKER_PROFILES,
    profileId,
    updateData
  );
}

/**
 * Update tasker metrics (called when tasks are completed)
 */
export async function updateTaskerMetrics(
  profileId: string,
  metrics: Partial<TaskerProfile['metrics']>
): Promise<void> {
  await updateDocument<TaskerProfile>(
    COLLECTIONS.TASKER_PROFILES,
    profileId,
    {
      metrics: metrics as TaskerProfile['metrics'],
      lastActiveAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
  );
}

