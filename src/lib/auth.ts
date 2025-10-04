import { useAuth0 } from '@auth0/auth0-react';

// Auth0 migration: Netlify Identity logic removed. Implement Auth0 authentication here.

// Store the Auth0 token retrieval function globally
let getAccessTokenSilentlyFn: (() => Promise<string>) | null = null;

export const setTokenGetter = (fn: () => Promise<string>) => {
    console.log('[Auth] Token getter function registered');
    getAccessTokenSilentlyFn = fn;
};

export const getToken = async (): Promise<string | null> => {
    console.log('[Auth] getToken called, function available:', !!getAccessTokenSilentlyFn);
    
    if (!getAccessTokenSilentlyFn) {
        console.error('[Auth] Token getter not initialized - Auth0 context not available');
        return null;
    }
    
    try {
        const token = await getAccessTokenSilentlyFn();
        console.log('[Auth] Token retrieved successfully, length:', token?.length || 0);
        return token;
    } catch (error) {
        console.error('[Auth] Failed to get token:', error);
        return null;
    }
};

export const useAuth = () => {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

    return { loginWithRedirect, logout, user, isAuthenticated, isLoading, getAccessTokenSilently };
};
