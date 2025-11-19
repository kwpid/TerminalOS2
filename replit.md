# FluxoOS - Desktop Simulator

## Overview

FluxoOS is a browser-based desktop operating system simulator that replicates the experience of modern desktop environments. The application features a complete windowing system with draggable and resizable windows, a custom scripting language called Fluxo, and several preinstalled applications including a terminal, code editor (VS.Studio), file manager, browser, and web store. The simulator provides a dark-themed interface inspired by Windows 11 and macOS Big Sur aesthetics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and API interactions

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library built on Radix (New York style variant)
- Tailwind CSS for utility-first styling with custom design tokens
- Dark mode only design approach with custom CSS variables for theming
- Monaco Editor integration for VS.Studio code editing capabilities

**State Management Pattern**
- React Context API (`DesktopContext`) serves as the central state manager for the entire desktop environment
- Manages windows, apps, desktop icons, file system nodes, and context menus
- In-memory state storage (no persistence between page refreshes)
- All desktop operations (window management, file system, app installation) flow through this context

**Window Management System**
- `react-rnd` library handles draggable and resizable window behavior
- Z-index based focus management for window stacking
- Three window states: open, minimized, closed
- Position and size updates propagate through the context system
- Each window maintains its own data payload for app-specific state

**File System Architecture**
- Tree-based structure with nodes containing type (file/folder), path, content
- Path-based navigation for Files app and VS.Studio
- Content stored as strings in-memory (no actual file I/O)
- Children relationships maintained through parentId references

### Backend Architecture

**Server Framework**
- Express.js HTTP server with TypeScript
- ESM module system throughout the codebase
- Custom middleware for request logging and JSON body parsing with raw buffer capture

**API Design Pattern**
- RESTful API structure under `/api` namespace
- Resource-oriented endpoints for file system, apps, desktop icons, and system state
- CRUD operations exposed as standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format with error handling

**Development vs Production Mode**
- Development: Vite middleware integrated directly into Express server for HMR
- Production: Static file serving from `dist/public` directory
- Conditional Replit-specific plugins (cartographer, dev banner, runtime error overlay)

**Storage Architecture**
- `IStorage` interface defines contract for data persistence operations
- `MemStorage` class implements in-memory storage (current implementation)
- Designed for easy swap to database-backed storage (structure supports Drizzle ORM integration)
- No actual database configured yet, but schema definitions exist in `shared/schema.ts`

### Fluxo Scripting Language

**Interpreter Design**
- Custom command parser in `fluxo-interpreter.ts`
- Executes within terminal windows with access to desktop context
- Built-in commands: help, clear, ls, cat, window management, file operations
- Module system for importing/exporting Fluxo scripts
- Console.log style output formatting

**Desktop API Integration**
- Direct access to window operations (move, resize, close, focus)
- File system manipulation (create files/folders, read content)
- App discovery and window listing capabilities
- Chaining syntax for method calls on objects (e.g., `window(id).move:(x, y)`)

### Application System

**App Types**
- Terminal: Fluxo command execution environment
- VS.Studio: Monaco-based code editor with file tree navigation
- Files: Visual file system browser with create/delete operations
- Browser: Simulated web browser with custom page system
- Web Store: Mock app marketplace for installing additional apps
- Properties: Window/app metadata inspector

**App Installation Model**
- Apps have `installed` boolean flag in their schema
- Web Store allows runtime installation of new apps (adds to apps list)
- Desktop icons created separately from app definitions
- Each app type maps to a specific React component for rendering

### Design System

**Tailwind Configuration**
- Custom border radius values (lg: 9px, md: 6px, sm: 3px)
- HSL color system with CSS custom properties for dynamic theming
- Comprehensive color palette: background, foreground, primary, secondary, muted, accent, destructive
- Card and popover variants with dedicated border colors
- Chart colors for potential data visualization

**Typography System**
- Primary: Segoe UI, system-ui, -apple-system (OS-native feel)
- Monospace: Fira Code, Cascadia Code, Monaco, Consolas
- Font scale focused on 12px-14px range for compact UI density

**Spacing & Layout**
- Taskbar: 48px fixed height at bottom
- Window title bar: 32px height
- Desktop icon grid with absolute positioning
- Consistent 1-8 Tailwind spacing units for padding/margins

## External Dependencies

### Core Libraries
- **@monaco-editor/react**: Code editor component for VS.Studio app
- **@tanstack/react-query**: Async state management and API caching
- **react-rnd**: Draggable and resizable window containers
- **wouter**: Lightweight client-side routing
- **nanoid**: Unique ID generation for windows, apps, and file nodes

### UI Component Libraries
- **@radix-ui/***: 20+ primitive components for accessible UI patterns (dialogs, dropdowns, menus, tooltips, etc.)
- **cmdk**: Command palette component foundation
- **class-variance-authority**: Type-safe component variant system
- **tailwind-merge**: Utility class conflict resolution
- **lucide-react**: Icon library for UI elements

### Database & Validation (Configured but Not Active)
- **drizzle-orm**: SQL ORM with TypeScript schema definitions
- **drizzle-zod**: Schema validation integration
- **@neondatabase/serverless**: Neon Postgres client driver
- **zod**: TypeScript-first schema validation library

### Development Tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Backend bundling for production builds
- **@replit/vite-plugin-***: Replit-specific development enhancements (cartographer, dev banner, runtime errors)
- **vite**: Frontend build tool and dev server with React plugin

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express (configured but unused without active database)
- **express-session**: Session middleware (dependency indicated by pg-simple inclusion)

### Date Utilities
- **date-fns**: Date formatting and manipulation for UI timestamps