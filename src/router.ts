import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/Home.vue') },
    {
      path: '/history',
      name: 'history',
      component: () => import('./views/History.vue'),
    },
    {
      path: '/survey/:id',
      name: 'quiz',
      component: () => import('./views/Quiz.vue'),
    },
    {
      path: '/about/:id',
      name: 'about',
      component: () => import('./views/Detail.vue'),
    },
    {
      path: '/result/:id',
      name: 'result',
      component: () => import('./views/ResultView.vue'),
    },
    {
      path: '/disclaimer',
      name: 'disclaimer',
      component: () => import('./views/Disclaimer.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('./views/Privacy.vue'),
    },
  ],
})
