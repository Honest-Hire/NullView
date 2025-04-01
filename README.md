# Simple Transparent Electron App

A basic Electron application with a transparent, always-on-top, borderless window displaying lorem ipsum text. This app implements aggressive screen capture resistance techniques similar to Interview Coder.

## Features

- Transparent window with semi-transparent black background
- Always on top of other windows
- Frameless/borderless design
- Draggable window
- Close button
- Toggle visibility button
- **Screen Capture Resistance** - Invisible to most screen recording software

## Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```
   cd simple-transparent-electron-app
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Running the App

1. Build the TypeScript files:
   ```
   npm run build
   ```
2. Start the application:
   ```
   npm start
   ```

Alternatively, you can use the development mode which builds and starts the app:
```
npm run dev
```

## Screen Capture Resistance Techniques

This app implements aggressive screen capture resistance techniques used by applications like Interview Coder:

1. **Content Protection API**
   - `mainWindow.setContentProtection(true)` - Tells the OS to exclude the window from screen captures

2. **Window Type and Properties**
   - `transparent: true` - Makes the window background transparent
   - `frame: false` - Removes window frame/borders
   - `type: "panel"` - Special window type that behaves differently from regular windows
   - `skipTaskbar: true` - Prevents window from appearing in the taskbar

3. **Layer Management**
   - `mainWindow.setAlwaysOnTop(true, "screen-saver", 1)` - Places window in a special layer
   - `mainWindow.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true})` - Makes window visible across workspaces

4. **macOS-Specific Protection**
   - `mainWindow.setHiddenInMissionControl(true)` - Prevents window from appearing in Mission Control
   - `mainWindow.setWindowButtonVisibility(false)` - Hides window control buttons
   - `mainWindow.setBackgroundColor("#00000000")` - Sets a fully transparent background
   - `mainWindow.setHasShadow(false)` - Disables window shadow

5. **Performance Settings**
   - `mainWindow.webContents.setBackgroundThrottling(false)` - Prevents background throttling
   - `mainWindow.webContents.setFrameRate(60)` - Sets a high frame rate

6. **Dynamic Visibility Management**
   - Advanced show/hide mechanism with opacity transitions
   - Window state preservation between hide/show operations
   - Mouse events handling for better user interaction

## How It Works

When you toggle the visibility of the window with the "Hide" button:

1. The app stores the current window position and size
2. Sets opacity to 0 
3. Hides the window completely

When you show it again:
1. The window is restored to its previous position
2. The app applies all screen capture resistance settings
3. Opacity is gradually restored from 0 to 1

## Customizing

You can modify the window behavior by editing:
- `src/main.ts` for changing Electron window properties and screen capture resistance settings
- `src/index.html` for changing content and styling 


## Addional knowledge dump
Technical Document: Screen Capture Resistance Techniques
Core Window Properties and Methods for Screen Capture Resistance
The transparent Electron app uses the following techniques to avoid being captured by screen recording tools:
1. Content Protection API

mainWindow.setContentProtection(true);

Description: This is the primary mechanism that explicitly tells the operating system that the window content should not be included in screen captures. This is an OS-level flag that instructs the window manager to exclude this window when screen recording or screenshot tools are used.

2. Window Type and Appearance Settings
// In BrowserWindow constructor options
{
  transparent: true,
  frame: false,
  hasShadow: false,
  backgroundColor: "#00000000",  // Fully transparent background color
  type: "panel",                 // Special window type
  skipTaskbar: true,             // Prevent showing in taskbar
  titleBarStyle: "hidden"        // No title bar
}
Description: These settings create a window that lacks the usual OS-provided decorations and UI elements that screen recording tools often use to identify application windows.
3. Layer and Workspace Management

mainWindow.setVisibleOnAllWorkspaces(true, {
  visibleOnFullScreen: true
});

mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
Description: These methods position the window in a special layer in the window stack. The "screen-saver" level is particularly important as it's a special z-order level that many screen recording tools exclude by default. The second parameter (1) sets the relative layer level within that group.
4. Platform-Specific Protection (macOS)
if (process.platform === "darwin") {
  // Set skip taskbar to reduce presence in window management
  mainWindow.setSkipTaskbar(true);
  // Disable shadow for a cleaner look
  mainWindow.setHasShadow(false);
}

Description: On macOS, these additional settings further help prevent the window from being detected and included in screen recordings.
5. Performance Optimizations That Affect Capturing
mainWindow.webContents.setBackgroundThrottling(false);
mainWindow.webContents.setFrameRate(60);

Description: These settings can make the window rendering behavior different from standard application windows, potentially causing screen recording tools to miss the window or handle it differently.
Differences from the Original Interview-Coder Application
The interview-coder application uses additional, more aggressive techniques:
Additional Protections in Interview-Coder
Hidden in Mission Control (macOS only):
Apply to README.md
;
This makes the window invisible in macOS Mission Control view, which many screen capture tools use to enumerate windows.

Window Button Visibility (macOS only):
Apply to README.md
 mainWindow.setWindowButtonVisibility(false);
This hides the standard window traffic light buttons that screen capture tools may use to identify windows.
Window Event Handling:
Apply to README.md
;
Interview-coder has more sophisticated window state tracking to maintain its anti-screen-capture properties across window operations.
Dynamic Opacity Control:
In the hideMainWindow and showMainWindow functions, interview-coder employs sophisticated opacity transitions:



### How It Works at the OS Level
When screen recording tools capture the screen, they typically:
Enumerate all visible windows through OS APIs
Apply filters based on window properties and OS-level flags
Composite the final image/video by layering the windows
The techniques described above work by interfering with this process in several ways:
Content Protection Flag: Directly tells the OS to exclude the window
Special Window Type: Makes the window harder to enumerate using standard APIs
Layer Management: Places the window in a layer that recording tools often exclude
Transparency and Framelessness: Makes it harder for the OS to define the window's boundaries
Performance Settings: Changes how the window is rendered, potentially causing capture tools to miss frames
Together, these techniques create a window that exists and is visible to the user, but is effectively "invisible" to most screen recording software.
