import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Patch,
  Delete,
} from '@nestjs/common';
import { ContractionCounterService } from './contraction-counter.service';
import { ContractionCounter } from '../entities/contraction-counter.entity';
import { CreateContractionCounterDto } from './dto/create-contraction-counter.dto';
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
import { ContractionCounterDto } from '../swagger/counter.responses';

@ApiTags('contraction-counters')
@ApiBearerAuth('JWT')
@Controller('contraction-counters')
@UseGuards(JwtAuthGuard)
export class ContractionCounterController {
  constructor(
    private readonly contractionCounterService: ContractionCounterService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contraction counter session' })
  @ApiBody({ type: CreateContractionCounterDto })
  @ApiCreatedResponse({
    description: 'Contraction counter created successfully',
    type: ContractionCounterDto,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Req() req,
    @Body() createContractionCounterDto: CreateContractionCounterDto,
  ): Promise<ContractionCounter> {
    try {
      const userId = req.user.id;
      return await this.contractionCounterService.createCounter(
        userId,
        createContractionCounterDto,
      );
    } catch {
      throw new HttpException(
        'Failed to create contraction counter',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my')
  @ApiOperation({
    summary: 'Get all contraction counters for the current authenticated user',
  })
  @ApiOkResponse({
    description: 'Retrieved all contraction counters for the current user',
    type: [ContractionCounterDto],
  })
  async findMyCounters(@Req() req): Promise<ContractionCounter[]> {
    const userId = req.user.id;
    return this.contractionCounterService.findByUserId(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all contraction counters for a specific user' })
  @ApiParam({ name: 'userId', description: 'ID of the user', type: 'string' })
  @ApiOkResponse({
    description: 'Retrieved all contraction counters for the specified user',
    type: [ContractionCounterDto],
  })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<ContractionCounter[]> {
    return this.contractionCounterService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contraction counter by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the contraction counter',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Retrieved the contraction counter',
    type: ContractionCounterDto,
  })
  @ApiNotFoundResponse({ description: 'Contraction counter not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContractionCounter> {
    const counter = await this.contractionCounterService.findById(id);
    if (!counter) {
      throw new HttpException(
        'Contraction counter not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return counter;
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a contraction counter session' })
  @ApiParam({
    name: 'id',
    description: 'ID of the contraction counter to close',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Contraction counter closed successfully',
    type: ContractionCounterDto,
  })
  @ApiNotFoundResponse({ description: 'Contraction counter not found' })
  async closeCounter(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContractionCounter> {
    try {
      return await this.contractionCounterService.closeCounter(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to close contraction counter',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contraction counter' })
  @ApiParam({
    name: 'id',
    description: 'ID of the contraction counter to delete',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Contraction counter deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Contraction counter not found' })
  async deleteCounter(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      await this.contractionCounterService.deleteCounter(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete contraction counter',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
