import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsUUID,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ImageStatus } from '@prisma/client';

export class QueryImagesDto {
  @ApiProperty({
    description: 'Filtrer par projet',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({
    description: 'Filtrer par statut',
    enum: ImageStatus,
    required: false,
    example: ImageStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(ImageStatus)
  status?: ImageStatus;

  @ApiProperty({
    description: 'Recherche dans les descriptions',
    required: false,
    example: 'lion',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Date de capture minimale',
    required: false,
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  capturedAfter?: string;

  @ApiProperty({
    description: 'Date de capture maximale',
    required: false,
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  capturedBefore?: string;

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
    enum: ['createdAt', 'capturedAt', 'originalName'],
  })
  @IsOptional()
  @IsString()
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
