import { useState } from 'react';
import { UserRound } from 'lucide-react';
import {
  AvatarFallback,
  UserAvatar,
  UserIdentity,
  UserName,
} from './UserProfile.styles';

export default function UserProfile({ user, googleIdentity }) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState('');
  const metadata = user?.user_metadata ?? {};
  const googleIdentityData =
    user?.identities?.find((identity) => identity.provider === 'google')
      ?.identity_data ?? {};

  const displayName =
    googleIdentity?.name ??
    googleIdentityData.full_name ??
    googleIdentityData.name ??
    metadata.full_name ??
    metadata.name ??
    metadata.user_name ??
    'משתמש';
  const avatarUrl =
    googleIdentity?.picture ??
    googleIdentityData.avatar_url ??
    googleIdentityData.picture ??
    metadata.avatar_url ??
    metadata.picture ??
    metadata.profile_image_url;

  return (
    <UserIdentity>
      {avatarUrl && failedAvatarUrl !== avatarUrl ? (
        <UserAvatar
          src={avatarUrl}
          alt={`תמונת פרופיל של ${displayName}`}
          referrerPolicy="no-referrer"
          onError={() => setFailedAvatarUrl(avatarUrl)}
        />
      ) : (
        <AvatarFallback aria-hidden="true">
          <UserRound size={20} />
        </AvatarFallback>
      )}
      <UserName>{displayName}</UserName>
    </UserIdentity>
  );
}
