import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';

// State
let mainWindow: BrowserWindow | null = null;
let isWindowVisible = true;
let windowPosition: { x: number; y: number } | null = null;
let windowSize: { width: number; height: number } | null = null;

// Create the main window
async function createWindow(): Promise<void> {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workAreaSize;

  const windowSettings: Electron.BrowserWindowConstructorOptions = {
    width: 400,
    height: 300,
    x: 50,
    y: 50,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      scrollBounce: true
    },
    show: true,
    frame: false,
    transparent: true,
    fullscreenable: false,
    hasShadow: false,
    backgroundColor: "#00000000",
    focusable: true,
    skipTaskbar: true,
    type: "panel",
    paintWhenInitiallyHidden: true,
    titleBarStyle: "hidden",
    enableLargerThanScreen: true,
    movable: true
  };

  mainWindow = new BrowserWindow(windowSettings);

  // Load the HTML file
  await mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  // Add window management event listeners
  mainWindow.on('closed', () => {
    mainWindow = null;
    isWindowVisible = false;
    windowPosition = null;
    windowSize = null;
  });
  
  mainWindow.on('move', () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    windowPosition = { x: bounds.x, y: bounds.y };
  });
  
  mainWindow.on('resize', () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    windowSize = { width: bounds.width, height: bounds.height };
  });

  // Make the window draggable
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
  });
  
  // Enhanced screen capture resistance settings
  mainWindow.setContentProtection(true);
  
  mainWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true
  });
  
  mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
  
  // Additional macOS-specific settings
  if (process.platform === "darwin") {
    // Prevent window from being captured in screenshots
    mainWindow.setHiddenInMissionControl(true);
    mainWindow.setWindowButtonVisibility(false);
    mainWindow.setBackgroundColor("#00000000");
    
    // Prevent window from being included in window switcher
    mainWindow.setSkipTaskbar(true);
    
    // Disable window shadow
    mainWindow.setHasShadow(false);
  }
  
  // Prevent the window from being captured by screen recording
  mainWindow.webContents.setBackgroundThrottling(false);
  mainWindow.webContents.setFrameRate(60);
  
  // Initialize window state
  const bounds = mainWindow.getBounds();
  windowPosition = { x: bounds.x, y: bounds.y };
  windowSize = { width: bounds.width, height: bounds.height };
}

// Window visibility functions
function hideMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  
  const bounds = mainWindow.getBounds();
  windowPosition = { x: bounds.x, y: bounds.y };
  windowSize = { width: bounds.width, height: bounds.height };
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
  mainWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true
  });
  mainWindow.setOpacity(0);
  mainWindow.hide();
  isWindowVisible = false;
}

function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  
  if (windowPosition && windowSize) {
    mainWindow.setBounds({
      ...windowPosition,
      ...windowSize
    });
  }
  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
  mainWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true
  });
  mainWindow.setContentProtection(true);
  mainWindow.setOpacity(0);
  mainWindow.showInactive();
  mainWindow.setOpacity(1);
  isWindowVisible = true;
}

// Toggle window visibility
function toggleMainWindow(): void {
  if (isWindowVisible) {
    hideMainWindow();
  } else {
    showMainWindow();
  }
}

// Set up IPC handlers
function setupIpcHandlers(): void {
  ipcMain.handle('toggle-window', () => {
    console.log('Toggle window IPC received');
    if (!mainWindow) {
      return { success: false, error: 'Window not initialized' };
    }
    
    try {
      toggleMainWindow();
      return { success: true, isVisible: isWindowVisible };
    } catch (error) {
      console.error('Error toggling window:', error);
      return { success: false, error: 'Failed to toggle window' };
    }
  });
}

// App event handlers
app.on('ready', async () => {
  await createWindow();
  setupIpcHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 