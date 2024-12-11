<script setup>
import TaskDetails from '@/components/TaskDetails.vue';
import SessionCards from '@/components/SessionCards.vue';
import AdministratorTaskbar from '@/components/AdminTaskbar.vue';
import { db } from "../firebase_setup.js";
import { getDoc, doc } from "firebase/firestore";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const taskID = route.params.taskID;

const taskName = ref('');
const startDateTime = ref('');
const endDateTime = ref('');
const location = ref('');
const description = ref('');
const location_lat = ref(null);
const location_lng = ref(null);
const requirements = ref([]);
const sessions = ref([]);

async function fetchTaskDetails() {
    try {
        const taskRef = doc(db, "task", taskID);
        const taskSnap = await getDoc(taskRef);

        if (taskSnap.exists()) {
            const taskData = taskSnap.data();
            taskName.value = taskData.task_name;
            startDateTime.value = taskData.start_date_time.toDate().toLocaleString();
            endDateTime.value = taskData.end_date_time.toDate().toLocaleString();
            location.value = taskData.location;
            location_lat.value = taskData.location_lat;
            location_lng.value = taskData.location_lng;
            description.value = taskData.description;
            requirements.value = taskData.requirements || [];
            sessions.value = taskData.sessions || [];
        }
    } catch (e) {
        alert(`Error fetching task details: ${e.message}`);
    }
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}
  
const sortedSessions = computed(() => {
    return [...sessions.value].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
        }

        return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
    });
});

onMounted(() => {
    fetchTaskDetails();
});
</script>

<template>
<AdministratorTaskbar />
<TaskDetails 
    :taskName="taskName"
    :startDateTime="startDateTime"
    :endDateTime="endDateTime"
    :location="location"
    :description="description"
    :location_lat="location_lat"
    :location_lng="location_lng"
    :requirements="requirements"
    :sessions="sessions"
>
<template #task-detail-button>
    <button class="task-detail-button" @click="router.push({ path: '/EditTask/' + taskID })">
        Edit Details
    </button>
</template>
<template #session-cards>
    <SessionCards 
        v-for="(session, index) in sortedSessions" 
        :key="index" 
        :session="session" 
    />
</template>
</TaskDetails>
</template>

<style>
</style>