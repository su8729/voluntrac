<script setup>
import AdministratorTaskbar from '@/components/AdminTaskbar.vue';
import { useRoute } from "vue-router";
import { db } from "../firebase_setup.js";
import { query, where, getDocs, collection, doc, getDoc, addDoc, Timestamp } from "firebase/firestore";
import { ref, onMounted } from "vue";

const route = useRoute();
const taskID = route.params.taskID;
const taskResv = ref([]);

async function fetchTaskReservationDetails() {
    try {
        const resvCol = collection(db, "task_reservations");
        const resvQuery = query(resvCol, where("task_id", "==", taskID));
        const taskSnap = await getDocs(resvQuery);

        if (!taskSnap.empty) {
            const reservations = [];
            for (const docSnap of taskSnap.docs) {
                const resvData = docSnap.data();
                const volunteerRef = doc(db, "users", resvData.volunteer_id);
                const volunteerSnap = await getDoc(volunteerRef);

                let assignmentStatus = null;

                // check if the volunteer has already been accepted or rejected
                const assignmentQuery = query(
                    collection(db, "task_assignment"),
                    where("task_id", "==", taskID),
                    where("volunteer_id", "==", resvData.volunteer_id)
                );
                const assignmentSnap = await getDocs(assignmentQuery);
                if (!assignmentSnap.empty) {
                    const assignmentData = assignmentSnap.docs[0].data();
                    assignmentStatus = assignmentData.status;
                }

                if (volunteerSnap.exists()) {
                    const volunteerData = volunteerSnap.data();
                    reservations.push({
                        ...resvData,
                        username: volunteerData.username,
                        status: assignmentStatus || "pending"
                    });
                } else {
                    reservations.push({
                        ...resvData,
                        username: "Unknown Volunteer",
                        status: assignmentStatus || "pending"
                    });
                }
            }

            taskResv.value = reservations;
        } 
    } catch (e) {
        alert(`Error fetching task reservation details: ${e.message}`);
    }
}

async function updateTaskAssignment(volunteer_id, status) {
    try {
        const assignmentData = {
            task_id: taskID,
            volunteer_id,
            status,
            date: Timestamp.now(),
        };

        await addDoc(collection(db, "task_assignment"), assignmentData);
        alert(`Volunteer has been ${status}`);
        fetchTaskReservationDetails();
    } catch (e) {
        alert(`Error updating task assignment: ${e.message}`);
    }
}

function acceptVolunteer(volunteer_id) {
    updateTaskAssignment(volunteer_id, "accepted");
}

function rejectVolunteer(volunteer_id) {
    updateTaskAssignment(volunteer_id, "rejected");
}

onMounted(() => {
    fetchTaskReservationDetails();
});
</script>

<template>
<AdministratorTaskbar />
    
<div class="task-table-container">
    <h2>Task Reservations</h2>
    <table class="task-table">
        <thead>
            <tr>
                <th>Volunteer Name</th>
                <th>Date</th>
                <th>Actions/ Status</th>
            </tr>
        </thead>
        <tbody v-if="taskResv.length > 0">
            <tr v-for="(resv, index) in taskResv" :key="index">
                <td>{{ resv.username }}</td>
                <td>{{ resv.reservation_date ? resv.reservation_date.toDate().toLocaleString() : 'No Date' }}</td>
                <td id="approve-reject-buttons">
                    <template v-if="resv.status === 'pending'">
                        <button class="action-button edit" @click="acceptVolunteer(resv.volunteer_id)">Approve</button> 
                        <button class="action-button view" @click="rejectVolunteer(resv.volunteer_id)">Reject</button>
                    </template>
                    <template v-else>
                        <span v-if="resv.status === 'accepted'" class="status accepted">Accepted</span>
                        <span v-if="resv.status === 'rejected'" class="status rejected">Rejected</span>
                    </template>
                </td>
            </tr>
        </tbody>
        <tbody v-else>
            <tr>
                <td colspan="3" class="text-center">No Requests Yet</td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<style>
#approve-reject-buttons {
    display: flex;
    justify-content: space-around;
    flex: 1 0 10px;
}
.status {
    font-weight: bold;
}
</style>