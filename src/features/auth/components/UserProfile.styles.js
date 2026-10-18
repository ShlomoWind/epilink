import styled from 'styled-components';

export const UserIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

export const UserAvatar = styled.img`
  display: block;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e5e7eb;
`;

export const AvatarFallback = styled.span`
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: 50%;
  color: #4b5563;
  background-color: #e5e7eb;
`;

export const UserName = styled.span`
  color: #111827;
  font-size: 0.875rem;
  font-weight: 600;
`;
