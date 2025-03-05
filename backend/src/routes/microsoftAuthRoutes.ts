import express, {Router, Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import usermodel from '../models/usermodel.js';
import {User, UserData} from '../types.js';
import logger from '../utils/logger.js';
import {authenticate} from '../utils/auth.js';

/**
 * Router for Microsoft Entra ID authentication routes.
 */
const router: Router = express.Router();

/**
 * Initiate Microsoft Entra ID authentication flow
 * Redirects the user to Microsoft's authentication page
 */
router.get('/login', (req: Request, res: Response) => {
  try {
    // This would be configured with actual Entra ID client details in production
    const clientId = process.env.MS_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.MS_REDIRECT_URI || '');
    // add all the scopes needed for the application "Company attribuuttia josta pitäis tulla palautteena joko Metropolia Henkilökunta tai Metropolia Opiskelija, tai sitten ExtensionAttribute5 jossa joko 365staff tai 365student arvo"
    const scope = encodeURIComponent(
      'openid profile email User.Read offline_access extension_CompanyAttribute5',
    );
    const responseType = 'code';
    const tenantId = process.env.MS_TENANT_ID; // Metropolia's tenant ID

    if (!clientId || !tenantId) {
      logger.error('Missing Microsoft auth configuration');
      return res.status(500).json({
        error: 'Microsoft authentication is not properly configured',
      });
    }

    // Construct the Microsoft OAuth URL
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scope}&response_mode=query`;

    // Return the URL to the frontend for redirection
    res.status(200).json({url: authUrl});
  } catch (error) {
    logger.error('Error initiating Microsoft authentication:', error);
    res.status(500).json({error: 'Error initiating Microsoft authentication'});
  }
});

/**
 * Handle the OAuth callback from Microsoft Entra ID
 * This endpoint receives the authorization code and exchanges it for an access token
 */
router.post('/callback', async (req: Request, res: Response) => {
  try {
    // Check if the environment variables are not undefined
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    // Get the authorization code from the request
    const {code} = req.body;
    if (!code) {
      return res.status(400).json({error: 'No authorization code provided'});
    }

    // Exchange the authorization code for an access token
    const clientId = process.env.MS_CLIENT_ID;
    const clientSecret = process.env.MS_CLIENT_SECRET;
    const redirectUri = process.env.MS_REDIRECT_URI;
    const tenantId = process.env.MS_TENANT_ID;

    if (!clientId || !clientSecret || !redirectUri || !tenantId) {
      logger.error('Missing Microsoft auth configuration');
      return res.status(500).json({
        error: 'Microsoft authentication is not properly configured',
      });
    }

    // Call Microsoft's token endpoint
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      },
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      logger.error('Token exchange error:', errorData);
      return res
        .status(400)
        .json({error: 'Failed to exchange authorization code'});
    }

    const tokenData = await tokenResponse.json();
    const idToken = tokenData.id_token;

    // Decode the ID token to get user information
    // Note: In production, you should validate the token signature properly
    const tokenParts = idToken.split('.');
    const payload = JSON.parse(
      Buffer.from(tokenParts[1], 'base64').toString('utf-8'),
    );

    // Extract user information from the token
    const email = payload.email || payload.preferred_username;
    const name = payload.name || '';
    const [firstName = '', lastName = ''] = name.split(' ');

    // Check if user is staff based on profile information
    // This uses the 'extension_Role' claim from Azure AD
    const isStaff =
      payload.extension_Role === 'Staff' ||
      (payload.groups && payload.groups.includes('Staff'));

    const username = email.split('@')[0];

    // Handle staff users
    if (isStaff) {
      // Try to find the user in our database
      let userFromDB = await usermodel.getAllUserInfo(email);

      // If staff user doesn't exist, create a new user
      if (userFromDB === null) {
        const userData: UserData = {
          username,
          staff: 1,
          first_name: firstName,
          last_name: lastName,
          email,
          roleid: 3, // teacher role
        };

        // Add staff user to database
        userFromDB = await usermodel.addStaffUser(userData);

        if (!userFromDB) {
          logger.error('Failed to create staff user from Microsoft login');
          return res.status(500).json({error: 'Failed to create user'});
        }

        // Create a JWT token for the new staff user
        const token = jwt.sign(userFromDB as User, process.env.JWT_SECRET, {
          expiresIn: '2h',
        });

        // Return the user and token to the frontend
        return res.status(200).json({user: userFromDB, token});
      } else {
        // Existing staff user, use normal authentication
        req.body.username = email;
        return authenticate(req, res, (_: NextFunction) => {}, username);
      }
    } else {
      // For students, use the same authentication flow as normal login
      logger.info(`Non-staff Microsoft login attempt for user: ${username}`);
      req.body.username = email;
      return authenticate(req, res, (_: NextFunction) => {}, username);
    }
  } catch (error) {
    logger.error('Error in Microsoft authentication callback:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

export default router;
