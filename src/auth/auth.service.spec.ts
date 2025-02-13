import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },

        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create a user and return user with token', async () => {
    const dto: CreateUserDto = {
      email: 'test@google.com',
      password: 'Abc123',
      fullName: 'Test User',
    };

    const user = {
      email: dto.email,
      fullName: dto.fullName,
      id: '1',
      isActive: true,
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('ABcbjAjkhas');

    const result = await authService.create(dto);

    expect(bcrypt.hashSync).toHaveBeenCalledWith('Abc123', 10);

    expect(result).toEqual({
      user: {
        email: 'test@google.com',
        fullName: 'Test User',
        id: '1',
        isActive: true,
        roles: ['user'],
      },
      token: 'mock-jwt-token',
    });
  });

  it('should throw an error if email already exist', async () => {
    const dto: CreateUserDto = {
      email: 'test@google.com',
      password: 'Abc123',
      fullName: 'Test User',
    };

    jest
      .spyOn(userRepository, 'save')
      .mockRejectedValue({ code: '23505', detail: 'Email already exists' });

    await expect(authService.create(dto)).rejects.toThrow(BadRequestException);
    await expect(authService.create(dto)).rejects.toThrow(
      'Email already exists',
    );
  });
});
