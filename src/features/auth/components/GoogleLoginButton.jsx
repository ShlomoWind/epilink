import { LogIn } from 'lucide-react';
import { LoginButton as StyledLoginButton } from './GoogleLoginButton.styles';

export default function GoogleLoginButton({
  disabled,
  isLoading,
  isSubmitting,
  onLogin,
}) {
  return (
    <StyledLoginButton
      onClick={onLogin}
      disabled={disabled || isLoading || isSubmitting}
      type="button"
    >
      <LogIn size={18} />
      {isLoading ? 'טוען...' : isSubmitting ? 'מתחבר...' : 'התחבר עם Google'}
    </StyledLoginButton>
  );
}
