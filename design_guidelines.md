# Desktop OS Simulator Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern desktop operating systems (Windows 11, macOS Big Sur) and development environments (VS Code, JetBrains IDEs) to create an authentic, professional desktop simulation experience.

**Dark Mode Only**: All interfaces use dark theme variants for consistency and reduced eye strain.

## Core Design Elements

### Typography
- **Primary Font**: 'Segoe UI', system-ui, -apple-system (OS-native feel)
- **Monospace Font**: 'Cascadia Code', 'Fira Code', 'Monaco', 'Consolas' (for Terminal and VS.Studio)
- **Size Scale**: 
  - Window titles: text-sm font-medium (14px)
  - Menu items: text-xs (12px)
  - Body text: text-sm (14px)
  - Code editor: text-sm with line-height-relaxed
  - Taskbar text: text-xs

### Layout System & Spacing
**Tailwind spacing units**: Primarily use 1, 2, 3, 4, 6, 8 for consistent density
- Window chrome padding: p-2 to p-3
- Taskbar height: h-12 (48px)
- Window title bar: h-8 (32px)
- Icon spacing: gap-2 to gap-4
- Menu item padding: px-3 py-1.5
- Desktop icon grid: gap-4

### Window System Design

**Window Chrome**:
- Rounded corners: rounded-lg (8px) for modern OS feel
- Drop shadows: shadow-2xl for depth and elevation
- Border: border border-gray-700/50 for subtle definition
- Title bar background: Slightly lighter than window body (bg-gray-800 vs bg-gray-900)
- Title bar height: 32px with centered text, left-aligned icon/title, right-aligned controls

**Window Controls** (top-right corner):
- Minimize, Maximize, Close buttons
- Size: w-10 h-8 each
- Icons: Use simple geometric shapes (minimize: horizontal line, maximize: square outline, close: X)
- Hover states: Subtle background change, close button gets red tint on hover
- Spacing: No gap between buttons, seamless row

**Window Dragging Visual Feedback**:
- Slight opacity reduction (opacity-95) while dragging
- Cursor changes to grabbing
- Smooth transitions: transition-all duration-150

### Taskbar Design

**Structure**:
- Fixed bottom position: fixed bottom-0 w-full
- Height: 48px (h-12)
- Background: bg-gray-900/95 backdrop-blur-md for modern translucent effect
- Border top: border-t border-gray-700/50
- Z-index: z-50 to stay on top

**Start Menu Button**:
- Position: Left side with distinctive icon (grid or Windows-style logo)
- Size: w-12 h-12 with icon centered
- Hover: Subtle background highlight

**App Icons on Taskbar**:
- Size: 40x40px (w-10 h-10)
- Active indicator: Bottom border (border-b-2 border-blue-500) or subtle background
- Spacing between icons: gap-1
- Right-click menu appears above icon with shadow-lg

**System Tray** (right side):
- Clock/time display: text-xs font-medium
- System icons (network, sound, battery simulation): w-5 h-5
- Spacing: gap-3

### Desktop Area

**Background**:
- Default: Gradient background (bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900)
- Or solid image with overlay for icon visibility

**Desktop Icons**:
- Size: 64x64px icon area
- Layout: Grid with gap-6, align-items-start
- Icon style: Rounded squares (rounded-xl) with app-specific colors/images
- Label below icon: text-xs text-white text-center with text-shadow for readability
- Selected state: bg-blue-600/20 backdrop-blur-sm border border-blue-400/50 rounded-lg
- Hover: Subtle scale (scale-105) or background tint

### Context Menu Design

**Right-Click Menus**:
- Background: bg-gray-800 with backdrop-blur-md
- Border: border border-gray-700 rounded-md
- Shadow: shadow-xl for elevation
- Min-width: min-w-[200px]
- Menu items: 
  - Padding: px-3 py-2
  - Hover: bg-gray-700
  - Icon + text layout with gap-3
  - Dividers: border-t border-gray-700

### App-Specific Designs

**Terminal App**:
- Full dark background: bg-black
- Text: text-green-400 or text-gray-100 (authentic terminal feel)
- Font: Monospace at text-sm with line-height-relaxed
- Prompt: Distinct color (text-blue-400)
- Input area: Blinking cursor with caret-green-400
- Scrollbar: Thin custom dark scrollbar
- Padding: p-4

**VS.Studio (Monaco Editor Integration)**:
- Left sidebar: bg-gray-900 w-12 with tool icons
- File explorer sidebar: bg-gray-800 w-64 (collapsible)
- Editor area: Monaco's default dark theme
- Tab bar: bg-gray-800 h-10 with tab items
- Active tab: bg-gray-900 border-t-2 border-blue-500
- Tab close button: hover shows X icon
- Status bar (bottom): bg-blue-600 h-6 text-xs
- Breadcrumbs: text-xs text-gray-400 below tabs

**Files Explorer**:
- Two-pane layout: Tree view (w-64) + content view (flex-1)
- Tree items: pl-4 per nesting level with chevron icons
- Folder icons: Different colors per type
- File icons: Extension-based (use simple SVG sprites)
- Toolbar: Top bar with New Folder, New File, Upload buttons (h-10)
- List/Grid view toggle

**Web Browser**:
- Address bar: bg-gray-800 rounded-full h-9 with px-4
- Back/Forward buttons: Circular w-9 h-9
- Tab bar: Similar to VS.Studio tabs
- Content area: bg-white (simulated pages) or bg-gray-900 (empty)

**Web Store**:
- Grid layout: 2-3 columns of app cards
- App cards: bg-gray-800 rounded-lg p-4 with hover:bg-gray-750
- Card contains: Icon (64x64), title (text-base font-semibold), description (text-sm text-gray-400), Install button
- Search bar at top: Similar to browser address bar

### Properties Windows

**Layout**:
- Tabbed interface if needed (General, Details, Permissions)
- Two-column form layout for properties: Label (right-aligned) + Value
- Advanced properties: Collapsible section with chevron
- Monospace font for paths and technical values
- Copy button next to copyable values

### Start Menu

**Popup Design**:
- Position: Bottom-left, above taskbar
- Size: w-[600px] h-[700px]
- Background: bg-gray-900/95 backdrop-blur-xl
- Border: border border-gray-700 rounded-t-lg
- Shadow: shadow-2xl

**Content**:
- Search bar at top: bg-gray-800 rounded-lg mb-4
- App grid: 4-5 columns of app tiles
- App tiles: w-20 h-20 with centered icon and label below
- Hover: bg-gray-800 rounded-md
- Pinned section separator
- All apps alphabetical list at bottom

### Visual Effects

**Animations** (minimal, performance-focused):
- Window open/close: Scale from/to 0.95 with fade (150ms)
- Window drag: No animation, instant position updates for responsiveness
- Hover states: transition-colors duration-150
- Menu popups: Fade + slide from anchor point (100ms)
- Loading states: Simple spinner or pulse effect

**Depth & Elevation**:
- Desktop: Base layer
- Windows: shadow-2xl with z-index based on focus order
- Modals/Dialogs: shadow-2xl z-50 with backdrop bg-black/50
- Context menus: shadow-xl z-60
- Taskbar/Start menu: z-50

### Component Library

**Buttons**:
- Primary: bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm
- Secondary: bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm
- Icon buttons: w-8 h-8 rounded hover:bg-gray-700 centered icon
- Danger: bg-red-600 hover:bg-red-700

**Input Fields**:
- Background: bg-gray-800 border border-gray-700
- Focus: ring-2 ring-blue-500 border-transparent
- Padding: px-3 py-2 rounded
- Text: text-sm

**Scrollbars**:
- Custom thin scrollbars: w-2 bg-gray-800
- Thumb: bg-gray-600 hover:bg-gray-500 rounded

### Consistency Rules

1. **All windows** use same title bar height and control buttons
2. **All menus** use same background, padding, and hover states
3. **All icons** maintain 1:1 aspect ratio in their containers
4. **All text** maintains readability with proper contrast against dark backgrounds
5. **All interactive elements** have clear hover/active states without color dependencies

This design creates an authentic, professional desktop OS experience that feels familiar yet modern, with consistent patterns across all applications while maintaining the unique character of each app type.