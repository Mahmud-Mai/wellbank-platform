import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DoctorsService } from './doctors.service';
import { CreateDoctorProfileDto, UpdateDoctorProfileDto, DoctorSearchQueryDto } from './dto/doctor.dto';

@ApiTags('doctors')
@Controller('doctors')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search doctors' })
  @ApiQuery({ name: 'specialty', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'minRating', required: false })
  @ApiQuery({ name: 'maxFee', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Doctors list' })
  async search(@Query() query: DoctorSearchQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const { doctors, total } = await this.doctorsService.search(query);

    return {
      status: 'success',
      data: { doctors },
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
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiResponse({ status: 200, description: 'Doctor profile' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const doctor = await this.doctorsService.findById(id);
    return {
      status: 'success',
      data: doctor,
    };
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get my doctor profile' })
  @ApiResponse({ status: 200, description: 'Doctor profile' })
  async getMyProfile(@Request() req: any) {
    const doctor = await this.doctorsService.findByUserId(req.user.id);

    if (!doctor) {
      return {
        status: 'success',
        data: null,
        message: 'Doctor profile not found',
      };
    }

    return {
      status: 'success',
      data: doctor,
    };
  }

  @Post('complete-profile')
  @ApiOperation({ summary: 'Complete doctor profile' })
  @ApiResponse({ status: 201, description: 'Profile completed' })
  async completeProfile(@Request() req: any, @Body() dto: CreateDoctorProfileDto) {
    const doctor = await this.doctorsService.createOrUpdate(req.user.id, dto);
    return {
      status: 'success',
      message: 'Profile completed, pending verification',
      data: {
        id: doctor.id,
        userId: doctor.userId,
        providerStatus: doctor.providerStatus,
        documentsSubmitted: 0,
      },
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update doctor profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateDoctorProfileDto) {
    const doctor = await this.doctorsService.update(req.user.id, dto);
    return {
      status: 'success',
      message: 'Profile updated successfully',
      data: doctor,
    };
  }
}
