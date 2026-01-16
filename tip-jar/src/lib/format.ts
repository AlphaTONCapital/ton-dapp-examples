/**
 * Format nanoTON to TON with specified decimal places
 */
export function formatTon(nanoTon: string, decimals: number = 2): string {
  const ton = Number(nanoTon) / 1e9;
  return ton.toFixed(decimals);
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
}

/**
 * Get display name from username or first name
 */
export function getDisplayName(username?: string, firstName?: string): string {
  if (username) return `@${username}`;
  if (firstName) return firstName;
  return 'Anonymous';
}
