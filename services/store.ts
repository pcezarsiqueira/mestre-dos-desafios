
import { ChallengePlan, User, UserRole, BrandingSettings, Mentorship, RegisteredStudent, RegisteredGroup } from "../types";

const API_URL = 'http://localhost:3001/api';

// Variável para controle de tenant (subdomínio) no armazenamento local
let storeTenant = 'default';

/**
 * Atualiza o prefixo ou identificador do tenant atual para o armazenamento.
 */
// Adicionando função para configurar o tenant atual
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

  try {
    await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    localStorage.setItem('mestre_desafios_user', JSON.stringify(newUser));
  } catch (e) {
    localStorage.setItem('mestre_desafios_user', JSON.stringify(newUser));
  }
  return newUser;
};

export const loginAdmin = async (email: string, pass: string): Promise<User | null> => {
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
        } else {
            const err = await response.json();
            alert(err.error || "Erro no login");
        }
    } catch (e) {
        if (email === 'admin@mestre.com' && pass === 'mestre@123') {
            const admin: User = { id: 'admin-001', name: 'Mestre Admin', email: 'admin@mestre.com', role: UserRole.ADMIN, credits: 999, generationsCount: 0, notificationsEnabled: true, isBlocked: false };
            localStorage.setItem('mestre_desafios_user', JSON.stringify(admin));
            return admin;
        }
    }
    return null;
};

// --- ADMIN ACTIONS ---

export const fetchAllUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/admin/users`);
    if (!response.ok) throw new Error("Erro ao buscar usuários");
    return await response.json();
};

export const updateUserInfo = async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.ok;
};

export const modifyUserCredits = async (id: string, amount: number) => {
    const response = await fetch(`${API_URL}/admin/users/${id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });
    return response.ok;
};

export const toggleUserBlockStatus = async (id: string, isBlocked: boolean) => {
    const response = await fetch(`${API_URL}/admin/users/${id}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_blocked: isBlocked })
    });
    return response.ok;
};

export const deleteUserAccount = async (id: string) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE'
    });
    return response.ok;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('mestre_desafios_user');
  return stored ? JSON.parse(stored) : null;
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

export const logoutUser = () => { localStorage.removeItem('mestre_desafios_user'); };

/**
 * Deduz um crédito do usuário atual e atualiza o contador de gerações.
 */
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

/**
 * Adiciona créditos localmente ao usuário atual. Usado após fluxo de pagamento.
 */
// Adiciona créditos localmente (após compra simulada)
export const addCredits = (amount: number): User | null => {
  const user = getCurrentUser();
  if (user) {
    user.credits += amount;
    localStorage.setItem('mestre_desafios_user', JSON.stringify(user));
    return user;
  }
  return null;
};

/**
 * Atualiza o status de completado de um desafio para um dia específico.
 */
// Atualiza o status de um desafio no plano atual
export const updateChallengeStatus = (day: number, completed: boolean): ChallengePlan | null => {
  const stored = localStorage.getItem('mestre_desafios_plan');
  if (!stored) return null;
  
  const plan: ChallengePlan = JSON.parse(stored);
  const challenge = plan.challenges.find(c => c.day === day);
  
  if (challenge) {
    challenge.completed = completed;
    savePlan(plan);
    return plan;
  }
  return null;
};

/**
 * Adiciona um comentário de feedback de aluno em um desafio.
 */
// Adiciona um comentário a um desafio específico
export const addCommentToChallenge = (day: number, studentName: string, text: string): ChallengePlan | null => {
  const stored = localStorage.getItem('mestre_desafios_plan');
  if (!stored) return null;
  
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
  return null;
};

export const getMentorships = (): Mentorship[] => JSON.parse(localStorage.getItem('mestre_desafios_mentorships') || '[]');
export const saveMentorship = (m: Mentorship) => {
  const ms = getMentorships();
  ms.push(m);
  localStorage.setItem('mestre_desafios_mentorships', JSON.stringify(ms));
  return m;
};
export const getStudents = (): RegisteredStudent[] => JSON.parse(localStorage.getItem('mestre_desafios_students') || '[]');
export const getGroups = (): RegisteredGroup[] => JSON.parse(localStorage.getItem('mestre_desafios_groups') || '[]');

export const updateBranding = (branding: BrandingSettings) => {
  const user = getCurrentUser();
  if (user) {
    user.branding = branding;
    localStorage.setItem('mestre_desafios_user', JSON.stringify(user));
    return user;
  }
  return null;
};
