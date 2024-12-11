<script setup>
import { ref, onMounted } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase_setup'; 

const lastLogin = ref('');

// Format the last login date
const formatLastLogin = (lastSignInTime) => {
    const date = new Date(lastSignInTime);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options); // This formats the date to e.g. '31 December 2024'
};

// Fetch last login date on component mount
onMounted(() => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            lastLogin.value = formatLastLogin(user.metadata.lastSignInTime); // Set formatted last login time
        } else {
            lastLogin.value = 'No login record';
        }
    });
});
</script>

<template>
<h3>Last login: {{ lastLogin }}</h3> <!-- Display the last login date -->
</template>


<style scoped>
</style>