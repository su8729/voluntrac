<script setup>
</script>

<template>
<div class="choice-container">
    <h2>Select Your Login Type</h2>
    <div class="choices">
    <RouterLink to="/volunteerLogin" class="choice-button">
        Login as Volunteer
    </RouterLink>
    <RouterLink to="/adminLogin" class="choice-button">
        Login as Admin
    </RouterLink>
    </div>
</div>
</template>

<style scoped>
.choice-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
    text-align: center;
}

h2 {
    font-size: 2em;
    margin-bottom: 30px;
    color: #333;
}

.choices {
    display: flex;
    gap: 20px;
}

.choice-button {
    text-decoration: none;
    padding: 15px 30px;
    border-radius: 5px;
    background-color: #f8e7bc;
    color: white;
    font-size: 1.2em;
    transition: background-color 0.3s ease;
}

.choice-button:hover {
    background-color: #fbce5b;
}
</style>