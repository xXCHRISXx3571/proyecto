import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppController } from '../src/app.controller';

describe('Health endpoint (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /health confirma que el proceso está disponible', () =>
    request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect(({ body }) =>
        expect(body).toMatchObject({ status: 'ok', service: 'cafecom-api' }),
      ));
});
