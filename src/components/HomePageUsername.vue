<script setup>
import { ref, onMounted } from 'vue';
import { auth, db } from '../firebase_setup';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'


const username = ref('Loading...');

const fetchUserData = async (user) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid)); 
            if (userDoc.exists()) {
                username.value = userDoc.data().username; 
            } else {
                console.log('No such user!');
            }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

onMounted(() => {
    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchUserData(user);
        }
    });
});
</script>

<template>
<h1>Welcome, {{ username }}!</h1>
</template>


<style scoped>
</style>