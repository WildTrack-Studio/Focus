import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { DetectionStatus } from '@prisma/client';

export class ValidateDetectionDto {
  @ApiProperty({
    description: 'Statut de validation',
    enum: DetectionStatus,
    example: DetectionStatus.VALIDATED,
  })
  @IsEnum(DetectionStatus)
  status: DetectionStatus;

  @ApiProperty({
    description: "ID de l'espèce corrigée (si différente)",
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @ApiProperty({
    description: 'Notes de validation',
    example: 'Espèce confirmée, bon angle de vue',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
