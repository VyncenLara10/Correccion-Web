'use client';

import { Auth0Provider as Auth0ProviderSDK } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { auth0Config } from '@/lib/auth0-config';

export function Auth0Provider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const onRedirectCallback = (appState?: any) => {
    router.push(appState?.returnTo || '/dashboard');
  };

  if (!auth0Config.domain || !auth0Config.clientId) {
    console.error('Auth0 configuration is missing');
    return <>{children}</>;
  }

  return (
    <Auth0ProviderSDK
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : '',
        audience: auth0Config.audience,
        scope: auth0Config.scope,
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0ProviderSDK>
  );
}