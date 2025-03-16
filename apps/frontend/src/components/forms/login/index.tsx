'use client';

import { Button } from '@kuiiksoft/ui/components';
import { CONSTANTS } from '../../../constants/index';
import { useAuthLogin } from '../../../hooks/authentication';
import { FormGenerator } from '../../global/form-generator';
import { Loader } from '../../global/loader';

type Props = {
  callbackUrl?: string | undefined;
};

const LoginForm = (props: Props) => {
  const { isPending, onAuthenticateUser, register, errors } = useAuthLogin(
    props.callbackUrl
  );

  return (
    <form className="flex flex-col gap-3 mt-10" onSubmit={onAuthenticateUser}>
      {CONSTANTS.signInForm.map((field) => (
        <FormGenerator
          {...field}
          key={field.id}
          register={register}
          errors={errors}
        />
      ))}
      <Button type="submit" className="rounded-2xl">
        <Loader loading={isPending}>Login with Email</Loader>
      </Button>
    </form>
  );
};

export default LoginForm;
