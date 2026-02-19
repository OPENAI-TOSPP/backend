import {
  Controller, Get, Post, Param, Body,
  UseGuards, Request, Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import { DocumentsService } from '../documents/documents.service';

@ApiTags('export')
@Controller()
export class ExportController {
  constructor(
    private exportService: ExportService,
    private documentsService: DocumentsService,
  ) {}

  @Get('documents/:id/export/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '저장된 문서 PDF 다운로드', description: '계정에 저장된 문서를 A4 PDF로 다운로드합니다.' })
  @ApiParam({ name: 'id', description: '문서 UUID' })
  @ApiResponse({ status: 200, description: 'PDF 파일 (application/pdf)', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '문서를 찾을 수 없음' })
  async exportDocumentPdf(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const doc = await this.documentsService.findOne(req.user.id, id);
    const html = this.exportService.generateHTML(doc.type, doc.content, doc.serviceInfo);
    const pdf = await this.exportService.generatePDF(html);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.title)}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  @Get('documents/:id/export/html')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '저장된 문서 HTML 다운로드', description: '계정에 저장된 문서를 HTML 파일로 다운로드합니다.' })
  @ApiParam({ name: 'id', description: '문서 UUID' })
  @ApiResponse({ status: 200, description: 'HTML 파일 (text/html)', content: { 'text/html': { schema: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '문서를 찾을 수 없음' })
  async exportDocumentHtml(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const doc = await this.documentsService.findOne(req.user.id, id);
    const html = this.exportService.generateHTML(doc.type, doc.content, doc.serviceInfo);

    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.title)}.html"`,
    });
    res.send(html);
  }

  @Post('export/pdf')
  @ApiOperation({ summary: '즉시 PDF 다운로드 (비저장)', description: '저장하지 않고 생성된 문서를 바로 PDF로 다운로드합니다. 로그인 불필요.' })
  @ApiBody({
    schema: {
      properties: {
        type: { type: 'string', enum: ['privacy-policy', 'terms-of-service'], example: 'privacy-policy' },
        content: { type: 'object', description: 'GeneratedDocument 또는 GeneratedTerms 객체' },
        serviceInfo: { type: 'object', description: '서비스 정보 객체' },
      },
      required: ['type', 'content', 'serviceInfo'],
    },
  })
  @ApiResponse({ status: 201, description: 'PDF 파일 (application/pdf)', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 500, description: 'PDF 생성 실패' })
  async exportPdf(
    @Body() body: { type: string; content: any; serviceInfo: any },
    @Res() res: Response,
  ) {
    const html = this.exportService.generateHTML(body.type, body.content, body.serviceInfo);
    const pdf = await this.exportService.generatePDF(html);

    const title = body.type === 'privacy-policy' ? '개인정보처리방침' : '서비스이용약관';
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  @Post('export/html')
  @ApiOperation({ summary: '즉시 HTML 다운로드 (비저장)', description: '저장하지 않고 생성된 문서를 바로 HTML 파일로 다운로드합니다. 로그인 불필요.' })
  @ApiBody({
    schema: {
      properties: {
        type: { type: 'string', enum: ['privacy-policy', 'terms-of-service'], example: 'privacy-policy' },
        content: { type: 'object', description: 'GeneratedDocument 또는 GeneratedTerms 객체' },
        serviceInfo: { type: 'object', description: '서비스 정보 객체' },
      },
      required: ['type', 'content', 'serviceInfo'],
    },
  })
  @ApiResponse({ status: 201, description: 'HTML 파일 (text/html)', content: { 'text/html': { schema: { type: 'string' } } } })
  async exportHtml(
    @Body() body: { type: string; content: any; serviceInfo: any },
    @Res() res: Response,
  ) {
    const html = this.exportService.generateHTML(body.type, body.content, body.serviceInfo);

    const title = body.type === 'privacy-policy' ? '개인정보처리방침' : '서비스이용약관';
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.html"`,
    });
    res.send(html);
  }
}
