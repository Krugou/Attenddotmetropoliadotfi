import express, {Router, Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import usermodel from '../models/usermodel.js';
import {User} from '../types.js';
import logger from '../utils/logger.js';

/**
 * Router for Microsoft Entra ID authentication routes.
 */
const router: Router = express.Router();

// Interface for Microsoft Graph API user response
interface MicrosoftGraphUserResponse {
  '@odata.context': string;
  'businessPhones': string[];
  'displayName': string;
  'givenName': string;
  'jobTitle': string | null;
  'mail': string;
  'mobilePhone': string | null;
  'officeLocation': string | null;
  'preferredLanguage': string | null;
  'surname': string;
  'userPrincipalName': string;
  'id': string;
  'isStaff'?: boolean;
}

// Interface for token data
interface TokenData {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

// Interface for more detailed user information
interface MicrosoftGraphDetailedUserResponse {
  '@odata.context': string; // The context of the response
  'value': {
    id: string; // The ID of the user
    principalDisplayName: string; // The display name of the principal
    principalId: string; // The ID of the principal
    principalType: string; // The type of the principal
    resourceDisplayName: string; // The display name of the resource
    resourceId: string; // The ID of the resource
    resourceType: string; // The type of the resource
  }[];
}

/**
 * Initiate Microsoft Entra ID authentication flow
 * Redirects the user to Microsoft's authentication page
 */
// @ts-ignore
router.get('/login', (req: Request, res: Response) => {
  try {
    // This would be configured with actual Entra ID client details in production
    const clientId = process.env.MS_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.MS_REDIRECT_URI || '');
    // Update scope to include User.Read.All permission
    const scope = encodeURIComponent('openid profile email User.Read.All');
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
router.post(
  '/callback',
  // @ts-ignore
  async (req: Request, res: Response, next: NextFunction) => {
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

      const tokenData = (await tokenResponse.json()) as TokenData;
      logger.info('Token data received successfully');
      // const idToken = tokenData.id_token;
      const accessToken = tokenData.access_token;

      // Fetch user profile data from Microsoft Graph API using the /me endpoint
      // this needs right permissions in the scope "User.Read"
      const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        logger.error(`Failed to get user data: ${userResponse.status}`);
        return res.status(500).json({error: 'Failed to retrieve user data'});
      }

      const userData =
        (await userResponse.json()) as MicrosoftGraphUserResponse;
      console.log('Basic user data retrieved successfully', userData);

      // Fetch additional user details
      // this needs right permissions in the scope "User.Read.All"
      try {
        const moreDetailsUserResponse = await fetch(
          `https://graph.microsoft.com/v1.0/users/${userData.id}/appRoleAssignments`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!moreDetailsUserResponse.ok) {
          logger.error(
            `Failed to get detailed user data: ${moreDetailsUserResponse.status}`,
            {
              userId: userData.id,
              statusText: moreDetailsUserResponse.statusText,
            },
          );
        } else {
          // Parse the JSON response
          const detailedUserData =
            (await moreDetailsUserResponse.json()) as MicrosoftGraphDetailedUserResponse;
          if (
            detailedUserData.value.some(
              (item) => item.principalDisplayName === 'Metropolia staff',
            )
          ) {
            userData.isStaff = true;
          }

          if (userData.isStaff) {
            logger.info(
              `User ${userData.mail} is confirmed as staff via appRoleAssignments.`,
            );
          }

          // Use any additional fields from detailedUserData as needed
        }
      } catch (error) {
        // Log error but continue with basic user data
        logger.error('Error fetching detailed user information:', error);
      }

      // Extract user information from the token and Graph API
      const email = userData.mail;
      const firstName = userData.givenName || '';
      const lastName = userData.surname || '';
      const jobTitle = userData.jobTitle || '';

      // Extract username from email (same as in userroutes.ts)
      const username = userData.userPrincipalName.split('@')[0];

      // Determine if user is staff based on job title or other indicators
      // This aligns with the logic in userroutes.ts
      const isStaff = !!jobTitle;
      if (isStaff) {
        logger.info(`User was Confirmed as staff via job title: ${jobTitle}`);
      }
      logger.info(`MS Auth: ${email} - isStaff: ${isStaff}`);

      // If the logged-in user is staff and they don't exist in the DB yet, add them to the DB
      if (isStaff) {
        try {
          // Check if the user exists in the database
          const userFromDB = await usermodel.getAllUserInfo(email);

          if (userFromDB === null) {
            // Determine role ID based on username pattern - matching userroutes.ts logic
            let roleid;
            switch (username) {
              case 'admin':
                roleid = 4;
                break;
              case 'counselor':
                roleid = 2;
                break;
              default:
                roleid = 3; // default to teacher
            }

            // Create userData object matching the structure used in userroutes.ts
            const userData = {
              username: username,
              staff: 1,
              first_name: firstName,
              last_name: lastName,
              email: email,
              roleid: roleid,
              activeStatus: 1,
              language: 'en',
              darkMode: 0,
            };
            // If the staff user doesn't exist, add them to the database
            const addStaffUserResponse = await usermodel.addStaffUser(userData);
            if (!addStaffUserResponse) {
              logger.error('Failed to add staff user to the database.');
              return res.status(500).json({error: 'Failed to create user'});
            }

            // Create a token for the user
            const token = jwt.sign(
              addStaffUserResponse as User,
              process.env.JWT_SECRET as string,
              {
                expiresIn: '2h',
              },
            );

            // Send the user and the token in the response
            return res.json({user: addStaffUserResponse, token});
          } else {
            // If the staff user exists, simply authenticate them
            logger.info(`Staff Microsoft login success for user: ${username}`);

            // Create a token for the user
            const token = jwt.sign(
              userFromDB as User,
              process.env.JWT_SECRET as string,
              {
                expiresIn: '2h',
              },
            );

            // Send the user and token in response
            return res.json({user: userFromDB, token});
          }
        } catch (error) {
          logger.error('Error processing staff user:', error);
          return res.status(500).json({error: 'Internal server error'});
        }
      }

      // If the logged-in user is not staff, check if they exist in database
      if (!isStaff) {
        try {
          // Find user in database by email
          const userFromDB = await usermodel.getAllUserInfo(email);

          if (!userFromDB) {
            logger.info('User is not assigned to any courses', {email});
            return res.status(403).json({
              message:
                'You are currently not assigned to any courses. Please contact your teacher to be assigned to a course.',
            });
          }

          logger.info(`Non-staff Microsoft login for user: ${username}`);

          // Create a token for the user
          const token = jwt.sign(
            userFromDB as User,
            process.env.JWT_SECRET as string,
            {
              expiresIn: '2h',
            },
          );

          // Send the user and token in response
          return res.json({user: userFromDB, token});
        } catch (error) {
          logger.error('Error processing non-staff user:', error);
          return res.status(500).json({error: 'Internal server error'});
        }
      }
    } catch (error) {
      logger.error('Error in Microsoft authentication callback:', error);
      return res.status(500).json({error: 'Internal server error'});
    }
  },
);

export default router;
