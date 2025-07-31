# Todo Application

A scalable todo application built with React, Node.js, and MongoDB.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Community Edition
- npm or yarn

### Windows Prerequisites
- **PowerShell 5.1 or higher** (included with Windows 10/11)
- **Git for Windows** (download from [git-scm.com](https://git-scm.com/download/win))
- **Windows Terminal** (recommended, available from Microsoft Store)

## MongoDB Installation

### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. Choose "Complete" installation
4. Install MongoDB Compass (GUI tool) when prompted
5. MongoDB will be installed as a Windows Service and will start automatically

**Windows Service Management:**
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# Start MongoDB service (if not running)
Start-Service MongoDB

# Stop MongoDB service
Stop-Service MongoDB

# Set MongoDB to start automatically on boot
Set-Service MongoDB -StartupType Automatic
```

### macOS
1. Using Homebrew:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

2. Start MongoDB service:
```bash
brew services start mongodb-community
```

### Linux (Ubuntu)
1. Import the MongoDB public GPG key:
```bash
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
   --dearmor
```

2. Create a list file for MongoDB:
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

3. Update the package database:
```bash
sudo apt-get update
```

4. Install MongoDB packages:
```bash
sudo apt-get install -y mongodb-org
```

5. Start MongoDB:
```bash
sudo systemctl start mongod
```

6. Enable MongoDB to start on boot:
```bash
sudo systemctl enable mongod
```

## Project Setup

1. Clone the repository:

**Windows (PowerShell):**
```powershell
git clone <repository-url>
cd todo
```

**macOS/Linux:**
```bash
git clone <repository-url>
cd todo
```

2. Install dependencies for both server and web:

**Windows (PowerShell):**
```powershell
# Install server dependencies
cd server
npm install

# Install web dependencies
cd ..\web
npm install
```

**macOS/Linux:**
```bash
# Install server dependencies
cd server
npm install

# Install web dependencies
cd ../web
npm install
```

3. Create a `.env` file in the server directory:

**Windows (PowerShell):**
```powershell
cd ..\server
New-Item -ItemType File -Name ".env"
```

**macOS/Linux:**
```bash
cd ../server
touch .env
```

4. Add the following to your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/todo-app
PORT=3001
```

5. Start the development servers:

**Windows (PowerShell):**

In one PowerShell window (server):
```powershell
cd server
npm run dev
```

In another PowerShell window (web):
```powershell
cd web
npm run dev
```

**macOS/Linux:**

In one terminal (server):
```bash
cd server
npm run dev
```

In another terminal (web):
```bash
cd web
npm run dev
```

The application should now be running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project Structure

```
todo/
├── server/                 # Backend server
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── models/        # MongoDB models
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Server entry point
│   └── package.json
│
├── web/                   # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── package.json
│
└── aws-deployment/        # AWS deployment configuration
    ├── terraform/         # Infrastructure as Code
    ├── deploy-*.sh        # Linux/macOS deployment scripts
    └── deploy-*.ps1       # Windows deployment scripts
```

## Available Scripts

### Server
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the server
- `npm start`: Start production server
- `npm test`: Run server tests

### Web
- `npm run dev`: Start development server
- `npm run build`: Build the web application
- `npm start`: Start production server
- `npm test`: Run web tests

## Testing

### Running Tests

**Windows (PowerShell):**
```powershell
# Run all server tests
cd server
npm test

# Run all web tests
cd ..\web
npm test

# Run specific test file
npm test -- dateUtils.test.ts

# Run tests in watch mode
npm test -- --watch
```

**macOS/Linux:**
```bash
# Run all server tests
cd server
npm test

# Run all web tests
cd ../web
npm test

# Run specific test file
npm test -- dateUtils.test.ts

# Run tests in watch mode
npm test -- --watch
```

## Database Management

### Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Create a new database named `todo-app`

### Using MongoDB Shell

**Windows:**
```powershell
# Open MongoDB Shell
mongosh

# Create and use database
use todo-app
```

**macOS/Linux:**
```bash
# Open MongoDB Shell
mongosh

# Create and use database
use todo-app
```

## AWS Deployment

The project includes comprehensive AWS deployment configuration with support for both Windows and Linux/macOS environments.

### Prerequisites for AWS Deployment

**Windows:**
1. Install AWS CLI: Download from [aws.amazon.com/cli](https://aws.amazon.com/cli/)
2. Install Terraform: Download from [terraform.io](https://www.terraform.io/downloads.html)
3. Install Docker Desktop: Download from [docker.com](https://www.docker.com/products/docker-desktop/)
4. Configure AWS credentials:
```powershell
aws configure
```

**macOS/Linux:**
1. Install AWS CLI, Terraform, and Docker using your package manager
2. Configure AWS credentials:
```bash
aws configure
```

### Deployment Steps

**Windows (PowerShell):**
```powershell
# Navigate to deployment directory
cd aws-deployment

# Deploy infrastructure
.\deploy-infrastructure.ps1 -Environment production -AwsRegion us-east-1

# Deploy applications
.\deploy-applications.ps1

# Setup database
.\setup-database.ps1
```

**macOS/Linux:**
```bash
# Navigate to deployment directory
cd aws-deployment

# Make scripts executable
chmod +x *.sh

# Deploy infrastructure
./deploy-infrastructure.sh production us-east-1

# Deploy applications
./deploy-applications.sh

# Setup database
./setup-database.sh
```

For detailed deployment instructions, see [aws-deployment/DEPLOYMENT_GUIDE.md](aws-deployment/DEPLOYMENT_GUIDE.md).

## Troubleshooting

### MongoDB Connection Issues

**Windows:**
1. Check if MongoDB service is running:
```powershell
Get-Service -Name MongoDB
```

2. Start MongoDB service if not running:
```powershell
Start-Service MongoDB
```

3. Check MongoDB logs:
```powershell
Get-Content "C:\Program Files\MongoDB\Server\6.0\log\mongod.log" -Tail 50
```

**macOS:**
```bash
brew services list
```

**Linux:**
```bash
sudo systemctl status mongod
```

### Port Conflicts

If port 3000 or 3001 is already in use:

**Windows (PowerShell):**
```powershell
# Find process using port 3000
netstat -ano | Select-String ":3000"

# Kill process by PID (replace XXXX with actual PID)
Stop-Process -Id XXXX -Force
```

**macOS/Linux:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process by PID
kill -9 <PID>
```

### Node.js Issues

**Windows:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**macOS/Linux:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### PowerShell Execution Policy

If you encounter execution policy errors on Windows:
```powershell
# Check current execution policy
Get-ExecutionPolicy

# Set execution policy to allow local scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker Issues on Windows

1. Ensure Docker Desktop is running
2. Check Windows Subsystem for Linux 2 (WSL2) is enabled
3. Verify virtualization is enabled in BIOS
4. Restart Docker Desktop if containers fail to start

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.