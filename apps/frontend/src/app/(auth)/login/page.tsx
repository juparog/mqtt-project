'use client';

import { Separator } from '@kuiiksoft/ui/components';
import { useSearchParams } from 'next/navigation';
import LoginForm from '../../../components/forms/login/index';
import { GoogleAuthButton } from '../../../components/global/google-oauth-button';

const LoginPage = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <>
      <h5 className="font-bold text-base text-themeTextWhite">Login</h5>
      <p className="text-themeTextGray leading-tight">
        Connect your devices and machines around the world, monitor and optimize
        your devices to the maximum. Login form
      </p>
      <LoginForm callbackUrl={callbackUrl} />
      <div className="my-10 w-full relative">
        <div className="bg-black p-3 absolute text-themeTextGray text-xs top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          OR CONTINUE WITH
        </div>
        <Separator orientation="horizontal" className="bg-themeGray" />
      </div>
      <GoogleAuthButton method="login" redirectUrl={callbackUrl} />
    </>
  );
};

export default LoginPage;
