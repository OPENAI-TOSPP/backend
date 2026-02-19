import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { generatePrivacyPolicyHTML } from './templates/privacy-policy.template';
import { generateTermsHTML } from './templates/terms-of-service.template';

@Injectable()
export class ExportService implements OnModuleInit, OnModuleDestroy {
  private browser: puppeteer.Browser | null = null;
  private readonly logger = new Logger(ExportService.name);

  async onModuleInit() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.logger.log('Puppeteer browser initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Puppeteer', error);
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  generateHTML(type: string, content: any, serviceInfo: any): string {
    if (type === 'privacy-policy') {
      return generatePrivacyPolicyHTML(content, serviceInfo);
    }
    return generateTermsHTML(content, serviceInfo);
  }

  async generatePDF(html: string): Promise<Buffer> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await this.browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="font-size:9px;text-align:center;width:100%;color:#999;">- <span class="pageNumber"></span> / <span class="totalPages"></span> -</div>',
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }
}
