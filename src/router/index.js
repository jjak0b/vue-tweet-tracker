import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from "@/views/Dashboard";
import HomePage from "@/views/HomePage";
import MainPage from "@/views/MainPage";
import FilterMenu from "@/views/FilterMenu";
import Gallery from "@/views/Gallery";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/app',
    name: 'HomePage',
    component: MainPage,
    children: [
      {
        path: '/app/dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: '/app/filter',
        name: 'New sample',
        component: FilterMenu
      },
      {
        path: '/app/gallery',
        name: 'Gallery',
        component: Gallery
      }
    ]
  },
]

const router = new VueRouter({
  mode: "history",
  routes
})

export default router
