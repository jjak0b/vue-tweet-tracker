import Vue from 'vue'
import VueRouter from 'vue-router'
import FilterMenu from "@/views/FilterMenu";
import Dashboard from "@/views/Dashboard";
import HomePage from "@/views/HomePage";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/samples',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/filter',
    name: 'New sample',
    component: FilterMenu
  }
]

const router = new VueRouter({
  routes
})

export default router
