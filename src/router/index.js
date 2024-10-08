import { createRouter, createWebHistory } from "vue-router";
import MenuView from "../views/MenuView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: MenuView,
    },
    {
      path: "/:userId",
      component: MenuView,
    },
    {
      path: "/completed-order",
      name: "completed-order",
      component: () => import("../views/CompletedOrder.vue"),
    },
    {
      path: "/test-pay",
      name: "test-pay",
      component: () => import("../views/TestPay.vue"),
    },
    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/AboutView.vue"),
    // },
  ],
});

export default router;
