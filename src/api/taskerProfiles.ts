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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:200',message:'saveTaskerProfile entry',data:{userId,userEmail,hasExistingProfile:!!existingProfile,existingProfileId:existingProfile?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'B,C'})}).catch(()=>{});
    // #endregion
    // If existingProfile not provided, try to load it
    let profile: TaskerProfile | undefined = existingProfile;
    if (!profile) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:205',message:'Loading profile inside saveTaskerProfile',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const loadedProfile = await getTaskerProfileByUserId(userId);
        profile = loadedProfile || undefined;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:208',message:'Profile loaded inside saveTaskerProfile',data:{profileLoaded:!!profile,profileId:profile?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:210',message:'Error loading profile inside saveTaskerProfile',data:{error:(err as any)?.message,errorCode:(err as any)?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.warn('Could not load existing profile:', err);
      }
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:212',message:'Before calculateCompletionPercentage',data:{hasPersonalInfo:!!formData.personalInfo,hasProfessionalInfo:!!formData.professionalInfo},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const completionPercentage = calculateCompletionPercentage(formData);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:214',message:'After calculateCompletionPercentage',data:{completionPercentage},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const eligibility = checkTaskAchieverEligibility(
      formData,
      profile?.metrics
    );

    // Prepare availability schedule
    const availabilitySchedule = {
      timezone: formData.workPreferences.timezone || 'UTC',
      days: formData.workPreferences.schedule,
    };

    // Prepare portfolio data - preserve existing IDs to avoid data loss
    // Note: formData types omit 'id', but at runtime projects/achievements may have IDs from loaded data
    const portfolio = {
      projects: formData.portfolio.projects.map((p, index) => {
        // Check if ID exists at runtime (from loaded profile data)
        const existingId = (p as any).id;
        // Try to match with existing profile projects by index or title
        const existingProject = profile?.portfolio?.projects?.[index];
        return {
        ...p,
          id: existingId || existingProject?.id || `${Date.now()}-${Math.random()}-${index}`,
        isPublic: true,
        completedAt: p.completedAt || new Date(),
        };
      }),
      achievements: formData.portfolio.achievements.map((a, index) => {
        // Check if ID exists at runtime (from loaded profile data)
        const existingId = (a as any).id;
        // Try to match with existing profile achievements by index or title
        const existingAchievement = profile?.portfolio?.achievements?.[index];
        return {
        ...a,
          id: existingId || existingAchievement?.id || `${Date.now()}-${Math.random()}-${index}`,
        date: a.date || new Date(),
        };
      }),
      testimonials: profile?.portfolio?.testimonials || [],
    };

    // Prepare services - preserve existing IDs
    // Note: formData type omits 'id', but at runtime services may have IDs from loaded data
    const services = formData.services.map((s, index) => {
      // Check if ID exists at runtime (from loaded profile data)
      const existingId = (s as any).id;
      // Try to match with existing profile services by index or title
      const existingService = profile?.services?.[index];
      return {
      ...s,
        id: existingId || existingService?.id || `${Date.now()}-${Math.random()}-${index}`,
      isActive: true,
      };
    });

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
      
      metrics: profile?.metrics || {
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
      
      createdAt: profile?.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastActiveAt: Timestamp.now(),
      ...(completionPercentage >= 80 && !profile?.profileCompletedAt ? { profileCompletedAt: Timestamp.now() } : {}),
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:315',message:'Before Firestore operation',data:{hasProfile:!!profile,profileId:profile?.id,willUpdate:!!profile,willCreate:!profile,profileDataKeys:Object.keys(profileData)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (profile) {
      // Update existing profile - preserve all existing data
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:318',message:'Calling updateDocument',data:{profileId:profile.id,collection:COLLECTIONS.TASKER_PROFILES},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      await updateDocument<TaskerProfile>(
        COLLECTIONS.TASKER_PROFILES,
        profile.id,
        profileData
      );
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:323',message:'updateDocument succeeded',data:{profileId:profile.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return profile.id;
    } else {
      // Create new profile
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:328',message:'Calling createDocument',data:{userId,collection:COLLECTIONS.TASKER_PROFILES},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const profileId = await createDocument<TaskerProfile>(
        COLLECTIONS.TASKER_PROFILES,
        profileData,
        userId // Use userId as document ID for easy lookup
      );
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:333',message:'createDocument succeeded',data:{profileId},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return profileId;
    }
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/82659649-bb47-4cfa-8853-c0aec6c59272',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'taskerProfiles.ts:338',message:'Error in saveTaskerProfile catch block',data:{errorMessage:error?.message,errorCode:error?.code,errorName:error?.name,stack:error?.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial_debug',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
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

