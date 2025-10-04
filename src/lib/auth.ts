import { useAuth0 } from '@auth0/auth0-react';

// Auth0 migration: Netlify Identity logic removed. Implement Auth0 authentication here.

export const useAuth = () => {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

    return { loginWithRedirect, logout, user, isAuthenticated, isLoading };
};
