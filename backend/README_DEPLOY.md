# Deployment Guide

This guide covers deploying the 4AM Management System to various platforms.

## Railway Deployment (Recommended)

Railway provides the easiest deployment experience with automatic builds and database provisioning.

### Steps

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" or "Deploy from Dockerfile"
   - Connect your repository

3. **Add PostgreSQL Database** (Recommended for production)
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL` environment variable

4. **Configure Environment Variables**
   - Go to your project settings
   - Add the following variables:
     - `JWT_SECRET`: Generate a secure random string (required)
     - `PORT`: Railway sets this automatically, but you can override it
     - `DATABASE_URL`: Automatically set if you added PostgreSQL (optional)

5. **Deploy**
   - Railway will automatically build and deploy from your Dockerfile
   - Or run: `railway up` from your backend directory

6. **Access Your Application**
   - Railway provides a public URL automatically
   - Access your app at `https://your-app.railway.app`

## Other Deployment Options

### Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
5. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   ```
6. Deploy: `git push heroku main`

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm install`
   - Run command: `npm start`
3. Add PostgreSQL database
4. Set environment variables in the dashboard

### VPS (Ubuntu/Debian)

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2** (Process Manager)
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone and setup**
   ```bash
   git clone your-repo
   cd 4AM_System/backend
   npm install
   ```

4. **Create .env file**
   ```bash
   nano .env
   # Add your environment variables
   ```

5. **Setup PostgreSQL** (optional)
   ```bash
   sudo apt-get install postgresql postgresql-contrib
   ```

6. **Start with PM2**
   ```bash
   pm2 start src/index.js --name 4am-system
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx reverse proxy** (recommended)
   ```bash
   sudo apt-get install nginx
   # Configure Nginx to proxy to localhost:4000
   ```

## Environment Variables

Required:
- `JWT_SECRET`: Secret key for JWT token signing (generate a secure random string)

Optional:
- `PORT`: Server port (default: 4000)
- `DATABASE_URL`: PostgreSQL or MySQL connection string
  - PostgreSQL: `postgresql://user:password@host:port/database`
  - MySQL: `mysql://user:password@host:port/database`
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`: Alternative MySQL config
- `BCRYPT_SALT_ROUNDS`: Bcrypt salt rounds (default: 10)
- `NODE_ENV`: Set to `production` for production environment

## Production Checklist

- [ ] Set `JWT_SECRET` to a secure random string
- [ ] Use PostgreSQL or MySQL (not SQLite) for production
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS if needed
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (e.g., Sentry)

## Database Migration

If you're migrating from SQLite to PostgreSQL/MySQL:

1. Export SQLite data (if needed)
2. Set `DATABASE_URL` in production
3. The application will automatically create tables on first run
4. Admin account (`admin@4am.com` / `admin123`) is created automatically

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format is correct
- Check database credentials
- Ensure database server is accessible

### Build Failures
- Ensure Node.js version is 14 or higher
- Check that all dependencies are in `package.json`
- Verify Dockerfile syntax if using Docker

### Runtime Errors
- Check logs: `pm2 logs` (if using PM2)
- Verify environment variables are set correctly
- Check database migrations ran successfully

