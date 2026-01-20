
export enum UserRole {
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
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

export interface TransformationMapping {
  painPoints: {
    emotional: string;
    physical: string;
    spiritual: string;
    social: string;
  };
  inferredCoreBeliefs: string;
  strategySummary: string;
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
  email: string;
  phone?: string;
  instagram?: string;
  role: UserRole;
  avatar?: string;
  credits: number;
  generationsCount: number; // Para controle de 1ª full vs 2ª/3ª parciais
  branding?: BrandingSettings;
  stripeCustomerId?: string;
  notificationsEnabled: boolean;
  password?: string;
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
  transformationMapping?: TransformationMapping;
  createdAt: string;
  isGroupPlan: boolean;
  methodology: string;
  isFullVersion: boolean; // Indica se é 7 ou 21 dias
}

export interface StripePackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

export interface GeneratePlanPayload {
  mentor_profile: string;
  transformation_type: string;
  method_status: string;
  has_material: boolean;
  materials_summary: string;
  pdf_base64?: string;
  student_name: string;
  student_profile: string;
  student_interests: string;
  health_areas: HealthArea[];
  isGroupPlan: boolean;
  plan_type: string;
  forceFullGeneration?: boolean; // Se true, ignora trava de 7 dias
}

export interface PlanResponse {
  plan_title: string;
  description: string;
  transformation_mapping: TransformationMapping;
  challenges: Omit<Challenge, 'completed' | 'comments'>[];
}

// Added missing WizardStepId type
export type WizardStepId = 'welcome' | 'qualification' | 'method' | 'content-choice' | 'material-upload' | 'avatar-creation' | 'health-areas';

// Added missing Mentorship interface
export interface Mentorship {
  id: string;
  expertId: string;
  title: string;
  description: string;
  price: number;
  createdAt: string;
}

// Added missing RegisteredStudent interface
export interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
}

// Added missing RegisteredGroup interface
export interface RegisteredGroup {
  id: string;
  name: string;
}

// Added missing TenantConfig interface
export interface TenantConfig {
  slug: string;
  isAdminTenant: boolean;
  branding: BrandingSettings;
  landing: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  tracks: Array<{
    id: string;
    name: string;
    description: string;
    days: number;
    challenges: any[];
  }>;
}
