/**
 * GNK Continuum - Type Definitions
 * Centralized type definitions for the entire application
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'user' | 'assistant' | 'admin';
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  isNeuralAssistant: boolean;
  expertise: string[];
  availability: AvailabilityStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: {
    company?: string;
    timezone?: string;
    preferredContact?: string;
  };
}

// ============================================================================
// TASK TYPES (TaskHatch)
// ============================================================================

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Urgency = 'immediate' | '24h' | 'this-week' | 'flexible';
export type RiskLevel = 'low' | 'moderate' | 'high';
export type Environment = 'development' | 'staging' | 'production' | 'sandbox';
export type DataSensitivity = 'public' | 'internal' | 'restricted';
export type TaskStatus = 
  | 'intake' 
  | 'analyzing' 
  | 'ai-processing' 
  | 'neural-requested' 
  | 'assigned' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled';

export interface Task {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  
  // Core Task Data
  title: string;
  summary: string;
  requirements: string;
  acceptanceCriteria: string;
  
  // Classification
  priority: Priority;
  urgency: Urgency;
  category: string;
  impact: string;
  riskLevel: RiskLevel;
  environment: Environment;
  
  // Execution Signals
  dueDate: Timestamp | null;
  estimatedHours: number | null;
  dependencies: string;
  communicationChannel: string;
  repoUrl: string;
  tags: string[];
  
  // Security & Compliance
  dataSensitivity: DataSensitivity;
  securityReview: boolean;
  blocked: boolean;
  
  // Status & Tracking
  status: TaskStatus;
  readinessScore: number;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
}

// ============================================================================
// AI ANALYSIS TYPES
// ============================================================================

export type AIProvider = 'openai' | 'anthropic' | 'custom' | 'multi';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type EffortLevel = 'low' | 'medium' | 'high';
export type AutomationType = 'script' | 'workflow' | 'api-integration' | 'ml-model';
export type Complexity = 'low' | 'medium' | 'high';

export interface AIAnalysis {
  id: string;
  taskId: string;
  
  // Analysis Results
  summary: string;
  proposedSolutions: Solution[];
  integrationSteps: IntegrationStep[];
  riskAssessment: RiskAssessment;
  automationOpportunities: AutomationOpportunity[];
  
  // AI Metadata
  aiProvider: AIProvider;
  model: string;
  analysisVersion: number;
  confidence: number;
  
  // Processing Info
  processingTime: number;
  tokensUsed: number;
  cost: number;
  
  // Status
  status: AnalysisStatus;
  error?: string;
  
  // Timestamps
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  approach: string;
  pros: string[];
  cons: string[];
  estimatedEffort: EffortLevel;
  estimatedHours: number | null;
  recommended: boolean;
  dependencies: string[];
}

export interface IntegrationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  tools: string[];
  estimatedTime: string;
  prerequisites: string[];
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  risks: Risk[];
  mitigations: Mitigation[];
}

export interface Risk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  impact: string;
}

export interface Mitigation {
  id: string;
  riskId: string;
  strategy: string;
  steps: string[];
}

export interface AutomationOpportunity {
  id: string;
  area: string;
  description: string;
  automationType: AutomationType;
  potentialSavings: string;
  complexity: Complexity;
  tools: string[];
}

// ============================================================================
// NEURAL GATEWAY TYPES
// ============================================================================

export type NeuralRequestStatus = 
  | 'pending' 
  | 'matched' 
  | 'accepted' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled' 
  | 'rejected';

export type AssignmentMethod = 'auto' | 'manual' | 'user-selected' | null;

export interface NeuralRequest {
  id: string;
  taskId: string | null;
  requesterId: string;
  requesterEmail: string;
  requesterName: string;
  
  // Request Details
  title: string;
  description: string;
  priority: Priority;
  category: string;
  estimatedHours: number | null;
  
  // Assignment
  assignedAssistantId: string | null;
  assignedAssistantName: string | null;
  assignmentMethod: AssignmentMethod;
  assignmentReason: string | null;
  
  // Status
  status: NeuralRequestStatus;
  rejectionReason: string | null;
  
  // Communication
  messages: NeuralMessage[];
  lastActivityAt: Timestamp;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
}

export interface NeuralMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'requester' | 'assistant';
  content: string;
  attachments: Attachment[];
  createdAt: Timestamp;
  readAt: Timestamp | null;
}

export interface Attachment {
  id: string;
  type: 'file' | 'image' | 'code-snippet' | 'link';
  url: string;
  name: string;
  size?: number;
}

// ============================================================================
// TASK ASSIGNMENT TYPES
// ============================================================================

export type AssignmentType = 'ai-only' | 'human-only' | 'hybrid';
export type WorkStatus = 'not-started' | 'in-progress' | 'blocked' | 'review' | 'completed';
export type AssignmentStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface TaskAssignment {
  id: string;
  taskId: string;
  neuralRequestId: string | null;
  
  // Assignment Details
  assignedToId: string;
  assignedToName: string;
  assignedToEmail: string;
  assignedBy: string;
  assignmentType: AssignmentType;
  
  // Work Details
  workStatus: WorkStatus;
  progress: number;
  notes: string;
  deliverables: Deliverable[];
  
  // Time Tracking
  estimatedHours: number | null;
  actualHours: number | null;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  
  // Status
  status: AssignmentStatus;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'code' | 'design' | 'plan' | 'other';
  url: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt: Timestamp | null;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface TaskHatchForm {
  title: string;
  summary: string;
  requirements: string;
  acceptanceCriteria: string;
  priority: Priority;
  urgency: Urgency;
  category: string;
  impact: string;
  riskLevel: RiskLevel;
  environment: Environment;
  repoUrl: string;
  dueDate: string;
  estimatedHours: string;
  dependencies: string;
  communicationChannel: string;
  dataSensitivity: DataSensitivity;
  securityReview: boolean;
  blocked: boolean;
  tags: string;
}

export interface NeuralRequestForm {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  estimatedHours: string;
  taskId?: string;
}

// ============================================================================
// TASKER PROFILE TYPES
// ============================================================================

export type TaskerStatus = 'incomplete' | 'pending' | 'approved' | 'active' | 'suspended';
export type TaskAchieverStatus = 'not-eligible' | 'eligible' | 'pending-approval' | 'approved' | 'active';
export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'expert';
export type AvailabilityPreference = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'on-demand';
export type WorkLocationPreference = 'remote' | 'on-site' | 'hybrid' | 'flexible';

export interface TaskerProfile {
  id: string;
  userId: string;
  userEmail: string;
  
  // Profile Status
  status: TaskerStatus;
  taskAchieverStatus: TaskAchieverStatus;
  completionPercentage: number;
  isTaskAchieverEligible: boolean;
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    displayName: string;
    profilePhoto?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    bio?: string;
  };
  
  // Professional Information
  professionalInfo: {
    title: string;
    experienceLevel: ExperienceLevel;
    yearsOfExperience: number;
    currentRole?: string;
    company?: string;
    linkedInUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
  };
  
  // Skills & Expertise
  skills: {
    primary: string[]; // Core skills
    secondary: string[]; // Additional skills
    certifications: Certification[];
    languages: Language[];
  };
  
  // Work Preferences
  workPreferences: {
    availability: AvailabilityPreference;
    location: WorkLocationPreference;
    preferredHoursPerWeek?: number;
    hourlyRate?: number;
    currency?: string;
    minimumTaskBudget?: number;
    availabilitySchedule?: AvailabilitySchedule;
    fastTrackAvailable: boolean;
  };
  
  // Specialties & Services
  specialties: string[];
  services: ServiceOffering[];
  
  // Portfolio & Experience
  portfolio: {
    projects: Project[];
    achievements: Achievement[];
    testimonials: Testimonial[];
  };
  
  // Task Performance Metrics
  metrics: {
    tasksCompleted: number;
    tasksInProgress: number;
    averageRating: number;
    totalRatings: number;
    slaReliability: number; // percentage
    averageTurnaroundHours: number;
    qualityScore: number; // 0-5
    responseTimeHours: number;
  };
  
  // TaskAchiever Eligibility Criteria
  taskAchieverCriteria: {
    minimumTasksCompleted: number;
    minimumRating: number;
    minimumSlaReliability: number;
    minimumCompletionRate: number;
    verifiedSkills: string[];
    certificationsRequired: string[];
    isVerified: boolean;
    verificationDate?: Date;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt: Timestamp;
  profileCompletedAt?: Timestamp;
  taskAchieverApprovedAt?: Timestamp;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  verified: boolean;
}

export interface Language {
  code: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'professional' | 'native';
}

export interface AvailabilitySchedule {
  timezone: string;
  days: {
    monday?: DaySchedule;
    tuesday?: DaySchedule;
    wednesday?: DaySchedule;
    thursday?: DaySchedule;
    friday?: DaySchedule;
    saturday?: DaySchedule;
    sunday?: DaySchedule;
  };
}

export interface DaySchedule {
  available: boolean;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  notes?: string;
}

export interface ServiceOffering {
  id: string;
  title: string;
  description: string;
  category: string;
  hourlyRate?: number;
  fixedRate?: number;
  estimatedHours?: number;
  isActive: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  duration: string;
  role: string;
  outcome?: string;
  url?: string;
  images?: string[];
  isPublic: boolean;
  completedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  metrics?: string;
  proofUrl?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientRole?: string;
  clientCompany?: string;
  content: string;
  rating: number;
  date: Date;
  projectTitle?: string;
  verified: boolean;
}

// TaskerMeta Form Data Structure (for form collection)
export interface TaskerMetaForm {
  // Step 1: Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    displayName: string;
    phone?: string;
    location?: string;
    timezone?: string;
    bio?: string;
  };
  
  // Step 2: Professional Information
  professionalInfo: {
    title: string;
    experienceLevel: ExperienceLevel;
    yearsOfExperience: number;
    currentRole?: string;
    company?: string;
    linkedInUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
  };
  
  // Step 3: Skills & Expertise
  skills: {
    primary: string[];
    secondary: string[];
    certifications: Omit<Certification, 'id' | 'verified'>[];
    languages: Language[];
  };
  
  // Step 4: Work Preferences
  workPreferences: {
    availability: AvailabilityPreference;
    location: WorkLocationPreference;
    preferredHoursPerWeek?: number;
    hourlyRate?: number;
    currency?: string;
    minimumTaskBudget?: number;
    timezone?: string;
    schedule: {
      monday?: DaySchedule;
      tuesday?: DaySchedule;
      wednesday?: DaySchedule;
      thursday?: DaySchedule;
      friday?: DaySchedule;
      saturday?: DaySchedule;
      sunday?: DaySchedule;
    };
    fastTrackAvailable: boolean;
  };
  
  // Step 5: Specialties & Services
  specialties: string[];
  services: Omit<ServiceOffering, 'id' | 'isActive'>[];
  
  // Step 6: Portfolio
  portfolio: {
    projects: Omit<Project, 'id' | 'isPublic'>[];
    achievements: Omit<Achievement, 'id'>[];
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WithId<T> = T & { id: string };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

