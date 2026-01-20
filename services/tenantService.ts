
import { TenantConfig } from '../types';

export const getTenantSlugFromHostname = (): string => {
  const hostname = window.location.hostname;
  
  // Localhost / IPs
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'default';
  }

  const parts = hostname.split('.');
  
  // Se for slug.mestredosdesafios.com.br (parts = [slug, mestredosdesafios, com, br])
  // Se for mestredosdesafios.com.br (parts = [mestredosdesafios, com, br])
  if (parts.length > 2) {
    const slug = parts[0];
    if (slug === 'www' || slug === 'app') return 'default';
    return slug;
  }

  return 'default';
};

export const loadTenantConfig = async (slug: string): Promise<TenantConfig> => {
  try {
    const response = await fetch(`/tenants/${slug}.json`);
    if (!response.ok) throw new Error('Tenant not found');
    const config = await response.json();
    return {
      ...config,
      isAdminTenant: slug === 'default'
    };
  } catch (error) {
    console.warn(`Config para [${slug}] não encontrada. Usando default.`);
    // Se falhar, tenta carregar o default
    if (slug !== 'default') return loadTenantConfig('default');
    
    // Fallback hardcoded se até o default.json falhar
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
