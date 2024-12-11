<script setup>
import { ref, onMounted } from 'vue';
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase_setup.js";

const props = defineProps({
    sessions: {
        type: Array,
        required: true
    },
    taskId: {
        type: String,
        required: true
    },
    volunteerId: {
        type: String,
        required: true
    }
});

const selectedSessions = ref([]);
const confirmedSessions = ref([]);
const isSubmitting = ref(false);
const error = ref('');
const success = ref('');
const hasExistingAssignments = ref(false);

const fetchExistingAssignments = async () => {
    try {
        const sessionAssignmentsRef = collection(db, "session_assignments");
        const q = query(
            sessionAssignmentsRef, 
            where("task_id", "==", props.taskId),
            where("volunteer_id", "==", props.volunteerId)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const assignmentDoc = querySnapshot.docs[0];
            confirmedSessions.value = assignmentDoc.data().sessions;
            hasExistingAssignments.value = true;
        }
    } catch (err) {
        console.error("Error fetching assignments:", err);
    }
};

const toggleSession = (sessionIndex) => {
    if (hasExistingAssignments.value) return;
    
    const index = selectedSessions.value.indexOf(sessionIndex);
    if (index === -1) {
        selectedSessions.value.push(sessionIndex);
    } else {
        selectedSessions.value.splice(index, 1);
    }
};

const handleConfirm = async () => {
    if (selectedSessions.value.length === 0) {
        error.value = 'Please select at least one session';
        return;
    }

    isSubmitting.value = true;
    error.value = '';
    success.value = '';

    try {
        const sessionAssignmentsRef = collection(db, "session_assignments");
        await addDoc(sessionAssignmentsRef, {
            task_id: props.taskId,
            volunteer_id: props.volunteerId,
            sessions: selectedSessions.value,
            created_at: Timestamp.now()
        });
        
        confirmedSessions.value = [...selectedSessions.value];
        hasExistingAssignments.value = true;
        success.value = 'Sessions confirmed successfully!';
        selectedSessions.value = [];
    } catch (err) {
        error.value = 'Failed to confirm sessions. Please try again.';
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    fetchExistingAssignments();
});
</script>

<template>
<div class="session-selection-card">
    <div class="card-header">
        <h2>{{ hasExistingAssignments ? 'Your Confirmed Sessions' : 'Select Available Sessions' }}</h2>
    </div>
    <div class="card-content">
        <div v-if="error" class="alert error">{{ error }}</div>
        <div v-if="success" class="alert success">{{ success }}</div>

        <div v-if="sessions.length > 0" class="session-detail-container">
            <div class="sessions-container">
                <div v-for="(session, index) in sessions" 
                        :key="index" 
                        class="session-card"
                        :class="{ 'confirmed': hasExistingAssignments && confirmedSessions.includes(index) }">
                    <input 
                        type="checkbox"
                        :checked="selectedSessions.includes(index) || (hasExistingAssignments && confirmedSessions.includes(index))"
                        @change="toggleSession(index)"
                        :disabled="hasExistingAssignments"
                    >
                    <div class="session-date">{{ session.date }}</div>
                    <div class="session-time">
                        <span>{{ session.start_time }}</span>
                        <span class="time-separator">to</span>
                        <span>{{ session.end_time }}</span>
                    </div>
                    <div v-if="hasExistingAssignments && confirmedSessions.includes(index)" 
                            class="confirmed-badge">
                        Confirmed
                    </div>
                </div>
            </div>
        </div>
        
        <button 
            v-if="!hasExistingAssignments"
            class="session-confirm"
            :disabled="isSubmitting || selectedSessions.length === 0"
            @click="handleConfirm"
        >
            {{ isSubmitting ? 'Confirming...' : 'Confirm Selected Sessions' }}
        </button>
    </div>
</div>
</template>

<style scoped>
.session-confirm {
    width: 100%;
    padding: 0.75rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 1rem;
}

.session-confirm:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
}

input[type="checkbox"]:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.confirmed-badge {
    padding: 5px 0;
}
</style>