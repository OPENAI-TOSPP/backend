import {
  Controller, Get, Post, Param, Body,
  UseGuards, Request, Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

  // Authenticated: export saved document as PDF
  @Get('documents/:id/export/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

  // Authenticated: export saved document as HTML
  @Get('documents/:id/export/html')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

  // Public: export unsaved document as PDF
  @Post('export/pdf')
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

  // Public: export unsaved document as HTML
  @Post('export/html')
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
