export const auth0Config = {
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '',
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || '',
  scope: 'openid profile email',
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : '',
  postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '',
};