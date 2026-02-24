import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThanOrEqual } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorProfileDto, UpdateDoctorProfileDto, DoctorSearchQueryDto } from './dto/doctor.dto';
import { ProviderStatus } from '@wellbank/shared';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async createOrUpdate(userId: string, dto: CreateDoctorProfileDto): Promise<Doctor> {
    let doctor = await this.doctorRepo.findOne({ where: { userId } });

    if (doctor) {
      Object.assign(doctor, dto);
    } else {
      doctor = this.doctorRepo.create({
        ...dto,
        userId,
        providerStatus: ProviderStatus.PENDING,
      });
    }

    return this.doctorRepo.save(doctor);
  }

  async findByUserId(userId: string): Promise<Doctor | null> {
    return this.doctorRepo.findOne({ where: { userId } });
  }

  async findById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({ where: { id } });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async search(query: DoctorSearchQueryDto): Promise<{ doctors: Doctor[]; total: number }> {
    const { page = 1, limit = 20, specialty, location, minRating, maxFee, search } = query;

    const qb = this.doctorRepo.createQueryBuilder('doctor')
      .where('doctor.providerStatus = :status', { status: ProviderStatus.ACTIVE });

    if (specialty) {
      qb.andWhere('doctor.specialty ILIKE :specialty', { specialty: `%${specialty}%` });
    }

    if (location) {
      qb.andWhere('(doctor.address->>\'city\' ILIKE :location OR doctor.address->>\'state\' ILIKE :location)', { location: `%${location}%` });
    }

    if (minRating) {
      qb.andWhere('doctor.rating >= :minRating', { minRating });
    }

    if (maxFee) {
      qb.andWhere('doctor.consultationFee <= :maxFee', { maxFee });
    }

    if (search) {
      qb.andWhere('(doctor.firstName ILIKE :search OR doctor.lastName ILIKE :search OR doctor.specialty ILIKE :search)', { search: `%${search}%` });
    }

    qb.orderBy('doctor.rating', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [doctors, total] = await qb.getManyAndCount();

    return { doctors, total };
  }

  async update(userId: string, dto: UpdateDoctorProfileDto): Promise<Doctor> {
    const doctor = await this.findByUserId(userId);

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    Object.assign(doctor, dto);
    return this.doctorRepo.save(doctor);
  }
}
