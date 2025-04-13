import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { KickLogService } from './kick-log.service';
import { KickLog } from '../entities/kick-log.entity';
import { CreateKickLogDto } from './dto';
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
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { KickLogDto, SuccessResponseDto } from '../swagger/counter.responses';

@ApiTags('kick-logs')
@ApiBearerAuth('JWT')
@Controller('kick-logs')
@UseGuards(JwtAuthGuard)
export class KickLogController {
  constructor(private readonly kickLogService: KickLogService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new kick log' })
  @ApiBody({ type: CreateKickLogDto })
  @ApiCreatedResponse({
    description: 'Kick log created successfully',
    type: KickLogDto,
  })
  @ApiNotFoundResponse({ description: 'Kick counter not found' })
  @ApiForbiddenResponse({
    description: 'You do not have permission to add logs to this counter',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Body() createKickLogDto: CreateKickLogDto,
    @Req() req,
  ): Promise<KickLog> {
    try {
      const userId = req.user.id;
      return await this.kickLogService.createLog(createKickLogDto, userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to create kick log',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('counter/:counterId')
  @ApiOperation({ summary: 'Get all kick logs for a specific counter' })
  @ApiParam({
    name: 'counterId',
    description: 'ID of the counter',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Retrieved all kick logs for the counter',
    type: [KickLogDto],
  })
  @ApiNotFoundResponse({ description: 'Kick counter not found' })
  @ApiForbiddenResponse({
    description: 'You do not have permission to view logs for this counter',
  })
  async findByCounter(
    @Param('counterId', ParseUUIDPipe) counterId: string,
    @Req() req,
  ): Promise<KickLog[]> {
    try {
      const userId = req.user.id;
      return await this.kickLogService.findByCounterId(counterId, userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to retrieve kick logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a kick log' })
  @ApiParam({
    name: 'id',
    description: 'ID of the kick log to delete',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Kick log deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Kick log not found' })
  @ApiForbiddenResponse({
    description: 'You do not have permission to delete this log',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<{ success: boolean }> {
    try {
      const userId = req.user.id;
      await this.kickLogService.deleteLog(id, userId);
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to delete kick log',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
