import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
  ) {}

  async create(userId: string, dto: CreateDocumentDto): Promise<Document> {
    const document = this.documentRepo.create({
      ...dto,
      userId,
    });

    return this.documentRepo.save(document);
  }

  async findAll(userId: string, documentType?: string): Promise<Document[]> {
    const where: Record<string, unknown> = { userId };
    if (documentType) {
      where.documentType = documentType;
    }

    return this.documentRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Document> {
    const document = await this.documentRepo.findOne({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async delete(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id, userId);
    await this.documentRepo.remove(document);
  }
}
