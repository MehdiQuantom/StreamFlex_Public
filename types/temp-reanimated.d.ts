declare module 'react-native-reanimated' {
  import * as React from 'react';
  import { ViewStyle, ViewProps } from 'react-native';

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

  export interface ReanimatedComponentProps<T> extends React.ComponentProps<T> {
    entering?: object;
    exiting?: object;
    layout?: object;
    style?: AnimatedStyle | ViewStyle;
  }

  export interface AnimatedComponent<T> extends React.ComponentClass<ReanimatedComponentProps<T>> {}

  export function createAnimatedComponent<T extends React.ComponentType<any>>(
    component: T
  ): AnimatedComponent<T>;

  export const View: AnimatedComponent<typeof import('react-native').View>;
  
  export const interpolate: (
    value: number,
    input: readonly number[],
    output: readonly number[],
    type?: "linear" | "easeIn" | "easeOut" | "easeInOut"
  ) => number;

  export const FadeIn: {
    duration?: number;
    delay?: number;
  };

  export const configureReanimatedLogger: (config: {
    enabled?: boolean;
    level?: "debug" | "info" | "warn" | "error";
  }) => void;
}