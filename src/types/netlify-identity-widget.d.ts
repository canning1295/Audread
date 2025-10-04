declare module 'netlify-identity-widget' {
  export type User = {
    email?: string;
    token?: { access_token?: string };
    jwt: () => Promise<string>;
  } | null;
  type Listener = (...args: any[]) => void;
  const widget: {
    init: () => void;
    open: (tab?: 'login' | 'signup' | 'recovery' | 'settings') => void;
    close: () => void;
    on: (evt: 'login' | 'logout' | 'init' | 'error', cb: Listener) => void;
    logout: () => void;
    currentUser: () => User;
  };
  export default widget;
}
