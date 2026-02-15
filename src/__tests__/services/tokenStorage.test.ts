jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn(),
}));

import * as storage from '../../services/auth/tokenStorage';

describe('tokenStorage', () => {
  it('returns null when no credentials', async () => {
    await expect(storage.getTokens()).resolves.toBeNull();
  });
});
