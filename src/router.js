import { createWebHashHistory, createRouter } from 'vue-router';

import Home from './views/Home.vue';
import Play from './views/Play.vue';
import Create from './views/Create.vue';

const routes = [
    { path: "/:adminMode?", component: Home },
    { path: "/quiz/:data", component: Play },
    { path: "/create/:data?", component: Create },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router