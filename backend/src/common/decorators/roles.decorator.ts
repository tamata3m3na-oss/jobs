import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@smartjob/shared';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
