import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  StreamableFile,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ImagesService } from './images.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { QueryImagesDto } from './dto/query-images.dto';
import { ImageEntity } from './entities/image.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import * as fs from 'fs';

@ApiTags('Images')
@ApiBearerAuth()
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @Auth(Role.ADMIN, Role.RESEARCHER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload une image vers un projet' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image à uploader',
    type: UploadImageDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploadée avec succès',
    type: ImageEntity,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<ImageEntity> {
    return this.imagesService.upload(
      file,
      uploadImageDto.projectId,
      uploadImageDto.description,
      userId,
      userRole,
    );
  }

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'Récupérer toutes les images avec pagination et filtres',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des images récupérée avec succès',
    type: [ImageEntity],
  })
  async findAll(
    @Query() query: QueryImagesDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.imagesService.findAll(query, userId, userRole);
  }

  @Get('statistics')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Récupérer les statistiques des images' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
  })
  async getStatistics() {
    return this.imagesService.getStatistics();
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: "Récupérer une image par son ID" })
  @ApiResponse({
    status: 200,
    description: 'Image récupérée avec succès',
    type: ImageEntity,
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Image non trouvée' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<ImageEntity> {
    return this.imagesService.findOne(id, userId, userRole);
  }

  @Get(':id/download')
  @Auth()
  @ApiOperation({ summary: 'Télécharger une image' })
  @ApiResponse({
    status: 200,
    description: 'Image téléchargée avec succès',
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Image non trouvée' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, originalName, mimeType } =
      await this.imagesService.download(id, userId, userRole);

    const file = fs.createReadStream(filePath);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${originalName}"`,
    });

    return new StreamableFile(file);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.RESEARCHER)
  @ApiOperation({ summary: 'Mettre à jour une image' })
  @ApiResponse({
    status: 200,
    description: 'Image mise à jour avec succès',
    type: ImageEntity,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Image non trouvée' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateImageDto: UpdateImageDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<ImageEntity> {
    return this.imagesService.update(id, updateImageDto, userId, userRole);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une image' })
  @ApiResponse({
    status: 200,
    description: 'Image supprimée avec succès',
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Image non trouvée' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<{ message: string }> {
    return this.imagesService.remove(id, userId, userRole);
  }
}
