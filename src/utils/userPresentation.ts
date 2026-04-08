interface ResolveDisplayNameInput {
  profileDisplayName?: string | null;
  authUserName?: string | null;
  email?: string | null;
}

interface ResolveAvatarInput {
  profilePictureUrl?: string | null;
  authPictureUrl?: string | null;
}

export function getTimeGreeting(now: Date = new Date()): string {
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Chào buổi sáng';
  }

  if (hour >= 12 && hour < 18) {
    return 'Chào buổi chiều';
  }

  return 'Chào buổi tối';
}

export function resolveDisplayName({
  profileDisplayName,
  authUserName,
  email,
}: ResolveDisplayNameInput): string {
  const profileName = (profileDisplayName ?? '').trim();
  if (profileName) return profileName;

  const userName = (authUserName ?? '').trim();
  if (userName) return userName;

  const emailValue = (email ?? '').trim();
  if (emailValue) {
    const localPart = emailValue.split('@')[0]?.trim();
    if (localPart) return localPart;
  }

  return 'bạn';
}

export function resolveAvatarUrl({
  profilePictureUrl,
  authPictureUrl,
}: ResolveAvatarInput): string | null {
  const profileAvatar = (profilePictureUrl ?? '').trim();
  if (profileAvatar) return profileAvatar;

  const authAvatar = (authPictureUrl ?? '').trim();
  if (authAvatar) return authAvatar;

  return null;
}
