import { ApiProperty } from '@nestjs/swagger';

export class ProjectUserEntity {
  @ApiProperty({
    description: 'Identifiant unique',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID du projet',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: "ID de l'utilisateur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: "Informations de l'utilisateur",
    required: false,
  })
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };

  @ApiProperty({
    description: "Date d'ajout au projet",
    example: '2024-03-05T10:30:00.000Z',
  })
  createdAt: Date;

  constructor(partial: Partial<ProjectUserEntity>) {
    Object.assign(this, partial);
  }
}
