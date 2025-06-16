# Todo Application

A scalable todo application built with React, Node.js, and MongoDB.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Community Edition
- npm or yarn

## MongoDB Installation

### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. Choose "Complete" installation
4. Install MongoDB Compass (GUI tool) when prompted
5. MongoDB will be installed as a Windows Service and will start automatically

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
```bash
git clone <repository-url>
cd todo
```

2. Install dependencies for both server and web:
```bash
# Install server dependencies
cd server
npm install

# Install web dependencies
cd ../web
npm install
```

3. Create a `.env` file in the server directory:
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
└── web/                   # Frontend application
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/        # Page components
    │   ├── services/     # API services
    │   └── types/        # TypeScript types
    └── package.json
```

## Available Scripts

### Server
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the server
- `npm start`: Start production server

### Web
- `npm run dev`: Start development server
- `npm run build`: Build the web application
- `npm start`: Start production server

## Database Management

### Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Create a new database named `todo-app`

### Using MongoDB Shell
1. Open terminal
2. Run `mongosh`
3. Create and use database:
```javascript
use todo-app
```

## Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB service is running:
   - Windows: Check Services app
   - macOS: `brew services list`
   - Linux: `sudo systemctl status mongod`

2. Check MongoDB logs:
   - Windows: `C:\Program Files\MongoDB\Server\<version>\log\mongod.log`
   - macOS/Linux: `/var/log/mongodb/mongod.log`

### Port Conflicts
If port 3000 or 3001 is already in use:
1. Find the process using the port:
```bash
# Windows
netstat -ano | findstr :3000
# macOS/Linux
lsof -i :3000
```

2. Kill the process or change the port in the configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request