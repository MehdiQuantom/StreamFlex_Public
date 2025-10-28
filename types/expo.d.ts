declare module 'expo-linear-gradient' {
  import * as React from 'react';
  
  export interface LinearGradientProps {
    colors: string[];
    style?: any;
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    children?: React.ReactNode;
  }

  export const LinearGradient: React.ComponentType<LinearGradientProps>;
}

declare module '@/components/IconSymbol' {
  import * as React from 'react';
  
  export interface IconSymbolProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }

  export const IconSymbol: React.ComponentType<IconSymbolProps>;
}

declare module 'react-native-webview' {
  import * as React from 'react';
  
  export interface WebViewProps {
    source: { uri: string };
    style?: any;
    onLoadEnd?: () => void;
    onError?: () => void;
    allowsFullscreenVideo?: boolean;
    mediaPlaybackRequiresUserAction?: boolean;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    startInLoadingState?: boolean;
    scalesPageToFit?: boolean;
  }

  export const WebView: React.ComponentType<WebViewProps>;
}