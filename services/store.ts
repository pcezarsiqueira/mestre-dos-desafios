
import { ChallengePlan, User, UserRole, BrandingSettings, Mentorship, RegisteredStudent, RegisteredGroup } from "../types";

// Detecção dinâmica inteligente da URL da API
const getBaseApiUrl = () => {
  const { hostname, protocol, port } = window.location;
  
  // Se estivermos em desenvolvimento local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3001/api`;
  }
  
  // Em produção, se a API estiver no mesmo host
  // Caso a API esteja em um subdomínio específico, altere aqui.
  return `${protocol}//${hostname}/api`;
};

const API_URL = getBaseApiUrl();

export const registerLead = async (data: { name: string, email: string, phone: string, instagram: string }): Promise<User> => {
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
    isBlocked: false,
    avatar: `https://ui-avatars.com/api/?name=${data.name}&background=fe7501&color=fff`,
    branding: {
      primaryColor: '#fe7501',
      secondaryColor: '#10b981',
      accentColor: '#f43f5e',
      mentoryName: 'Minha Mentoria Elite',
      expertName: data.name
    }
  };

  // Sempre salva localmente primeiro para garantir que o usuário não perca o acesso
  localStorage.setItem('mestre_desafios_user', JSON.stringify(newUser));

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    if (response.ok) console.log("✅ Usuário sincronizado com o MySQL.");
  } catch (e) {
    console.warn("⚠️ Servidor offline. Operando em modo local.");
  }
  return newUser;
};

export const loginAdmin = async (email: string, pass: string): Promise<User | null> => {
    // Super Admin Hardcoded (Sempre funciona, independente do MySQL)
    if (email === 'admin@mestre.com' && pass === 'mestre@123') {
        const admin: User = { id: 'admin-001', name: 'Mestre Admin', email: 'admin@mestre.com', role: UserRole.ADMIN, credits: 999, generationsCount: 0, notificationsEnabled: true, isBlocked: false };
        localStorage.setItem('mestre_desafios_user', JSON.stringify(admin));
        return admin;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('mestre_desafios_user', JSON.stringify(user));
            return user;
        }
    } catch (e) {
        console.error("❌ Erro de conexão com a API de login:", e);
    }
    
    // Fallback: se houver um usuário no localStorage que coincida
    const stored = getCurrentUser();
    if (stored && stored.email === email) return stored;

    return null;
};

export const fetchAllUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_URL}/admin/users`);
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
    } catch (e) {
        console.error("Falha ao buscar usuários da API remota.");
    }
    return [];
};

export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem('mestre_desafios_user');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

export const savePlan = async (plan: ChallengePlan | null) => {
  if (!plan) {
      localStorage.removeItem('mestre_desafios_plan');
      return;
  }
  localStorage.setItem('mestre_desafios_plan', JSON.stringify(plan));
  try {
      await fetch(`${API_URL}/plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plan)
      });
  } catch (e) {}
};

export const getPlan = async (): Promise<ChallengePlan | null> => {
  const stored = localStorage.getItem('mestre_desafios_plan');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) { return null; }
  }
  return null;
};

export const logoutUser = () => { 
  localStorage.removeItem('mestre_desafios_user'); 
  localStorage.removeItem('mestre_desafios_plan');
};

export const deductCredit = () => {
    const user = getCurrentUser();
    if (user && (user.role === UserRole.ADMIN || user.credits > 0)) {
      if (user.role !== UserRole.ADMIN) user.credits -= 1;
      user.generationsCount += 1;
      localStorage.setItem('mestre_desafios_user', JSON.stringify(user));
      return user;
    }
    return null;
};

export const addCredits = (amount: number): User | null => {
  const user = getCurrentUser();
  if (user) {
    user.credits += amount;
    localStorage.setItem('mestre_desafios_user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const updateChallengeStatus = (day: number, completed: boolean): ChallengePlan | null => {
  const stored = localStorage.getItem('mestre_desafios_plan');
  if (!stored) return null;
  
  try {
    const plan: ChallengePlan = JSON.parse(stored);
    const challenge = plan.challenges.find(c => c.day === day);
    if (challenge) {
      challenge.completed = completed;
      savePlan(plan);
      return plan;
    }
  } catch (e) {}
  return null;
};

// Fix: Added missing export to allow Dashboard component to add comments to challenges
export const addCommentToChallenge = (day: number, studentName: string, text: string): ChallengePlan | null => {
  const stored = localStorage.getItem('mestre_desafios_plan');
  if (!stored) return null;
  
  try {
    const plan: ChallengePlan = JSON.parse(stored);
    const challenge = plan.challenges.find(c => c.day === day);
    if (challenge) {
      if (!challenge.comments) challenge.comments = [];
      challenge.comments.push({
        id: crypto.randomUUID(),
        studentName,
        text,
        timestamp: new Date().toISOString()
      });
      savePlan(plan);
      return plan;
    }
  } catch (e) {
    console.error("Erro ao adicionar comentário:", e);
  }
  return null;
};

export const getStudents = (): RegisteredStudent[] => {
  try {
    return JSON.parse(localStorage.getItem('mestre_desafios_students') || '[]');
  } catch (e) { return []; }
};

export const getGroups = (): RegisteredGroup[] => {
  try {
    return JSON.parse(localStorage.getItem('mestre_desafios_groups') || '[]');
  } catch (e) { return []; }
};

export const updateBranding = (branding: BrandingSettings) => {
  const user = getCurrentUser();
  if (user) {
    user.branding = branding;
    localStorage.setItem('mestre_desafios_user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const setStoreTenant = (slug: string) => {
  // Implementação opcional para multi-tenant local
};
