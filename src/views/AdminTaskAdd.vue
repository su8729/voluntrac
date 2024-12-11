<template>
    <AdministratorTaskbar></AdministratorTaskbar>
    <div>
        <div id="task-management-header">
            <h1>Add Tasks here!</h1>
        </div>
    </div>
    <AddEditTask></AddEditTask>
</template>

<script setup>
import AddEditTask from '../components/AdminAddEditTask.vue'
import AdministratorTaskbar from '../components/AdminTaskbar.vue'
</script>

<style scoped>
#task-management-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    margin-bottom: 0.2rem;
}

h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
}
</style>
