/**
 * Centralized configuration for WellBank backend
 * All environment variables are accessed through this configuration
 * NEVER use process.env directly in application code
 */

export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '54320', 10),
    username: process.env.DB_USERNAME ?? 'wellbank',
    password: process.env.DB_PASSWORD ?? 'wellbank_dev_password',
    database: process.env.DB_DATABASE ?? 'wellbank_dev',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '63790', 10),
    password: process.env.REDIS_PASSWORD ?? undefined,
    db: parseInt(process.env.REDIS_DB ?? '0', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
  },
  vault: {
    address: process.env.VAULT_ADDR ?? 'http://localhost:8201',
    token: process.env.VAULT_TOKEN ?? 'dev-only-token',
    namespace: process.env.VAULT_NAMESPACE ?? 'wellbank',
  },
  encryption: {
    algorithm: process.env.ENCRYPTION_ALGORITHM ?? 'aes-256-gcm',
  },
  budpay: {
    publicKey: process.env.BUDPAY_PUBLIC_KEY ?? '',
    secretKey: process.env.BUDPAY_SECRET_KEY ?? '',
    webhookSecret: process.env.BUDPAY_WEBHOOK_SECRET ?? '',
    baseUrl: process.env.BUDPAY_BASE_URL ?? 'https://api.budpay.com/api/v2',
  },
  dojah: {
    appId: process.env.DOJAH_APP_ID ?? '',
    secretKey: process.env.DOJAH_SECRET_KEY ?? '',
    baseUrl: process.env.DOJAH_BASE_URL ?? 'https://api.dojah.io',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin',
    bucket: process.env.S3_BUCKET ?? 'wellbank-files',
    region: process.env.S3_REGION ?? 'us-east-1',
  },
  email: {
    host: process.env.SMTP_HOST ?? 'localhost',
    port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
    user: process.env.SMTP_USER ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
    from: process.env.SMTP_FROM ?? 'noreply@wellbank.ng',
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'debug',
    filePath: process.env.LOG_FILE_PATH ?? 'logs/app.log',
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3001,http://localhost:8080,http://localhost:5173',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN ?? '',
  },
});
