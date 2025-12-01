import express, { Router, type RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import usermodel from '../models/usermodel.js';
import logger from '../utils/logger.js';
import { User, UserData } from '../types.js';

const router: Router = express.Router();

// Helpers
const requireEnv = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`${k} is not set`);
  return v;
};

const signToken = (u: User) =>
  jwt.sign(u, requireEnv('JWT_SECRET'), { expiresIn: '2h' });

const roleFromUsername = (u: string) =>
  u === 'admin' ? 4 : u === 'counselor' ? 2 : 3;

// Handlers
const loginHandler: RequestHandler = (req, res) => {
  try {
    console.log(
      'row 44, microsoftAuthRoutes.ts, login path, initiating Microsoft Entra ID authentication flow'
    );

    const clientId = requireEnv('MS_CLIENT_ID');
    const tenantId = requireEnv('MS_TENANT_ID');
    const redirectUri = encodeURIComponent(requireEnv('MS_REDIRECT_URI'));
    const scope = encodeURIComponent('openid profile email User.Read');

    const url =
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize` +
      `?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}` +
      `&scope=${scope}&response_mode=query`;

    res.status(200).json({ url });
  } catch (err) {
    logger.error('MS /login config error', err);
    res
      .status(500)
      .json({ error: 'Microsoft authentication is not properly configured' });
  }
};

const callbackHandler: RequestHandler = async (req, res) => {
  try {
    console.log('row 80, microsoftAuthRoutes.ts, callback path, receives authorization code from Microsoft Entra ID and exchanges it for an access token');

    requireEnv('JWT_SECRET');

    const code = req.body?.code as string | undefined;
    if (!code) {
      res.status(400).json({ error: 'No authorization code provided' });
      return;
    }

    const client_id = requireEnv('MS_CLIENT_ID');
    const client_secret = requireEnv('MS_CLIENT_SECRET');
    const redirect_uri = requireEnv('MS_REDIRECT_URI');
    const tenantId = requireEnv('MS_TENANT_ID');

    // POST: Exchange authorization code for access token
    const tokenResp = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id,
          client_secret,
          code,
          redirect_uri,
          grant_type: 'authorization_code',
        }),
      }
    );

    if (!tokenResp.ok) {
      const e = await tokenResp.json().catch(() => ({}));
      logger.error('Token exchange error', e);
      res
        .status(400)
        .json({ error: 'Failed to exchange authorization code' });
      return;
    }

    const { access_token } = (await tokenResp.json()) as { access_token: string };

    // GET: Retrieve user data from Microsoft Graph API (/me)
    const meResp = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!meResp.ok) {
      logger.error('Graph /me error', meResp.status);
      res.status(500).json({ error: 'Failed to retrieve user data' });
      return;
    }

    const me = (await meResp.json()) as {
      givenName?: string;
      surname?: string;
      jobTitle?: string | null;
      mail?: string | null;
      userPrincipalName: string;
    };

    const email = me.mail as string;
    const firstName = me.givenName ?? '';
    const lastName = me.surname ?? '';
    const username = me.userPrincipalName.split('@')[0];
    const isStaff = !!me.jobTitle;

    if (isStaff) {
      const existing = await usermodel.getAllUserInfo(email);
      if (!existing) {
        console.log("row 169, microsoftAuthRoutes.ts, callback path, staff user doesn't exist in the database, adding them to the database");

        const userData: UserData = {
          username,
          staff: 1,
          first_name: firstName,
          last_name: lastName,
          email,
          roleid: roleFromUsername(username),
        };
        // @ts-expect-error mallin palautetyyppi
        const created = await usermodel.addStaffUser(userData);
        if (!created) {
          logger.error('Failed to add staff user');
          res.status(500).json({ error: 'Failed to create user' });
          return;
        }
        res.json({ user: created, token: signToken(created as User) });
        return;
      }
      logger.info(`Staff Microsoft login success for user: ${username}`);
      res.json({ user: existing, token: signToken(existing as User) });
      return;
    }

    console.log("row 235, microsoftAuthRoutes.ts, callback path, non-staff user doesn't exist in the database, checking if they exist in the database");

    const userFromDB = await usermodel.getAllUserInfo(email);
    if (!userFromDB) {
      logger.info('User is not assigned to any courses', { email });
      res.status(403).json({
        message:
          'You are currently not assigned to any courses. Please contact your teacher to be assigned to a course.',
      });
      return;
    }

    logger.info(`Non-staff Microsoft login for user: ${username}`);
    res.json({ user: userFromDB, token: signToken(userFromDB as User) });
  } catch (err) {
    logger.error('Error in Microsoft authentication callback', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Routes

// GET: Microsoft login — generate consent URL (Entra ID OAuth2)
router.get('/login', loginHandler);

// POST: Microsoft OAuth2 callback — exchange code, fetch user, issue JWT
router.post('/callback', callbackHandler);

export default router;
