import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ImageStatus } from '@prisma/client';

export class UpdateImageDto {
  @ApiProperty({
    description: 'Description ou notes sur l\'image',
    example: 'Lion mâle adulte près du point d\'eau - Mise à jour',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Statut de traitement de l\'image',
    enum: ImageStatus,
    example: ImageStatus.COMPLETED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ImageStatus)
  status?: ImageStatus;
}
