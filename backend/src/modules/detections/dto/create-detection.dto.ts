import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class BoundingBoxDto {
  @ApiProperty({ description: 'Coordonnée X', example: 100 })
  @IsNumber()
  @Min(0)
  x: number;

  @ApiProperty({ description: 'Coordonnée Y', example: 150 })
  @IsNumber()
  @Min(0)
  y: number;

  @ApiProperty({ description: 'Largeur', example: 200 })
  @IsNumber()
  @Min(0)
  width: number;

  @ApiProperty({ description: 'Hauteur', example: 300 })
  @IsNumber()
  @Min(0)
  height: number;
}

export class CreateDetectionDto {
  @ApiProperty({
    description: "ID de l'image",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  imageId: string;

  @ApiProperty({
    description: 'ID du projet (optionnel)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({
    description: 'Score de confiance (0-1)',
    example: 0.95,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiProperty({
    description: 'Boîte englobante',
    type: BoundingBoxDto,
    example: { x: 100, y: 150, width: 200, height: 300 },
  })
  @IsObject()
  @IsNotEmpty()
  boundingBox: BoundingBoxDto;

  @ApiProperty({
    description: "ID de l'espèce détectée",
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @ApiProperty({
    description: 'Label prédit par le modèle',
    example: 'lion',
    required: false,
  })
  @IsOptional()
  @IsString()
  predictedLabel?: string;

  @ApiProperty({
    description: 'Version du modèle ML',
    example: 'yolov8-wildlife-v1.2',
    required: false,
  })
  @IsOptional()
  @IsString()
  mlModelVersion?: string;

  @ApiProperty({
    description: 'Données additionnelles',
    example: { features: [], metadata: {} },
    required: false,
  })
  @IsOptional()
  @IsObject()
  additionalData?: any;
}
