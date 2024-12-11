<script setup>
import AdministratorTaskbar from '@/components/AdminTaskbar.vue';
import { ref, onMounted } from 'vue';
import { getDocs, collection, where, query } from "firebase/firestore";
import { db } from "../firebase_setup.js";
import { RouterLink } from 'vue-router';
import router from '@/router';
import { Timestamp } from "firebase/firestore"; 

const tasksList = ref([]);
const activeTasks = ref([]);

async function fetchCurrentTasks() {
    // only fetch those that end date is after current date
    try {
        const currentTime = Timestamp.now();
        const q = query(collection(db, "task"), where("end_date_time", ">", currentTime));
        const tasksSnapshot = await getDocs(q);
        
        tasksList.value = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
        }));

        activeTasks.value = [...tasksList.value];
    } catch (e) {
        console.error("Error fetching tasks: ", e);
    }
}


function viewTaskDetails(taskID) {
    router.push(`/Admin/ViewTask/${taskID}`);
}

function viewManageVolunteers(taskID) {
    router.push({ name: 'AdminViewAssignment', params: { taskID } });
}

onMounted(async () => {
    fetchCurrentTasks();
});
</script>

<template>
<AdministratorTaskbar />

<div>
    <div id="task-management-header">
        <h1>Manage Tasks</h1>
        <div id="task-management-header-buttons">
            <RouterLink to="/Admin/AddTasks"><button class="header-button">+ Add Task</button></RouterLink>
            <RouterLink><button class="header-button">View Past Tasks</button></RouterLink>
        </div>            
    </div>
</div>
<div class="task-table-container">
    <table class="task-table">
        <thead>
            <tr>
                <th>Active Tasks</th>
                <th></th>
                <th>Actions</th>
                <th></th>
            </tr>
        </thead>
        <tbody v-if="activeTasks.length > 0">
            <tr v-for="task in activeTasks" :key="task.id">
                <td>{{ task.data.task_name }}</td>
                <td><button class="action-button view" @click="viewTaskDetails(task.id)">View Details</button></td>
                <td><RouterLink :to="'/EditTask/' + task.id"><button class="action-button edit">Edit Details</button></RouterLink></td>
                <td><button class="action-button manage" @click="viewManageVolunteers(task.id)">Manage Volunteers</button></td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<style>
.header-button {
    border: 1px solid #ccc;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
    font-size: 1em;
}

#task-management-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
}
#task-management-header-buttons {
    display: flex;
    gap: 10px;
}
.view {
    background-color:#dda9a9;
}
.view:hover {
    background-color:#cc6c6c;
}

.manage {
    background-color: #97bdc4;
}
.manage:hover {
    background-color: #84acbc;
}
</style>