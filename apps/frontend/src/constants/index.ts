import { AuthFormProps, LOGIN_FORM } from './forms';
import { LANDING_PAGE_MENU, MenuProps } from './menus';

type ConstantsProps = {
  signInForm: AuthFormProps[];
  landingPageMenu: MenuProps[];
};

export const CONSTANTS: ConstantsProps = {
  landingPageMenu: LANDING_PAGE_MENU,
  signInForm: LOGIN_FORM,
};
