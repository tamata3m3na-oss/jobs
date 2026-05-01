import { BaseUser, UserRole, UserStatus } from '@smartjob/shared';

export interface UserResponseDto extends BaseUser {
  role: UserRole;
  status: UserStatus;
}
