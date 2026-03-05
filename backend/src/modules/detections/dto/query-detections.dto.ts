import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DetectionStatus } from '@prisma/client';

export class QueryDetectionsDto {
  @ApiProperty({
    description: 'Filtrer par projet',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({
    description: 'Filtrer par image',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  imageId?: string;

  @ApiProperty({
    description: 'Filtrer par espèce',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @ApiProperty({
    description: 'Filtrer par statut',
    enum: DetectionStatus,
    required: false,
    example: DetectionStatus.PENDING_VALIDATION,
  })
  @IsOptional()
  @IsEnum(DetectionStatus)
  status?: DetectionStatus;

  @ApiProperty({
    description: 'Filtrer par état de validation',
    required: false,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  validated?: boolean;

  @ApiProperty({
    description: 'Filtrer par validateur',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  validatedById?: string;

  @ApiProperty({
    description: 'Confiance minimale',
    required: false,
    example: 0.8,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minConfidence?: number;

  @ApiProperty({
    description: 'Numéro de page',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: "Nombre d'éléments par page",
    required: false,
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: 'Champ de tri',
    required: false,
    default: 'createdAt',
    enum: ['createdAt', 'confidence', 'validatedAt'],
  })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Ordre de tri',
    required: false,
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
