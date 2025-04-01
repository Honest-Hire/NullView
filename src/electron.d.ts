interface ElectronAPI {
  toggleMainWindow: () => Promise<{ 
    success: boolean; 
    isVisible?: boolean; 
    error?: string 
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {}; 