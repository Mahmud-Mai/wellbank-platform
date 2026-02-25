import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WinstonModule } from "nest-winston";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import configuration from "./config/configuration";
import { getDatabaseConfig } from "./config/database.config";
import { getLoggerConfig } from "./config/logger.config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { BankAccountsModule } from "./modules/bank-accounts/bank-accounts.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { PatientsModule } from "./modules/patients/patients.module";
import { DoctorsModule } from "./modules/doctors/doctors.module";

@Module({
  imports: [
    // Configuration module - load first
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [".env.local", ".env"]
    }),

    // Winston logging - temporarily disabled for debugging
    // WinstonModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) =>
    //     getLoggerConfig(configService)
    // }),

    // TypeORM database connection
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService)
    }),

    // EventEmitter for cross-module communication
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ".",
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false
    }),

    // BullMQ for background jobs
    // Temporarily disabled to debug startup issue
    // BullModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     connection: {
    //       host: configService.get<string>("redis.host"),
    //       port: configService.get<number>("redis.port"),
    //       password: configService.get<string>("redis.password"),
    //       db: configService.get<number>("redis.db")
    //     }
    //   })
    // }),

    // Schedule for cron jobs
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    OrganizationsModule,
    BankAccountsModule,
    DocumentsModule,
    PatientsModule,
    DoctorsModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
