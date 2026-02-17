import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ProviderStatus, VerificationStatus } from '@wellbank/shared';
import { DoctorProfile } from '../entities/doctor-profile.entity';
import { PharmacyProfile } from '../entities/pharmacy-profile.entity';
import { LaboratoryProfile } from '../entities/laboratory-profile.entity';
import { Document } from '../entities/document.entity';
import { NotificationService } from './notification.service';

interface ExpiredLicense {
  providerId: string;
  providerType: string;
  licenseType: string;
  expiryDate: Date;
  email: string;
  name: string;
}

@Injectable()
export class LicenseExpiryService {
  private readonly logger = new Logger(LicenseExpiryService.name);

  constructor(
    @InjectRepository(DoctorProfile)
    private readonly doctorRepository: Repository<DoctorProfile>,
    @InjectRepository(PharmacyProfile)
    private readonly pharmacyRepository: Repository<PharmacyProfile>,
    @InjectRepository(LaboratoryProfile)
    private readonly laboratoryRepository: Repository<LaboratoryProfile>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredLicenses(): Promise<void> {
    this.logger.log('Starting daily license expiry check...');

    const expiredDoctors = await this.checkExpiredDoctorLicenses();
    const expiredPharmacies = await this.checkExpiredPharmacyLicenses();
    const expiredLabs = await this.checkExpiredLaboratoryLicenses();
    const expiredDocuments = await this.checkExpiredDocuments();

    const allExpired: ExpiredLicense[] = [
      ...expiredDoctors,
      ...expiredPharmacies,
      ...expiredLabs,
      ...expiredDocuments,
    ];

    for (const expired of allExpired) {
      await this.suspendProvider(expired);
      await this.notifyProvider(expired);
    }

    await this.notifyAdmins(allExpired);

    this.logger.log(
      `License expiry check completed. ${allExpired.length} providers suspended.`
    );
  }

  private async checkExpiredDoctorLicenses(): Promise<ExpiredLicense[]> {
    const now = new Date();

    const expiredDoctors = await this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoin('doctor.user', 'user')
      .where('doctor.mdcn_expiry_date <= :now', { now })
      .andWhere('doctor.provider_status != :suspended', {
        suspended: ProviderStatus.SUSPENDED,
      })
      .select([
        'doctor.id',
        'doctor.mdcnLicenseNumber',
        'doctor.mdcnExpiryDate',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .getMany();

    return expiredDoctors.map((doctor) => ({
      providerId: doctor.id,
      providerType: 'doctor',
      licenseType: 'MDCN',
      expiryDate: doctor.mdcnExpiryDate,
      email: doctor.user?.email,
      name: `${doctor.user?.firstName} ${doctor.user?.lastName}`,
    }));
  }

  private async checkExpiredPharmacyLicenses(): Promise<ExpiredLicense[]> {
    const now = new Date();

    const expiredPharmacies = await this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .leftJoin('pharmacy.user', 'user')
      .where('pharmacy.pcn_expiry_date <= :now', { now })
      .andWhere('pharmacy.provider_status != :suspended', {
        suspended: ProviderStatus.SUSPENDED,
      })
      .select([
        'pharmacy.id',
        'pharmacy.pcnLicenseNumber',
        'pharmacy.pcnExpiryDate',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .getMany();

    return expiredPharmacies.map((pharmacy) => ({
      providerId: pharmacy.id,
      providerType: 'pharmacy',
      licenseType: 'PCN',
      expiryDate: pharmacy.pcnExpiryDate,
      email: pharmacy.user?.email,
      name: `${pharmacy.user?.firstName} ${pharmacy.user?.lastName}`,
    }));
  }

  private async checkExpiredLaboratoryLicenses(): Promise<ExpiredLicense[]> {
    const now = new Date();

    const expiredLabs = await this.laboratoryRepository
      .createQueryBuilder('lab')
      .leftJoin('lab.user', 'user')
      .where('lab.mlscn_expiry_date <= :now', { now })
      .andWhere('lab.provider_status != :suspended', {
        suspended: ProviderStatus.SUSPENDED,
      })
      .select([
        'lab.id',
        'lab.mlscnLicenseNumber',
        'lab.mlscnExpiryDate',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .getMany();

    return expiredLabs.map((lab) => ({
      providerId: lab.id,
      providerType: 'laboratory',
      licenseType: 'MLSCN',
      expiryDate: lab.mlscnExpiryDate,
      email: lab.user?.email,
      name: `${lab.user?.firstName} ${lab.user?.lastName}`,
    }));
  }

  private async checkExpiredDocuments(): Promise<ExpiredLicense[]> {
    const now = new Date();

    const expiredDocs = await this.documentRepository.find({
      where: {
        expiryDate: LessThanOrEqual(now),
        verificationStatus: VerificationStatus.APPROVED,
      },
      relations: ['owner'],
    });

    return expiredDocs.map((doc) => ({
      providerId: doc.ownerId,
      providerType: 'document',
      licenseType: doc.documentType,
      expiryDate: doc.expiryDate,
      email: (doc as any).owner?.email,
      name: (doc as any).owner?.firstName,
    }));
  }

  private async suspendProvider(expired: ExpiredLicense): Promise<void> {
    const suspensionReason = `LICENSE_EXPIRED:${expired.licenseType}`;

    switch (expired.providerType) {
      case 'doctor':
        await this.doctorRepository.update(expired.providerId, {
          providerStatus: ProviderStatus.SUSPENDED,
          suspensionReason,
          suspendedAt: new Date(),
        });
        break;
      case 'pharmacy':
        await this.pharmacyRepository.update(expired.providerId, {
          providerStatus: ProviderStatus.SUSPENDED,
          suspensionReason,
          suspendedAt: new Date(),
        });
        break;
      case 'laboratory':
        await this.laboratoryRepository.update(expired.providerId, {
          providerStatus: ProviderStatus.SUSPENDED,
          suspensionReason,
          suspendedAt: new Date(),
        });
        break;
      case 'document':
        await this.documentRepository.update(
          { ownerId: expired.providerId },
          {
            verificationStatus: VerificationStatus.EXPIRED,
          }
        );
        break;
    }

    this.logger.log(
      `Provider ${expired.providerId} suspended due to expired ${expired.licenseType} license`
    );
  }

  private async notifyProvider(expired: ExpiredLicense): Promise<void> {
    if (!expired.email) return;

    await this.notificationService.sendEmail({
      to: expired.email,
      subject: 'WellBank Account Suspended - License Expired',
      template: 'license-expired',
      context: {
        name: expired.name,
        licenseType: expired.licenseType,
        expiryDate: expired.expiryDate,
        reactivationLink: `${this.configService.get('app.frontendUrl')}/reactivate`,
      },
    });
  }

  private async notifyAdmins(expiredProviders: ExpiredLicense[]): Promise<void> {
    if (expiredProviders.length === 0) return;

    const adminEmails = this.configService.get<string[]>('admin.emails') || [];

    for (const adminEmail of adminEmails) {
      await this.notificationService.sendEmail({
        to: adminEmail,
        subject: `WellBank: ${expiredProviders.length} Providers Suspended`,
        template: 'admin-license-suspension',
        context: {
          count: expiredProviders.length,
          providers: expiredProviders,
        },
      });
    }
  }

  async checkExpiringSoon(daysAhead: number = 30): Promise<ExpiredLicense[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const expiringDoctors = await this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoin('doctor.user', 'user')
      .where('doctor.mdcn_expiry_date <= :futureDate', { futureDate })
      .andWhere('doctor.mdcn_expiry_date > :now', { now: new Date() })
      .andWhere('doctor.provider_status = :active', {
        active: ProviderStatus.ACTIVE,
      })
      .select([
        'doctor.id',
        'doctor.mdcnLicenseNumber',
        'doctor.mdcnExpiryDate',
        'user.email',
      ])
      .getMany();

    return expiringDoctors.map((doctor) => ({
      providerId: doctor.id,
      providerType: 'doctor',
      licenseType: 'MDCN',
      expiryDate: doctor.mdcnExpiryDate,
      email: doctor.user?.email,
      name: '',
    }));
  }
}
