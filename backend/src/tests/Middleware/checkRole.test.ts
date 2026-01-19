import checkUserRole from '../../utils/checkRole.js';
import logger from '../../utils/logger.js';

jest.mock('../../utils/logger.js', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

describe('checkUserRole middleware', () => {
  const makeRes = () => {
    const res: any = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  const makeReq = (overrides: any = {}) =>
    ({
      path: '/test',
      method: 'GET',
      user: undefined,
      ...overrides,
    }) as any;

  test('denies access when no user is logged in (returns 403)', () => {
    const req = makeReq({ user: undefined });
    const res = makeRes();
    const next = jest.fn();

    checkUserRole(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'No user logged in' });
    expect(next).not.toHaveBeenCalled();
    expect((logger as any).error).toHaveBeenCalledTimes(1);
  });

  test('denies access when user role is not allowed (returns 403)', () => {
    const req = makeReq({ user: { role: 'student', email: 'stud@metropolia.fi' } });
    const res = makeRes();
    const next = jest.fn();

    checkUserRole(['admin', 'teacher'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
    expect(next).not.toHaveBeenCalled();
    expect((logger as any).error).toHaveBeenCalledTimes(1);
  });

  test('allows access when user role is allowed (calls next)', () => {
    const req = makeReq({ user: { role: 'teacher', email: 'teacher@metropolia.fi' } });
    const res = makeRes();
    const next = jest.fn();

    checkUserRole(['admin', 'teacher'])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
