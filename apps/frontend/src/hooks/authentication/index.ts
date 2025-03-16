import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { redirectGoogleOAuth } from '../../actions/auth';
import { LoginSchema } from '../../components/forms/login/schema';
import { generateCodeChallenge, generateCodeVerifier } from '../../lib/utils';

export const useAuthLogin = (callbackUrl?: string) => {
  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur',
  });

  const router = useRouter();

  const onAuthSignIn = async (email: string, password: string) => {
    const response = await signIn('credentials', {
      email,
      password,

      redirect: false,
    });

    if (!response?.error) {
      reset();
      toast.success('Welcome back!');
      router.push(callbackUrl || '/dashboard');
    } else {
      console.error(`[useAuthLogin] ${JSON.stringify(response)}`);
      toast.error(
        response.error === 'CredentialsSignin'
          ? 'Email/password is incorrect, try again'
          : 'Oops! Something went wrong.'
      );
    }
  };

  const { mutate: initiateLoginFlow, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      onAuthSignIn(email, password),
  });

  const onAuthenticateUser = handleSubmit(async (values) => {
    initiateLoginFlow({ email: values.email, password: values.password });
  });

  return {
    onAuthenticateUser,
    isPending,
    register,
    errors,
  };
};

export const useGoogleAuth = (options: { redirectUrl: string }) => {
  const initiateGoogleLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem('codeVerifier', codeVerifier);
    try {
      redirectGoogleOAuth({
        callbackUrl: `${process.env.NEXT_PUBLIC_URL}/oauth-callback`,
        redirectUrl: options.redirectUrl,
        codeChallenge,
      });
    } catch (error) {
      console.error('Error initiating Google login:', error);
    }
  };

  return {
    initiateGoogleLogin,
  };
};

export const useOAuthLogin = (callbackUrl?: string) => {
  const router = useRouter();

  const onAuthSignInWithCode = async (code: string, codeVerifier: string) => {
    const response = await signIn('oauth', {
      code,
      codeVerifier,
      redirect: false,
    });

    if (!response?.error) {
      toast.success('Authentication successful!');
      router.push(callbackUrl || '/dashboard');
    } else {
      console.error(`[useOAuthLogin] ${JSON.stringify(response)}`);
      toast.error('Oops! Something went wrong during OAuth login.');
    }
  };

  const { mutate: initiateOAuthFlow, isPending } = useMutation({
    mutationFn: ({
      code,
      verifierCode,
    }: {
      code: string;
      verifierCode: string;
    }) => onAuthSignInWithCode(code, verifierCode),
  });

  const onAuthenticateWithOAuth = async (
    code: string,
    verifierCode: string
  ) => {
    initiateOAuthFlow({ code, verifierCode });
  };

  return {
    onAuthenticateWithOAuth,
    isPending,
  };
};
