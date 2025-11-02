# 4AM Company Management System

A complete web-based management system for 4AM Company with support for Admin, Assistant, and Employee user types.

## Features

- **User Management**: Three user types (Admin, Assistant, Employee)
- **Authentication**: Secure JWT-based authentication
- **Task Management**: Create and manage tasks
- **User Statistics**: Admin dashboard with employee and assistant counts
- **Multi-database Support**: SQLite (default), MySQL, and PostgreSQL
- **Responsive Design**: Modern, mobile-friendly interface
- **Bilingual Support**: Arabic and English language support

## Project Structure

```
4AM_System/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth and validation middleware
│   │   ├── models/          # Database models
│   │   ├── public/          # Frontend static files
│   │   └── routes/          # API routes
│   ├── data/                # SQLite database storage
│   ├── Dockerfile           # Docker configuration
│   ├── docker-compose.yml   # Docker Compose configuration
│   ├── package.json         # Node.js dependencies
│   └── README_DEPLOY.md     # Deployment guide
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- (Optional) Docker and Docker Compose

### Local Development

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
   JWT_SECRET=your-secret-key-here
   PORT=4000
   # Optional: For MySQL or PostgreSQL
   # DATABASE_URL=mysql://user:password@host:port/database
   # DATABASE_URL=postgresql://user:password@host:port/database
   # Or use MySQL variables:
   # MYSQL_HOST=localhost
   # MYSQL_USER=root
   # MYSQL_PASSWORD=password
   # MYSQL_DATABASE=4am_system
   ```

4. **Run the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

5. **Access the application**
   - Open your browser to `http://localhost:4000`
   - Default admin account: `admin@4am.com` / `admin123`

### Using Docker

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create .env file** (as shown above)

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

## Database Configuration

The system supports three database options:

1. **SQLite** (Default): No configuration needed. Database is stored in `backend/data/database.sqlite`
2. **MySQL**: Set `MYSQL_URL` or `DATABASE_URL` with MySQL connection string
3. **PostgreSQL**: Set `DATABASE_URL` with PostgreSQL connection string

The system automatically detects which database to use based on environment variables.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "user_type": "employee",
    "department": "account-manager"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "admin@4am.com",
    "password": "admin123"
  }
  ```

- `GET /api/auth/me` - Get current user info (requires Bearer token)
- `GET /api/auth/users` - Get all users (Admin only, requires Bearer token)
- `GET /api/auth/stats` - Get user statistics (Admin only, requires Bearer token)

### Tasks

- `GET /api/tasks` - Get all tasks (requires Bearer token)
- `POST /api/tasks` - Create a new task (requires Bearer token)
  ```json
  {
    "title": "Task title",
    "description": "Task description"
  }
  ```

## User Types

- **Admin**: Full system access, can view all users and statistics
- **Assistant**: Can manage tasks and employees
- **Employee**: Can view assigned tasks

## Deployment

### Railway (Recommended)

See `backend/README_DEPLOY.md` for detailed Railway deployment instructions.

### Other Platforms

The application can be deployed to any Node.js hosting platform:
- Heroku
- DigitalOcean
- AWS
- Azure
- VPS

Ensure you set the following environment variables:
- `JWT_SECRET` (required)
- `PORT` (optional, defaults to 4000)
- `DATABASE_URL` (optional, for MySQL/PostgreSQL)

## Development

### Project Structure Details

- **Controllers**: Handle business logic and database operations
- **Middleware**: Authentication and input validation
- **Models**: Database connection and initialization
- **Routes**: API endpoint definitions
- **Public**: Frontend HTML, CSS, and JavaScript files

### Adding New Features

1. Create controller functions in `backend/src/controllers/`
2. Define routes in `backend/src/routes/`
3. Add validation middleware if needed
4. Update frontend in `backend/src/public/`

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Helmet.js for security headers
- Input validation on all endpoints
- Admin-only endpoints are protected

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software for 4AM Company.

## Support

For issues or questions, please contact the development team.
