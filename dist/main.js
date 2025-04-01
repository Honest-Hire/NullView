"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
// State
let mainWindow = null;
let isWindowVisible = true;
let windowPosition = null;
let windowSize = null;
// Create the main window
async function createWindow() {
    if (mainWindow) {
        if (mainWindow.isMinimized())
            mainWindow.restore();
        mainWindow.focus();
        return;
    }
    const primaryDisplay = electron_1.screen.getPrimaryDisplay();
    const workArea = primaryDisplay.workAreaSize;
    const windowSettings = {
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
    mainWindow = new electron_1.BrowserWindow(windowSettings);
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
        if (!mainWindow)
            return;
        const bounds = mainWindow.getBounds();
        windowPosition = { x: bounds.x, y: bounds.y };
    });
    mainWindow.on('resize', () => {
        if (!mainWindow)
            return;
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
function hideMainWindow() {
    if (!mainWindow || mainWindow.isDestroyed())
        return;
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
function showMainWindow() {
    if (!mainWindow || mainWindow.isDestroyed())
        return;
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
function toggleMainWindow() {
    if (isWindowVisible) {
        hideMainWindow();
    }
    else {
        showMainWindow();
    }
}
// Set up IPC handlers
function setupIpcHandlers() {
    electron_1.ipcMain.handle('toggle-window', () => {
        console.log('Toggle window IPC received');
        if (!mainWindow) {
            return { success: false, error: 'Window not initialized' };
        }
        try {
            toggleMainWindow();
            return { success: true, isVisible: isWindowVisible };
        }
        catch (error) {
            console.error('Error toggling window:', error);
            return { success: false, error: 'Failed to toggle window' };
        }
    });
}
// App event handlers
electron_1.app.on('ready', async () => {
    await createWindow();
    setupIpcHandlers();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map