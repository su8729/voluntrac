<script setup>
import { ref, onMounted } from 'vue';
import ProfileDetails from '@/components/ProfileDetails.vue';
import AdministratorTaskbar from "../components/AdminTaskbar.vue"
import { useRouter } from 'vue-router';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const router = useRouter();
const showConfirmation = ref(false);
const profile = ref({
    fullName: '',
    dateOfBirth: '',
    residentialAddress: '',
    organisation: '',
    department: '',
});

function handleSave(updatedData) {
    console.log("Received save event with updated data:", updatedData);
    profile.value = updatedData;
    showConfirmation.value = true;
}

onMounted(() => {
    auth.onAuthStateChanged((currentUser) => {
        if (currentUser) {
            // Fetch user data here or call getData if needed
        } else {
            console.error('No user is currently signed in.');
            router.push('/login');  // Redirect to login page if not signed in
        }
    });
});
</script>

<template>
<div>
    <AdministratorTaskbar></AdministratorTaskbar>

    <ProfileDetails @save="handleSave" />
</div>
</template>

<style scoped>
</style>