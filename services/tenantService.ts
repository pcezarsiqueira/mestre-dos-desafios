
import { TenantConfig } from '../types';

// Alterado de 'http://localhost:3001/api' para '/api' para evitar erros de Mixed Content (HTTP vs HTTPS)
const API_URL = '/api';

export const getTenantSlugFromHostname = (): string => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'default';
  }

  const parts = hostname.split('.');
  if (parts.length > 2) {
    const slug = parts[0];
    if (slug === 'www' || slug === 'app') return 'default';
    return slug;
  }

  return 'default';
};

export const loadTenantConfig = async (slug: string): Promise<TenantConfig> => {
  try {
    // 1. Tenta buscar no banco de dados via API usando caminho relativo
    const response = await fetch(`${API_URL}/tenants/${slug}`);
    if (response.ok) {
      const config = await response.json();
      return {
        ...config,
        isAdminTenant: slug === 'default'
      };
    }

    // 2. Fallback para arquivo JSON local (legado/padrão)
    const localResponse = await fetch(`/tenants/${slug}.json`);
    if (localResponse.ok) {
      const config = await localResponse.json();
      return {
        ...config,
        isAdminTenant: slug === 'default'
      };
    }

    throw new Error('Config not found');
  } catch (error) {
    console.warn(`Config para [${slug}] não encontrada. Usando default.`);
    if (slug !== 'default') return loadTenantConfig('default');
    
    return {
      slug: 'default',
      isAdminTenant: true,
      branding: {
        primaryColor: '#fe7501',
        secondaryColor: '#10b981',
        accentColor: '#f43f5e',
        mentoryName: 'Mestre dos Desafios',
        expertName: 'Admin'
      },
      landing: {
        headline: 'Escale sua Mentoria com Desafios de 21 Dias',
        subheadline: 'Crie experiências imersivas e gamificadas com IA.',
        ctaText: 'Começar Agora'
      },
      tracks: []
    };
  }
};

export const saveTenantConfig = async (config: { slug: string, mentorId: string, branding: any, landing: any }) => {
  const response = await fetch(`${API_URL}/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao salvar configuração de subdomínio');
  }
  return await response.json();
};
