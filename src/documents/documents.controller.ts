import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: '문서 저장', description: '생성된 문서를 계정에 저장합니다.' })
  @ApiBody({ type: CreateDocumentDto })
  @ApiResponse({ status: 201, description: '저장 성공', schema: { example: { data: { id: 'uuid', type: 'privacy-policy', title: '마이서비스 개인정보처리방침', status: 'draft', createdAt: '2026-02-20T00:00:00.000Z' } } } })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async create(@Request() req, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '내 문서 목록 조회', description: '저장된 문서 목록을 페이지네이션으로 반환합니다.' })
  @ApiQuery({ name: 'type', required: false, enum: ['privacy-policy', 'terms-of-service'], description: '문서 유형 필터' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: '페이지당 항목 수 (기본값: 10)' })
  @ApiResponse({ status: 200, description: '목록 반환', schema: { example: { data: { items: [], total: 0, page: 1, limit: 10 } } } })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async findAll(
    @Request() req,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.documentsService.findAll(req.user.id, {
      type,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '문서 단건 조회', description: '저장된 문서 하나를 ID로 조회합니다.' })
  @ApiParam({ name: 'id', description: '문서 UUID' })
  @ApiResponse({ status: 200, description: '문서 반환' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '문서를 찾을 수 없음' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.documentsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '문서 수정', description: '저장된 문서의 내용을 수정합니다.' })
  @ApiParam({ name: 'id', description: '문서 UUID' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '문서를 찾을 수 없음' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '문서 삭제', description: '저장된 문서를 삭제합니다.' })
  @ApiParam({ name: 'id', description: '문서 UUID' })
  @ApiResponse({ status: 200, description: '삭제 성공', schema: { example: { data: { message: 'Document deleted' } } } })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '문서를 찾을 수 없음' })
  async remove(@Request() req, @Param('id') id: string) {
    await this.documentsService.remove(req.user.id, id);
    return { message: 'Document deleted' };
  }
}
