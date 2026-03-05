import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UpdateImageDto } from './dto/update-image.dto';
import { QueryImagesDto } from './dto/query-images.dto';
import { ImageEntity } from './entities/image.entity';
import { Role, ImageStatus } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

@Injectable()
export class ImagesService {
  private readonly uploadDir: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Upload une image
   */
  async upload(
    file: Express.Multer.File,
    projectId: string,
    description: string | undefined,
    userId: string,
    userRole: Role,
  ): Promise<ImageEntity> {
    // Vérifier que le projet existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Vérifier que l'utilisateur a accès au projet (sauf admin)
    if (userRole !== Role.ADMIN) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId,
          userId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException("Vous n'avez pas accès à ce projet");
      }
    }

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;
    const projectDir = path.join(this.uploadDir, projectId);
    const filePath = path.join(projectDir, fileName);

    // Créer le dossier du projet si nécessaire
    try {
      await fs.access(projectDir);
    } catch {
      await fs.mkdir(projectDir, { recursive: true });
    }

    // Sauvegarder le fichier
    await fs.writeFile(filePath, file.buffer);

    // Extraire les métadonnées (basique pour l'instant)
    const relativePath = path.join(projectId, fileName);

    // Créer l'entrée en base de données
    const image = await this.prisma.image.create({
      data: {
        originalName: file.originalname,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        description: description || null,
        status: ImageStatus.PENDING,
        projectId,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'IMAGE_UPLOADED',
        entity: 'Image',
        entityId: image.id,
        changes: {
          projectId,
          fileName: file.originalname,
          fileSize: file.size,
        },
      },
    });

    return new ImageEntity(image);
  }

  /**
   * Récupérer toutes les images avec pagination et filtres
   */
  async findAll(
    query: QueryImagesDto,
    currentUserId: string,
    userRole: Role,
  ) {
    const {
      projectId,
      status,
      search,
      capturedAfter,
      capturedBefore,
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
            userId: currentUserId,
          },
        });

        if (!hasAccess) {
          throw new ForbiddenException("Vous n'avez pas accès à ce projet");
        }
      }
    } else if (userRole !== Role.ADMIN) {
      // Les non-admins ne voient que les images de leurs projets
      const userProjects = await this.prisma.projectUser.findMany({
        where: { userId: currentUserId },
        select: { projectId: true },
      });

      where.projectId = {
        in: userProjects.map((up) => up.projectId),
      };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (capturedAfter || capturedBefore) {
      where.capturedAt = {};
      if (capturedAfter) {
        where.capturedAt.gte = new Date(capturedAfter);
      }
      if (capturedBefore) {
        where.capturedAt.lte = new Date(capturedBefore);
      }
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Récupérer les images et le total
    const [images, total] = await Promise.all([
      this.prisma.image.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
        include: {
          _count: {
            select: {
              detections: true,
            },
          },
        },
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      data: images.map(
        (image) =>
          new ImageEntity({
            ...image,
            detectionCount: image._count.detections,
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
   * Récupérer une image par son ID
   */
  async findOne(
    id: string,
    currentUserId: string,
    userRole: Role,
  ): Promise<ImageEntity> {
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            detections: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Image non trouvée');
    }

    // Vérifier l'accès au projet pour les non-admins
    if (userRole !== Role.ADMIN) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: image.projectId,
          userId: currentUserId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException("Vous n'avez pas accès à cette image");
      }
    }

    return new ImageEntity({
      ...image,
      detectionCount: image._count.detections,
    });
  }

  /**
   * Mettre à jour une image
   */
  async update(
    id: string,
    updateImageDto: UpdateImageDto,
    userId: string,
    userRole: Role,
  ): Promise<ImageEntity> {
    // Vérifier que l'image existe
    const existingImage = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!existingImage) {
      throw new NotFoundException('Image non trouvée');
    }

    // Vérifier l'accès au projet pour les non-admins
    if (userRole !== Role.ADMIN) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: existingImage.projectId,
          userId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException("Vous n'avez pas accès à cette image");
      }
    }

    // Mettre à jour l'image
    const image = await this.prisma.image.update({
      where: { id },
      data: updateImageDto,
      include: {
        _count: {
          select: {
            detections: true,
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'IMAGE_UPDATED',
        entity: 'Image',
        entityId: image.id,
        changes: JSON.parse(
          JSON.stringify({ updates: updateImageDto, updatedBy: userId }),
        ),
      },
    });

    return new ImageEntity({
      ...image,
      detectionCount: image._count.detections,
    });
  }

  /**
   * Supprimer une image
   */
  async remove(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<{ message: string }> {
    // Vérifier que l'image existe
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            detections: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Image non trouvée');
    }

    // Vérifier l'accès au projet pour les non-admins
    if (userRole !== Role.ADMIN) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: image.projectId,
          userId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException("Vous n'avez pas accès à cette image");
      }
    }

    // Supprimer le fichier physique
    const fullPath = path.join(this.uploadDir, image.filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
    }

    // Supprimer l'image de la base (cascade sur détections)
    await this.prisma.image.delete({
      where: { id },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'IMAGE_DELETED',
        entity: 'Image',
        entityId: id,
        changes: {
          fileName: image.originalName,
          projectId: image.projectId,
          deletedBy: userId,
        },
      },
    });

    return { message: 'Image supprimée avec succès' };
  }

  /**
   * Récupérer les statistiques des images
   */
  async getStatistics() {
    const [
      total,
      byStatus,
      totalSize,
      recentUploads,
    ] = await Promise.all([
      this.prisma.image.count(),
      this.prisma.image.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.image.aggregate({
        _sum: {
          fileSize: true,
        },
      }),
      this.prisma.image.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
          },
        },
      }),
    ]);

    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus: statusStats,
      totalSizeBytes: totalSize._sum.fileSize || 0,
      totalSizeMB: Math.round((totalSize._sum.fileSize || 0) / (1024 * 1024)),
      recentUploads7Days: recentUploads,
    };
  }

  /**
   * Télécharger une image
   */
  async download(
    id: string,
    currentUserId: string,
    userRole: Role,
  ): Promise<{ filePath: string; originalName: string; mimeType: string }> {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image non trouvée');
    }

    // Vérifier l'accès au projet pour les non-admins
    if (userRole !== Role.ADMIN) {
      const hasAccess = await this.prisma.projectUser.findFirst({
        where: {
          projectId: image.projectId,
          userId: currentUserId,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException("Vous n'avez pas accès à cette image");
      }
    }

    const fullPath = path.join(this.uploadDir, image.filePath);

    // Vérifier que le fichier existe
    try {
      await fs.access(fullPath);
    } catch {
      throw new NotFoundException('Fichier physique introuvable');
    }

    return {
      filePath: fullPath,
      originalName: image.originalName,
      mimeType: image.mimeType,
    };
  }
}
