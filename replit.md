# NexText - Real-Time Chat Application

## Overview

NexText is a modern, real-time messaging platform built with React, TypeScript, Express, and Firebase. It provides a WhatsApp-like experience with glass-morphism UI design, PIN-based user connections, and comprehensive messaging features. The application uses Firebase Realtime Database for instant message delivery, Firebase Firestore for user profiles and contacts, Firebase Authentication for secure user management, and Firebase Storage for media uploads.

The application is mobile-first (optimized for 480px max-width) with a futuristic design featuring glass-morphism effects, gradient colors, and smooth animations powered by Framer Motion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18.3.1 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query for server state management and caching
- Tailwind CSS with custom theme configuration for styling
- Radix UI components for accessible UI primitives
- Socket.io client for real-time bidirectional communication

**Design System:**
- Glass-morphism effects using backdrop-blur and semi-transparent backgrounds
- Dark mode as default with light mode toggle support
- Custom color palette with gradient combinations (primary: Deep Purple #8B5CF6, secondary: Cyan Blue #06B6D4, accent: Pink/Magenta #EC4899)
- Mobile-first responsive design with max-width constraints
- Typography using Inter and Poppins font families from Google Fonts

**State Management:**
- AuthContext for global authentication state using React Context API
- TanStack Query for API data fetching, caching, and synchronization
- Local component state for UI-specific interactions
- Socket.io for real-time message updates and typing indicators

**Key Components:**
- ChatWindow: Main messaging interface with message bubbles, typing indicators, and media support
- ChatList: Displays user conversations with unread counts and online status
- MessageInput: Handles text input, emoji selection, GIF integration, and file uploads
- ConnectModal: PIN-based contact addition interface
- ProfileView: User profile management with PIN display and bio editing

### Backend Architecture

**Technology Stack:**
- Express.js as the HTTP server framework
- TypeScript for type safety across server code
- Firebase Admin SDK for backend Firebase operations
- Socket.io server for WebSocket connections
- Multer for file upload handling

**API Architecture:**
- RESTful API design with resource-based routing
- JWT-based authentication using Firebase Auth tokens
- Middleware authentication layer for protected routes
- Request/response logging for debugging

**API Endpoints:**
- `/api/users` - User profile CRUD operations, contact management via PIN
- `/api/chats` - Chat creation, listing, and management
- `/api/messages` - Message search and retrieval
- `/api/groups` - Group chat creation and member management
- `/api/upload` - Media file uploads to Firebase Storage
- `/api/notifications` - Push notification token registration and sending

**Real-time Communication:**
- Socket.io for bidirectional event-based communication
- Authentication middleware for socket connections using Firebase tokens
- Events: join-chat, leave-chat, typing-start, typing-stop, new-message
- Presence tracking in Firebase Realtime Database for online/offline status

### Database Architecture

**Firebase Firestore (User Data):**
- `/users/{userId}` - User profiles with PIN, displayName, bio, photoURL, email, createdAt
- `/users/{userId}/contacts/{contactId}` - Subcollection for user contacts with metadata
- Used for structured, queryable data requiring indexes and complex queries

**Firebase Realtime Database (Real-time Data):**
- `/chats/{chatId}` - Chat metadata including participants, lastMessage, unreadCount
- `/messages/{chatId}/{messageId}` - Individual messages with text, timestamp, reactions, media URLs
- `/presence/{userId}` - User online status and last seen timestamps
- `/typing/{chatId}/{userId}` - Active typing indicators per chat
- `/groups/{groupId}` - Group chat configuration and member lists
- Optimized for real-time synchronization and instant updates

**Data Flow:**
- User profiles created/updated in Firestore on signup/profile edit
- Contacts stored as Firestore subcollections for easy querying
- Messages stored in Realtime Database for instant delivery
- Chat metadata synchronized between Firestore and Realtime Database
- Media files uploaded to Firebase Storage with public URLs stored in messages

**PIN System:**
- 6-character alphanumeric codes (A-Z, 0-9) generated on user creation
- Globally unique validated through Firestore queries
- Used for contact discovery without requiring email/phone exposure
- PIN generation utility with retry logic for collision handling

### Authentication & Authorization

**Firebase Authentication:**
- Email/password authentication flow
- Firebase ID tokens for API authentication
- Token verification in Express middleware
- Protected routes redirect to `/auth` when unauthenticated
- Secure logout with session cleanup

**Security Model:**
- All API endpoints require valid Firebase auth tokens
- User-specific data access enforced through Firebase security rules
- File uploads restricted to authenticated users
- Socket connections authenticated before accepting events

## External Dependencies

### Firebase Services

**Firebase Realtime Database:**
- URL: `https://chatting-application-8180c-default-rtdb.asia-southeast1.firebasedatabase.app`
- Purpose: Real-time message synchronization, typing indicators, presence tracking
- Access: Firebase Admin SDK with service account credentials

**Firebase Firestore:**
- Project: chatting-application-8180c
- Purpose: User profiles, contacts, structured data storage
- Access: Requires database creation in Firebase Console if not initialized

**Firebase Authentication:**
- Project: chatting-application-8180c
- Purpose: User registration, login, token generation
- Methods: Email/password

**Firebase Storage:**
- Bucket: chatting-application-8180c.firebasestorage.app
- Purpose: Image uploads, profile pictures, media attachments
- Access: Public URLs after upload, user-scoped file paths

**Required Environment Variables:**
- `FIREBASE_PROJECT_ID` - Firebase project identifier
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key (with escaped newlines)

### Third-Party APIs

**Giphy API:**
- API Key: Hardcoded in `GifPicker.tsx` component
- Purpose: GIF search and trending GIFs for message attachments
- Endpoints: Trending and search endpoints

### Build & Development Tools

**Drizzle ORM:**
- Configuration present but not actively used for Firebase
- Configured for PostgreSQL with Neon Database support
- Schema defined in `/shared/schema.ts` but not implemented in current Firebase-based architecture

**Vite:**
- Development server with HMR
- Production build configuration
- Custom plugins for Replit integration
- Path aliases for cleaner imports (@, @shared, @assets)

**TypeScript:**
- Strict mode enabled for type safety
- Shared types between client and server
- Path resolution for module imports

### UI Component Libraries

**Radix UI:**
- Comprehensive set of accessible UI primitives
- Dialog, Dropdown, Popover, Toast, and form components
- Unstyled components styled with Tailwind CSS

**shadcn/ui:**
- Pre-built component system based on Radix UI
- Customized theme configuration in `components.json`
- New York style variant with CSS variables for theming

**Additional Libraries:**
- `date-fns` - Date formatting and manipulation
- `framer-motion` - Animation library (referenced in design docs)
- `react-icons` - Icon library including Giphy icon
- `lucide-react` - Primary icon set
- `class-variance-authority` - Component variant styling
- `clsx` - Conditional className utility