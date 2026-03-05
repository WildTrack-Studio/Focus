import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserEntity } from './entities/user.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un nouvel utilisateur (Admin uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    type: UserEntity,
  })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.usersService.create(createUserDto, adminId);
  }

  @Get()
  @Auth(Role.ADMIN)
  @ApiOperation({
    summary: 'Récupérer tous les utilisateurs avec pagination et filtres',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserEntity' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('statistics')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Récupérer les statistiques des utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        active: { type: 'number' },
        inactive: { type: 'number' },
        byRole: {
          type: 'object',
          properties: {
            ADMIN: { type: 'number' },
            RESEARCHER: { type: 'number' },
            VALIDATOR: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async getStatistics() {
    return this.usersService.getStatistics();
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.RESEARCHER, Role.VALIDATOR)
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur (Admin uniquement)' })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.usersService.update(id, updateUserDto, adminId);
  }

  @Patch(':id/password')
  @Auth(Role.ADMIN, Role.RESEARCHER, Role.VALIDATOR)
  @ApiOperation({ summary: "Changer le mot de passe d'un utilisateur" })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe mis à jour',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Mot de passe mis à jour avec succès',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Mot de passe actuel incorrect' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.usersService.updatePassword(
      id,
      updatePasswordDto,
      currentUserId,
    );
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Désactiver un utilisateur (Soft delete - Admin uniquement)',
  })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur désactivé',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Utilisateur désactivé avec succès',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer son propre compte',
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.usersService.remove(id, adminId);
  }
}
