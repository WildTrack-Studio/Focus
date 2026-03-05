import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nom du projet',
    example: 'Étude des lions du Serengeti',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du projet est requis' })
  name: string;

  @ApiProperty({
    description: 'Description du projet',
    example: 'Étude comportementale des lions dans le parc national du Serengeti',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Localisation du projet',
    example: 'Parc National du Serengeti, Tanzanie',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Date de début du projet',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Date de fin prévue du projet',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
