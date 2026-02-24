import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/document.dto';

@ApiTags('documents')
@Controller('documents')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a document' })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  async create(@Request() req: any, @Body() dto: CreateDocumentDto) {
    const document = await this.documentsService.create(req.user.id, dto);
    return {
      status: 'success',
      message: 'Document uploaded successfully',
      data: document,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: 'Documents list' })
  async findAll(@Request() req: any, @Query('type') type?: string) {
    const documents = await this.documentsService.findAll(req.user.id, type);
    return {
      status: 'success',
      data: { documents },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document details' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const document = await this.documentsService.findOne(id, req.user.id);
    return {
      status: 'success',
      data: document,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    await this.documentsService.delete(id, req.user.id);
    return {
      status: 'success',
      message: 'Document deleted successfully',
    };
  }
}
