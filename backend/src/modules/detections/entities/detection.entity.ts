import { ApiProperty } from '@nestjs/swagger';
import { DetectionStatus } from '@prisma/client';

export class DetectionEntity {
  @ApiProperty({
    description: 'Identifiant unique de la détection',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Score de confiance (0-1)',
    example: 0.95,
  })
  confidence: number;

  @ApiProperty({
    description: 'Boîte englobante',
    example: { x: 100, y: 150, width: 200, height: 300 },
  })
  boundingBox: any;

  @ApiProperty({
    description: "ID de l'espèce",
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  speciesId: string | null;

  @ApiProperty({
    description: 'Label prédit',
    example: 'lion',
    nullable: true,
  })
  predictedLabel: string | null;

  @ApiProperty({
    description: 'Statut de validation',
    enum: DetectionStatus,
    example: DetectionStatus.PENDING_VALIDATION,
  })
  status: DetectionStatus;

  @ApiProperty({
    description: 'Détection validée',
    example: false,
  })
  validated: boolean;

  @ApiProperty({
    description: 'ID du validateur',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  validatedById: string | null;

  @ApiProperty({
    description: 'Date de validation',
    example: '2024-03-05T10:30:00.000Z',
    nullable: true,
  })
  validatedAt: Date | null;

  @ApiProperty({
    description: 'Version du modèle ML',
    example: 'yolov8-wildlife-v1.2',
    nullable: true,
  })
  mlModelVersion: string | null;

  @ApiProperty({
    description: 'Données additionnelles',
    nullable: true,
  })
  additionalData: any | null;

  @ApiProperty({
    description: 'ID du projet',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  projectId: string | null;

  @ApiProperty({
    description: "ID de l'image",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  imageId: string;

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
    description: "Informations sur l'espèce",
    required: false,
  })
  species?: {
    id: string;
    name: string;
    scientificName: string | null;
  } | null;

  @ApiProperty({
    description: 'Informations sur le validateur',
    required: false,
  })
  validatedBy?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;

  constructor(partial: Partial<DetectionEntity>) {
    Object.assign(this, partial);
  }
}
