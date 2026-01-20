
import { ChallengePlan, User, UserRole, BrandingSettings, Mentorship, RegisteredStudent, RegisteredGroup } from "../types";

let currentTenant = 'default';

export const setStoreTenant = (slug: string) => {
  currentTenant = slug;
};

const storageKey = (baseKey: string): string => {
  return `TENANT:${currentTenant}:${baseKey}`;
};

// Migração simples: se não houver dados no tenant mas houver na chave global (antiga), migra.
const getWithMigration = (key: string): string | null => {
  const namespaced = localStorage.getItem(storageKey(key));
  if (namespaced) return namespaced;

  // Se estivermos no default, tentamos pegar a chave antiga sem prefixo
  if (currentTenant === 'default') {
    const legacy = localStorage.getItem(key);
    if (legacy) {
      console.log(`Migrando chave legada: ${key}`);
      localStorage.setItem(storageKey(key), legacy);
      // Opcional: localStorage.removeItem(key); // Cuidado ao remover produção
      return legacy;
    }
  }
  return null;
};

const PLAN_KEY = 'mestre_desafios_plan';
const USER_KEY = 'mestre_desafios_user';
const MENTORSHIPS_KEY = 'mestre_desafios_mentorships';
const STUDENTS_KEY = 'mestre_desafios_students';
const GROUPS_KEY = 'mestre_desafios_groups';

export const loginUser = (name: string, role: UserRole): User => {
  const stored = getWithMigration(USER_KEY);
  if (stored) {
    const u = JSON.parse(stored);
    if (u.role === role) return u;
  }

  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@metadesafios.com.br`,
    role,
    credits: 10,
    notificationsEnabled: false,
    avatar: `https://ui-avatars.com/api/?name=${name}&background=fe7501&color=fff`,
    branding: {
      primaryColor: '#fe7501',
      secondaryColor: '#10b981',
      accentColor: '#f43f5e',
      mentoryName: 'Minha Mentoria Elite',
      expertName: name
    }
  };
  localStorage.setItem(storageKey(USER_KEY), JSON.stringify(user));
  return user;
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

export const getMentorships = (): Mentorship[] => JSON.parse(getWithMigration(MENTORSHIPS_KEY) || '[]');
export const saveMentorship = (m: Mentorship) => {
  const current = getMentorships();
  localStorage.setItem(storageKey(MENTORSHIPS_KEY), JSON.stringify([...current, m]));
};

export const getStudents = (): RegisteredStudent[] => JSON.parse(getWithMigration(STUDENTS_KEY) || '[]');
export const saveStudent = (s: RegisteredStudent) => {
  const current = getStudents();
  localStorage.setItem(storageKey(STUDENTS_KEY), JSON.stringify([...current, s]));
};

export const getGroups = (): RegisteredGroup[] => JSON.parse(getWithMigration(GROUPS_KEY) || '[]');
export const saveGroup = (g: RegisteredGroup) => {
  const current = getGroups();
  localStorage.setItem(storageKey(GROUPS_KEY), JSON.stringify([...current, g]));
};

export const deductCredit = () => {
  const user = getCurrentUser();
  if (user && user.credits > 0) {
    user.credits -= 1;
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

export const getCurrentUser = (): User | null => {
  const stored = getWithMigration(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(storageKey(USER_KEY));
};

export const savePlan = (plan: ChallengePlan | null) => {
  if (plan === null) {
    localStorage.removeItem(storageKey(PLAN_KEY));
  } else {
    localStorage.setItem(storageKey(PLAN_KEY), JSON.stringify(plan));
  }
};

export const getPlan = (): ChallengePlan | null => {
  const stored = getWithMigration(PLAN_KEY);
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
