'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useOAuthLogin } from '../../../hooks/authentication';

const OAuthCallbackPage = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl') || '/dashboard';
  const { onAuthenticateWithOAuth, isPending } = useOAuthLogin(redirectUrl);

  const [authAttempted, setAuthAttempted] = useState(false); // Estado para rastrear el intento de autenticación
  const [authError, setAuthError] = useState<string | null>(null); // Estado para errores

  useEffect(() => {
    if (authAttempted) return; // Evitar múltiples intentos

    const code = searchParams.get('code');
    const codeVerifier = localStorage.getItem('codeVerifier');

    if (code && codeVerifier) {
      setAuthAttempted(true); // Marcar que se intentó la autenticación
      onAuthenticateWithOAuth(code, codeVerifier).catch((error) => {
        setAuthError('Failed to authenticate. Please try again.');
        console.error('[OAuthCallbackPage]', error);
      });
    } else {
      setAuthError('Missing authorization code or verifier.');
    }
  }, [searchParams, onAuthenticateWithOAuth, authAttempted]);

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-500">{authError}</p>
        <div className="flex gap-2">
          <button
            onClick={() => (window.location.href = '/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Login
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      {isPending ? <p>Authenticating...</p> : <p>Redirecting...</p>}
    </div>
  );
};

export default OAuthCallbackPage;
