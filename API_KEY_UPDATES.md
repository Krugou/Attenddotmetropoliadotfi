# Updating API Keys and Authentication Credentials

This document provides step-by-step instructions for updating the Metropolia Open Data API key and Microsoft Entra ID credentials for the attendance application.

## Prerequisites

- Access to Metropolia's internal network or VPN connection
- SSH access credentials to the production server
- Administrative privileges for editing environment variables

## Updating API Keys and Credentials

### Step 1: Connect to the Server

1. Open a terminal or command prompt
2. Connect to the server using SSH:

   ```bash
   ssh kaarleh@10.120.36.68
   ```

3. When prompted, enter the password: `password1`

> **Note**: This connection is only possible from within Metropolia's internal network or via VPN.

### Step 2: Navigate to the Application Directory

```bash
cd Jaksurveillance
cd backend
```

### Step 3: Edit Environment Variables

Open the environment configuration file:

```bash
nano .env
```

Update the following variables as needed:

```
# Metropolia Open Data API
OPENDATA_API_KEY=your_new_api_key_here

# Microsoft Entra ID (Azure AD) Credentials
ENTRA_ID_CLIENT_ID=your_new_client_id_here
ENTRA_ID_CLIENT_SECRET=your_new_client_secret_here
ENTRA_ID_TENANT_ID=your_new_tenant_id_here
```

Save the file by pressing `CTRL+X`, then `Y` to confirm changes, followed by `Enter`.

### Step 4: Rebuild and Restart the Application

Navigate back to the root application directory and rebuild:

```bash
cd ..
npm run rebuild
```

This command will rebuild and restart the application with the updated credentials.

### Step 5: Verify Changes

Check the application logs to ensure there are no authentication errors:

```bash
cd backend/logs
tail -f logfile.log
```

## Troubleshooting

If you encounter authentication issues after updating credentials:

1. Verify the credentials are entered correctly without any typos
2. Check that there are no trailing spaces in the .env file
3. Ensure the API keys have the proper permissions
4. Review the error logs for specific error messages

For persistent issues, contact the system administrator or development team lead.

## Security Notes

- Never share API keys or credentials via unsecured channels
- Regularly rotate API keys according to security best practices
- Keep a secure backup of previous working credentials
- Follow the principle of least privilege when requesting new API credentials
