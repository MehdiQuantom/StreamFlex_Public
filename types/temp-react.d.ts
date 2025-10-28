// Type definitions for React
declare namespace React {
  type ReactNode = ReactElement | ReactFragment | string | number | boolean | null | undefined;
  type ReactFragment = Iterable<ReactNode>;
  type ComponentType<P = any> = ClassType<P, any> | FunctionComponent<P>;
  
  interface FunctionComponent<P = {}> {
    (props: P & { children?: ReactNode }, context?: any): ReactElement | null;
  }
  
  interface ClassType<P, T> {
    new(props: P, context?: any): T;
  }

  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  type Key = string | number;

  interface JSXElementConstructor<P> {
    (props: P): ReactElement<P, any> | null;
  }

  class Component<P = {}, S = {}> {
    constructor(props: P, context?: any);
    props: Readonly<P>;
    state: Readonly<S>;
    context: any;
    setState(state: S | ((prevState: S, props: P) => S), callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
  }

  interface PropsWithChildren<P = unknown> {
    children?: ReactNode;
    [key: string]: any;
  }

  interface FC<P = {}> extends FunctionComponent<P> {}

  interface Provider<T> {
    new(props: { value: T; children?: ReactNode }): Component<{ value: T; children?: ReactNode }>;
    (props: { value: T; children?: ReactNode }): ReactElement | null;
  }

  interface Context<T> {
    Provider: Provider<T>;
    Consumer: FC<{ children: (value: T) => ReactNode }>;
  }

  type Ref<T> = ((instance: T | null) => void) | MutableRefObject<T | null>;
  
  interface MutableRefObject<T> {
    current: T;
  }

  function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useContext<T>(context: Context<T>): T;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  function createContext<T>(defaultValue: T): Context<T>;
  function forwardRef<T, P = {}>(render: (props: P, ref: Ref<T>) => ReactElement | null): FC<P & { ref?: Ref<T> }>;
}

declare module 'react' {
  export = React;
}