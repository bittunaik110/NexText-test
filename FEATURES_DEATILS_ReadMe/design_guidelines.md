# NexText Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern messaging apps (WhatsApp, Telegram, Discord) combined with premium futuristic aesthetics. The design emphasizes glass-morphism, gradient accents, and smooth micro-interactions for a next-generation chat experience.

## Core Design Principles
- **Mobile-First**: Optimized for 480px max-width with native app feel
- **Real-Time Feedback**: Immediate visual responses to all user actions
- **Premium Glass-Morphism**: Translucent surfaces with backdrop blur effects
- **Dark Mode Primary**: Dark theme by default with optional light mode toggle

---

## Typography

**Font Families**: 
- Primary: 'Inter' or 'Poppins' (modern sans-serif via Google Fonts)
- Fallback: system-ui, -apple-system

**Font Hierarchy**:
- Headings: 600-700 weight, tight letter-spacing (-0.02em)
- Body: 400-500 weight, normal spacing
- Small Text: 400 weight, subtle gray (#94A3B8)

**Sizes**:
- Large Heading: 28-32px (profile names, welcome screens)
- Medium Heading: 20-24px (chat headers)
- Body: 15-16px (messages, inputs)
- Small: 12-13px (timestamps, status)

---

## Layout System

**Spacing Units**: Tailwind units of **2, 3, 4, 6, 8, 12, 16**
- Micro spacing: p-2, gap-3
- Component padding: p-4, p-6
- Section spacing: py-8, py-12, py-16
- Message bubbles: px-4 py-3

**Container Widths**:
- Mobile: max-w-md (480px)
- Desktop Sidebar: 30% width
- Desktop Chat Window: 70% width
- Message Bubbles: max-w-[75%]

---

## Color Palette

**Primary Colors**:
- Deep Purple: #8B5CF6 (primary actions, sent messages)
- Cyan Blue: #06B6D4 (accents, links)
- Pink/Magenta: #EC4899 (highlights, gradients)

**Backgrounds**:
- Dark Base: #0F172A (Slate 900)
- Dark Elevated: #1E293B (Slate 800)
- Glass Surface: #334155 with rgba(51, 65, 85, 0.6) + blur(20px)

**Text Colors**:
- Primary: #F8FAFC (near white)
- Secondary: #94A3B8 (Slate 400)
- Muted: #64748B (Slate 500)

**Status Colors**:
- Success/Online: #10B981 (pulsing green dot)
- Error: #EF4444
- Warning: #F59E0B

**Gradients**:
- Primary: `linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)`
- Secondary: `linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)`
- Sent Messages: `linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)`

---

## Component Library

### Navigation & Headers
- **Fixed Header**: Glass-morphism effect, gradient accent bar at top, sticky positioning
- **Mobile Bottom Nav**: Glass background, icon-only with labels, fixed bottom
- **Desktop Sidebar**: 30% width, glass cards for chat list, fixed left

### Chat Components

**Message Bubbles**:
- Sent: Purple gradient background, rounded-3xl (24px), float right, white text
- Received: Glass slate background (#334155 with blur), rounded-3xl, float left
- Padding: px-4 py-3
- Max-width: 75%
- Timestamp: Bottom-right, text-xs, opacity-70

**Chat List Items**:
- Glass card with hover lift effect (translateY(-4px))
- Avatar with gradient ring for online users
- Layout: Avatar (left) | Name + Preview (center) | Time + Badge (right)
- Unread badge: Gradient background, circular, bouncy animation

**Input Area**:
- Glass background, fixed bottom
- Emoji picker button (left), attach button (left)
- Auto-expanding textarea (max 4 lines)
- Circular gradient send button (right)
- Border-radius: 12px

### Forms & Inputs

**Text Inputs**:
- Glass-morphism: rgba(51, 65, 85, 0.6) + backdrop-blur(20px)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Focus: Gradient border glow effect
- Border-radius: 12px
- Padding: 14px 18px

**PIN Input**:
- 6 separated boxes, large size (48px × 48px)
- Glass background, center-aligned digits
- Gradient focus state

### Buttons

**Primary (Filled)**:
- Gradient background (#8B5CF6 → #EC4899)
- Hover: scale(1.02) + glow shadow
- Active: scale(0.98)
- Border-radius: 12px
- Padding: 12px 24px

**Secondary (Outlined)**:
- Transparent background, gradient border
- Hover: Gradient fill transition
- Same sizing as primary

**Icon Buttons**:
- Circular, 40-48px size
- Glass or gradient background
- Icons: 20-24px (Lucide React)

### Cards & Modals

**Glass Cards**:
- Background: rgba(51, 65, 85, 0.6)
- Backdrop-filter: blur(20px)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Shadow: 0 8px 32px rgba(0, 0, 0, 0.3)
- Border-radius: 16px
- Hover: translateY(-4px) + shadow increase

**Modals** (Connection, Profile):
- Center-aligned glass card
- Slide-up animation entrance
- Backdrop: rgba(0, 0, 0, 0.7) with blur

### Status Indicators

**Online Dot**: 
- Size: 10-12px, absolute positioned on avatar
- Green (#10B981) with pulsing animation
- Ring effect: animate-pulse

**Typing Indicator**:
- 3 bouncing dots with gradient colors
- Positioned above input area
- Animation: staggered bounce

**Read Receipts**:
- Single check (✓): Sent - gray
- Double check (✓✓): Delivered - gradient cyan
- Double check filled: Read - gradient purple

---

## Animations

**Message Animations**:
- Send: Slide up + fade in (0.3s ease-out)
- Receive: Slide down + fade in (0.3s ease-out)

**Micro-Interactions**:
- Button click: Ripple effect + scale transform
- Card hover: Lift (translateY(-4px)) in 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Icon hover: Gradient color transition
- Page transitions: Fade + slide (0.4s)

**Loading States**:
- Gradient shimmer effect on skeleton loaders
- Spinner: Rotating gradient ring

**Use Sparingly**: Limit to purposeful interactions only - avoid excessive animation

---

## Icons
- **Library**: Lucide React (CDN)
- **Sizes**: 20-24px standard, 16-18px for small contexts
- **Treatment**: Gradient on hover for interactive icons
- **Key Icons**: MessageCircle, Send, Paperclip, Smile, MoreVertical, Check, CheckCheck, Clock

---

## Images
This is a messaging application - images are user-generated content within messages:
- **Profile Avatars**: Circular, 40-48px in chat list, 80-100px in profile view, gradient ring for online status
- **Message Images**: Rounded corners (12px), max-width responsive, lightbox on click
- **Empty States**: Illustration or icon-based (not photos) for "no chats" screen

---

## Accessibility
- Focus states: Visible gradient ring on all interactive elements
- Color contrast: Text maintains 4.5:1 ratio against glass backgrounds
- Keyboard navigation: Full support for tab/enter interactions
- Screen reader: Proper ARIA labels for status indicators and icons
- Touch targets: Minimum 44×44px for mobile buttons