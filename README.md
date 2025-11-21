
# NexText - Real-Time Chat Application

A modern, real-time messaging platform built with React, TypeScript, Express, and Firebase. NexText provides a WhatsApp-like experience with glass-morphism UI, PIN-based connections, and real-time messaging capabilities.

![NexText](https://img.shields.io/badge/NexText-Chat%20Application-blue)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)

## 🌟 Features

### Core Messaging
- **Real-time Chat**: Instant message delivery using Firebase Realtime Database and Socket.io
- **Message Types**: Text, images, GIFs, emojis, and file attachments
- **Message Actions**: Edit, delete, reply, and react to messages
- **Typing Indicators**: See when someone is typing
- **Read Receipts**: Single check (sent), double check (delivered), double check filled (read)
- **Message Search**: Search messages within chats by text and date range

### User Management
- **PIN-based Connections**: Unique 6-character alphanumeric PIN for each user
- **Firebase Authentication**: Secure email/password authentication
- **User Profiles**: Display name, bio, profile picture, and custom status
- **Online Presence**: Real-time online/offline status tracking
- **Contact Management**: Add contacts via PIN, view contact list

### Group Features
- **Group Chats**: Create and manage group conversations
- **Group Settings**: Update group name, description, and avatar
- **Member Management**: Add/remove members, view member list
- **Group Roles**: Admin and member roles with permissions

### UI/UX Features
- **Glass-morphism Design**: Modern translucent UI with backdrop blur effects
- **Dark Mode**: Eye-friendly dark theme by default
- **Responsive Design**: Mobile-first approach (max-width: 480px)
- **Smooth Animations**: Framer Motion for fluid transitions
- **Emoji Support**: Built-in emoji picker for messages and reactions
- **GIF Integration**: Giphy API integration for GIF search
- **File Upload**: Image and file sharing with Firebase Storage

### Settings & Privacy
- **Account Settings**: Manage profile, phone number, and account details
- **Privacy Controls**: Block contacts, manage last seen, profile photo visibility
- **Security Options**: Two-factor authentication, login alerts
- **Notification Preferences**: Customize push, in-app, and email notifications
- **Theme Customization**: Light, dark, and auto theme options
- **Wallpaper Settings**: Customize chat backgrounds

### Additional Features
- **Status Updates**: WhatsApp-style status feature
- **Voice/Video Calls**: Call history and management (UI ready)
- **Chat Search**: Search across all conversations
- **Message Context Menu**: Right-click menu for message actions
- **Unread Count**: Badge notifications for unread messages
- **Chat Pinning**: Pin important chats to the top

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js & Express** - Server framework
- **TypeScript** - Type safety
- **Socket.io** - WebSocket server
- **Firebase Admin SDK** - Backend Firebase integration
- **Multer** - File upload handling

### Database & Storage
- **Firebase Authentication** - User authentication
- **Firebase Realtime Database** - Real-time data sync
- **Cloud Firestore** - User profiles and metadata
- **Firebase Storage** - File and image storage

### Development Tools
- **ESBuild** - Fast bundling
- **PostCSS** - CSS processing
- **Drizzle ORM** - Type-safe database queries
- **TSX** - TypeScript execution

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utility functions and API clients
│   │   ├── pages/        # Page components
│   │   └── App.tsx       # Root component
│   └── public/           # Static assets
├── server/                # Backend Express application
│   ├── api/              # API route handlers
│   ├── middleware/       # Express middleware
│   ├── utils/           # Utility functions
│   ├── firebase-admin.ts # Firebase Admin setup
│   ├── socket.ts        # Socket.io configuration
│   └── routes.ts        # API route definitions
└── shared/              # Shared types and schemas

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with enabled services:
  - Authentication (Email/Password)
  - Realtime Database
  - Cloud Firestore
  - Storage

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Firebase Client (Frontend)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Server
PORT=5000
```

### Installation

1. **Clone the repository** (if applicable) or download the project

2. **Install dependencies**:
```bash
npm install
```

3. **Configure Firebase**:
   - Go to Firebase Console
   - Create a new project or use existing
   - Enable Authentication, Realtime Database, Firestore, and Storage
   - Download service account key (Project Settings > Service Accounts)
   - Add credentials to `.env` file

4. **Start development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Build

```bash
npm run build
npm run start
```

## 🔐 Security Features

### Authentication & Authorization
- Firebase Authentication with email/password
- JWT tokens for API requests
- Protected API routes with authentication middleware
- Automatic token refresh

### Data Security
- Environment variables for sensitive data
- Firebase Security Rules for database access control
- HTTPS-only in production
- Input validation and sanitization

### PIN System Security
- Cryptographically secure random generation
- Global uniqueness checks
- Collision prevention (max 10 retries)
- Cannot add self as contact
- Duplicate contact prevention

## 📡 API Endpoints

### Users
- `POST /api/users/profile` - Create user profile
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/by-pin/:pin` - Find user by PIN

### Chats
- `POST /api/chats/create` - Create or get existing chat
- `GET /api/chats/list` - Get all user chats
- `GET /api/chats/:chatId` - Get specific chat
- `PUT /api/chats/:chatId/read` - Mark chat as read

### Messages
- `GET /api/messages/:chatId/messages` - Get chat messages
- `GET /api/messages/:chatId/search` - Search messages

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups/:groupId` - Get group details
- `PUT /api/groups/:groupId` - Update group
- `POST /api/groups/:groupId/members` - Add members
- `DELETE /api/groups/:groupId/members/:userId` - Remove member

### Upload
- `POST /api/upload/image` - Upload image file

## 🔌 Socket.io Events

### Client to Server
- `join-chat` - Join chat room
- `leave-chat` - Leave chat room
- `send-message` - Send new message
- `typing-start` - User started typing
- `typing-stop` - User stopped typing
- `react-to-message` - Add reaction
- `edit-message` - Edit message
- `delete-message` - Delete message

### Server to Client
- `new-message` - New message received
- `message-edited` - Message was edited
- `message-deleted` - Message was deleted
- `message-reaction` - Reaction added
- `message-status-update` - Status changed
- `user-typing` - Typing status changed
- `message-error` - Error occurred

## 🎨 Design Philosophy

NexText follows a modern, premium design approach:

- **Glass-morphism**: Translucent surfaces with backdrop blur
- **Dark Mode First**: Optimized for low-light environments
- **Gradient Accents**: Purple-to-pink gradients for CTAs
- **Micro-interactions**: Smooth animations on all interactions
- **Mobile-First**: Responsive design starting at 480px max-width
- **Accessibility**: ARIA labels, keyboard navigation, high contrast

## 📱 Supported Platforms

- **Web Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Web**: iOS Safari, Chrome Mobile
- **Screen Sizes**: Optimized for 320px - 1920px widths

## 🧪 Testing

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing documentation.

## 📚 Additional Documentation

- [PIN System Documentation](PIN_SYSTEM.md) - Detailed PIN connection system
- [Backend Schema](BACKEND_SCHEMA.md) - Database structure and API documentation
- [Design Guidelines](design_guidelines.md) - UI/UX design specifications
- [Testing Guide](TESTING_GUIDE.md) - Testing procedures and checklist

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Radix UI for accessible components
- Tailwind CSS for styling utilities
- Lucide React for beautiful icons
- Giphy for GIF integration

## 📧 Support

For issues, questions, or support:
- Email: support@nextext.com
- Live Chat: Available 24/7 in app

## 🗺️ Roadmap

### Planned Features
- [ ] Voice messages
- [ ] Video/voice calls implementation
- [ ] End-to-end encryption
- [ ] Multi-device sync
- [ ] Desktop application
- [ ] Message scheduling
- [ ] Polls and surveys
- [ ] Location sharing
- [ ] Contact sync
- [ ] Backup and restore

---

**Built with ❤️ using React, Firebase, and TypeScript**
