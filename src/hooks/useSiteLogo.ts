import { useMemo } from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';
import staticLogo from '@/assets/logo.png';

export function useSiteLogo() {
  const { data } = useSiteContent('logo');
  return useMemo(() => {
    const url = (data as any)?.value?.url;
    return url || staticLogo;
  }, [data]);
}
