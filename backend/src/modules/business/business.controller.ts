import { Controller, Post, Get, Patch, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('business')
@ApiBearerAuth('JWT')
@Controller('business')
@Roles(Role.ADMIN)
export class BusinessController {
  private readonly logger = new Logger(BusinessController.name);

  constructor(private readonly businessService: BusinessService) {}

  @Post('setup')
  @ApiOperation({
    summary: 'Set up business and seed all defaults (suppliers, products, inventory)',
  })
  @ApiResponse({ status: 201, description: 'Business created with all defaults seeded' })
  @ApiResponse({ status: 409, description: 'Business already set up' })
  setup(@CurrentUser() user: any, @Body() dto: CreateBusinessDto) {
    return this.businessService.setup(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get business profile' })
  @ApiResponse({ status: 200 })
  get(@CurrentUser() user: any) {
    return this.businessService.getProfile(user.id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get business profile (alias)' })
  @ApiResponse({ status: 200 })
  getProfile(@CurrentUser() user: any) {
    return this.businessService.getProfile(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update business profile' })
  @ApiResponse({ status: 200 })
  update(@CurrentUser() user: any, @Body() dto: UpdateBusinessDto) {
    return this.businessService.updateProfile(user.id, dto);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update business profile (alias)' })
  @ApiResponse({ status: 200 })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateBusinessDto) {
    return this.businessService.updateProfile(user.id, dto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: "Get today's dashboard summary" })
  @ApiResponse({ status: 200 })
  async getDashboard(@CurrentUser() user: any) {
    try {
      return await this.businessService.getDashboard(user.id);
    } catch (error) {
      this.logger.error('Dashboard error', error instanceof Error ? error.stack : error);
      throw error;
    }
  }
}
