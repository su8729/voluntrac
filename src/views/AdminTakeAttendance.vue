<script setup>
import AdministratorTaskbar from '@/components/AdminTaskbar.vue';
import { ref, onMounted } from 'vue';
import { getDocs, collection, where, query, Timestamp } from "firebase/firestore";
import { db } from "../firebase_setup.js";
import router from '@/router';

const activeTasks = ref([]);

async function fetchAllTasks() {
    try {
        const currentTime = Timestamp.now();
        const q = query(
            collection(db, "task"),
            where("end_date_time", ">", currentTime)
        );
        const tasksSnapshot = await getDocs(q);
        activeTasks.value = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
        }));
    } catch (e) {
        console.error("Error fetching tasks: ", e);
    }
}

function viewManageAttendance(taskID) {
    router.push(`/Admin/ManageAttendance/${taskID}`);
}

onMounted(async () => {
    await fetchAllTasks();
});
</script>

<template>
<AdministratorTaskbar />
<div>
    <div id="task-management-header">
    <h1>Take Attendance</h1>
    </div>
</div>
<div class="task-table-container">
    <table class="task-table">
        <thead>
            <tr>
                <th>Active Tasks</th>
                <th class="action-header">Actions</th>
            </tr>
        </thead>
        <tbody v-if="activeTasks && activeTasks.length > 0">
            <tr v-for="task in activeTasks" :key="task.id">
                <td>{{ task.data.task_name }}</td>
                <td class="action-cell">
                    <button class="action-button manage" @click="viewManageAttendance(task.id)">
                    Manage Attendance
                    </button>
                </td>
            </tr>
        </tbody>
        <tbody v-else>
            <tr>
                <td colspan="2" class="no-tasks">No active tasks found</td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<style scoped>
#task-management-header {
    display: flex;
    justify-content: flex-start;
    padding: 1rem;
}

.task-table-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin: 0 auto;
    max-width: 800px;
}

.task-table {
    width: 100%;
    border-collapse: collapse;
}

.task-table th,
.task-table td {
    padding: 15px;
    vertical-align: middle;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.task-table th {
    background-color: #f8f9fa;
    font-weight: bold;
}

th.action-header {
    text-align: right;
    padding-right: 140px;
    width: 300px;
}

.action-cell {
    display: flex;
    justify-content: flex-end;
}

.action-button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 1em;
}

.manage {
    background-color: #97bdc4;
    color: white;
}

.manage:hover {
    background-color: #84acbc;
}

.no-tasks {
    text-align: center;
    padding: 20px;
    color: #666;
}

@media (max-width: 768px) {
    .task-table-container {
        margin: 10px;
        padding: 10px;
    }

    .task-table th,
    .task-table td {
        padding: 8px;
    }

    .action-button {
        padding: 6px 12px;
    }
}
</style>
