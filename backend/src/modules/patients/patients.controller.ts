import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PatientsService } from './patients.service';
import { CreatePatientProfileDto, UpdatePatientProfileDto } from './dto/patient.dto';

@ApiTags('patients')
@Controller('patients')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getProfile(@Request() req: any) {
    const patient = await this.patientsService.findByUserId(req.user.id);

    if (!patient) {
      return {
        status: 'success',
        data: null,
        message: 'Patient profile not found',
      };
    }

    return {
      status: 'success',
      data: patient,
    };
  }

  @Post('complete-profile')
  @ApiOperation({ summary: 'Complete patient profile' })
  @ApiResponse({ status: 201, description: 'Profile completed' })
  async completeProfile(@Request() req: any, @Body() dto: CreatePatientProfileDto) {
    const patient = await this.patientsService.createOrUpdate(req.user.id, dto);
    return {
      status: 'success',
      message: 'Profile completed successfully',
      data: {
        id: patient.id,
        userId: patient.userId,
        kycLevel: patient.kycLevel,
        needsAdminVerification: false,
      },
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update patient profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updateProfile(@Request() req: any, @Body() dto: UpdatePatientProfileDto) {
    const patient = await this.patientsService.update(req.user.id, dto);
    return {
      status: 'success',
      message: 'Profile updated successfully',
      data: patient,
    };
  }
}
