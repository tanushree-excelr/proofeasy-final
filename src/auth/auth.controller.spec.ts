import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('test-token'),
            verifyAsync: jest.fn().mockResolvedValue({ username: 'proofeasy' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should use only the refresh token for refresh requests', async () => {
    const result = await controller.refresh({
      refresh_token: 'refresh-token',
      access_token: 'old-access-token',
    } as any);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('refresh-token');
    expect(result).toEqual(
      expect.objectContaining({
        access_token: 'test-token',
        token_type: 'Bearer',
      }),
    );
  });

  it('should reject requests without a refresh token', async () => {
    await expect(
      controller.refresh({ access_token: 'old-access-token' } as any),
    ).rejects.toThrow('refresh_token is required');
  });
});
