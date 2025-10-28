declare module 'react-native' {
  import * as React from 'react';

  export type StyleProp<T> = T | T[] | undefined;
  export type OpaqueColorValue = any;

  export interface ViewStyle {
    [key: string]: any;
  }

  export interface TextStyle extends ViewStyle {
    fontSize?: number;
    fontWeight?: string;
  }

  export interface ViewProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    key?: React.Key;
  }

  export interface TextProps {
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
    numberOfLines?: number;
    onPress?: () => void;
  }

  export interface ScrollViewProps extends ViewProps {
    contentContainerStyle?: StyleProp<ViewStyle>;
    keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  }

  export interface ImageStyle extends ViewStyle {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  }

  export interface ImageProps extends ViewProps {
    source: { uri: string } | number;
    style?: StyleProp<ImageStyle>;
  }

  export interface TouchableOpacityProps extends ViewProps {
    onPress?: () => void;
    disabled?: boolean;
    activeOpacity?: number;
  }

  export interface TextInputProps extends ViewProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    autoComplete?: string;
  }

  export interface ActivityIndicatorProps extends ViewProps {
    size?: 'small' | 'large';
    color?: string;
    animating?: boolean;
  }

  export interface FlatListProps<T> extends ScrollViewProps {
    data: T[];
    renderItem: (info: { item: T; index: number }) => React.ReactNode;
    keyExtractor?: (item: T, index: number) => string;
  }

  export interface PlatformStatic {
    OS: 'ios' | 'android' | 'web';
    select<T>(specs: { ios?: T; android?: T; web?: T; default?: T }): T;
  }

  export interface DimensionsStatic {
    get(dimension: 'window' | 'screen'): { width: number; height: number; scale: number; fontScale: number };
  }

  export interface ModalProps extends ViewProps {
    visible?: boolean;
    onRequestClose?: () => void;
    animationType?: 'none' | 'slide' | 'fade';
    transparent?: boolean;
  }

  export interface AlertStatic {
    alert(title: string, message?: string, buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[]): void;
  }

  export interface KeyboardAvoidingViewProps extends ViewProps {
    behavior?: 'height' | 'position' | 'padding';
    keyboardVerticalOffset?: number;
  }

  export interface LinkingStatic {
    openURL(url: string): Promise<void>;
    canOpenURL(url: string): Promise<boolean>;
  }

  export interface StyleSheetStatic {
    create<T extends { [key: string]: any }>(styles: T): T;
    absoluteFillObject: ViewStyle;
    hairlineWidth: number;
    flatten(style: StyleProp<any>): any;
  }

  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const Image: React.ComponentType<ImageProps>;
  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;
  export const TextInput: React.ComponentType<TextInputProps>;
  export const ActivityIndicator: React.ComponentType<ActivityIndicatorProps>;
  export const FlatList: React.ComponentType<FlatListProps<any>>;
  export const Platform: PlatformStatic;
  export const Dimensions: DimensionsStatic;
  export const Modal: React.ComponentType<ModalProps>;
  export const Alert: AlertStatic;
  export const KeyboardAvoidingView: React.ComponentType<KeyboardAvoidingViewProps>;
  export const Pressable: React.ComponentType<TouchableOpacityProps>;
  export const StyleSheet: StyleSheetStatic;
  export const Linking: LinkingStatic;
  export function useColorScheme(): 'light' | 'dark' | null;
}