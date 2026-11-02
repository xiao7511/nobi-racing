import { createRouter, createWebHashHistory } from 'vue-router';
import { dataTransport } from './api/transport';
import {publicReference} from './lib/urls';
const backend = dataTransport === 'backend';
export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/forum', name: 'forum', component: () => import('./views/ForumView.vue') },
    { path: '/brief', name: 'brief', component: () => import('./views/BriefView.vue') },
    { path: '/weekends/:id', name: 'weekend', component: () => import('./views/WeekendView.vue') },
    { path: '/legal', name: 'legal', component: () => import('./views/LegalView.vue') },
    { path: '/', name: 'home', component: publicReference?()=>import('./views/PublicHomeView.vue'):backend ? () => import('./views/backend/HomeView.vue') : () => import('./views/HomeView.vue') },
    { path: '/news', name: 'news', component: publicReference?()=>import('./views/PublicNewsView.vue'):() => import('./views/NewsView.vue') },
    { path: '/news/:id', name: 'article', component: () => import('./views/ArticleView.vue') },
    { path: '/races', name: 'races', component: backend ? () => import('./views/backend/RacesView.vue') : () => import('./views/RacesView.vue') },
    { path: '/races/:id', name: 'race', component: backend ? () => import('./views/backend/RaceView.vue') : () => import('./views/RaceView.vue') },
    { path: '/stats', name: 'stats', component: backend ? () => import('./views/backend/StatsView.vue') : () => import('./views/StatsView.vue') },
    { path: '/drivers/:id', name: 'driver', component: backend ? () => import('./views/backend/DriverView.vue') : () => import('./views/DriverView.vue') },
    { path: '/teams/:id', name: 'team', component: () => import('./views/backend/TeamView.vue') },
    { path: '/profile', name: 'profile', component: backend ? () => import('./views/backend/ProfileView.vue') : () => import('./views/ProfileView.vue') },
    { path: '/settings', name: 'settings', component: () => import('./views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue') },
  ],
  scrollBehavior: (_to, _from, saved) => saved || { top: 0 },
});
