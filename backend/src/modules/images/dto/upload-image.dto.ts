import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    description: 'ID du projet auquel l\'image appartient',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'L\'ID du projet doit être un UUID valide' })
  @IsNotEmpty({ message: 'L\'ID du projet est requis' })
  projectId: string;

  @ApiProperty({
    description: 'Description ou notes sur l\'image',
    example: 'Lion mâle adulte près du point d\'eau',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Fichier image (JPEG, PNG, etc.)',
  })
  file: any;
}
