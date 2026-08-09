interface PasswordVisibilityState {
  type: 'password' | 'text';
  labelKey: 'auth.password.show' | 'auth.password.hide';
}

export const getPasswordVisibilityState = (
  isVisible: boolean,
): PasswordVisibilityState => (isVisible
  ? { type: 'text', labelKey: 'auth.password.hide' }
  : { type: 'password', labelKey: 'auth.password.show' });
