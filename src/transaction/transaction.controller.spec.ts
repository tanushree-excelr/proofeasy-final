import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { BlockchainService } from '../blockchain/blockchain.service';
import { JwtService } from '@nestjs/jwt';

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: BlockchainService,
          useValue: {
            createTransaction: jest.fn(),
            getStatus: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
