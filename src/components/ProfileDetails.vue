<script setup>
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase_setup';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential } from 'firebase/auth';
import { onMounted, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const profile = ref({
    name: '',
    fullName: '',
    dateOfBirth: '',
    residentialAddress: '',
    organisation: '',
    department: '',
    skills: null,
});

const successMessage = ref('');
const emit = defineEmits(['save']);

const auth = getAuth();
const user = ref(null);
const email = ref('');
const password1 = ref('');
const profileEditingEnabled = ref(false);
const showPasswordModal = ref(false);
const role = ref('');
const router = useRouter();

async function getData() {
    try {
        if (!user.value?.uid) return;
        
        const userDoc = doc(db, 'users', user.value.uid);
        const docSnap = await getDoc(userDoc);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            role.value = data?.role || '';
            profile.value = {
                name: data?.username || '',
                fullName: data?.fullName || '',
                dateOfBirth: data?.dateOfBirth || '',
                residentialAddress: data?.residentialAddress || '',
                organisation: data?.organisation || '',
                department: data?.department || '',
                skills: data?.skills || null,
            };
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

onMounted(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
            user.value = currentUser;
            email.value = currentUser.email;
            await getData();
        } else {
            console.error('No user is currently signed in.');
            router.push('/login');
        }
    });

    onUnmounted(() => unsubscribe());
});

async function saveChanges() {
    try {
        if (!user.value?.uid) {
            console.error('No user ID available');
            return;
        }

        const userDoc = doc(db, 'users', user.value.uid);
        
        const updateData = {
            fullName: profile.value.fullName,
            dateOfBirth: profile.value.dateOfBirth,
            residentialAddress: profile.value.residentialAddress,
            organisation: profile.value.organisation,
            department: profile.value.department,
            skills: profile.value.skills,
            username: profile.value.name,
            role: role.value
        };
        console.log(updateData)

        await updateDoc(userDoc, updateData);
        console.log('Profile updated:', updateData);
        successMessage.value = 'Profile has been updated successfully!';
        emit('save', updateData);

        profileEditingEnabled.value = false;

        setTimeout(() => {
            if (role.value === 'volunteer') {
                router.push('/UserProfile');
            } else {
                router.push('/AdminProfile');
            }
        }, 100);

    } catch (error) {
        console.error('Error saving changes:', error);
        alert('Error updating profile. Please try again.');
    }
}

async function reAuth(e) {
    e.preventDefault();  
    try {
        if (!user.value) {
            console.error('No user is logged in');
            alert('No user is logged in. Please sign in.');
            return;
        }
        const creds = EmailAuthProvider.credential(user.value.email, password1.value);
        await reauthenticateWithCredential(user.value, creds);
        console.log('Re-authentication successful!');

        showPasswordModal.value = false;
        profileEditingEnabled.value = true;
        password1.value = '';
    } catch (error) {
        console.error('Error re-authenticating:', error);
        alert('Invalid password, please try again.');
    }
}

const handleSave = async () => {
    await saveChanges();
    profileEditingEnabled.value = false;
};
</script>

<template>
    <!-- Welcome page with UserID and update profile button -->
    <div v-if="!profileEditingEnabled" class="profile-container">
        <h1>About you, {{ profile.name }}.</h1>
        <p>Welcome to your profile page. You can update your information below.</p>
    
        <div class="update-button-container">
            <button @click="showPasswordModal = true" class="update-button">Update your profile</button>
        </div>
    </div>
    
    <!-- Modal for password entry -->
    <div v-if="showPasswordModal" class="modal-overlay">
        <div class="modal-content">
            <h2>Please enter your password to continue</h2>
            <form @submit.prevent="reAuth">
            <label for="password1">Password:</label>
            <input type="password" id="password1" v-model="password1" required>
            <button type="submit">Submit</button>
            </form>
            <button @click="showPasswordModal = false">Cancel</button>
        </div>
    </div>
    
    <!-- Profile Editing Section (after re-authentication) -->
    <div v-if="profileEditingEnabled" class="center-wrapper">
        <div class="edit-profile-container">
        <h1>Edit Your Profile</h1>
        <form @submit.prevent="saveChanges" class="profile-form">
            <table class="profile-table">
            <tr>
                <th><label for="fullName">Full Name:</label></th>
                <td><input type="text" id="fullName" v-model="profile.fullName" required></td>
            </tr>
            <tr>
                <th><label for="dob">Date of Birth:</label></th>
                <td><input type="date" id="dob" v-model="profile.dateOfBirth" required></td>
            </tr>
            <tr>
                <th><label for="residentialAddress">Residential Address:</label></th>
                <td><input type="text" id="residentialAddress" v-model="profile.residentialAddress" required></td>
            </tr>
            <tr>
                <th><label for="organisation">Your Organisation:</label></th>
                <td><input type="text" id="organisation" v-model="profile.organisation" required></td>
            </tr>
            <tr v-if="role !== 'volunteer'">
                <th><label for="department">Department:</label></th>
                <td><input type="text" id="department" v-model="profile.department" required></td>
            </tr>
            <tr v-if="role === 'volunteer'">
                <th><label for="skills">Your Skills:</label></th>
                <td><input type="text" id="skills" v-model="profile.skills" placeholder="Separate by commas" required></td>
            </tr>
            </table>
            <div class="submit-button-container">
                <button type="button" class="save-button" @click="handleSave">Save Changes</button>
            </div>
        </form>
        <div class="go-back-container">
            <button @click="profileEditingEnabled = false" class="go-back-button">Go back!</button>
        </div>
        </div>
    </div>
    
    <!-- Display User Profile Information -->
    <div v-if="!profileEditingEnabled">
        <div class="profile-table-container">
        <h2>Your Profile Information</h2>
        <table class="profile-table">
            <tr>
                <td>Full Name:</td>
                <td>{{ profile.fullName }}</td>
            </tr>
            <tr>
                <td>Date of Birth:</td>
                <td>{{ profile.dateOfBirth }}</td>
            </tr>
            <tr>
                <td>Residential Address:</td>
                <td>{{ profile.residentialAddress }}</td>
            </tr>
            <tr>
                <td>Organisation:</td>
                <td>{{ profile.organisation }}</td>
            </tr>
            <tr v-if="role !== 'volunteer'">
                <td>Department:</td>
                <td>{{ profile.department }}</td>
            </tr>
            <tr v-if="role === 'volunteer'">
                <td>Skills:</td>
                <td>{{ profile.skills }}</td>
            </tr>
        </table>
        <div class="go-back-container">
            <button @click="router.push('/ViewTasks')" class="go-back-button">Go back!</button>
        </div> 
        </div>
    </div> 
</template>

<style scoped>
.profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-top: 20px;
}

.update-button-container {
    display: flex;
    justify-content: center;
    margin: 20px 0;
}

.update-button {
     margin-bottom: 20px;
    padding: 10px 20px;
    background-color: #ddd;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); 
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
    margin-bottom: 20px;
}

.modal-content input {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    border: 1px solid #ccc;
    box-sizing: border-box;
}

.modal-content button {
    padding: 10px 20px;
    margin: 10px 5px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.modal-content button:hover {
    background-color: #45a049;
}

.modal-content button[type="submit"] {
    background-color: #007bff;
}

.modal-content button[type="submit"]:hover {
    background-color: #0056b3;
}

.profile-table-container {
    max-width: 700px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.profile-table {
    width: 100%;
    border-collapse: collapse;
}

.profile-table th {
    text-align: left;
    padding: 8px;
    background-color: #f2f2f2;
    font-weight: bold;
    width: 30%;
}

.profile-table td {
    padding: 8px;
    border-top: 1px solid #ddd;
}

.profile-table input[type="text"],
.profile-table input[type="date"] {
    width: 100%;
    padding: 10px;
    border: 2px solid #b89ac9; 
    border-radius: 5px;
    font-size: 16px;
    box-sizing: border-box;
}

.profile-table input#skills::placeholder {
    color: #888; 
    font-style: italic; 
}

.profile-table input::placeholder {
    color: #888; 
    font-style: italic;
}

.go-back-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.go-back-button {
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold; 
    color: black;
    background-color: #fadfa1;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.go-back-button :hover {
    background-color: #f0d78c;
}

.profile-table tr:nth-child(even) {
    background-color: #f9f9f9;
} 

.submit-button-container {
    text-align: center;
    margin-top: 20px;
}

.save-button {
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold; 
    color: black;
    background-color: #fadfa1;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.save-button:hover {
    background-color: #f0c975;
}

.center-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh; 
    width: 100%;
}

.edit-profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    max-width: 600px;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
