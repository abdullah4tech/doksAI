import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'
import ChatView from '../pages/ChatView.vue'
import LoginView from '../pages/LoginView.vue'
import RegisterView from '../pages/RegisterView.vue'
import OnboardingView from '../pages/OnboardingView.vue'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView,
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/c/:id',
      name: 'chat',
      component: ChatView,
      props: true,
      meta: { requiresAuth: true },
    },
  ],
})

// Route guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const onboardingCompleted = authStore.onboardingCompleted

  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login with return URL
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }
  // If user is authenticated but hasn't completed onboarding
  // and trying to access protected routes other than onboarding
  else if (
    isAuthenticated &&
    !onboardingCompleted &&
    to.name !== 'onboarding' &&
    to.meta.requiresAuth
  ) {
    next({ name: 'onboarding' })
  }
  // If trying to access login/register while authenticated, redirect based on onboarding status
  else if (!to.meta.requiresAuth && isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    next({ name: onboardingCompleted ? 'home' : 'onboarding' })
  }
  // Otherwise proceed normally
  else {
    next()
  }
})

export default router
