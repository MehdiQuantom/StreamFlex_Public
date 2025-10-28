declare module '@supabase/supabase-js' {
  // Database table schemas
  export interface Favorite {
    id: number;
    user_id: string;
    media_type: 'movie' | 'tv';
    media_id: number;
    created_at: string;
    updated_at: string;
  }

  export interface WatchHistory {
    id: number;
    user_id: string;
    media_type: 'movie' | 'tv';
    media_id: number;
    progress: number;
    created_at: string;
    updated_at: string;
    watched_at: string;
  }

  export interface Database {
    favorites: Favorite;
    watch_history: WatchHistory;
  }
  export interface Session {
    user: User | null;
    access_token: string;
    refresh_token: string;
  }

  export interface User {
    id: string;
    email?: string;
  }

  interface QueryBuilder<T> extends Promise<{ data: T[]; error: Error | null }> {
    select(columns?: string): QueryBuilder<T>;
    insert(values: Partial<T>): Promise<{ data: T[]; error: Error | null }>;
    update(values: Partial<T>): Promise<{ data: T[]; error: Error | null }>;
    delete(): Promise<{ data: T[]; error: Error | null }>;
    eq(column: string, value: any): QueryBuilder<T>;
    in(column: string, values: any[]): QueryBuilder<T>;
    single(): Promise<{ data: T | null; error: Error | null }>;
    order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
    limit(count: number): QueryBuilder<T>;
    gte(column: string, value: any): QueryBuilder<T>;
    lte(column: string, value: any): QueryBuilder<T>;
    gt(column: string, value: any): QueryBuilder<T>;
    lt(column: string, value: any): QueryBuilder<T>;
    neq(column: string, value: any): QueryBuilder<T>;
    match(query: { [key: string]: any }): QueryBuilder<T>;
    like(column: string, pattern: string): QueryBuilder<T>;
    ilike(column: string, pattern: string): QueryBuilder<T>;
    is(column: string, value: any): QueryBuilder<T>;
    or(filters: string, options?: { foreignTable?: string }): QueryBuilder<T>;
    not(column: string, operator: string, value: any): QueryBuilder<T>;
    filter(column: string, operator: string, value: any): QueryBuilder<T>;
    contains(column: string, value: any): QueryBuilder<T>;
    containedBy(column: string, value: any): QueryBuilder<T>;
    range(column: string, from: any, to: any): QueryBuilder<T>;
    overlaps(column: string, value: any): QueryBuilder<T>;
    textSearch(column: string, query: string, options?: { config?: string }): QueryBuilder<T>;
  }

  interface SupabaseClient {
    auth: {
      signInWithPassword(credentials: { email: string; password: string }): Promise<{
        data: { user: User | null; session: Session | null };
        error: Error | null;
      }>;
      signIn(credentials: { email: string; password: string }): Promise<{
        data: { user: User | null; session: Session | null };
        error: Error | null;
      }>;
      signUp(credentials: { email: string; password: string }): Promise<{
        data: { user: User | null; session: Session | null };
        error: Error | null;
      }>;
      signOut(): Promise<{ error: Error | null }>;
      getUser(): Promise<{
        data: { user: User | null };
        error: Error | null;
      }>;
      getSession(): Promise<{
        data: { session: Session | null };
        error: Error | null;
      }>;
      onAuthStateChange(
        callback: (event: string, session: Session | null) => void
      ): { data: { subscription: { unsubscribe: () => void }; user: User | null }; error: Error | null };
    };
    from<T>(table: string): QueryBuilder<T>;
  }

  export function createClient<T = any>(url: string, key: string, options?: any): SupabaseClient & T;
}