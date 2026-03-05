import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddUserToProjectDto } from './dto/add-user-to-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { ProjectEntity } from './entities/project.entity';
import { ProjectUserEntity } from './entities/project-user.entity';
import { Role } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau projet
   */
  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectEntity> {
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        location: createProjectDto.location,
        startDate: createProjectDto.startDate
          ? new Date(createProjectDto.startDate)
          : null,
        endDate: createProjectDto.endDate
          ? new Date(createProjectDto.endDate)
          : null,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'PROJECT_CREATED',
        entity: 'Project',
        entityId: project.id,
        changes: {
          name: project.name,
          createdBy: userId,
        },
      },
    });

    return new ProjectEntity(project);
  }

  /**
   * Récupérer tous les projets avec pagination et filtres
   */
  async findAll(query: QueryProjectsDto, currentUserId: string, userRole: Role) {
    const {
      search,
      location,
      userId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Construire les filtres
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Si un userId est spécifié, filtrer par utilisateur assigné
    if (userId) {
      where.users = {
        some: {
          userId: userId,
        },
      };
    }

    // Les non-admins ne voient que leurs projets
    if (userRole !== Role.ADMIN) {
      where.users = {
        some: {
          userId: currentUserId,
        },
      };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Récupérer les projets et le total
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
        include: {
          _count: {
            select: {
              users: true,
              images: true,
              detections: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects.map(
        (project) =>
          new ProjectEntity({
            ...project,
            userCount: project._count.users,
            imageCount: project._count.images,
            detectionCount: project._count.detections,
          }),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer un projet par son ID
   */
  async findOne(
    id: string,
    currentUserId: string,
    userRole: Role,
  ): Promise<ProjectEntity> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            images: true,
            detections: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Vérifier que l'utilisateur a accès au projet
    if (userRole !== Role.ADMIN) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: id,
          userId: currentUserId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException("Vous n'avez pas accès à ce projet");
      }
    }

    return new ProjectEntity({
      ...project,
      userCount: project._count.users,
      imageCount: project._count.images,
      detectionCount: project._count.detections,
    });
  }

  /**
   * Mettre à jour un projet
   */
  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectEntity> {
    // Vérifier que le projet existe
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Préparer les données de mise à jour
    const updateData: any = { ...updateProjectDto };

    if (updateProjectDto.startDate) {
      updateData.startDate = new Date(updateProjectDto.startDate);
    }

    if (updateProjectDto.endDate) {
      updateData.endDate = new Date(updateProjectDto.endDate);
    }

    // Mettre à jour le projet
    const project = await this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            users: true,
            images: true,
            detections: true,
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'PROJECT_UPDATED',
        entity: 'Project',
        entityId: project.id,
        changes: JSON.parse(
          JSON.stringify({ updates: updateProjectDto, updatedBy: userId }),
        ),
      },
    });

    return new ProjectEntity({
      ...project,
      userCount: project._count.users,
      imageCount: project._count.images,
      detectionCount: project._count.detections,
    });
  }

  /**
   * Supprimer un projet
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Vérifier que le projet existe
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            images: true,
            detections: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Vérifier qu'il n'y a pas de données associées
    if (project._count.images > 0 || project._count.detections > 0) {
      throw new ConflictException(
        'Impossible de supprimer un projet contenant des images ou des détections',
      );
    }

    // Supprimer le projet (cascade sur ProjectUser)
    await this.prisma.project.delete({
      where: { id },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'PROJECT_DELETED',
        entity: 'Project',
        entityId: id,
        changes: {
          name: project.name,
          deletedBy: userId,
        },
      },
    });

    return { message: 'Projet supprimé avec succès' };
  }

  /**
   * Ajouter un utilisateur à un projet
   */
  async addUser(
    projectId: string,
    addUserDto: AddUserToProjectDto,
    adminId: string,
  ): Promise<ProjectUserEntity> {
    // Vérifier que le projet existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: addUserDto.userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que l'utilisateur n'est pas déjà assigné
    const existing = await this.prisma.projectUser.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: addUserDto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Utilisateur déjà assigné à ce projet');
    }

    // Ajouter l'utilisateur au projet
    const projectUser = await this.prisma.projectUser.create({
      data: {
        projectId,
        userId: addUserDto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_ADDED_TO_PROJECT',
        entity: 'ProjectUser',
        entityId: projectUser.id,
        changes: {
          projectId,
          userId: addUserDto.userId,
          addedBy: adminId,
        },
      },
    });

    return new ProjectUserEntity(projectUser);
  }

  /**
   * Retirer un utilisateur d'un projet
   */
  async removeUser(
    projectId: string,
    userId: string,
    adminId: string,
  ): Promise<{ message: string }> {
    // Vérifier que le projet existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Vérifier que l'utilisateur est assigné au projet
    const projectUser = await this.prisma.projectUser.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!projectUser) {
      throw new NotFoundException("Utilisateur non assigné à ce projet");
    }

    // Retirer l'utilisateur du projet
    await this.prisma.projectUser.delete({
      where: {
        id: projectUser.id,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_REMOVED_FROM_PROJECT',
        entity: 'ProjectUser',
        entityId: projectUser.id,
        changes: {
          projectId,
          userId,
          removedBy: adminId,
        },
      },
    });

    return { message: 'Utilisateur retiré du projet avec succès' };
  }

  /**
   * Lister les utilisateurs d'un projet
   */
  async getProjectUsers(
    projectId: string,
    currentUserId: string,
    userRole: Role,
  ): Promise<ProjectUserEntity[]> {
    // Vérifier que le projet existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Vérifier l'accès au projet pour les non-admins
    if (userRole !== Role.ADMIN) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId,
          userId: currentUserId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException("Vous n'avez pas accès à ce projet");
      }
    }

    // Récupérer les utilisateurs du projet
    const projectUsers = await this.prisma.projectUser.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projectUsers.map((pu) => new ProjectUserEntity(pu));
  }

  /**
   * Récupérer les statistiques des projets
   */
  async getStatistics() {
    const [
      total,
      totalImages,
      totalDetections,
      projectsWithMostImages,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.image.count(),
      this.prisma.detection.count(),
      this.prisma.project.findMany({
        take: 5,
        orderBy: {
          images: {
            _count: 'desc',
          },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              images: true,
              detections: true,
            },
          },
        },
      }),
    ]);

    return {
      totalProjects: total,
      totalImages,
      totalDetections,
      averageImagesPerProject: total > 0 ? Math.round(totalImages / total) : 0,
      topProjects: projectsWithMostImages.map((p) => ({
        id: p.id,
        name: p.name,
        imageCount: p._count.images,
        detectionCount: p._count.detections,
      })),
    };
  }
}
