import { createRouter, createWebHistory } from 'vue-router';
import TaskAdd from '@/views/AdminTaskAdd.vue';
import LogIn from '@/views/UserLogIn.vue';
import RegisterUser from '@/views/VolunteerRegisterUser.vue';
import RegisterAdmin from '@/views/AdminRegister.vue';
import TaskSearch from '@/views/VolunteerTaskSearch.vue';
import VolunteerTaskDetail from '@/views/VolunteerTaskDetail.vue';
import VolunteerHomePage from '@/views/VolunteerHomePage.vue';
import ForbiddenAccess from "@/views/UserForbiddenAccess.vue";
import AdministratorDashboard from "@/views/AdminDashboard.vue";
import NotFound from "@/views/UserNotFound.vue";
import VolunteerProfile from '@/views/VolunteerProfile.vue';
import LoginChoice from '@/views/UserLoginChoice.vue';
import AdminLogin from '@/views/AdminLogin.vue';
import AdminTaskManagement from '@/views/AdminTaskManagement.vue';
import AdminTaskDetail from '@/views/AdminTaskDetail.vue';
import AdminTaskAssignment from '@/views/AdminTaskAssignment.vue';
import AdminTaskEdit from '@/views/AdminTaskEdit.vue';
import TakeAttendance from '@/views/AdminTakeAttendance.vue'; 
import ManageAttendance from '@/views/AdminManageAttendance.vue'; 
import AdminProfile from '@/views/AdminProfile.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/loginChoice'
    },
    {
      path: '/loginChoice',
      name: 'LoginChoice',
      component: LoginChoice
    },
    {
      path: '/volunteerLogin',
      name: 'VolunteerLogin',
      component: LogIn
    },
    {
      path: '/adminLogin',
      name: 'AdminLogin',
      component: AdminLogin
    },
    {
      path: '/registerUser',
      name: 'RegisterUser',
      component: RegisterUser
    },
    {
      path: '/registerAdmin',
      name: 'RegisterAdmin',
      component: RegisterAdmin
    },
    {
      path: '/ViewTasks',
      name: 'ViewTasks',
      component: VolunteerHomePage
    },
    {
      path: '/Admin/AddTasks',
      name: 'AddTasks',
      component: TaskAdd
    },
    {
      path: '/SearchTasks',
      name: 'SearchTasks',
      component: TaskSearch
    },
    {
      path: '/ViewTask/:taskID',
      name: 'VolunteerTaskDetail',
      component: VolunteerTaskDetail
    },
    {
      path: '/ForbiddenAccess',
      name: 'ForbiddenAccess',
      component: ForbiddenAccess
    },
    {
      path: '/Admin/Dashboard',
      name: 'AdminDashboard',
      component: AdministratorDashboard
    },
    {
      path: '/Admin/ManageTasks',
      name: 'ManageTasks',
      component: AdminTaskManagement
    },
    {
      path: '/Admin/ViewTask/:taskID',
      name: 'AdminViewTasks',
      component: AdminTaskDetail
    },
    {
      path: '/Admin/TaskAssignment/:taskID',
      name: 'AdminViewAssignment',
      component: AdminTaskAssignment,
      props: true,
    },
    {
      path: '/Admin/TakeAttendance',
      name: 'TakeAttendance',
      component: TakeAttendance
    },
    {
      path: '/Admin/ManageAttendance/:taskID',
      name: 'ManageAttendance',
      component: ManageAttendance,
      props: true
    },
    {
      path: '/UserProfile',
      name: 'VolunteerProfile',
      component: VolunteerProfile
    },
    {
      path: '/AdminProfile',
      name: 'AdminProfile',
      component: AdminProfile
    },
    {
      path: '/:catchAll(.*)', 
      name: 'NotFound',
      component: NotFound
    },
    {
      path: '/EditTask/:taskID',
      name: 'Edit Task',
      component: AdminTaskEdit
    }
  ]
});

/*
router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const publicLinks = ['LoginChoice', 'VolunteerLogin', 'AdminLogin', 'RegisterUser', 'RegisterAdmin'];
  if (!user && !publicLinks.includes(to.name)) {
    next({ name: 'LoginChoice' });
  } else {
    next();
  }
});
*/

export default router;

