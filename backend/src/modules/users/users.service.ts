import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouvel utilisateur (admin uniquement)
   */
  async create(
    createUserDto: CreateUserDto,
    adminId: string,
  ): Promise<UserEntity> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        isActive: createUserDto.isActive ?? true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: user.id,
        changes: {
          email: user.email,
          role: user.role,
          createdBy: adminId,
        },
      },
    });

    return new UserEntity(user);
  }

  /**
   * Récupérer tous les utilisateurs avec pagination et filtres
   */
  async findAll(query: QueryUsersDto) {
    const {
      search,
      role,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Construire les filtres
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Récupérer les utilisateurs et le total
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => new UserEntity(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return new UserEntity(user);
  }

  /**
   * Mettre à jour un utilisateur
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    adminId: string,
  ): Promise<UserEntity> {
    // Vérifier que l'utilisateur existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Si l'email change, vérifier qu'il n'est pas déjà utilisé
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Mettre à jour l'utilisateur
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_UPDATED',
        entity: 'User',
        entityId: user.id,
        changes: JSON.parse(JSON.stringify({ updates: updateUserDto, updatedBy: adminId })),
      },
    });

    return new UserEntity(user);
  }

  /**
   * Mettre à jour le mot de passe d'un utilisateur
   */
  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
    currentUserId: string,
  ): Promise<{ message: string }> {
    // Récupérer l'utilisateur avec son mot de passe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que l'utilisateur modifie son propre mot de passe
    if (userId !== currentUserId) {
      throw new UnauthorizedException(
        'Vous ne pouvez modifier que votre propre mot de passe',
      );
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    // Vérifier que le nouveau mot de passe est différent
    const isSamePassword = await bcrypt.compare(
      updatePasswordDto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit être différent de l\'ancien',
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: userId,
        changes: {
          action: 'password_changed',
        },
      },
    });

    return { message: 'Mot de passe mis à jour avec succès' };
  }

  /**
   * Supprimer un utilisateur (soft delete)
   */
  async remove(id: string, adminId: string): Promise<{ message: string }> {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Empêcher la suppression de son propre compte
    if (id === adminId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
    }

    // Désactiver l'utilisateur (soft delete)
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_DELETED',
        entity: 'User',
        entityId: id,
        changes: {
          email: user.email,
          deletedBy: adminId,
        },
      },
    });

    return { message: 'Utilisateur désactivé avec succès' };
  }

  /**
   * Récupérer les statistiques des utilisateurs
   */
  async getStatistics() {
    const [total, activeUsers, inactiveUsers, byRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    const roleStats = byRole.reduce((acc, item) => {
      acc[item.role] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: roleStats,
    };
  }
}
