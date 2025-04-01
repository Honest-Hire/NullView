"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose any APIs to the renderer process here
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // You can add functions here if needed
    toggleMainWindow: async () => {
        try {
            return await electron_1.ipcRenderer.invoke('toggle-window');
        }
        catch (error) {
            console.error('Error toggling window:', error);
            return { success: false, error: 'Failed to toggle window' };
        }
    }
});
console.log('Preload script loaded');
//# sourceMappingURL=preload.js.map