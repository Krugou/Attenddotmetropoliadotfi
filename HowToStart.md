# Getting Started with Metropolia Attendance App

This guide provides comprehensive instructions for setting up, configuring, and maintaining the Metropolia Attendance application.

## Prerequisites

Before you begin, ensure you have the following:

- **API Keys**:
  - Metropolia Open Data API key for course and lecture data integration
  - Microsoft Entra ID (Azure AD) credentials for authentication
- **Development Environment**:
  - Node.js (LTS version recommended)
  - npm or yarn package manager
  - MariaDB server
  - Git

## Development Installation

### Database Setup

1. Install MariaDB server and ensure it's running
2. Import the database schema:

   ```bash
   mysql -u root -p < backend/database/jaksec.sql
   ```

3. Create database users with appropriate permissions:

   ```bash
   mysql -u root -p < backend/database/createusers.sql
   ```

### Environment Configuration

1. Navigate to the backend folder and create a `.env` file:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Update the `.env` file with your specific configuration values:
   - Database credentials
   - API keys
   - JWT secret
   - Microsoft authentication details

### Running the Application

From the project root folder:

- **Production Build**:

  ```bash
  npm run all
  ```

  This builds and starts both frontend and backend.

- **Frontend Production Build**:

  ```bash
  cd frontend && npm run build
  ```

- **Development Mode**:

  ```bash
  npm start
  ```

  This starts both frontend and backend in development mode with hot-reloading.

## Server Deployment

### Initial Server Setup

1. Install MariaDB server on your production server
2. Import the database schema:

   ```bash
   mysql -u root -p < backend/database/jaksec.sql
   ```

3. Create necessary database users:

   ```bash
   mysql -u root -p < backend/database/createusers.sql
   ```

### Web Server Configuration

1. Configure Apache server as specified in [server configuration guide](serversideconf/readme.md)
2. Set up process management:

   ```bash
   cp backend/ecosystem.config.cjs.example backend/ecosystem.config.cjs
   ```

3. Edit `ecosystem.config.cjs` with your production environment settings
4. Start the application using PM2:

   ```bash
   pm2 start backend/ecosystem.config.cjs
   ```

## Updating API Keys and Authentication Credentials via SSH

### SSH Connection Setup

1. Connect to your server using SSH:

   ```bash
   ssh username@your-server-hostname
   ```

   Replace `username` with your server username and `your-server-hostname` with your server's address.

2. Navigate to your application directory:

   ```bash
   cd /path/to/attenddotmetropoliadotfi
   ```

### Updating Environment Variables

#### Method 1: Direct .env File Edit

1. Use a text editor to open the `.env` file:

   ```bash
   nano backend/.env
   ```

2. Update the relevant values:

   ```
   # Metropolia API Configuration
   APIKEYMETROPOLIA="your_new_api_key"

   # Microsoft Entra ID (Azure AD) Configuration
   MS_CLIENT_ID="your_new_microsoft_client_id"
   MS_CLIENT_SECRET="your_new_microsoft_client_secret"
   MS_REDIRECT_URI="your_redirect_uri"
   MS_TENANT_ID="your_tenant_id"
   ```

3. Save and exit (in nano: Ctrl+O, Enter, Ctrl+X)

#### Method 2: Using sed for Non-Interactive Updates

For automated deployments or scripts:

```bash
# Update Metropolia API key
sed -i 's/^APIKEYMETROPOLIA=.*/APIKEYMETROPOLIA="your_new_api_key"/' backend/.env

# Update Microsoft authentication credentials
sed -i 's/^MS_CLIENT_ID=.*/MS_CLIENT_ID="your_new_microsoft_client_id"/' backend/.env
sed -i 's/^MS_CLIENT_SECRET=.*/MS_CLIENT_SECRET="your_new_microsoft_client_secret"/' backend/.env
```

### Applying Changes

After updating the environment variables, restart the application to apply changes:

```bash
# If using PM2
pm2 restart backend/ecosystem.config.cjs

# If running directly
cd backend
npm run build
npm run start
```

### Security Best Practices

1. **Key Rotation**: Regularly update API keys and secrets (recommended every 90 days)
2. **Access Control**: Restrict `.env` file permissions to the application user only:

   ```bash
   chmod 600 backend/.env
   ```

3. **Backup**: Always create a backup before making changes:

   ```bash
   cp backend/.env backend/.env.backup
   ```

4. **Audit**: Keep a record of when credentials are updated and by whom
5. **Secure Connection**: Only update credentials over a secure SSH connection, never over unencrypted channels

### Troubleshooting

If the application fails to start after updating credentials:

1. Check the log files: `pm2 logs` or examine `backend/logs/error-logfile.log`
2. Verify the `.env` file format hasn't been corrupted
3. Restore from backup if necessary: `cp backend/.env.backup backend/.env`
4. Ensure the new credentials are valid and have the necessary permissions

## Maintenance and Monitoring

- Monitor application logs: `pm2 logs`
- Check server performance: `pm2 monit`
- Set up automated backups of your database
- Implement a monitoring solution for uptime and performance

After following these steps, your Metropolia Attendance App should be up and running with secure, well-managed authentication credentials!
