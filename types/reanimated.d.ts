  export as namespace ReactNativeReanimated;
// Type definitions for Reanimated
declare namespace ReactNativeReanimated {
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

  export class ReanimatedComponent<P extends object> extends React.Component<P> {}

  export const View: typeof ReanimatedComponent<ViewProps>;
  export const createAnimatedComponent: <P extends object>(
    component: React.ComponentType<P>
  ) => ReanimatedComponent<P>;

  export const Animated: {
    View: typeof View;
  };

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

export {};
}