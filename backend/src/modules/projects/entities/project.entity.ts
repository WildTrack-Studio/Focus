import { ApiProperty } from '@nestjs/swagger';

export class ProjectEntity {
  @ApiProperty({
    description: 'Identifiant unique du projet',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nom du projet',
    example: 'Étude des lions du Serengeti',
  })
  name: string;

  @ApiProperty({
    description: 'Description du projet',
    example: 'Étude comportementale des lions dans le parc national du Serengeti',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Localisation du projet',
    example: 'Parc National du Serengeti, Tanzanie',
    nullable: true,
  })
  location: string | null;

  @ApiProperty({
    description: 'Date de début du projet',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
  })
  startDate: Date | null;

  @ApiProperty({
    description: 'Date de fin prévue du projet',
    example: '2024-12-31T00:00:00.000Z',
    nullable: true,
  })
  endDate: Date | null;

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
    description: 'Nombre d\'utilisateurs assignés',
    example: 5,
    required: false,
  })
  userCount?: number;

  @ApiProperty({
    description: 'Nombre d\'images',
    example: 150,
    required: false,
  })
  imageCount?: number;

  @ApiProperty({
    description: 'Nombre de détections',
    example: 342,
    required: false,
  })
  detectionCount?: number;

  constructor(partial: Partial<ProjectEntity>) {
    Object.assign(this, partial);
  }
}
