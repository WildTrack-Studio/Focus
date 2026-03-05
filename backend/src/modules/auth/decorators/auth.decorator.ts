import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Decorator to combine JWT authentication and optional role-based access control
 * Usage:
 *  - @Auth() - Requires authentication only
 *  - @Auth(UserRole.ADMIN) - Requires authentication and ADMIN role
 *  - @Auth(UserRole.ADMIN, UserRole.RESEARCHER) - Requires authentication and one of the specified roles
 */
export function Auth(...roles: string[]) {
  const decorators = [
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  ];

  if (roles.length > 0) {
    decorators.push(Roles(...(roles as any)));
  }

  return applyDecorators(...decorators);
}
