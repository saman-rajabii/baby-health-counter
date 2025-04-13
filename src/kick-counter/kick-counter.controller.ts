import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Put,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { KickCounterService } from './kick-counter.service';
import { KickCounter } from '../entities/kick-counter.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateKickCounterDto, UpdatePeriodDto } from './dto';
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
import {
  KickCounterDto,
  SuccessResponseDto,
} from '../swagger/counter.responses';

@ApiTags('kick-counters')
@ApiBearerAuth('JWT')
@Controller('kick-counters')
@UseGuards(JwtAuthGuard)
export class KickCounterController {
  constructor(private readonly kickCounterService: KickCounterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new kick counter session' })
  @ApiBody({ type: CreateKickCounterDto })
  @ApiCreatedResponse({
    description: 'Kick counter created successfully',
    type: KickCounterDto,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Req() req,
    @Body() createKickCounterDto: CreateKickCounterDto,
  ): Promise<KickCounter> {
    try {
      const userId = req.user.id;
      return await this.kickCounterService.createCounter(
        userId,
        createKickCounterDto,
      );
    } catch {
      throw new HttpException(
        'Failed to create kick counter',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my')
  @ApiOperation({
    summary: 'Get all kick counters for the current authenticated user',
  })
  @ApiOkResponse({
    description: 'Retrieved all kick counters for the current user',
    type: [KickCounterDto],
  })
  async findMyCounters(@Req() req): Promise<KickCounter[]> {
    const userId = req.user.id;
    return this.kickCounterService.findByUserId(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all kick counters for a specific user' })
  @ApiParam({ name: 'userId', description: 'ID of the user', type: 'string' })
  @ApiOkResponse({
    description: 'Retrieved all kick counters for the specified user',
    type: [KickCounterDto],
  })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<KickCounter[]> {
    return this.kickCounterService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a kick counter by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the kick counter',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Retrieved the kick counter',
    type: KickCounterDto,
  })
  @ApiNotFoundResponse({ description: 'Kick counter not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<KickCounter> {
    const counter = await this.kickCounterService.findById(id);
    if (!counter) {
      throw new HttpException('Kick counter not found', HttpStatus.NOT_FOUND);
    }
    return counter;
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete a kick counter session' })
  @ApiParam({
    name: 'id',
    description: 'ID of the kick counter to complete',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Kick counter completed successfully',
    type: KickCounterDto,
  })
  @ApiNotFoundResponse({ description: 'Kick counter not found' })
  async complete(@Param('id', ParseUUIDPipe) id: string): Promise<KickCounter> {
    try {
      return await this.kickCounterService.completeCounter(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to complete kick counter',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id/period')
  @ApiOperation({
    summary: 'Update a kick counter period and recalculate finishedAt',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the kick counter to update',
    type: 'string',
  })
  @ApiBody({ type: UpdatePeriodDto })
  @ApiOkResponse({
    description: 'Kick counter period updated successfully',
    type: KickCounterDto,
  })
  @ApiNotFoundResponse({ description: 'Kick counter not found' })
  async updatePeriod(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePeriodDto: UpdatePeriodDto,
  ): Promise<KickCounter> {
    try {
      return await this.kickCounterService.updatePeriod(
        id,
        updatePeriodDto.period,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update kick counter period',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id/reset-period')
  @ApiOperation({ summary: 'Reset finishedAt based on period from startedAt' })
  @ApiParam({
    name: 'id',
    description: 'ID of the kick counter to reset',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Kick counter period reset successfully',
    type: KickCounterDto,
  })
  @ApiNotFoundResponse({ description: 'Kick counter not found' })
  async resetPeriod(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KickCounter> {
    try {
      return await this.kickCounterService.resetCounterPeriod(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to reset kick counter period',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a kick counter' })
  @ApiParam({
    name: 'id',
    description: 'ID of the kick counter to delete',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Kick counter deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Kick counter not found' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    await this.kickCounterService.deleteCounter(id);
    return { success: true };
  }
}
