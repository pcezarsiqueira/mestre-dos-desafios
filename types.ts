
export enum UserRole {
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT'
}

export enum HealthArea {
  PHYSICAL = 'Saúde Física',
  EMOTIONAL = 'Saúde Emocional',
  MENTAL = 'Saúde Mental / Intelectual',
  SPIRITUAL = 'Saúde Espiritual',
  SOCIAL = 'Saúde Relacional / Social',
  PROFESSIONAL = 'Saúde Profissional',
  FINANCIAL = 'Saúde Financeira'
}

export interface BrandingSettings {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  mentoryName: string;
  expertName: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  credits: number;
  branding?: BrandingSettings;
}

export interface Comment {
  id: string;
  studentName: string;
  text: string;
  timestamp: string;
}

export interface Challenge {
  day: number;
  title: string;
  objective: string; 
  instructions: string[]; 
  estimated_time: string;
  style_notes: string;
  health_area_weights: Record<string, number>;
  xp: number;
  completed: boolean;
  comments: Comment[];
  isFireTrial?: boolean;
}

export interface ChallengePlan {
  id: string;
  mentorId: string;
  studentName: string; 
  planTitle: string; 
  planDescription: string; 
  niche: string;
  selectedAreas: HealthArea[];
  challenges: Challenge[];
  createdAt: string;
  isGroupPlan: boolean;
  methodology: string;
  shareToken?: string;
}

export interface Mentorship {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
  activePlanId?: string;
}

export interface RegisteredGroup {
  id: string;
  name: string;
  studentCount: number;
}

export interface GeneratePlanPayload {
  mentor_profile: string;
  transformation_type: string;
  method_status: string;
  has_material: boolean;
  materials_summary: string;
  student_name: string;
  student_profile: string;
  student_interests: string;
  health_areas: HealthArea[];
  isGroupPlan: boolean;
  plan_type: string;
}

export interface PlanResponse {
  plan_title: string;
  description: string;
  challenges: Omit<Challenge, 'completed' | 'comments'>[];
}

export type WizardStepId = 'welcome' | 'qualification' | 'method' | 'content-choice' | 'material-upload' | 'avatar-creation' | 'health-areas';
