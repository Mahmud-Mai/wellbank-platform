import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>("app.nodeEnv")
    };
  }

  getInfo() {
    return {
      name: "WellBank API",
      version: "1.0.0",
      description: "Healthcare coordination platform for Africa",
      documentation: `/${this.configService.get<string>("app.apiPrefix")}/docs`
    };
  }
}
