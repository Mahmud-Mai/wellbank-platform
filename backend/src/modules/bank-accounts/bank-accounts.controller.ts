import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/bank-account.dto';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BankAccountsController {
  constructor(private bankAccountsService: BankAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a bank account' })
  @ApiResponse({ status: 201, description: 'Bank account added' })
  async create(@Request() req: any, @Body() dto: CreateBankAccountDto) {
    const account = await this.bankAccountsService.create(req.user.id, dto);
    return {
      status: 'success',
      message: 'Bank account added successfully',
      data: account,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all bank accounts' })
  @ApiResponse({ status: 200, description: 'Bank accounts list' })
  async findAll(@Request() req: any) {
    const accounts = await this.bankAccountsService.findAll(req.user.id);
    return {
      status: 'success',
      data: { bankAccounts: accounts },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank account by ID' })
  @ApiResponse({ status: 200, description: 'Bank account details' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const account = await this.bankAccountsService.findOne(id, req.user.id);
    return {
      status: 'success',
      data: account,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete bank account' })
  @ApiResponse({ status: 200, description: 'Bank account deleted' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    await this.bankAccountsService.delete(id, req.user.id);
    return {
      status: 'success',
      message: 'Bank account deleted successfully',
    };
  }

  @Post(':id/set-primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set bank account as primary' })
  @ApiResponse({ status: 200, description: 'Primary account set' })
  async setPrimary(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const account = await this.bankAccountsService.setPrimary(id, req.user.id);
    return {
      status: 'success',
      message: 'Primary account set successfully',
      data: account,
    };
  }
}
