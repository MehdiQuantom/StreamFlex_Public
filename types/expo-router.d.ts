declare module 'expo-router' {
  import * as React from 'react';

  export interface StackProps {
    children?: React.ReactNode;
    screenOptions?: {
      headerShown?: boolean;
      headerStyle?: any;
      headerTintColor?: string;
      presentation?: 'modal' | 'transparentModal' | 'formSheet';
    };
  }

  interface StackScreenProps {
    name?: string;
    options?: {
      title?: string;
      headerShown?: boolean;
      headerStyle?: any;
      headerTintColor?: string;
      presentation?: 'modal' | 'transparentModal' | 'formSheet';
      animation?: 'fade';
      headerShadowVisible?: boolean;
      sheetAllowedDetents?: number[];
    };
    children?: React.ReactNode;
  }

  interface StackComponent extends React.ElementType<StackProps> {
    Screen: React.ElementType<StackScreenProps>;
  }

  export const Stack: StackComponent;

  export type NavigationProp = {
    push: (route: string | { pathname: string; params?: any }) => void;
    replace: (route: string | { pathname: string; params?: any }) => void;
    back: () => void;
  };

  export const router: NavigationProp;
  export function useRouter(): NavigationProp;
  export function usePathname(): string;
  export function useLocalSearchParams<T = any>(): T;
}

declare module '@react-navigation/native' {
  import * as React from 'react';
  
  export interface Theme {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };
  }

  export const DarkTheme: Theme;
  export const DefaultTheme: Theme;
  export function useTheme(): Theme;
  export const ThemeProvider: React.FC<{ theme: Theme; children: React.ReactNode }>;
}

declare module 'react-native-reanimated' {
  import * as React from 'react';
  
  export interface AnimatedStyle {
    [key: string]: any;
  }

  export type WithSpringConfig = {
    damping?: number;
    mass?: number;
    stiffness?: number;
    overshootClamping?: boolean;
    restSpeedThreshold?: number;
    restDisplacementThreshold?: number;
  };

  export type SharedValue<T> = {
    value: T;
  };

  export function withSpring<T>(
    toValue: T,
    config?: WithSpringConfig,
    callback?: (finished: boolean) => void
  ): T;

  export function useSharedValue<T>(initialValue: T): SharedValue<T>;
  export function useAnimatedStyle(
    updater: () => AnimatedStyle,
    deps?: any[]
  ): AnimatedStyle;

  type AnimatedComponent<P extends object> = React.ComponentType<P>;
  
  export const View: AnimatedComponent<import('react-native').ViewProps>;
  export const createAnimatedComponent: <P extends object>(
    component: React.ComponentType<P>
  ) => AnimatedComponent<P>;
}

declare module '@react-navigation/drawer' {
  import * as React from 'react';
  
  export interface DrawerContentComponentProps {
    navigation: any;
    state: any;
  }

  export interface DrawerNavigationOptions {
    drawerType?: 'front' | 'back' | 'slide';
    drawerPosition?: 'left' | 'right';
    swipeEnabled?: boolean;
    gestureEnabled?: boolean;
    unmountOnBlur?: boolean;
    overlayColor?: string;
    drawerStyle?: import('react-native').ViewStyle;
    sceneContainerStyle?: import('react-native').ViewStyle;
    drawerContent?: (props: DrawerContentComponentProps) => React.ReactNode;
  }

  export const createDrawerNavigator: () => any;
}