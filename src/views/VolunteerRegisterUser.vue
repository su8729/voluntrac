<script setup>
import { ref } from 'vue';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase_setup';
import { useRouter } from 'vue-router';

const db = getFirestore();

const firstName = ref('');
const lastName = ref('');
const phone = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const dateOfBirth = ref('');
const role = ref('volunteer');
const message = ref('');
const router = useRouter();

const register = async () => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;
        
        await setDoc(doc(db, 'users', user.uid), {
            firstName: firstName.value,
            lastName: lastName.value,
            fullName: firstName.value + ' ' + lastName.value,
            phone: phone.value,
            username: username.value,
            dateOfBirth: dateOfBirth.value,
            email: email.value,
            role: role.value,
        });

        message.value = `User Registered: ${user.email}`;
        alert('Account created, please log in.');
        router.push('/volunteerLogin');
    } catch (error) {
        message.value = `Error: ${error.message}`;
    }
};
</script>

<template>
<div class="register-container">
    <div class="welcome">
        <img class="logo" src="/image.png" alt="Logo" />
    </div>
    <div class="register-form">
        <h2>Register</h2>
        <form @submit.prevent="register">
        <div class="input-group">
            <input v-model="firstName" type="text" placeholder="First Name" required />
            <span class="icon">👤</span>
        </div>
        <div class="input-group">
            <input v-model="lastName" type="text" placeholder="Last Name" required />
            <span class="icon">👤</span>
        </div>
        <div class="input-group">
            <input 
                type="text" 
                v-model="dateOfBirth"
                placeholder="Date of Birth"
                onfocus="(this.type='date')"
                onblur="if(!this.value)this.type='text'"
                required
            />
            <span class="icon">📅</span>
        </div>
        <div class="input-group">
            <input v-model="phone" type="tel" placeholder="Phone Number" required />
            <span class="icon">📞</span>
        </div>
        <div class="input-group">
            <input v-model="username" type="text" placeholder="Username" required />
            <span class="icon">👤</span>
        </div>
        <div class="input-group">
            <input v-model="email" type="email" placeholder="Email" required />
            <span class="icon">✉️</span>
        </div>
        <div class="input-group">
            <input v-model="password" type="password" placeholder="Password" required />
            <span class="icon">🔒</span>
        </div>
        <button type="submit" class="register-button">Register</button>
        </form>
        <p>Already have an account? <RouterLink to="/volunteerLogin">Login</RouterLink></p>
        <p>{{ message }}</p>
    </div>
</div>
</template>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8f8f8;
    gap: 10px;
}

.welcome {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}

.logo {
    width: 95%;
    height: auto;
}

.register-form {
    background-color: rgb(228, 228, 228);
    padding: 45px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}

h2 {
    font-size: 1.5em;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
}

.input-group {
    position: relative;
    margin-bottom: 15px;
    width: 100%;
}

input {
    width: calc(100% - 40px);
    padding: 8px;
    padding-right: 40px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1em;
}

.icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #333;
}

.register-button {
    width: 100%;
    padding: 8px;
    background-color: #f8e7bc;
    border: 0;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    color: #333;
}

a {
    color: #007bff;
}

a:hover {
    text-decoration: underline;
}

p {
    margin-top: 10px;
    font-size: 0.9em;
    color: #666;
    text-align: center;
}
</style>
