import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
// import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import helmet from "helmet";
import compression from "compression";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  // Get configuration service
  const configService = app.get(ConfigService);

  // Use Winston logger (temporarily disabled)
  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS - allow multiple origins for development
  const corsOrigin = configService.get<string>("cors.origin");
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin?.split(',').map(o => o.trim()) || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // API prefix
  const apiPrefix = configService.get<string>("app.apiPrefix") ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle("WellBank API")
    .setDescription("WellBank Healthcare Platform API Documentation")
    .setVersion("1.0")
    .addTag("authentication", "User authentication and authorization")
    .addTag("patients", "Patient profile and medical records")
    .addTag("doctors", "Doctor profiles and availability")
    .addTag("consultations", "Medical consultations and appointments")
    .addTag("laboratories", "Laboratory tests and results")
    .addTag("pharmacies", "Pharmacy orders and medications")
    .addTag("wallet", "Digital wallet and payments")
    .addTag("insurance", "Insurance policies and claims")
    .addTag("emergency", "Emergency services")
    .addTag("notifications", "User notifications")
    .addTag("admin", "Platform administration")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true
    }
  });

  // Start server
  const port = configService.get<number>("app.port") ?? 3000;
  await app.listen(port);

  console.log(`
    🚀 WellBank Backend is running!
    📝 API Documentation: http://localhost:${port}/${apiPrefix}/docs
    🔧 Environment: ${configService.get<string>("app.nodeEnv")}
    🌐 Port: ${port}
  `);
}

bootstrap();
