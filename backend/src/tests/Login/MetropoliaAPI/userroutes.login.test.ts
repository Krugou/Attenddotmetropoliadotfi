import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

describe('User login routes (Metropolia API + dev users)', () => {
  let usermodel: any;
  let doFetch: any;
  let authenticate: any;
  let router: any;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env.JWT_SECRET = 'testsecret';

    process.env.devaccount = 'admin';
    process.env.devpass = 'adminpass';
    process.env.devcounseloraccount = 'counselor';
    process.env.devcounselorpass = 'counselorpass';

    // Mocks MUST be set before importing the router
    jest.doMock('../../../models/usermodel.js', () => ({
      __esModule: true,
      default: {
        getAllUserInfo: jest.fn(),
        addStaffUser: jest.fn(),
      },
    }));

    jest.doMock('../../../utils/doFetch.js', () => ({
      __esModule: true,
      default: jest.fn(),
    }));

    jest.doMock('../../../utils/auth.js', () => ({
      __esModule: true,
      authenticate: jest.fn((_req: any, res: any) => res.status(200).json({ ok: true })),
    }));

    jest.doMock('../../../utils/logger.js', () => ({
      __esModule: true,
      default: {
        info: jest.fn(),
        error: jest.fn(),
      },
    }));

    jest.doMock('express-rate-limit', () => ({
      __esModule: true,
      default: () => (_req: any, _res: any, next: any) => next(),
    }));

    // Now import after mocks + env
    router = (await import('../../../routes/userroutes.js')).default;
    usermodel = (await import('../../../models/usermodel.js')).default;
    doFetch = (await import('../../../utils/doFetch.js')).default;
    authenticate = (await import('../../../utils/auth.js')).authenticate;
  });

  const makeApp = () => {
    const app = express();
    app.use(express.json());
    // mount exactly like the router expects
    app.use('/', router);
    return app;
  };

  test('returns 403 when username/password is invalid', async () => {
    doFetch.mockResolvedValueOnce({ message: 'invalid username or password' });

    const app = makeApp();

    const res = await request(app)
      .post('/')
      .send({ username: 'x', password: 'y' })
      .expect(403);

    expect(res.body).toEqual({ message: 'Invalid username or password' });
  });

  test('non-staff can log in successfully', async () => {
    doFetch.mockResolvedValueOnce({
      staff: false,
      user: 'student',
      firstname: 'Sam',
      lastname: 'Student',
      email: 'sam@student.fi',
    });

    const app = makeApp();

    await request(app)
      .post('/')
      .send({ username: 'student', password: 'pw' })
      .expect(200);

    expect(authenticate).toHaveBeenCalledTimes(1);
  });

  test('staff user not in DB is created and receives JWT (login success)', async () => {
    doFetch.mockResolvedValueOnce({
      staff: true,
      user: 'teacher',
      firstname: 'Willie',
      lastname: 'Teacher',
      email: 'teacher@metropolia.fi',
    });

    usermodel.getAllUserInfo.mockResolvedValueOnce(null);
    usermodel.addStaffUser.mockResolvedValueOnce({
      userid: 1,
      username: 'teacher',
      email: 'teacher@metropolia.fi',
      staff: 1,
      roleid: 3,
    });

    const app = makeApp();

    const res = await request(app)
      .post('/')
      .send({ username: 'teacher', password: 'pw' })
      .expect(200);

    expect(usermodel.addStaffUser).toHaveBeenCalledTimes(1);
    expect(res.body.token).toBeTruthy();

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET!);
    expect(decoded).toHaveProperty('email', 'teacher@metropolia.fi');
  });

  test('admin can log in successfully', async () => {
    // Important: this hits getDevUser() path (no doFetch needed)
    usermodel.getAllUserInfo.mockResolvedValueOnce(null);

    usermodel.addStaffUser.mockResolvedValueOnce({
      userid: 99,
      username: 'admin',
      email: 'admin@metropolia.fi',
      staff: 1,
      roleid: 4,
    });

    const app = makeApp();

    const res = await request(app)
      .post('/')
      .send({ username: 'admin', password: 'adminpass' })
      .expect(200);

    expect(res.body.token).toBeTruthy();
    const callArg = usermodel.addStaffUser.mock.calls[0][0];
    expect(callArg.roleid).toBe(4);
  });

  test('staff user already exists -> authenticate is called (login success)', async () => {
    doFetch.mockResolvedValueOnce({
      staff: true,
      user: 'teacher',
      firstname: 'Willie',
      lastname: 'Teacher',
      email: 'teacher@metropolia.fi',
    });

    usermodel.getAllUserInfo.mockResolvedValueOnce({ userid: 123 });

    const app = makeApp();

    await request(app)
      .post('/')
      .send({ username: 'teacher', password: 'pw' })
      .expect(200);

    expect(authenticate).toHaveBeenCalledTimes(1);
  });

  test('returns 500 if JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;

    const app = makeApp();

    await request(app)
      .post('/')
      .send({ username: 'x', password: 'y' })
      .expect(500);
  });
});
