/**
 * Generate random WiFi credentials
 */
export function generateWiFiCredentials() {
  // Generate a unique username
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  const username = `wifi_${timestamp}${randomStr}`.substring(0, 20);

  // Generate a strong password
  const password = generateRandomPassword(12);

  return { username, password };
}

/**
 * Generate a random password
 */
function generateRandomPassword(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Calculate credential validity end date based on plan duration
 */
export function calculateValidityEndDate(durationHours?: number): Date {
  const now = new Date();
  if (!durationHours) {
    // Default to 1 hour if not specified
    durationHours = 1;
  }
  return new Date(now.getTime() + durationHours * 60 * 60 * 1000);
}

/**
 * Format credentials for display to user
 */
export function formatCredentialsForDisplay(
  username: string,
  password: string,
  ssid: string,
  validityEnd: Date
) {
  return {
    username,
    password,
    ssid,
    validityEnd: validityEnd.toISOString(),
    expiresIn: formatExpiryTime(validityEnd),
  };
}

/**
 * Format expiry time in human-readable format
 */
function formatExpiryTime(expiryDate: Date): string {
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();

  if (diffMs <= 0) return "Expired";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m remaining`;
  }
  return `${diffMinutes}m remaining`;
}

/**
 * Generate SMS text for WiFi credentials
 */
export function generateSMSText(
  username: string,
  password: string,
  ssid: string,
  expiryTime: string
): string {
  return `Your Oloika WiFi credentials:\nNetwork: ${ssid}\nUsername: ${username}\nPassword: ${password}\nExpires in: ${expiryTime}\nThank you for using Oloika WiFi!`;
}
