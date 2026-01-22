
import { ChallengePlan, User, UserRole, BrandingSettings, Mentorship, RegisteredStudent, RegisteredGroup } from "../types";

// Detecção dinâmica da URL da API
const getBaseApiUrl = () => {
  const { hostname, protocol } = window.location;
  // Se estivermos em localhost, usamos a porta 3001
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3001/api`;
  }
  // Em produção, assumimos que a API está no mesmo host ou em um subdomínio 'api'
  // Ajuste conforme sua infraestrutura real. Aqui usamos o padrão de API no mesmo servidor.
  return `${protocol}//${hostname}/api`;
};

const API_URL = getBaseApiUrl();

// Variável para controle de tenant (subdomínio) no armazenamento local
let storeTenant = 'default';

/**
 * Atualiza o prefixo ou identificador do tenant atual para o armazenamento.
 */
export const setStoreTenant = (slug: string) => {
  storeTenant = slug;
};

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

  localStorage.setItem('mestre_desafios_user', JSON.stringify(newUser));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) {
        console.log("Usuário registrado com sucesso no banco de dados.");
    }
  } catch (e) {
    console.warn("Backend indisponível no momento. Seus dados estão salvos localmente e serão sincronizados depois.");
  }
  return newUser;
};

export const loginAdmin = async (email: string, pass: string): Promise<User | null> => {
    // Super Admin Hardcoded para emergências
    if (email === 'admin@mestre.com' && pass === 'mestre@123') {
        const admin: User = { id: 'admin-001', name: 'Mestre Admin', email: 'admin@mestre.com', role: UserRole.ADMIN, credits: 999, generationsCount: 0, notificationsEnabled: true, isBlocked: false };
        localStorage.setItem('mestre_desafios_user', JSON.stringify(admin));
        return admin;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('mestre_desafios_user', JSON.stringify(user));
            return user;
        }
    } catch (e) {
        console.warn("Falha de conexão com o servidor de login.");
    }
    
    // Fallback: se já houver um usuário logado localmente com o mesmo e-mail
    const stored = getCurrentUser();
    if (stored && stored.email === email) return stored;

    return null;
};

// --- ADMIN ACTIONS ---

export const fetchAllUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_URL}/admin/users`);
        if (!response.ok) throw new Error("Erro ao buscar usuários");
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Erro fetchAllUsers:", e);
        return [];
    }
};

export const updateUserInfo = async (id: string, data: any) => {
    try {
        const response = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.ok;
    } catch (e) { return false; }
};

export const modifyUserCredits = async (id: string, amount: number) => {
    try {
        const response = await fetch(`${API_URL}/admin/users/${id}/credits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        return response.ok;
    } catch (e) { return false; }
};

export const toggleUserBlockStatus = async (id: string, isBlocked: boolean) => {
    try {
        const response = await fetch(`${API_URL}/admin/users/${id}/block`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_blocked: isBlocked })
        });
        return response.ok;
    } catch (e) { return false; }
};

export const deleteUserAccount = async (id: string) => {
    try {
        const response = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (e) { return false; }
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
  if (plan === null) {
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

export const getPlan = async (mentorId?: string): Promise<ChallengePlan | null> => {
  if (mentorId) {
      try {
          const response = await fetch(`${API_URL}/plans/${mentorId}`);
          if (response.ok) return await response.json();
      } catch (e) {}
  }
  const stored = localStorage.getItem('mestre_desafios_plan');
  return stored ? JSON.parse(stored) : null;
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
  } catch (e) {
    console.error("Erro ao atualizar status do desafio", e);
  }
  return null;
};

export const addCommentToChallenge = (day: number, studentName: string, text: string): ChallengePlan | null => {
  const stored = localStorage.getItem('mestre_desafios_plan');
  if (!stored) return null;
  
  try {
    const plan: ChallengePlan = JSON.parse(stored);
    const challenge = plan.challenges.find(c => c.day === day);
    
    if (challenge) {
      const newComment = {
        id: crypto.randomUUID(),
        studentName,
        text,
        timestamp: new Date().toISOString()
      };
      if (!challenge.comments) challenge.comments = [];
      challenge.comments.push(newComment);
      savePlan(plan);
      return plan;
    }
  } catch (e) {}
  return null;
};

export const getMentorships = (): Mentorship[] => {
  try {
    return JSON.parse(localStorage.getItem('mestre_desafios_mentorships') || '[]');
  } catch (e) { return []; }
};

export const saveMentorship = (m: Mentorship) => {
  const ms = getMentorships();
  ms.push(m);
  localStorage.setItem('mestre_desafios_mentorships', JSON.stringify(ms));
  return m;
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
