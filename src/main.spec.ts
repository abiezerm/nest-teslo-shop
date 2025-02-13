import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';
import { AppModule } from './app.module';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockReturnValue({
    log: jest.fn(),
  }),
  ValidationPipe: jest.requireActual('@nestjs/common').ValidationPipe,
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockReturnValue({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    build: jest.fn(),
  }),
  ApiProperty: jest.fn(),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue('document'),
    setup: jest.fn(),
  },
}));

jest.mock('./app.module', () => ({
  AppModule: jest.fn().mockReturnValue('AppModule'),
}));

describe('Main.ts', () => {
  it('should configure app', async () => {
    await bootstrap();
  });
});
