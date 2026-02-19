import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async create(userId: string, dto: CreateDocumentDto): Promise<Document> {
    const doc = this.documentsRepository.create({
      ...dto,
      userId,
    });
    return this.documentsRepository.save(doc);
  }

  async findAll(
    userId: string,
    query: { type?: string; page?: number; limit?: number },
  ) {
    const { type, page = 1, limit = 10 } = query;
    const where: any = { userId };
    if (type) where.type = type;

    const [items, total] = await this.documentsRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: string, id: string): Promise<Document> {
    const doc = await this.documentsRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException('Access denied');
    return doc;
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto): Promise<Document> {
    const doc = await this.findOne(userId, id);
    Object.assign(doc, dto);
    return this.documentsRepository.save(doc);
  }

  async remove(userId: string, id: string): Promise<void> {
    const doc = await this.findOne(userId, id);
    await this.documentsRepository.remove(doc);
  }
}
