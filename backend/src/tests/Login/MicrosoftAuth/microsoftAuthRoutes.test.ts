import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import router from '../../../routes/microsoftAuthRoutes.js';
import usermodel from '../../../models/usermodel.js';

jest.mock('../../../models/usermodel.js', () => ({
  __esModule: true,
  default: {
    getAllUserInfo: jest.fn(),
    addStaffUser: jest.fn(),
  },
}));

const fetchMock = jest.fn();
(globalThis as any).fetch = fetchMock;

describe('Microsoft Entra ID login flow (/ms)', () => {
  const app = express();

  beforeAll(() => {
    app.use(express.json());
    app.use('/ms', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_SECRET = 'testsecret';
    process.env.MS_CLIENT_ID = 'cid';
    process.env.MS_TENANT_ID = 'tid';
    process.env.MS_REDIRECT_URI = 'http://localhost/ms/callback';
    process.env.MS_CLIENT_SECRET = 'csecret';
  });

  test(
    'login initiation succeeds and returns a Microsoft authorization URL with correct tenant and client_id',
    async () => {
      const res = await request(app).get('/ms/login').expect(200);

      expect(res.body.url).toContain(
        'https://login.microsoftonline.com/tid/oauth2/v2.0/authorize'
      );
      expect(res.body.url).toContain('client_id=cid');
    }
  );

  test(
    'login fails when authorization code is missing (returns 400)',
    async () => {
      await request(app).post('/ms/callback').send({}).expect(400);
    }
  );

  test(
    'login fails when Microsoft token exchange fails (returns 400)',
    async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'invalid_grant' }),
      });

      await request(app).post('/ms/callback').send({ code: 'abc' }).expect(400);
    }
  );

  test(
    'login fails when Microsoft Graph user profile request fails (returns 500)',
    async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'token123' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'unauthorized' }),
        });

      await request(app).post('/ms/callback').send({ code: 'abc' }).expect(500);
    }
  );

  test(
    'staff login succeeds when user does not exist (creates DB user and returns valid JWT)',
    async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'token123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            givenName: 'Ada',
            surname: 'Lovelace',
            jobTitle: 'Teacher',
            mail: 'ada@metropolia.fi',
            userPrincipalName: 'admin@metropolia.fi',
          }),
        });

      (usermodel as any).getAllUserInfo.mockResolvedValueOnce(null);
      (usermodel as any).addStaffUser.mockResolvedValueOnce({
        userid: 1,
        username: 'admin',
        email: 'ada@metropolia.fi',
        staff: 1,
        roleid: 4,
      });

      const res = await request(app)
        .post('/ms/callback')
        .send({ code: 'abc' })
        .expect(200);

      expect((usermodel as any).addStaffUser).toHaveBeenCalledTimes(1);
      expect(res.body.token).toBeTruthy();

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET!);
      expect(decoded).toHaveProperty('username');
    }
  );

  test(
    'login fails for non-staff user without course assignments (returns 403)',
    async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'token123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            givenName: 'Student',
            surname: 'One',
            jobTitle: null,
            mail: 'stud@metropolia.fi',
            userPrincipalName: 'stud@metropolia.fi',
          }),
        });

      (usermodel as any).getAllUserInfo.mockResolvedValueOnce(null);

      await request(app).post('/ms/callback').send({ code: 'abc' }).expect(403);
    }
  );
});
