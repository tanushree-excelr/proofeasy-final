import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('Authentication', () => {
    it('POST /api/tokens - Success', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tokens')
        .send({
          username:
            process.env.PROOFEASY_API_USER ||
            'proofeasy_api_user',
          password:
            process.env.PROOFEASY_API_PASSWORD ||
            'proofeasy_api_password',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.token_type).toBe('Bearer');
      expect(response.body).toHaveProperty('expires_in');
      expect(response.body).toHaveProperty('expires_at');
      expect(response.body).toHaveProperty('refresh_token');
    });

    it('POST /api/tokens - Unauthorized (invalid credentials)', () => {
      return request(app.getHttpServer())
        .post('/api/tokens')
        .send({
          username: 'wrong_user',
          password: 'wrong_password',
        })
        .expect(401);
    });

    it('POST /api/tokens - Bad Request (missing body)', () => {
      return request(app.getHttpServer())
        .post('/api/tokens')
        .send({})
        .expect(400);
    });
  });

  describe('Transactions (Protected)', () => {
    it('POST /transaction/create - Unauthorized without token', () => {
      return request(app.getHttpServer())
        .post('/transaction/create')
        .send({ data: 'test_data' })
        .expect(401);
    });

    it('POST /status - Unauthorized without token', () => {
      return request(app.getHttpServer())
        .post('/status')
        .send({ transaction_id: 'some_hash' })
        .expect(401);
    });
  });
});
