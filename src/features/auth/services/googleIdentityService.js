const GOOGLE_USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

export async function fetchGoogleIdentity(accessToken, { signal } = {}) {
  const response = await fetch(GOOGLE_USER_INFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Google Identity API request failed with status ${response.status}.`,
    );
  }

  const identity = await response.json();

  return {
    name: typeof identity.name === 'string' ? identity.name : null,
    email: typeof identity.email === 'string' ? identity.email : null,
    picture: typeof identity.picture === 'string' ? identity.picture : null,
  };
}
