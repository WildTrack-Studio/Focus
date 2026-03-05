import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator to protect routes by required roles
 * Usage: @Roles(Role.ADMIN, Role.RESEARCHER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
