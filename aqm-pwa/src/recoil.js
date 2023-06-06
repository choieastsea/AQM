import { atom } from 'recoil';

const isAuthenticated = atom({
  key: 'isAthenticated',
  default: false,
});
const fitbitToken = atom({
  key: 'fitbittoken',
  default: { accessToken: '', refreshToken: '', userId: '' },
});

export { isAuthenticated, fitbitToken };
