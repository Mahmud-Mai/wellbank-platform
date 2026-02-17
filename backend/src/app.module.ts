import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WinstonModule } from "nest-winston";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { BullModule } from "@nestjs/bullmq";
import configuration from "./config/configuration";
import { getDatabaseConfig } from "./config/database.config";
import { getLoggerConfig } from "./config/logger.config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    // Configuration module - load first
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [".env.local", ".env"]
    }),

    // Winston logging
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getLoggerConfig(configService)
    }),

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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>("redis.host"),
          port: configService.get<number>("redis.port"),
          password: configService.get<string>("redis.password"),
          db: configService.get<number>("redis.db")
        }
      })
    })

    // Feature modules will be added here as we build them
    // AuthModule,
    // UserModule,
    // ConsultationModule,
    // etc.
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
