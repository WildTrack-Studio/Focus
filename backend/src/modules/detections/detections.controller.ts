import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DetectionsService } from './detections.service';
import { CreateDetectionDto } from './dto/create-detection.dto';
import { UpdateDetectionDto } from './dto/update-detection.dto';
import { ValidateDetectionDto } from './dto/validate-detection.dto';
import { QueryDetectionsDto } from './dto/query-detections.dto';
import { DetectionEntity } from './entities/detection.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, DetectionStatus } from '@prisma/client';

@ApiTags('Detections')
@ApiBearerAuth()
@Controller('detections')
export class DetectionsController {
  constructor(private readonly detectionsService: DetectionsService) {}

  @Post()
  @Auth(Role.ADMIN, Role.RESEARCHER)
  @ApiOperation({ summary: 'Créer une nouvelle détection' })
  @ApiResponse({
    status: 201,
    description: 'Détection créée avec succès',
    type: DetectionEntity,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Image ou espèce non trouvée' })
  async create(
    @Body() createDetectionDto: CreateDetectionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<DetectionEntity> {
    return this.detectionsService.create(
      createDetectionDto,
      userId,
      userRole,
    );
  }

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'Récupérer toutes les détections avec filtres',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des détections récupérée avec succès',
    type: [DetectionEntity],
  })
  async findAll(
    @Query() query: QueryDetectionsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.detectionsService.findAll(query, userId, userRole);
  }

  @Get('statistics')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Récupérer les statistiques des détections' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
  })
  async getStatistics(@Query('projectId') projectId?: string) {
    return this.detectionsService.getStatistics(projectId);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Récupérer une détection par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Détection récupérée avec succès',
    type: DetectionEntity,
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Détection non trouvée' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<DetectionEntity> {
    return this.detectionsService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.RESEARCHER)
  @ApiOperation({ summary: 'Mettre à jour une détection' })
  @ApiResponse({
    status: 200,
    description: 'Détection mise à jour avec succès',
    type: DetectionEntity,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Détection non trouvée' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDetectionDto: UpdateDetectionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<DetectionEntity> {
    return this.detectionsService.update(
      id,
      updateDetectionDto,
      userId,
      userRole,
    );
  }

  @Post(':id/validate')
  @Auth(Role.ADMIN, Role.VALIDATOR)
  @ApiOperation({ summary: 'Valider ou rejeter une détection' })
  @ApiResponse({
    status: 200,
    description: 'Détection validée avec succès',
    type: DetectionEntity,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Détection non trouvée' })
  async validate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() validateDetectionDto: ValidateDetectionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<DetectionEntity> {
    return this.detectionsService.validate(
      id,
      validateDetectionDto,
      userId,
      userRole,
    );
  }

  @Post('batch/validate')
  @Auth(Role.ADMIN, Role.VALIDATOR)
  @ApiOperation({ summary: 'Validation en lot de plusieurs détections' })
  @ApiResponse({
    status: 200,
    description: 'Validation en lot effectuée',
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async batchValidate(
    @Body() body: { ids: string[]; status: DetectionStatus },
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.detectionsService.batchValidate(
      body.ids,
      body.status,
      userId,
      userRole,
    );
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une détection' })
  @ApiResponse({
    status: 200,
    description: 'Détection supprimée avec succès',
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Détection non trouvée' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<{ message: string }> {
    return this.detectionsService.remove(id, userId, userRole);
  }
}
