import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8081',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:8081',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS — read allowed origins from env (ALLOWED_ORIGINS), always keep local dev origins too
  const configuredOrigins = configService.get<string[]>('allowedOrigins') || [];
  const allowedOrigins = Array.from(new Set([...configuredOrigins, ...DEV_ORIGINS]));

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  });

  // Request logger middleware
  app.use((req, res, next) => {
    logger.log(`${req.method} ${req.url}`);
    next();
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Choco Berry Business API')
    .setDescription(
      'Daily report, BOM, inventory, sales, payroll, P&L — Complete business management for Choco Berry',
    )
    .setVersion('2.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', in: 'header' },
      'JWT',
    )
    .addServer('http://localhost:3000')
    .addTag('auth', 'Authentication & User management')
    .addTag('business', 'Business profile & dashboard')
    .addTag('suppliers', 'Supplier management & purchases')
    .addTag('products', 'Products & BOM recipes')
    .addTag('inventory', 'Inventory management')
    .addTag('sales', 'Point of Sale')
    .addTag('expenses', 'Expense tracking')
    .addTag('employees', 'Employee management & payroll')
    .addTag('cashbox', 'Cash register management')
    .addTag('funds', 'Business funds (Charity, Reserve, etc.)')
    .addTag('daily-report', 'Daily business reports')
    .addTag('reports', 'Analytics, P&L & exports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
  logger.log(`🚀 Choco Berry API running at http://localhost:${port}`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
