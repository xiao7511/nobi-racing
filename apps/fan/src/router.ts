import { createRouter, createWebHashHistory } from 'vue-router';
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/news', name: 'news', component: () => import('./views/NewsView.vue') },
    { path: '/news/:id', name: 'article', component: () => import('./views/ArticleView.vue') },
    { path: '/races', name: 'races', component: () => import('./views/RacesView.vue') },
    { path: '/races/:id', name: 'race', component: () => import('./views/RaceView.vue') },
    { path: '/stats', name: 'stats', component: () => import('./views/StatsView.vue') },
    { path: '/drivers/:id', name: 'driver', component: () => import('./views/DriverView.vue') },
    { path: '/profile', name: 'profile', component: () => import('./views/ProfileView.vue') },
    { path: '/settings', name: 'settings', component: () => import('./views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue') },
  ],
  scrollBehavior: (_to, _from, saved) => saved || { top: 0 },
});
