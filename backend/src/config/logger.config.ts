import { WinstonModuleOptions } from "nest-winston";
import * as winston from "winston";
import { ConfigService } from "@nestjs/config";

export const getLoggerConfig = (
  configService: ConfigService
): WinstonModuleOptions => {
  const logLevel = configService.get<string>("logging.level");
  const logFilePath = configService.get<string>("logging.filePath");
  const nodeEnv = configService.get<string>("app.nodeEnv");

  const transports: winston.transport[] = [
    // Console transport with colors for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, context, ...meta }) => {
            let msg = `${timestamp} [${level}] ${context ? `[${context}]` : ""} ${message}`;
            if (Object.keys(meta).length > 0) {
              msg += ` ${JSON.stringify(meta)}`;
            }
            return msg;
          }
        )
      )
    })
  ];

  // Add file transport for production
  if (nodeEnv === "production") {
    transports.push(
      new winston.transports.File({
        filename: logFilePath,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    );
  }

  return {
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    transports,
    // Intelligent error filtering - only log unexpected errors
    exceptionHandlers: [
      new winston.transports.File({ filename: "logs/exceptions.log" })
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: "logs/rejections.log" })
    ]
  };
};
