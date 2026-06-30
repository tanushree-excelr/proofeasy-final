import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  controllers: [TransactionController],
})
export class TransactionModule {}