
import { ChallengePlan, User, UserRole, BrandingSettings, Mentorship, RegisteredStudent, RegisteredGroup } from "../types";

const PLAN_KEY = 'mestre_desafios_plan';
const USER_KEY = 'mestre_desafios_user';
const MENTORSHIPS_KEY = 'mestre_desafios_mentorships';
const STUDENTS_KEY = 'mestre_desafios_students';
const GROUPS_KEY = 'mestre_desafios_groups';

export const loginUser = (name: string, role: UserRole): User => {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) {
    const u = JSON.parse(stored);
    if (u.role === role) return u;
  }

  const user: User = {
    id: crypto.randomUUID(),
    name,
    role,
    credits: 10,
    avatar: `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`,
    branding: {
      primaryColor: '#6366f1',
      secondaryColor: '#10b981',
      accentColor: '#f43f5e',
      mentoryName: 'Minha Mentoria Elite',
      expertName: name
    }
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const updateBranding = (branding: BrandingSettings) => {
  const user = getCurrentUser();
  if (user) {
    user.branding = branding;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

// Gerenciamento de Dados do Mentor
export const getMentorships = (): Mentorship[] => JSON.parse(localStorage.getItem(MENTORSHIPS_KEY) || '[]');
export const saveMentorship = (m: Mentorship) => {
  const current = getMentorships();
  localStorage.setItem(MENTORSHIPS_KEY, JSON.stringify([...current, m]));
};

export const getStudents = (): RegisteredStudent[] => JSON.parse(localStorage.getItem(STUDENTS_KEY) || '[]');
export const saveStudent = (s: RegisteredStudent) => {
  const current = getStudents();
  localStorage.setItem(STUDENTS_KEY, JSON.stringify([...current, s]));
};

export const getGroups = (): RegisteredGroup[] => JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
export const saveGroup = (g: RegisteredGroup) => {
  const current = getGroups();
  localStorage.setItem(GROUPS_KEY, JSON.stringify([...current, g]));
};

export const deductCredit = () => {
  const user = getCurrentUser();
  if (user && user.credits > 0) {
    user.credits -= 1;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const addCredits = (amount: number) => {
  const user = getCurrentUser();
  if (user) {
    user.credits += amount;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const savePlan = (plan: ChallengePlan | null) => {
  if (plan === null) {
    localStorage.removeItem(PLAN_KEY);
  } else {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  }
};

export const getPlan = (): ChallengePlan | null => {
  const stored = localStorage.getItem(PLAN_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const updateChallengeStatus = (day: number, completed: boolean) => {
  const plan = getPlan();
  if (plan) {
    const updatedChallenges = plan.challenges.map(c => 
      c.day === day ? { ...c, completed } : c
    );
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
        return { 
          ...c, 
          comments: [...comments, { id: crypto.randomUUID(), studentName, text, timestamp: new Date().toISOString() }] 
        };
      }
      return c;
    });
    const updatedPlan = { ...plan, challenges: updatedChallenges };
    savePlan(updatedPlan);
    return updatedPlan;
  }
  return null;
};
