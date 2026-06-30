import { Injectable, InternalServerErrorException } from '@nestjs/common';
const { Client } = require('@mstblockchain/mst-sdk');

@Injectable()
export class BlockchainService {
  private client: any;

  constructor() {
    this.client = new Client(
      process.env.RPC_URL,
      process.env.PRIVATE_KEY,
    );
  }

  async createTransaction(data: string) {
    const tx = {
      to: '0x0000000000000000000000000000000000000000',
      value: '0',
      data:
        '0x' +
        Buffer.from(data).toString('hex'),
    };

    try {
      const txHash =
        await this.client.signer.sendTransaction(tx);

      const hash = txHash.hash || txHash;
      return {
        transaction_id: hash,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getStatus(txHash: string) {
    try {
      const receipt =
        await this.client.provider.getTransactionReceipt(
          txHash,
        );

      const isConfirmed = receipt && receipt.status === 1;

      const tx =
        await this.client.provider.ethersProvider.getTransaction(
          txHash,
        );

      if (!tx || !tx.data) {
        return {
          blockchained: false,
          detail: null,
        };
      }

      let hexData = tx.data;
      if (hexData.startsWith('0x')) {
        hexData = hexData.slice(2);
      }
      const dataStr = Buffer.from(
        hexData,
        'hex',
      ).toString('utf8');

      return {
        blockchained: !!isConfirmed,
        detail: {
          transaction_id: txHash,
          data: dataStr,
        },
      };
    } catch (error: any) {
      return {
        blockchained: false,
        detail: null,
      };
    }
  }

  async getAddress() {
    return {
      address: this.client.signer.address,
    };
  }

  async getBalance() {
    try {
      const balance =
        await this.client.provider.getBalance(
          this.client.signer.address,
        );

      return {
        address: this.client.signer.address,
        balance: balance.toString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}