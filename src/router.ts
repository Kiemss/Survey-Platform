import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/Home.vue') },
    {
      path: '/survey/:id',
      name: 'quiz',
      component: () => import('./views/Quiz.vue'),
    },
    {
      path: '/result/:id',
      name: 'result',
      component: () => import('./views/ResultView.vue'),
    },
  ],
})
