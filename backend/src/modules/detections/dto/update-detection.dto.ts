import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsObject } from 'class-validator';
import { BoundingBoxDto } from './create-detection.dto';

export class UpdateDetectionDto {
  @ApiProperty({
    description: "ID de l'espèce",
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @ApiProperty({
    description: 'Label prédit',
    example: 'leopard',
    required: false,
  })
  @IsOptional()
  @IsString()
  predictedLabel?: string;

  @ApiProperty({
    description: 'Boîte englobante',
    type: BoundingBoxDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  boundingBox?: BoundingBoxDto;

  @ApiProperty({
    description: 'Données additionnelles',
    required: false,
  })
  @IsOptional()
  @IsObject()
  additionalData?: any;
}
