import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { CreateOrganizationDto, UpdateOrganizationDto, AddMemberDto } from './dto/organization.dto';
import { OrganizationMemberRole, ProviderStatus } from '@wellbank/shared';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private memberRepo: Repository<OrganizationMember>,
  ) {}

  async create(userId: string, dto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepo.create({
      name: dto.name,
      tradingName: dto.tradingName,
      type: dto.type,
      description: dto.description,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      contactPerson: dto.contactPerson,
      contactPersonPosition: dto.contactPersonPosition,
      address: dto.address,
      logoUrl: dto.logoUrl,
      cacNumber: dto.cacNumber,
      tin: dto.tin,
      yearEstablished: dto.yearEstablished,
      bedCapacity: dto.bedCapacity,
      consultingRooms: dto.consultingRooms,
      hasOperatingTheatre: dto.hasOperatingTheatre,
      hasICU: dto.hasICU,
      departments: dto.departments,
      services: dto.services,
      hasAmbulance: dto.hasAmbulance,
      hasPharmacy: dto.hasPharmacy,
      hasLaboratory: dto.hasLaboratory,
      hasEmergencyRoom: dto.hasEmergencyRoom,
      is24Hours: dto.is24Hours,
      operatingHours: dto.operatingHours,
      acceptsInsurance: dto.acceptsInsurance,
      hmosAccepted: dto.hmosAccepted,
      medicalDirectorName: dto.medicalDirectorName,
      medicalDirectorMdcn: dto.medicalDirectorMdcn,
      hasDelivery: dto.hasDelivery,
      ndprConsent: dto.ndprConsent,
      termsAccepted: dto.termsAccepted,
      createdById: userId,
      status: ProviderStatus.PENDING,
    });

    const saved = await this.organizationRepo.save(organization);

    const member = this.memberRepo.create({
      organizationId: saved.id,
      userId,
      roleInOrg: OrganizationMemberRole.ADMIN,
    });
    await this.memberRepo.save(member);

    return this.findOne(saved.id);
  }

  async findAll(userId: string, page = 1, limit = 20): Promise<{ organizations: Organization[]; total: number }> {
    const members = await this.memberRepo.find({
      where: { userId },
      select: ['organizationId'],
    });

    const orgIds = members.map(m => m.organizationId);

    if (orgIds.length === 0) {
      return { organizations: [], total: 0 };
    }

    const [organizations, total] = await this.organizationRepo.findAndCount({
      where: { id: In(orgIds) },
      relations: ['members'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { organizations, total };
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.organizationRepo.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return org;
  }

  async update(id: string, userId: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.findOne(id);
    await this.checkOrgAdmin(org.id, userId);

    Object.assign(org, dto);
    return this.organizationRepo.save(org);
  }

  async addMember(orgId: string, userId: string, dto: AddMemberDto): Promise<OrganizationMember> {
    await this.findOne(orgId);
    await this.checkOrgAdmin(orgId, userId);

    const member = this.memberRepo.create({
      organizationId: orgId,
      userId: dto.userId,
      roleInOrg: dto.roleInOrg,
      department: dto.department,
    });

    return this.memberRepo.save(member);
  }

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    return this.memberRepo.find({
      where: { organizationId: orgId },
      relations: ['user'],
      order: { joinedAt: 'DESC' },
    });
  }

  async removeMember(orgId: string, memberId: string, userId: string): Promise<void> {
    await this.checkOrgAdmin(orgId, userId);

    const result = await this.memberRepo.delete({ id: memberId, organizationId: orgId });
    if (result.affected === 0) {
      throw new NotFoundException('Member not found');
    }
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const members = await this.memberRepo.find({
      where: { userId },
      relations: ['organization'],
    });

    return members.map(m => m.organization);
  }

  async isUserOrgAdmin(orgId: string, userId: string): Promise<boolean> {
    const member = await this.memberRepo.findOne({
      where: { organizationId: orgId, userId },
    });

    return member?.roleInOrg === OrganizationMemberRole.ADMIN;
  }

  private async checkOrgAdmin(orgId: string, userId: string): Promise<void> {
    const isAdmin = await this.isUserOrgAdmin(orgId, userId);
    if (!isAdmin) {
      throw new ForbiddenException('Only organization admins can perform this action');
    }
  }
}
