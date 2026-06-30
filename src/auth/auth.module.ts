import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'proofeasy-secret',
        signOptions: { expiresIn: '14400s' },
      }),
    }),
  ],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}