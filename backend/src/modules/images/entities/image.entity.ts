import { ApiProperty } from '@nestjs/swagger';
import { ImageStatus } from '@prisma/client';

export class ImageEntity {
  @ApiProperty({
    description: 'Identifiant unique de l\'image',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nom original du fichier',
    example: 'IMG_0123.jpg',
  })
  originalName: string;

  @ApiProperty({
    description: 'Chemin de stockage du fichier',
    example: 'projects/project-uuid/images/image-uuid.jpg',
  })
  filePath: string;

  @ApiProperty({
    description: 'URL d\'accès au fichier',
    example: 'https://minio.example.com/focus/projects/project-uuid/images/image-uuid.jpg',
    nullable: true,
  })
  url?: string;

  @ApiProperty({
    description: 'Taille du fichier en octets',
    example: 2048576,
  })
  fileSize: number;

  @ApiProperty({
    description: 'Type MIME du fichier',
    example: 'image/jpeg',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Largeur de l\'image en pixels',
    example: 1920,
    nullable: true,
  })
  width: number | null;

  @ApiProperty({
    description: 'Hauteur de l\'image en pixels',
    example: 1080,
    nullable: true,
  })
  height: number | null;

  @ApiProperty({
    description: 'Date de capture de l\'image (EXIF)',
    example: '2024-03-05T10:30:00.000Z',
    nullable: true,
  })
  capturedAt: Date | null;

  @ApiProperty({
    description: 'Localisation GPS de la capture (EXIF)',
    example: { latitude: -2.3333, longitude: 34.8333 },
    nullable: true,
  })
  gpsLocation: any | null;

  @ApiProperty({
    description: 'Métadonnées EXIF complètes',
    example: { Make: 'Canon', Model: 'EOS 5D', ISO: 800 },
    nullable: true,
  })
  exifData: any | null;

  @ApiProperty({
    description: 'Description ou notes',
    example: 'Lion mâle adulte près du point d\'eau',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Statut de traitement',
    enum: ImageStatus,
    example: ImageStatus.COMPLETED,
  })
  status: ImageStatus;

  @ApiProperty({
    description: 'ID du projet',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2024-03-05T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de mise à jour',
    example: '2024-03-05T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Nombre de détections',
    example: 3,
    required: false,
  })
  detectionCount?: number;

  constructor(partial: Partial<ImageEntity>) {
    Object.assign(this, partial);
  }
}
