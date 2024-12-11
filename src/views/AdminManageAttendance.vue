<script setup>
import AdministratorTaskbar from '@/components/AdminTaskbar.vue';
import { ref, onMounted } from 'vue';
import { db } from "../firebase_setup.js";
import { getDoc, getDocs, doc, collection, query, where, addDoc, updateDoc } from "firebase/firestore";

const props = defineProps({
   taskID: {
       type: String,
       required: true,
   },
});

const taskDescription = ref("You are currently taking attendance for");
const taskResv = ref([]);
const attendance = ref({});
const remarks = ref({});
const activeTaskName = ref("");

async function fetchActiveTaskName() {
   try {
       const taskRef = doc(db, "task", props.taskID);
       const taskSnapshot = await getDoc(taskRef);
       if (taskSnapshot.exists()) {
           activeTaskName.value = taskSnapshot.data().task_name || "Unknown Task";
       } else {
           activeTaskName.value = "Unknown Task";
       }
   } catch (e) {
       console.error("Error fetching task name: ", e);
       activeTaskName.value = "Unknown Task";
   }
}

async function fetchApprovedVolunteers() {
   try {
       const approvedVolunteersQuery = query(
           collection(db, "task_assignment"),
           where("task_id", "==", props.taskID),
           where("status", "==", "accepted")
       );
       const volunteersSnapshot = await getDocs(approvedVolunteersQuery);

       const volunteers = [];
       for (const docSnap of volunteersSnapshot.docs) {
           const volunteerData = docSnap.data();
           const volunteerRef = doc(db, "users", volunteerData.volunteer_id);
           const volunteerSnap = await getDoc(volunteerRef);

           if (volunteerSnap.exists()) {
               const username = volunteerSnap.data().username || "Unknown Volunteer";
               volunteers.push({
                   volunteer_id: volunteerData.volunteer_id,
                   username: username,
               });

               const attendanceQuery = query(
                   collection(db, "user_attendance"),
                   where("task_id", "==", props.taskID),
                   where("user_id", "==", volunteerData.volunteer_id)
               );
               const attendanceSnapshot = await getDocs(attendanceQuery);

               if (!attendanceSnapshot.empty) {
                   const existingAttendance = attendanceSnapshot.docs[0].data();
                   attendance.value[volunteerData.volunteer_id] = existingAttendance.attendance_status;
                   remarks.value[volunteerData.volunteer_id] = existingAttendance.remark || "";
               }
           }
       }
       taskResv.value = volunteers;
   } catch (e) {
       console.error("Error fetching approved volunteers: ", e);
   }
}

function markAll(status) {
   taskResv.value.forEach((volunteer) => {
       attendance.value[volunteer.volunteer_id] = status;
   });
}

function confirmIndividual(volunteerId, status) {
   attendance.value[volunteerId] = status;
}

async function finalizeAttendance() {
   const unmarkedAttendance = taskResv.value.some(
       volunteer => !attendance.value[volunteer.volunteer_id]
   );
   
   if (unmarkedAttendance) {
       alert("Please mark attendance for all volunteers!");
       return;
   }

   try {
       for (const volunteer of taskResv.value) {
           const attendanceQuery = query(
               collection(db, "user_attendance"),
               where("task_id", "==", props.taskID),
               where("user_id", "==", volunteer.volunteer_id)
           );

           const attendanceSnapshot = await getDocs(attendanceQuery);

           const attendanceData = {
               task_id: props.taskID,
               user_id: volunteer.volunteer_id,
               attendance_status: attendance.value[volunteer.volunteer_id],
               remark: remarks.value[volunteer.volunteer_id] || "",
               timestamp: new Date().toISOString()
           };

           if (!attendanceSnapshot.empty) {

               const existingDoc = attendanceSnapshot.docs[0];
               await updateDoc(doc(db, "user_attendance", existingDoc.id), attendanceData);
           } else {

               await addDoc(collection(db, "user_attendance"), attendanceData);
           }
       }

       const taskRef = doc(db, "task", props.taskID);
       await updateDoc(taskRef, { 
           attendance_finalised: true,
           attendance_finalised_at: new Date().toISOString()
       });
       
       alert("All attendance records have been saved successfully!");
   } catch (error) {
       console.error("Error finalizing attendance:", error);
       alert(`Failed to save attendance records: ${error.message}`);
   }
}

onMounted(async () => {
   await fetchActiveTaskName();
   await fetchApprovedVolunteers();
});
</script>

<template>
    <AdministratorTaskbar />
    <div>
        <div id="task-management-header">
            <h1>Manage attendance here</h1>
            <p class="task-description">{{ taskDescription }} {{ activeTaskName }}</p>
        </div>
    </div>
    
    <div class="main-content">
        <div class="content-container">
            <div class="action-buttons">
                <button @click="markAll('present')" class="action-button present">
                    Mark all as present
                </button>
                <button @click="markAll('absent')" class="action-button absent">
                    Mark all as absent
                </button>
            </div>
    
            <div class="task-table-container">
                <table class="task-table">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Attendance</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody v-if="taskResv.length > 0">
                        <tr v-for="(resv, index) in taskResv" :key="index">
                            <td>{{ resv.username }}</td>
                            <td class="attendance-cell">
                                <div class="attendance-buttons">
                                    <button 
                                        class="attendance-button"
                                        :class="{ active: attendance[resv.volunteer_id] === 'present' }"
                                        @click="confirmIndividual(resv.volunteer_id, 'present')">
                                        Present
                                    </button>
                                    <button 
                                        class="attendance-button"
                                        :class="{ active: attendance[resv.volunteer_id] === 'absent' }"
                                        @click="confirmIndividual(resv.volunteer_id, 'absent')">
                                        Absent
                                    </button>
                                </div>
                            </td>
                            <td>
                                <textarea 
                                    v-model="remarks[resv.volunteer_id]"
                                    class="remarks-input"
                                    placeholder="Enter remarks here..."
                                ></textarea>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="3" class="no-tasks">No approved volunteers found</td>
                        </tr>
                    </tbody>
                </table>
            </div>
    
            <div class="footer-section">
                <button @click="finalizeAttendance" class="finalize-button">
                    Finalise ({{ taskResv.length }} records)
                </button>
            </div>
        </div>
    </div>
</template>
    
<style scoped>
#task-management-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    margin-bottom: 0.2rem;
}

.admin-container {
    min-height: 100vh;
    background-color: #ffffff;
}

.main-content {
    padding: 0 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.page-title {
    font-size: 2rem;
    font-weight: bold;
    color: #000;
    display: flex;
    justify-content: flex-start;
    padding: 1rem;
}

.task-description {
    font-size: 1.2rem;
    color: #333;
    margin-top: 0.1rem;
}

.content-container {
    margin-top: 0.5rem;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-bottom: 1rem;
}

.action-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.action-button.present {
    background-color: #b3d9df;
    color: #000;
}

.action-button.absent {
    background-color: #f1b3b3;
    color: #000;
}

.task-table-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.task-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

.task-table th,
.task-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.task-table th {
    background-color: #f8f9fa;
    font-weight: bold;
    font-size: 1rem;
    width: 33.33%;
}

.attendance-cell {
    width: auto;
}

.attendance-buttons {
    display: flex;
    gap: 0.5rem;
}

.attendance-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    background-color: #f5f5f5;
    transition: all 0.2s;
}

.attendance-button.active {
    background-color: #97bdc4;
    color: white;
}

.remarks-input {
    width: 100%;
    height: 80px;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    line-height: 1.4;
    resize: none;
}

.remarks-input:focus {
    border-color: #97bdc4;
    outline: none;
    box-shadow: 0 0 0 2px rgba(151, 189, 196, 0.2);
}

.remarks-input::placeholder {
    color: #999;
}

.footer-section {
    display: flex;
    justify-content: flex-end;
}

.finalize-button {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 500;
    background-color: #fdd835;
    color: #000;
    cursor: pointer;
    transition: background-color 0.2s;
}

.finalize-button:hover {
    background-color: #fbc02d;
}

.no-tasks {
    text-align: center;
    color: #666;
    padding: 2rem;
}

@media (max-width: 768px) {
    .main-content {
        padding: 1rem;
    }

    .action-buttons {
        flex-direction: column;
    }

    .action-button {
        width: 100%;
    }

    .task-table-container {
        padding: 1rem;
    }

    .task-table th,
    .task-table td {
        padding: 0.75rem;
    }

    .attendance-buttons {
        flex-direction: column;
    }

    .attendance-button {
        width: 100%;
    }

    .finalize-button {
        width: 100%;
    }
}
</style>
