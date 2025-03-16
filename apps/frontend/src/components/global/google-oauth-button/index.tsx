'use client';

import { Button } from '@kuiiksoft/ui/components';
import { useGoogleAuth } from '../../../hooks/authentication';
import { Google } from '../../../icons';
import { Loader } from '../loader';

type GoogleAuthButtonProps = {
  method: 'register' | 'login';
  redirectUrl: string;
};

export const GoogleAuthButton = ({
  method,
  redirectUrl,
}: GoogleAuthButtonProps) => {
  const { initiateGoogleLogin } = useGoogleAuth({ redirectUrl });
  return (
    <Button
      onClick={initiateGoogleLogin}
      className="w-full rounded-2xl flex gap-3 bg-themeBlack border-themeGray"
      variant="outline"
    >
      <Loader loading={false}>
        <Google />
        Google
      </Loader>
    </Button>
  );
};
