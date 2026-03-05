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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddUserToProjectDto } from './dto/add-user-to-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { ProjectEntity } from './entities/project.entity';
import { ProjectUserEntity } from './entities/project-user.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un nouveau projet (Admin uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Projet créé avec succès',
    type: ProjectEntity,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  @Auth(Role.ADMIN, Role.RESEARCHER, Role.VALIDATOR)
  @ApiOperation({
    summary: 'Récupérer tous les projets (Admin voit tout, autres voient leurs projets)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des projets récupérée',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProjectEntity' },
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
  async findAll(
    @Query() query: QueryProjectsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.findAll(query, userId, userRole);
  }

  @Get('statistics')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Récupérer les statistiques des projets' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées',
    schema: {
      type: 'object',
      properties: {
        totalProjects: { type: 'number' },
        totalImages: { type: 'number' },
        totalDetections: { type: 'number' },
        averageImagesPerProject: { type: 'number' },
        topProjects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              imageCount: { type: 'number' },
              detectionCount: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async getStatistics() {
    return this.projectsService.getStatistics();
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.RESEARCHER, Role.VALIDATOR)
  @ApiOperation({ summary: 'Récupérer un projet par son ID' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({
    status: 200,
    description: 'Projet trouvé',
    type: ProjectEntity,
  })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un projet (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({
    status: 200,
    description: 'Projet mis à jour',
    type: ProjectEntity,
  })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un projet (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({
    status: 200,
    description: 'Projet supprimé',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Projet supprimé avec succès',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Projet contient des images ou détections',
  })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.remove(id, userId);
  }

  @Post(':id/users')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Ajouter un utilisateur à un projet (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur ajouté au projet',
    type: ProjectUserEntity,
  })
  @ApiResponse({ status: 404, description: 'Projet ou utilisateur non trouvé' })
  @ApiResponse({ status: 409, description: 'Utilisateur déjà assigné' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async addUser(
    @Param('id') projectId: string,
    @Body() addUserDto: AddUserToProjectDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.projectsService.addUser(projectId, addUserDto, adminId);
  }

  @Get(':id/users')
  @Auth(Role.ADMIN, Role.RESEARCHER, Role.VALIDATOR)
  @ApiOperation({ summary: 'Lister les utilisateurs d\'un projet' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs du projet',
    type: [ProjectUserEntity],
  })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProjectUsers(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.getProjectUsers(projectId, userId, userRole);
  }

  @Delete(':projectId/users/:userId')
  @Auth(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retirer un utilisateur d\'un projet (Admin uniquement)' })
  @ApiParam({ name: 'projectId', description: 'ID du projet' })
  @ApiParam({ name: 'userId', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur retiré du projet',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Utilisateur retiré du projet avec succès',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Projet ou utilisateur non trouvé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async removeUser(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.projectsService.removeUser(projectId, userId, adminId);
  }
}
