import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, AddMemberDto, OrganizationQueryDto } from './dto/organization.dto';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Request() req: any, @Body() dto: CreateOrganizationDto) {
    const organization = await this.organizationsService.create(req.user.id, dto);
    return {
      status: 'success',
      message: 'Organization created successfully',
      data: organization,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get my organizations' })
  @ApiResponse({ status: 200, description: 'Organizations list' })
  async findAll(@Request() req: any, @Query() query: OrganizationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const { organizations, total } = await this.organizationsService.findAll(
      req.user.id,
      page,
      limit,
    );
    return {
      status: 'success',
      data: { organizations },
      meta: {
        pagination: {
          page,
          perPage: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const organization = await this.organizationsService.findOne(id);
    return {
      status: 'success',
      data: organization,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: UpdateOrganizationDto,
  ) {
    const organization = await this.organizationsService.update(id, req.user.id, dto);
    return {
      status: 'success',
      message: 'Organization updated successfully',
      data: organization,
    };
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to organization' })
  @ApiResponse({ status: 201, description: 'Member added' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: AddMemberDto,
  ) {
    const member = await this.organizationsService.addMember(id, req.user.id, dto);
    return {
      status: 'success',
      message: 'Member added successfully',
      data: member,
    };
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get organization members' })
  @ApiResponse({ status: 200, description: 'Members list' })
  async getMembers(@Param('id', ParseUUIDPipe) id: string) {
    const members = await this.organizationsService.getMembers(id);
    return {
      status: 'success',
      data: { members },
    };
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove member from organization' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Request() req: any,
  ) {
    await this.organizationsService.removeMember(id, memberId, req.user.id);
    return {
      status: 'success',
      message: 'Member removed successfully',
    };
  }
}
