import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;


  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
  it('/users (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'testUser' })
      .expect(201);
  
    expect(res.body).toHaveProperty('id');
  });
  it('/chat (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/chat')
      .send({ name: 'Chat Room' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
  });
  it('/messages (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/messages')
      .send({ text: 'Hello', chatRoomId: 1, userId: 1 })
      .expect(201);
    expect(res.body).toHaveProperty('id');
  });
  
  
});
