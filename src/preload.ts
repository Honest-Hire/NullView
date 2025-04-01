import { contextBridge, ipcRenderer } from 'electron';

// Expose any APIs to the renderer process here
contextBridge.exposeInMainWorld('electronAPI', {
  // You can add functions here if needed
  toggleMainWindow: async () => {
    try {
      return await ipcRenderer.invoke('toggle-window');
    } catch (error) {
      console.error('Error toggling window:', error);
      return { success: false, error: 'Failed to toggle window' };
    }
  }
});

console.log('Preload script loaded'); 