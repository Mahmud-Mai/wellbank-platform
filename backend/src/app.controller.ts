import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  getHealth() {
    const health = this.appService.getHealth();
    return {
      status: "success",
      data: health,
    };
  }

  @Get()
  @ApiOperation({ summary: "API information" })
  @ApiResponse({ status: 200, description: "Returns API information" })
  getInfo() {
    const info = this.appService.getInfo();
    return {
      status: "success",
      data: info,
    };
  }
}
