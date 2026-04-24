import userApi from './userApi';
import type { UserProfile, PatchUserRequest } from '../types/User';

export const userService = {
  getMe: () => userApi.get<UserProfile>('/me'),
  patchMe: (patch: PatchUserRequest) => userApi.patch<UserProfile>('/me', patch),
};
