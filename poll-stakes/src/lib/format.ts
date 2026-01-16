/**
 * Format nanoTON to TON with specified decimal places
 */
export function formatTon(nanoTon: string, decimals: number = 2): string {
  const ton = Number(nanoTon) / 1e9;
  return ton.toFixed(decimals);
}

/**
 * Format seconds to time remaining (e.g., "2h 30m")
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 0) return 'Expired';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    // Future date - format as time remaining
    return formatTimeRemaining(Math.abs(diffInSeconds));
  }

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
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

/**
 * Calculate percentage of pool
 */
export function calculatePoolPercentage(amount: string, total: string): number {
  const amountNum = Number(amount);
  const totalNum = Number(total);
  if (totalNum === 0) return 0;
  return Math.round((amountNum / totalNum) * 100);
}
