import { AuthStatusMessageContainer } from './AuthStatusMessage.styles';

export default function AuthStatusMessage({ children }) {
  if (!children) {
    return null;
  }

  return (
    <AuthStatusMessageContainer role="alert">
      {children}
    </AuthStatusMessageContainer>
  );
}
