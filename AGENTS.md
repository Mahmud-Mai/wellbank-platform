# WellBank Development Guide

## Project Overview

WellBank is a NestJS modular monolith healthcare platform monorepo with:
- **Backend**: NestJS 10 with TypeScript
- **Frontend**: Next.js 14 (to be added)
- **Shared**: TypeScript types and Zod validation schemas
- **Database**: PostgreSQL with TypeORM
- **Cache/Jobs**: Redis with BullMQ

## Commands

### Root Commands (from monorepo root)

```bash
# Install all dependencies
npm run install:all

# Build shared types
npm run shared:build

# Start backend in dev mode
npm run backend:dev

# Build backend
npm run backend:build
```

### Backend Commands (cd backend)

```bash
# Development with hot reload
npm run dev

# Build production
npm run build

# Start production
npm run start:prod

# Lint and fix
npm run lint

# Format code
npm run format

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run a single test file
npm test -- app.controller.spec.ts

# Run a single test by name
npm test -- --testNamePattern="health check"
```

## Code Style Guidelines

### General Rules

- **Line length**: 100 characters max
- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes
- **Trailing commas**: All (including in function parameters)

### TypeScript Conventions

- **Strict mode enabled**: All strict compiler options are on
- **No explicit `any`**: Avoid `any`; use `unknown` or proper typing
- **Use `interface` over type aliases** for object shapes
- **Use `readonly` for immutable data**
- **Enable `strictNullChecks`**: Always check for null/undefined

### Naming Conventions

```typescript
// Classes and Types: PascalCase
class UserService { }
interface UserProfile { }
type PaymentStatus = 'pending' | 'completed' | 'failed';

// Variables, functions, methods: camelCase
const userId = '123';
function getUserById(id: string) { }
async function fetchPatientData() { }

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = '/api/v1';

// Enums: PascalCase with PascalCase members
enum UserRole {
  Admin = 'ADMIN',
  Doctor = 'DOCTOR',
  Patient = 'PATIENT',
}

// File names: kebab-case
// user.service.ts, patient.controller.ts, api-response.dto.ts
```

### Import Organization

Order imports strictly as follows (eslint-plugin-import groups):

1. **External libraries** (NestJS, TypeORM, etc.)
2. **Internal packages** (@wellbank/shared)
3. **Relative imports** (../, ./)

```typescript
// 1. External - @nestjs packages
import { Injectable, Controller, Get, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

// 2. External - other libraries
import { IsString, IsEmail, IsOptional } from "class-validator";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

// 3. Internal packages
import { UserRole } from "@wellbank/shared";

// 4. Relative imports
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { getDatabaseConfig } from "./config/database.config";
```

### Decorator Usage

```typescript
// Controller - use @ApiTags for Swagger
@ApiTags("patients")
@Controller("patients")
export class PatientController {
  // Use constructor injection
  constructor(private readonly patientService: PatientService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get patient by ID" })
  @ApiResponse({ status: 200, description: "Patient found" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async getPatient(@Param("id") id: string) {
    return this.patientService.findById(id);
  }
}

// Service - @Injectable() decorator
@Injectable()
export class PatientService {
  constructor(
    private readonly repository: PatientRepository,
    private readonly configService: ConfigService
  ) {}
}
```

### Error Handling

- Use NestJS built-in exceptions for standard errors
- Create custom exceptions for domain-specific errors
- Always use proper HTTP status codes
- Use Swagger decorators for API documentation

```typescript
// Throwing standard errors
import { NotFoundException, BadRequestException } from "@nestjs/common";

throw new NotFoundException(`Patient with ID ${id} not found`);
throw new BadRequestException("Invalid email format");

// Use class-validator for input validation
import { IsString, IsEmail, MinLength, IsOptional } from "class-validator";

export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

### Configuration

- **NEVER use `process.env` directly** in application code
- Always use `ConfigService` from `@nestjs/config`
- All configuration must go through `configuration.ts`

```typescript
// CORRECT - using ConfigService
constructor(private configService: ConfigService) {
  const port = this.configService.get<number>("app.port");
  const dbHost = this.configService.get<string>("database.host");
}

// WRONG - using process.env directly
const port = process.env.PORT; // Never do this
```

### Database Entities

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("patients")
export class Patient {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Module Structure

Follow NestJS modular structure:

```
src/
├── config/           # Configuration files
├── modules/          # Feature modules
│   ├── patients/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── patients.controller.ts
│   │   ├── patients.service.ts
│   │   └── patients.module.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

### Testing

- Test files: `*.spec.ts` in the same directory as the code
- Use `@nestjs/testing` for unit tests
- Follow AAA pattern: Arrange, Act, Assert

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHealth: jest.fn().mockReturnValue({ status: "ok" }),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  describe("getHealth", () => {
    it("should return health status", () => {
      const result = controller.getHealth();
      expect(result).toEqual({ status: "ok" });
    });
  });
});
```

### API Documentation

- Always add Swagger decorators to controllers
- Use `@ApiTags` to group endpoints
- Add `@ApiOperation` for endpoint descriptions
- Use `@ApiResponse` for status codes

### Git Branch Naming

Use: `[wip|feat|chore|bugfix|hotfix]/<description>`

Examples:
- `feat/patient-registration`
- `bugfix/auth-token-expiry`
- `chore/update-dependencies`

### Commit Messages

```
type(scope): description

- bullet points of changes
```

Examples:
```
feat(auth): add JWT refresh token endpoint

- implement refresh token rotation
- store refresh tokens in Redis
- add logout endpoint to invalidate tokens
```
