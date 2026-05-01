import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/modules/users/users.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;

  const mockUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateProfile: jest.fn(),
    updateRole: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
    paginate: jest.fn(),
    existsByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: 'IUserRepository', useValue: mockUserRepository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<any>('IUserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: 'JOB_SEEKER' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(service.getUserById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const dto = { email: 'new@example.com', firstName: 'New', lastName: 'User' };
      const mockUser = { ...dto, id: '2', role: 'JOB_SEEKER' };
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.createUser(dto as any);
      expect(result).toEqual(mockUser);
    });
  });
});
