import {
  Body,
  Controller,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BlockchainService } from '../blockchain/blockchain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('ProofEasy Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TransactionController {
  constructor(
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post('transaction/create')
  @ApiOperation({
    summary:
      'Store ProofEasy document metadata on MST Blockchain',
  })
  @ApiResponse({ status: 201, description: 'Transaction submitted successfully' })
  @ApiResponse({ status: 400, description: 'Transaction data is required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          example:
            'CERT001|HASH123456789|UNIVERSITY001',
        },
      },
      required: ['data'],
    },
  })
  async create(@Body() body: any) {
    if (!body || !body.data) {
      throw new BadRequestException('Data is required');
    }

    return await this.blockchainService.createTransaction(
      body.data,
    );
  }

  @Post('status')
  @ApiOperation({
    summary:
      'Check blockchain status of a transaction',
  })
  @ApiResponse({ status: 201, description: 'Transaction status retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Transaction ID is required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transaction_id: {
          type: 'string',
          example:
            '0x123456789abcdef123456789abcdef123456789abcdef',
        },
      },
      required: ['transaction_id'],
    },
  })
  async status(@Body() body: any) {
    if (!body || !body.transaction_id) {
      throw new BadRequestException(
        'transaction_id is required',
      );
    }

    return await this.blockchainService.getStatus(
      body.transaction_id,
    );
  }
}