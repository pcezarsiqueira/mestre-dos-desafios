
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantConfig } from '../types';
import { getTenantSlugFromHostname, loadTenantConfig } from '../services/tenantService';
import { setStoreTenant } from '../services/store';

interface TenantContextType {
  slug: string;
  config: TenantConfig | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  slug: 'default',
  config: null,
  isLoading: true,
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slug, setSlug] = useState('default');
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTenant = async () => {
      const currentSlug = getTenantSlugFromHostname();
      setSlug(currentSlug);
      setStoreTenant(currentSlug); // Atualiza o prefixo do store
      
      const currentConfig = await loadTenantConfig(currentSlug);
      setConfig(currentConfig);
      setIsLoading(false);
    };

    initTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ slug, config, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
