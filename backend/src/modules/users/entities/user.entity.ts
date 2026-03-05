import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserEntity {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: "Prénom de l'utilisateur",
    example: 'John',
  })
  firstName: string | null;

  @ApiProperty({
    description: "Nom de l'utilisateur",
    example: 'Doe',
  })
  lastName: string | null;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: Role,
    example: Role.RESEARCHER,
  })
  role: Role;

  @ApiProperty({
    description: "Statut actif de l'utilisateur",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Date de dernière connexion',
    example: '2024-03-05T10:30:00.000Z',
    nullable: true,
  })
  lastLogin: Date | null;

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

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
