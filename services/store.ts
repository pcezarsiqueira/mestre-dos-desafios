
import { ChallengePlan, User, UserRole, BrandingSettings, Mentorship, RegisteredStudent, RegisteredGroup } from "../types";

let currentTenant = 'default';
export const setStoreTenant = (slug: string) => { currentTenant = slug; };
const storageKey = (baseKey: string): string => `TENANT:${currentTenant}:${baseKey}`;

const PLAN_KEY = 'mestre_desafios_plan';
const USER_KEY = 'mestre_desafios_user';
const MENTORSHIPS_KEY = 'mestre_desafios_mentorships';
const STUDENTS_KEY = 'mestre_desafios_students';
const GROUPS_KEY = 'mestre_desafios_groups';

export const registerLead = (data: { name: string, email: string, phone: string, instagram: string }): User => {
  const newUser: User = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    instagram: data.instagram,
    role: UserRole.MENTOR,
    credits: 3,
    generationsCount: 0,
    notificationsEnabled: false,
    avatar: `https://ui-avatars.com/api/?name=${data.name}&background=fe7501&color=fff`,
    branding: {
      primaryColor: '#fe7501',
      secondaryColor: '#10b981',
      accentColor: '#f43f5e',
      mentoryName: 'Minha Mentoria Elite',
      expertName: data.name
    }
  };
  localStorage.setItem(storageKey(USER_KEY), JSON.stringify(newUser));
  return newUser;
};

export const loginAdmin = (email: string, pass: string): User | null => {
  if (email === 'admin@mestre.com' && pass === 'mestre@123') {
    const admin: User = {
      id: 'admin-001',
      name: 'Mestre Admin',
      email: 'admin@mestre.com',
      role: UserRole.ADMIN,
      credits: 999,
      generationsCount: 0,
      notificationsEnabled: true,
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fe7501'
    };
    localStorage.setItem(storageKey(USER_KEY), JSON.stringify(admin));
    return admin;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(storageKey(USER_KEY));
  return stored ? JSON.parse(stored) : null;
};

export const deductCredit = () => {
  const user = getCurrentUser();
  if (user && user.credits > 0) {
    user.credits -= 1;
    user.generationsCount += 1;
    localStorage.setItem(storageKey(USER_KEY), JSON.stringify(user));
    return user;
  }
  return null;
};

export const addCredits = (amount: number) => {
  const user = getCurrentUser();
  if (user) {
    user.credits += amount;
    localStorage.setItem(storageKey(USER_KEY), JSON.stringify(user));
    return user;
  }
  return null;
};

export const updateBranding = (branding: BrandingSettings) => {
  const user = getCurrentUser();
  if (user) {
    user.branding = branding;
    localStorage.setItem(storageKey(USER_KEY), JSON.stringify(user));
    return user;
  }
  return null;
};

export const logoutUser = () => { localStorage.removeItem(storageKey(USER_KEY)); };
export const savePlan = (plan: ChallengePlan | null) => {
  if (plan === null) localStorage.removeItem(storageKey(PLAN_KEY));
  else localStorage.setItem(storageKey(PLAN_KEY), JSON.stringify(plan));
};
export const getPlan = (): ChallengePlan | null => {
  const stored = localStorage.getItem(storageKey(PLAN_KEY));
  return stored ? JSON.parse(stored) : null;
};

export const updateChallengeStatus = (day: number, completed: boolean) => {
  const plan = getPlan();
  if (plan) {
    const updatedChallenges = plan.challenges.map(c => c.day === day ? { ...c, completed } : c);
    const updatedPlan = { ...plan, challenges: updatedChallenges };
    savePlan(updatedPlan);
    return updatedPlan;
  }
  return null;
};

export const addCommentToChallenge = (day: number, studentName: string, text: string) => {
  const plan = getPlan();
  if (plan) {
    const updatedChallenges = plan.challenges.map(c => {
      if (c.day === day) {
        const comments = c.comments || [];
        return { ...c, comments: [...comments, { id: crypto.randomUUID(), studentName, text, timestamp: new Date().toISOString() }] };
      }
      return c;
    });
    const updatedPlan = { ...plan, challenges: updatedChallenges };
    savePlan(updatedPlan);
    return updatedPlan;
  }
  return null;
};

// Added missing getMentorships function
export const getMentorships = (): Mentorship[] => {
  const stored = localStorage.getItem(storageKey(MENTORSHIPS_KEY));
  return stored ? JSON.parse(stored) : [];
};

// Added missing saveMentorship function
export const saveMentorship = (m: Mentorship) => {
  const mentorships = getMentorships();
  localStorage.setItem(storageKey(MENTORSHIPS_KEY), JSON.stringify([...mentorships, m]));
};

// Added missing getStudents function
export const getStudents = (): RegisteredStudent[] => {
  const stored = localStorage.getItem(storageKey(STUDENTS_KEY));
  return stored ? JSON.parse(stored) : [];
};

// Added missing getGroups function
export const getGroups = (): RegisteredGroup[] => {
  const stored = localStorage.getItem(storageKey(GROUPS_KEY));
  return stored ? JSON.parse(stored) : [];
};
