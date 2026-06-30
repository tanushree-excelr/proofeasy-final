import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

interface RefreshTokenRequest {
  refresh_token?: string;
}
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Authentication')
@Controller('api')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Access Token using a refresh token' })
  @ApiResponse({ status: 201, description: 'Access token refreshed successfully' })
  @ApiResponse({ status: 400, description: 'Refresh token is missing' })
  @ApiResponse({ status: 401, description: 'Refresh token is invalid or expired' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string' },
      },
      required: ['refresh_token'],
    },
  })
  async refresh(@Body() body: RefreshTokenRequest) {
    const refreshToken = body?.refresh_token?.trim();

    if (!refreshToken) {
      throw new BadRequestException('refresh_token is required');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const newPayload = { username: payload.username };
    const expires_in = 14400; // 4 hours
    const access_token = await this.jwtService.signAsync(newPayload, {
      expiresIn: `${expires_in}s`,
    });
    const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

    return {
      access_token,
      token_type: 'Bearer',
      expires_in,
      expires_at,
    };
  }

  @Post('tokens')
  @ApiOperation({
    summary:
      'Generate Access Token for ProofEasy',
  })
  @ApiResponse({ status: 201, description: 'Tokens generated successfully' })
  @ApiResponse({ status: 400, description: 'Username and password are required' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'proofeasy_api_user',
        },
        password: {
          type: 'string',
          example: 'proofeasy_api_password',
        },
      },
      required: ['username', 'password'],
    },
  })
  async login(@Body() body: any) {
    if (!body || !body.username || !body.password) {
      throw new BadRequestException(
        'username and password are required',
      );
    }

    const expectedUser =
      process.env.PROOFEASY_API_USER ||
      'proofeasy_api_user';
    const expectedPass =
      process.env.PROOFEASY_API_PASSWORD ||
      'proofeasy_api_password';

    if (
      body.username !== expectedUser ||
      body.password !== expectedPass
    ) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const payload = { username: body.username };
    const expires_in = 14400; // 4 hours
    const refresh_expires_in = 86400; // 1 day
    const access_token =
      await this.jwtService.signAsync(payload, {
        expiresIn: `${expires_in}s`,
      });
    const refresh_token =
      await this.jwtService.signAsync(payload, {
        expiresIn: `${refresh_expires_in}s`,
      });
    const expires_at = new Date(
      Date.now() + expires_in * 1000,
    ).toISOString();
    const refresh_expires_at = new Date(
      Date.now() + refresh_expires_in * 1000,
    ).toISOString();

    return {
      access_token,
      token_type: 'Bearer',
      expires_in,
      expires_at,
      refresh_token,
      refresh_expires_in,
      refresh_expires_at,
    };
  }
}