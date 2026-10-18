import { LogoutButton as StyledLogoutButton } from './LogoutButton.styles';

export default function LogoutButton({ disabled, onLogout }) {
  return (
    <StyledLogoutButton
      onClick={onLogout}
      disabled={disabled}
      type="button"
    >
      התנתק
    </StyledLogoutButton>
  );
}
