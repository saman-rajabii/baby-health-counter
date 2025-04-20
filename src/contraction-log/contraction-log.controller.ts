import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ContractionLogService } from './contraction-log.service';
import { ContractionLog } from '../entities/contraction-log.entity';
import { CreateContractionLogDto } from './dto/create-contraction-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('contraction-logs')
@ApiBearerAuth('JWT')
@Controller('contraction-logs')
@UseGuards(JwtAuthGuard)
export class ContractionLogController {
  constructor(private readonly contractionLogService: ContractionLogService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contraction log' })
  @ApiBody({ type: CreateContractionLogDto })
  @ApiCreatedResponse({
    description: 'Contraction log created successfully',
    type: ContractionLog,
  })
  @ApiResponse({ status: 404, description: 'Contraction counter not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Body() createContractionLogDto: CreateContractionLogDto,
  ): Promise<ContractionLog> {
    try {
      return await this.contractionLogService.create(createContractionLogDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to create contraction log',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('counter/:counterId')
  @ApiOperation({ summary: 'Get all contraction logs for a specific counter' })
  @ApiParam({
    name: 'counterId',
    description: 'ID of the contraction counter',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Retrieved all contraction logs for the specified counter',
    type: [ContractionLog],
  })
  @ApiNotFoundResponse({ description: 'Contraction counter not found' })
  async findByCounter(
    @Param('counterId', ParseUUIDPipe) counterId: string,
  ): Promise<ContractionLog[]> {
    try {
      return await this.contractionLogService.findByCounterId(counterId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to fetch contraction logs',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contraction log by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the contraction log',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Retrieved the contraction log',
    type: ContractionLog,
  })
  @ApiNotFoundResponse({ description: 'Contraction log not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContractionLog> {
    const log = await this.contractionLogService.findById(id);
    if (!log) {
      throw new HttpException(
        'Contraction log not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return log;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contraction log' })
  @ApiParam({
    name: 'id',
    description: 'ID of the contraction log to delete',
    type: 'string',
  })
  @ApiOkResponse({ description: 'Contraction log deleted successfully' })
  @ApiNotFoundResponse({ description: 'Contraction log not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    const deleted = await this.contractionLogService.remove(id);
    if (!deleted) {
      throw new HttpException(
        'Contraction log not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { success: true };
  }
}
