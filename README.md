# Prodigy - Cross-Platform Todo App

A modern, feature-rich todo application built for web, iOS, and Android platforms. This app provides a seamless experience across all devices, similar to Microsoft Todo, with a focus on simplicity and productivity.

## Features

- 📱 Cross-platform support (Web, iOS, Android)
- ✨ Modern and intuitive user interface
- 🔄 Real-time synchronization across devices
- 📅 Due date management
- 📋 Task categorization and organization
- 🔍 Search functionality
- 🎯 Priority levels
- 🔔 Reminders and notifications
- 🌙 Dark/Light mode support
- 🔐 User authentication
- 📊 Progress tracking

## Tech Stack

- **Frontend**: React Native (for mobile) and React (for web)
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: Firebase Auth
- **State Management**: Redux Toolkit
- **Styling**: Styled Components
- **Testing**: Jest and React Testing Library

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- React Native development environment setup
- MongoDB
- Firebase account

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd prodigy
   ```

2. Install dependencies:
   ```bash
   # Install web dependencies
   npm install

   # Install mobile dependencies
   cd mobile
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both root and mobile directories
   - Add necessary environment variables (see `.env.example`)

4. Start the development servers:
   ```bash
   # Start web application
   npm run dev

   # Start mobile application
   cd mobile
   npm run ios     # for iOS
   npm run android # for Android
   ```

## Project Structure

```
prodigy/
├── web/                 # Web application
├── mobile/             # Mobile application (iOS & Android)
├── server/             # Backend server
├── shared/             # Shared utilities and types
└── docs/              # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Microsoft Todo
- Built with modern web and mobile technologies
- Community-driven development