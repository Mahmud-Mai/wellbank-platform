import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientProfileDto, UpdatePatientProfileDto } from './dto/patient.dto';
import { KycLevel } from '@wellbank/shared';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async createOrUpdate(userId: string, dto: CreatePatientProfileDto): Promise<Patient> {
    let patient = await this.patientRepo.findOne({ where: { userId } });

    if (patient) {
      Object.assign(patient, dto);
    } else {
      patient = this.patientRepo.create({
        ...dto,
        userId,
        kycLevel: KycLevel.LEVEL_1,
      });
    }

    return this.patientRepo.save(patient);
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    return this.patientRepo.findOne({ where: { userId } });
  }

  async findById(id: string): Promise<Patient> {
    const patient = await this.patientRepo.findOne({ where: { id } });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async update(userId: string, dto: UpdatePatientProfileDto): Promise<Patient> {
    const patient = await this.findByUserId(userId);

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    Object.assign(patient, dto);
    return this.patientRepo.save(patient);
  }
}
