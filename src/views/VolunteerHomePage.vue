<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase_setup';
import { collection, query, where, getDocs, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth } from '../firebase_setup';
import { useRouter } from "vue-router";
import VolunteerTaskbar from "../components/VolunteerTaskbar.vue";
import HomePageUsername from '@/components/HomePageUsername.vue';
import LastLoginDate from '@/components/LastLoginDate.vue';
const router = useRouter();

const tasks = ref([]);

async function fetchTasks() {
  const currentUser = auth.currentUser;
  if (currentUser) {
        try {
            const resvQuery = query(
                collection(db, 'task_reservations'),
                where('volunteer_id', '==', currentUser.uid)
            );
            const reservationSnapshot = await getDocs(resvQuery);

            const tasksPromises = reservationSnapshot.docs.map(async (resvDoc) => {
                const taskID = resvDoc.data().task_id;

                const taskDoc = await getDoc(doc(db, 'task', taskID));

                const assignmentQuery = query(
                    collection(db, 'task_assignment'),
                    where('task_id', '==', taskID),
                    where('volunteer_id', '==', currentUser.uid)
                );
                const assignmentSnapshot = await getDocs(assignmentQuery);

                let status = 'pending';
                let assignmentId = null;

                if (!assignmentSnapshot.empty) {
                    const assignmentDoc = assignmentSnapshot.docs[0];
                    status = assignmentDoc.data().status;
                    assignmentId = assignmentDoc.id;
                }

                return taskDoc.exists()
                    ? { 
                        reservation_id: resvDoc.id,
                        assignment_id: assignmentId,
                        task_id: taskID, 
                        status: status, 
                        ...taskDoc.data() 
                      }
                    : null;
            });

            tasks.value = (await Promise.all(tasksPromises)).filter(task => task !== null);
            console.log(tasks.value);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
  }
}

async function cancelPendingTask(taskID, reservationID) {
    const currentUser = auth.currentUser;
    if (currentUser && confirm('Are you sure you want to cancel this pending task?')) {
        try {
            // Delete the reservation document
            await deleteDoc(doc(db, 'task_reservations', reservationID));
            
            alert('Pending task successfully cancelled!');
            await fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('There was an error cancelling the task. Please try again.');
        }
    }
}

async function cancelTask(taskID, reservationID, assignmentID) {
    const currentUser = auth.currentUser;
    if (currentUser && confirm('Are you sure you want to cancel this task?')) {
        try {
            // Delete both reservation and assignment documents
            await deleteDoc(doc(db, 'task_reservations', reservationID));
            
            if (assignmentID) {
                await deleteDoc(doc(db, 'task_assignment', assignmentID));
            }

            alert('Task successfully cancelled!');
            await fetchTasks();
        } catch (error) {
            console.error('Error cancelling the task:', error);
            alert('There was an error cancelling the task. Please try again.');
        }
    }
}

onMounted(fetchTasks);

function viewTaskDetails(taskID) {
  router.push(`/ViewTask/${taskID}`);
}
</script>

<template>
<div>
    <VolunteerTaskbar></VolunteerTaskbar>

    <div class="volunteer-homepage">
        <HomePageUsername />
        <LastLoginDate />
    </div>

    <div class="task-table-container">
        <h2 class="page-title">Here's what you signed up for</h2>
        <table class="task-table">
            <thead>
                <tr>
                    <th>Upcoming Tasks</th>
                    <th>Start Date & Time</th>
                    <th>Reporting Location</th>
                    <th>Status</th>
                    <th>Options</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="task in tasks" :key="task.reservation_id">
                    <td @click="viewTaskDetails(task.task_id)">{{ task.task_name }}</td>
                    <td>{{ task.start_date_time.toDate().toLocaleString() }}</td>
                    <td>{{ task.location }}</td>
                    <td>{{ task.status }}</td>
                    <td>
                        <button v-if="task.status === 'accepted'" 
                                @click="cancelTask(task.task_id, task.reservation_id, task.assignment_id)" 
                                class="action-button">Cancel</button>
                        <button v-else-if="task.status === 'rejected'" 
                                @click="cancelTask(task.task_id, task.reservation_id, task.assignment_id)" 
                                class="action-button">Delete</button>
                        <button v-else 
                                @click="cancelPendingTask(task.task_id, task.reservation_id)" 
                                class="action-button">Cancel</button>
                    </td>
                </tr>
                <tr v-if="tasks.length === 0">
                    <td colspan="5">No tasks available</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="image-container">
        <img src="/img2.png" alt="Illustration">
    </div>
</div>
</template>

<style scoped>

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f0f0f0;
  border-bottom: 2px solid #e0e0e0;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 50px;
  width: auto;
}

.voluntrac-text {
  font-size: 1.8em;
  font-weight: bold;
  margin-left: 10px;
}

.navbar {
  display: flex;
  align-items: center;
}

.navbar-links {
  display: flex;
  gap: 20px;
  list-style: none;
}

.navbar-links li a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.navbar-links li a:hover {
  color: #555;
}

.volunteer-homepage {
    padding: 20px;
}

.task-table-container {
  width: 80%;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-title {
  text-align: center;
  font-size: 2.4em;
  color: #333;
  margin-bottom: 20px;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.1em;
  text-align: left;
}

.task-table thead th {
  background-color: #f8f8f8;
  padding: 15px;
  border-bottom: 2px solid #ccc;
  font-weight: bold;
}

.task-table tbody td {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.task-table tbody tr:last-child td {
  border-bottom: none;
}

.action-button {
  background-color: #f8e7bc;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1em;
  color: #333;
}

.action-button:hover {
  background-color: #f4c9a1;
}

.image-container {
  width: 300px; 
  height: auto;
  float: right; 
  margin-top: 50px; 
  margin-right: 100px;
}

.image-container img {
  max-width: 100%; 
  height: auto;
}  

@media (max-width: 768px) {
  .task-table-container {
    width: 95%;
  }

  .task-table {
    font-size: 0.9em;
  }

  .navbar-links {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
  
