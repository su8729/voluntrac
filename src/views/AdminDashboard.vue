<script setup>
import AdministratorTaskbar from "../components/AdminTaskbar.vue"
import HomePageUsername from '@/components/HomePageUsername.vue'
import LastLoginDate from '@/components/LastLoginDate.vue';
import { db } from "@/firebase_setup.js";
import { ref, onMounted } from 'vue';
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
/*import { query, collection, where, getCountFromServer, Timestamp } from 'firebase/firestore';
import { ref } from 'vue'; */

const requestsToManage = ref(0);
const tasksToTakeAttendance = ref(0); 

async function fetchOutstandingRequests() {
    try {
        const resvQuery = query(collection(db, "task_reservations"));
        const reservationsSnapshot = await getDocs(resvQuery);

        let pendingCount = 0;

        for (const docSnap of reservationsSnapshot.docs) {
            const resvData = docSnap.data();
            
            const assignmentQuery = query(
                collection(db, "task_assignment"),
                where("task_id", "==", resvData.task_id),
                where("volunteer_id", "==", resvData.volunteer_id)
            );
            const assignmentSnap = await getDocs(assignmentQuery);
            
            if (assignmentSnap.empty || assignmentSnap.docs[0].data().status === "pending") {
                pendingCount++;
            }
        }
        
        requestsToManage.value = pendingCount;
    } catch (error) {
        console.error("Error fetching outstanding requests: ", error);
    }
}

async function updateAttendanceFinalisedField() {
    try {
        const tasksSnapshot = await getDocs(collection(db, "task"));

        tasksSnapshot.forEach(async (doc) => {
            const data = doc.data();

            if (data.attendance_finalised === undefined) {
                await updateDoc(doc.ref, { attendance_finalised: false });
                console.log(`Updated task ${doc.id} with attendance_finalised: false`);
            } else {
                console.log(`Task ${doc.id} already has attendance_finalised set to: ${data.attendance_finalised}`);
            }
        });
    } catch (error) {
        console.error("Error updating tasks:", error);
    }
}


async function fetchUnfinalisedAttendance() {
    try {
        const taskQuery = query(collection(db, "task"), where("attendance_finalised", "==", false));
        const tasksSnapshot = await getDocs(taskQuery);

        tasksToTakeAttendance.value = tasksSnapshot.size;
    } catch (error) {
        console.error("Error fetching unfinalised attendance tasks:", error);
    }
}

updateAttendanceFinalisedField();

onMounted(() => {
    fetchOutstandingRequests();
    fetchUnfinalisedAttendance();
});
</script>

<template>
<AdministratorTaskbar></AdministratorTaskbar>

<div class="admin-homepage">
    <HomePageUsername /> <!-- Renders the username -->
    <LastLoginDate /> <!-- Renders the last login date -->
</div>

<div class = "task-options">
    <h2>What would you like to do today?</h2>
    
    <div class="task-grid">
        <div class="task-card1">
            <RouterLink to="/Admin/ManageTasks">
                <img src="/AdminDashboard_Icon 1.png" alt="Manage Tasks Icon" class="task-icon">
                <h3>Manage Tasks</h3>
                <p>Add, manage and delete tasks for volunteers</p>
            </RouterLink>
        </div>

        <div class = "task-card2">
            <RouterLink to="/Admin/TakeAttendance">
                <img src="/AdminDashboard_Icon 2.png" alt="Manage Tasks Icon" class="task-icon">
                <h3>Take Attendance</h3>
                <p>Record and track attendance of volunteers at events here</p>
            </RouterLink>
        </div>
    </div>

    <div class = "dashboard">
        <h2>Here’s what you missed out:</h2>

        <div class = "dashboard-cards">
            <div class = "requests">
                <RouterLink to = "/Admin/ManageTasks">
                    <h3> {{ requestsToManage }}</h3>
                    <p>Requests</p>
                </RouterLink>
            </div>              

            <div class = "attendance">
                <RouterLink to = "/Admin/TakeAttendance">
                    <h3>{{ tasksToTakeAttendance }}</h3>
                    <p>Attendance to submit</p>
                </RouterLink>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
.admin-homepage {
    padding: 20px;
}

h1, h2 {
    margin-bottom: 20px;
}

h3 {
    font-size: 20px;
}

.task-options {
    padding: 20px;
}

.task-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(200px, 1fr));
    gap: 20px;
    justify-content: center;
}

.task-card1, .task-card2 {
    background-image: linear-gradient(#f8e7bc, #e6c2bf);
    /*background-color: #f8e7bc;*/
    border: 1px solid #ddd;
    /*font-size: 15px;*/
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    transition: box-shadow 0.3s ease;
}

.task-card1:hover, .task-card2:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.task-card1 >>> a, .task-card2 >>> a {
    text-decoration: none;
    color:black;
}

.task-card1 img.task-icon {
    width: 80px; 
    height: auto;
    margin-bottom: 5px; 
}

.task-card2 img.task-icon {
    width: 100px; 
    height: auto;
    margin-bottom: 5px; 
}

.dashboard {
    margin-top: 40px;
}

.dashboard-cards {
    display: flex;
    gap: 20px;
}

.requests, .attendance {
    background-color: #97bdc4;
    border: 1px solid #ddd;
    padding: 50px;
    border-radius: 8px;
    flex: 1;
    text-align: center;
}

.requests h3 {
    font-size: 40px;
    margin: 0;
}

.requests >>> a, .attendance >>> a {
    text-decoration: none;
    color:white;
}

.attendance h3 {
    font-size: 40px;
    margin: 0;
    text-decoration: none;
}

.requests p {
    margin: 5px 0 0;
}

.attendance p {
    margin: 5px 0 0;
}
</style>    
