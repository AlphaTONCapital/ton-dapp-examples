import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface InitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

/**
 * Parse Telegram init data from raw query string
 */
export function parseInitData(initDataRaw: string): InitData {
  const params = new URLSearchParams(initDataRaw);
  const result: Record<string, unknown> = {};

  for (const [key, value] of params.entries()) {
    try {
      result[key] = JSON.parse(value);
    } catch {
      result[key] = value;
    }
  }

  return result as unknown as InitData;
}

/**
 * Validate Telegram init data signature
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(
  initDataRaw: string,
  botToken: string,
  options: { expiresIn?: number } = {}
): void {
  const params = new URLSearchParams(initDataRaw);
  const hash = params.get('hash');

  if (!hash) {
    throw new Error('Hash is missing from init data');
  }

  // Check expiration
  const authDate = params.get('auth_date');
  if (!authDate) {
    throw new Error('auth_date is missing from init data');
  }

  const { expiresIn = 86400 } = options; // Default 24 hours
  if (expiresIn > 0) {
    const authTimestamp = parseInt(authDate, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authTimestamp > expiresIn) {
      throw new Error('Init data has expired');
    }
  }

  // Create data-check-string by sorting params alphabetically (excluding hash)
  const dataCheckArr: string[] = [];
  const sortedParams = Array.from(params.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  for (const [key, value] of sortedParams) {
    if (key !== 'hash') {
      dataCheckArr.push(`${key}=${value}`);
    }
  }

  const dataCheckString = dataCheckArr.join('\n');

  // Create secret key: HMAC-SHA256(botToken, "WebAppData")
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Calculate hash: HMAC-SHA256(dataCheckString, secretKey)
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) {
    throw new Error('Invalid init data signature');
  }
}
