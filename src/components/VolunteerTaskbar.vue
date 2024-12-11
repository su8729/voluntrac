<script setup>
import { auth } from '../firebase_setup';
import { useRouter } from "vue-router";
import { signOut } from 'firebase/auth';
const router = useRouter();

async function logOut() {
    signOut(auth).then(() => router.push({path: "/"})).catch((error) => console.log(error.message));
}
</script>

<template>
<div>
    <nav class="navbar">
        <div class="navbar-logo">
            <img src="/app logo.png" alt="Voluntrac Logo" />
            <RouterLink to="/ViewTasks">VOLUNTRAC</RouterLink>
        </div>
        <div class="navbar-links">
            <RouterLink to="/ViewTasks">VIEW MY TASKS</RouterLink>
            <RouterLink to="/SearchTasks">SEARCH OPPORTUNITIES</RouterLink>
            <RouterLink to="/UserProfile">MY PROFILE ▼</RouterLink>
            <RouterLink to="/" @click.prevent="logOut">LOG OUT</RouterLink>
        </div>
    </nav>
</div>
</template>
  
<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #f8f8f8;
    border-bottom: 1px solid #ccc;
}
  
.navbar-logo {
    display: flex;
    align-items: center;
}
  
.navbar-logo img {
    height: 40px;
    margin-right: 10px;
}
  
.navbar-logo a {
    font-size: 1.5em;
    font-weight: bold;
    text-decoration: none;
    color: black;
}
  
.navbar-links {
    display: flex;
    gap: 20px;
}
  
.navbar-links a {
    text-decoration: none;
    color: #333;
    font-size: 1.1em;
    font-weight: 500;
}
  
.navbar-links a:hover {
    text-decoration: underline;
}
  
h2 {
    text-align: center;
    font-size: 1.8em;
    color: #333;
    margin-bottom: 20px;
}
  
@media (max-width: 768px) {
    .navbar-links {
        flex-direction: column;
        gap: 10px;
    }
}
</style>