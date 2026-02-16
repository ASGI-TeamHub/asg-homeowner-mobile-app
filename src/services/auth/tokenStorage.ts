import * as Keychain from 'react-native-keychain';
import { AuthToken } from '../../types';

const SERVICE = 'asg_homeowner_tokens';
const USERNAME = 'auth_tokens';

export const storeTokens = async (tokens: AuthToken): Promise<void> => {
  await Keychain.setGenericPassword(USERNAME, JSON.stringify(tokens), { service: SERVICE });
};

export const getTokens = async (): Promise<AuthToken | null> => {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE });
  if (!credentials) {
    return null;
  }

  try {
    return JSON.parse(credentials.password) as AuthToken;
  } catch {
    return null;
  }
};

export const clearTokens = async (): Promise<void> => {
  await Keychain.resetGenericPassword({ service: SERVICE });
};
