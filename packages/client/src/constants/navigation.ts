import {
    BUDDY_SYSTEM_EVENTS_ROUTE,
    EVENTS_ROUTE,
    MATCHES_ROUTE,
    PROFILE_ROUTE,
    SWIPING_ROUTE,
} from './routes';

export interface NavigationItem {
    text: string;
    shortText: string;
    href: string;
    icon: string;
    desktopOnly?: boolean;
}

export const NAVIGATION: NavigationItem[] = [
    {
        text: 'Découvrir',
        shortText: 'Découvrir',
        href: SWIPING_ROUTE,
        icon: 'telescope',
    },
    {
        text: 'Événements',
        shortText: 'Événements',
        href: EVENTS_ROUTE,
        icon: 'calendar',
    },
    {
        text: 'Parrainage',
        shortText: 'Parrainage',
        href: BUDDY_SYSTEM_EVENTS_ROUTE,
        icon: 'handshake',
        desktopOnly: true,
    },
    {
        text: 'Mes Connexions',
        shortText: 'Connexions',
        href: MATCHES_ROUTE,
        icon: 'comment',
    },
    {
        text: 'Mon profil',
        shortText: 'Profil',
        href: PROFILE_ROUTE,
        icon: 'user',
    },
];

export const NAVIGATION_NOT_LOGGED_IN: NavigationItem[] = [
    {
        text: 'Se connecter',
        shortText: 'Connexion',
        href: '/login',
        icon: 'sign-in',
    },
    {
        text: "S'inscrire",
        shortText: "S'inscrire",
        href: '/signup',
        icon: 'user-plus',
    },
    {
        text: 'À propos',
        shortText: 'À propos',
        href: '/about',
        icon: 'info-circle',
    },
];
