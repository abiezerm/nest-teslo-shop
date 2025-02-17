import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../../src/app.module';

describe('Auth - Login', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) - should throw 400 if no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login');

    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string',
    ];

    expect(response.status).toBe(400);

    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message);
    });
  });

  it('/auth/login (POST) - wrong credentials - email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test1@google2.com', password: 'Abc123' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Credentials are not valid (email)',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('/auth/login (POST) - wrong credentials - password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test1@google.com', password: 'Abc1234' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Credentials are not valid (password)',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('/auth/login (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test1@google.com', password: 'Abc123' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        email: 'test1@google.com',
        fullName: 'Test One',
        isActive: true,
        roles: ['admin'],
      },
      token: expect.any(String),
    });
  });
});
