import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddUserToProjectDto {
  @ApiProperty({
    description: "ID de l'utilisateur à ajouter au projet",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide" })
  @IsNotEmpty({ message: "L'ID utilisateur est requis" })
  userId: string;
}
