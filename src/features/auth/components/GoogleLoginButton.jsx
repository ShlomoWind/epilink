import { LogIn } from 'lucide-react';
import { LoginButton as StyledLoginButton } from './GoogleLoginButton.styles';

export default function GoogleLoginButton({
  disabled,
  fullWidth = false,
  isLoading,
  isSubmitting,
  onLogin,
}) {
  return (
    <StyledLoginButton
      onClick={onLogin}
      disabled={disabled || isLoading || isSubmitting}
      $fullWidth={fullWidth}
      type="button"
    >
      <LogIn size={18} />
      {isLoading ? 'טוען...' : isSubmitting ? 'מתחבר...' : 'התחבר עם Google'}
    </StyledLoginButton>
  );
}
