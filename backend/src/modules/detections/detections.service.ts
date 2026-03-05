import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateDetectionDto } from './dto/create-detection.dto';
import { UpdateDetectionDto } from './dto/update-detection.dto';
import { ValidateDetectionDto } from './dto/validate-detection.dto';
import { QueryDetectionsDto } from './dto/query-detections.dto';
import { DetectionEntity } from './entities/detection.entity';
import { Role, DetectionStatus } from '@prisma/client';

@Injectable()
export class DetectionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle détection
   */
  async create(
    createDetectionDto: CreateDetectionDto,
    userId: string,
    userRole: Role,
  ): Promise<DetectionEntity> {
    const { imageId, projectId, ...data } = createDetectionDto;

    // Vérifier que l'image existe
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image non trouvée');
    }

    // Vérifier l'accès au projet de l'image
    if (userRole !== Role.ADMIN) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: image.projectId,
          userId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException(
          "Vous n'avez pas accès à ce projet",
        );
      }
    }

    // Vérifier que l'espèce existe si fournie
    if (data.speciesId) {
      const species = await this.prisma.species.findUnique({
        where: { id: data.speciesId },
      });

      if (!species) {
        throw new NotFoundException('Espèce non trouvée');
      }
    }

    // Créer la détection
    const detection = await this.prisma.detection.create({
      data: {
        ...data,
        boundingBox: data.boundingBox as any,
        additionalData: data.additionalData
          ? (data.additionalData as any)
          : null,
        imageId,
        projectId: projectId || image.projectId,
      },
      include: {
        species: {
          select: {
            id: true,
            name: true,
            scientificName: true,
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'DETECTION_CREATED',
        entity: 'Detection',
        entityId: detection.id,
        changes: {
          imageId,
          projectId: projectId || image.projectId,
          confidence: data.confidence,
          predictedLabel: data.predictedLabel,
        },
      },
    });

    return new DetectionEntity(detection);
  }

  /**
   * Récupérer toutes les détections avec filtres
   */
  async findAll(query: QueryDetectionsDto, userId: string, userRole: Role) {
    const {
      projectId,
      imageId,
      speciesId,
      status,
      validated,
      validatedById,
      minConfidence,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Construire les filtres
    const where: any = {};

    if (projectId) {
      where.projectId = projectId;

      // Vérifier l'accès au projet pour les non-admins
      if (userRole !== Role.ADMIN) {
        const hasAccess = await this.prisma.projectUser.findFirst({
          where: {
            projectId,
            userId,
          },
        });

        if (!hasAccess) {
          throw new ForbiddenException(
            "Vous n'avez pas accès à ce projet",
          );
        }
      }
    } else if (userRole !== Role.ADMIN) {
      // Les non-admins ne voient que les détections de leurs projets
      const userProjects = await this.prisma.projectUser.findMany({
        where: { userId },
        select: { projectId: true },
      });

      where.projectId = {
        in: userProjects.map((up) => up.projectId),
      };
    }

    if (imageId) {
      where.imageId = imageId;
    }

    if (speciesId) {
      where.speciesId = speciesId;
    }

    if (status) {
      where.status = status;
    }

    if (validated !== undefined) {
      where.validated = validated;
    }

    if (validatedById) {
      where.validatedById = validatedById;
    }

    if (minConfidence !== undefined) {
      where.confidence = {
        gte: minConfidence,
      };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Récupérer les détections et le total
    const [detections, total] = await Promise.all([
      this.prisma.detection.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
        include: {
          species: {
            select: {
              id: true,
              name: true,
              scientificName: true,
            },
          },
          validatedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.detection.count({ where }),
    ]);

    return {
      data: detections.map((d) => new DetectionEntity(d)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer une détection par son ID
   */
  async findOne(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<DetectionEntity> {
    const detection = await this.prisma.detection.findUnique({
      where: { id },
      include: {
        species: {
          select: {
            id: true,
            name: true,
            scientificName: true,
          },
        },
        validatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!detection) {
      throw new NotFoundException('Détection non trouvée');
    }

    // Vérifier l'accès au projet pour les non-admins
    if (userRole !== Role.ADMIN && detection.projectId) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: detection.projectId,
          userId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException(
          "Vous n'avez pas accès à cette détection",
        );
      }
    }

    return new DetectionEntity(detection);
  }

  /**
   * Mettre à jour une détection
   */
  async update(
    id: string,
    updateDetectionDto: UpdateDetectionDto,
    userId: string,
    userRole: Role,
  ): Promise<DetectionEntity> {
    // Vérifier que la détection existe
    const existingDetection = await this.prisma.detection.findUnique({
      where: { id },
    });

    if (!existingDetection) {
      throw new NotFoundException('Détection non trouvée');
    }

    // Vérifier l'accès au projet pour les non-admins
    if (userRole !== Role.ADMIN && existingDetection.projectId) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: existingDetection.projectId,
          userId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException(
          "Vous n'avez pas accès à cette détection",
        );
      }
    }

    // Vérifier que l'espèce existe si fournie
    if (updateDetectionDto.speciesId) {
      const species = await this.prisma.species.findUnique({
        where: { id: updateDetectionDto.speciesId },
      });

      if (!species) {
        throw new NotFoundException('Espèce non trouvée');
      }
    }

    // Préparer les données
    const updateData: any = { ...updateDetectionDto };
    if (updateData.boundingBox) {
      updateData.boundingBox = updateData.boundingBox as any;
    }
    if (updateData.additionalData) {
      updateData.additionalData = updateData.additionalData as any;
    }

    // Mettre à jour la détection
    const detection = await this.prisma.detection.update({
      where: { id },
      data: updateData,
      include: {
        species: {
          select: {
            id: true,
            name: true,
            scientificName: true,
          },
        },
        validatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'DETECTION_UPDATED',
        entity: 'Detection',
        entityId: detection.id,
        changes: JSON.parse(
          JSON.stringify({ updates: updateDetectionDto, updatedBy: userId }),
        ),
      },
    });

    return new DetectionEntity(detection);
  }

  /**
   * Valider ou rejeter une détection
   */
  async validate(
    id: string,
    validateDetectionDto: ValidateDetectionDto,
    userId: string,
    userRole: Role,
  ): Promise<DetectionEntity> {
    // Seuls les validateurs et admins peuvent valider
    if (userRole !== Role.ADMIN && userRole !== Role.VALIDATOR) {
      throw new ForbiddenException(
        'Seuls les validateurs et administrateurs peuvent valider des détections',
      );
    }

    // Vérifier que la détection existe
    const existingDetection = await this.prisma.detection.findUnique({
      where: { id },
    });

    if (!existingDetection) {
      throw new NotFoundException('Détection non trouvée');
    }

    // Vérifier l'accès au projet
    if (userRole !== Role.ADMIN && existingDetection.projectId) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: existingDetection.projectId,
          userId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException(
          "Vous n'avez pas accès à cette détection",
        );
      }
    }

    // Vérifier que l'espèce existe si fournie
    if (validateDetectionDto.speciesId) {
      const species = await this.prisma.species.findUnique({
        where: { id: validateDetectionDto.speciesId },
      });

      if (!species) {
        throw new NotFoundException('Espèce non trouvée');
      }
    }

    // Mettre à jour la détection
    const updateData: any = {
      status: validateDetectionDto.status,
      validated:
        validateDetectionDto.status === DetectionStatus.VALIDATED,
      validatedById: userId,
      validatedAt: new Date(),
    };

    if (validateDetectionDto.speciesId) {
      updateData.speciesId = validateDetectionDto.speciesId;
    }

    if (validateDetectionDto.notes) {
      updateData.additionalData = {
        ...(existingDetection.additionalData as any),
        validationNotes: validateDetectionDto.notes,
      };
    }

    const detection = await this.prisma.detection.update({
      where: { id },
      data: updateData,
      include: {
        species: {
          select: {
            id: true,
            name: true,
            scientificName: true,
          },
        },
        validatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'DETECTION_VALIDATED',
        entity: 'Detection',
        entityId: detection.id,
        changes: {
          status: validateDetectionDto.status,
          validated: detection.validated,
          validatedBy: userId,
          speciesId: validateDetectionDto.speciesId,
          notes: validateDetectionDto.notes,
        },
      },
    });

    return new DetectionEntity(detection);
  }

  /**
   * Supprimer une détection
   */
  async remove(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<{ message: string }> {
    // Vérifier que la détection existe
    const detection = await this.prisma.detection.findUnique({
      where: { id },
    });

    if (!detection) {
      throw new NotFoundException('Détection non trouvée');
    }

    // Vérifier l'accès au projet pour les non-admins
    if (userRole !== Role.ADMIN && detection.projectId) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: detection.projectId,
          userId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException(
          "Vous n'avez pas accès à cette détection",
        );
      }
    }

    // Supprimer la détection
    await this.prisma.detection.delete({
      where: { id },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'DETECTION_DELETED',
        entity: 'Detection',
        entityId: id,
        changes: {
          imageId: detection.imageId,
          projectId: detection.projectId,
          confidence: detection.confidence,
          deletedBy: userId,
        },
      },
    });

    return { message: 'Détection supprimée avec succès' };
  }

  /**
   * Récupérer les statistiques des détections
   */
  async getStatistics(projectId?: string) {
    const where: any = {};
    if (projectId) {
      where.projectId = projectId;
    }

    const [
      total,
      byStatus,
      validated,
      pending,
      rejected,
      avgConfidence,
    ] = await Promise.all([
      this.prisma.detection.count({ where }),
      this.prisma.detection.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.detection.count({
        where: { ...where, validated: true },
      }),
      this.prisma.detection.count({
        where: { ...where, status: DetectionStatus.PENDING_VALIDATION },
      }),
      this.prisma.detection.count({
        where: { ...where, status: DetectionStatus.REJECTED },
      }),
      this.prisma.detection.aggregate({
        where,
        _avg: {
          confidence: true,
        },
      }),
    ]);

    const statusStats = byStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Top espèces détectées
    const topSpecies = await this.prisma.detection.groupBy({
      by: ['speciesId'],
      where: {
        ...where,
        speciesId: { not: null },
      },
      _count: true,
      orderBy: {
        _count: {
          speciesId: 'desc',
        },
      },
      take: 5,
    });

    const topSpeciesDetails = await Promise.all(
      topSpecies.map(async (item) => {
        const species = await this.prisma.species.findUnique({
          where: { id: item.speciesId! },
          select: {
            id: true,
            name: true,
            scientificName: true,
          },
        });
        return {
          species,
          count: item._count,
        };
      }),
    );

    return {
      total,
      byStatus: statusStats,
      validated,
      pending,
      rejected,
      averageConfidence: avgConfidence._avg.confidence || 0,
      topSpecies: topSpeciesDetails,
    };
  }

  /**
   * Batch validation
   */
  async batchValidate(
    ids: string[],
    status: DetectionStatus,
    userId: string,
    userRole: Role,
  ): Promise<{ updated: number; errors: string[] }> {
    // Seuls les validateurs et admins peuvent valider
    if (userRole !== Role.ADMIN && userRole !== Role.VALIDATOR) {
      throw new ForbiddenException(
        'Seuls les validateurs et administrateurs peuvent valider des détections',
      );
    }

    const errors: string[] = [];
    let updated = 0;

    for (const id of ids) {
      try {
        await this.validate(
          id,
          { status },
          userId,
          userRole,
        );
        updated++;
      } catch (error) {
        errors.push(`${id}: ${error.message}`);
      }
    }

    return { updated, errors };
  }
}
