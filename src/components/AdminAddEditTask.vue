<script setup>
import { db } from "../firebase_setup.js";
import { addDoc, collection, Timestamp, getDoc, doc, setDoc } from "firebase/firestore";
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import loader from '../google_setup.js';

const router = useRouter();
const route = useRoute();
const taskID = route.params.taskID;

const taskName = ref('');
const startDateTime = ref('');
const endDateTime = ref('');
const location = ref('');
const location_lat = ref(null);
const location_lng = ref(null);
const requirements = ref('');
const description = ref('');
const sessions = ref([]);

async function processData() {
    const fDateCheck = new Date(startDateTime.value);
    const tDateCheck = new Date(endDateTime.value);

    if (fDateCheck >= tDateCheck) {
        alert('Your start date and time must be before the end date and time!');
        return;
    }

    const invalidSessions = sessions.value.filter(session => !validateSessionTime(session));
    if (invalidSessions.length > 0) {
        alert('Some sessions have invalid times. Please ensure all sessions are within the main date range and end times are after start times.');
        return;
    }

    if (confirm(`You are about to add ${taskName.value}, are you sure?`)) {
        const dataUpload = {
            task_name: taskName.value,
            start_date_time: Timestamp.fromDate(fDateCheck),
            end_date_time: Timestamp.fromDate(tDateCheck),
            location: location.value,
            requirements: requirements.value.split(",").map(command => command.trim()),
            description: description.value,
            sessions: sessions.value.map(session => ({
                date: session.date,
                start_time: session.startTime,
                end_time: session.endTime
            }))
        };

        if (location_lat.value !== null && location_lng.value !== null) {
            dataUpload.location_lat = location_lat.value;
            dataUpload.location_lng = location_lng.value;
        }

        if (taskID) {
            setDoc(doc(db, "task", taskID), dataUpload, { merge: true }) 
                .then(() => {
                    router.replace('/Admin/Dashboard');
                    resetForm();
                })
                .catch((error) => {
                    alert(error.message);
                });
        } else {
            addDoc(collection(db, "task"), dataUpload)
                .then(() => {
                    router.replace('/Admin/Dashboard');
                    resetForm();
                })
                .catch((error) => {
                    alert(error.message);
                });
        }
    }
}

async function populateData() {
    if (taskID != null) {
        try {
            const document = await getDoc(doc(db, "task", taskID));
        if (document.exists()) {
            const data = document.data();
            taskName.value = data.task_name;
            startDateTime.value = data.start_date_time.toDate().toISOString().slice(0, 16);
            endDateTime.value = data.end_date_time.toDate().toISOString().slice(0, 16);
            location.value = data.location;
            requirements.value = data.requirements.join(', ');
            description.value = data.description;
            sessions.value = data.sessions;
        }
        } catch (error) {
            console.log(error.message);
        }
    }
}

function resetForm() {
    taskName.value = '';
    startDateTime.value = '';
    endDateTime.value = '';
    location.value = '';
    location_lat.value = null;
    location_lng.value = null;
    requirements.value = '';
    description.value = '';
    sessions.value = [];
}

let autocomplete;
function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        { componentRestrictions: { country: ['SG'] } }
    );
    autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged() {
    const place = autocomplete.getPlace();
    if (place.geometry) {
        location.value = place.formatted_address || place.name;
        location_lat.value = place.geometry.location.lat();
        location_lng.value = place.geometry.location.lng();
    } else {
        alert("No details available for the selected location.");
    }
}

const dateRange = computed(() => {
    if (!startDateTime.value || !endDateTime.value) return [];
    
    const dates = [];
    const currentDate = new Date(startDateTime.value.split('T')[0]);
    const endDate = new Date(endDateTime.value.split('T')[0]);
    
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
});

function addSession() {
    sessions.value.push({
        date: '',
        startTime: '',
        endTime: ''
    });
}

function removeSession(index) {
    sessions.value.splice(index, 1);
}

// check if session is within the main start and end datetime
function validateSessionTime(session) {
    if (!session.startTime || !session.endTime) return true;
    
    const startTime = new Date(`${session.date}T${session.startTime}`);
    const endTime = new Date(`${session.date}T${session.endTime}`);
    
    const mainStart = new Date(startDateTime.value);
    const mainEnd = new Date(endDateTime.value);
    
    if (startTime < mainStart || endTime > mainEnd) {
        return false;
    }
    
    return startTime < endTime;
}

onMounted(() => {
    loader.load().then(() => {
        initAutocomplete();
        populateData();
    }).catch((e) => {
        console.log('Error loading Google Maps:', e);
    });
});
</script>

<template>
<div class="form-container">
    <form>
        <div class="form-grid">
            <label for="taskName">Task Name</label>
            <input v-model="taskName" id="taskName" required>
        </div>

        <div class="form-item">
            <label for="description">Task Description</label>
            <textarea v-model="description" id="description" required></textarea>
        </div>

        <div class="form-item">
            <label for="startDateTime">Start Date & Time</label>
            <input v-model="startDateTime" type="datetime-local" id="startDateTime" required>
        </div>

        <div class="form-item">
            <label for="endDateTime">End Date & Time</label>
            <input v-model="endDateTime" type="datetime-local" id="endDateTime" required>
        </div>

        <div class="form-item">
            <label for="location">Location</label>
            <input v-model="location" id="autocomplete" type="text" placeholder="Enter location" required>
        </div>

        <div class="form-item">
            <label for="requirements">Requirements</label>
            <input v-model="requirements" id="requirements" placeholder="Separate by commas">
        </div>

        <div class="sessions-section">
            <div class="sessions-header">
                <h3>Session Timings</h3>
                <button type="button" @click="addSession" class="add-session-btn">Add Session</button>
            </div>

            <div v-for="(session, index) in sessions" :key="index" class="session-item">
            <div class="session-grid">
                <div class="session-date">
                    <label :for="'session-date-' + index">Date</label>
                    <input type="date" v-model="session.date" :id="'session-date-' + index" required>
                </div>

                <div class="session-time">
                    <label :for="'session-start-' + index">Start Time</label>
                    <input type="time" v-model="session.startTime" :id="'session-start-' + index" required>
                </div>

                <div class="session-time">
                    <label :for="'session-end-' + index">End Time</label>
                    <input type="time" v-model="session.endTime" :id="'session-end-' + index" required>
                </div>

                <button type="button" @click="removeSession(index)" class="remove-session-btn">Remove</button>
            </div>
            </div>
        </div>
        
        <div class="submit-button">
            <input type="submit" @click.prevent="processData" value="Save task!">
        </div>
    </form>
</div>
</template>

<style>
.form-container {
    max-width: 700px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.form-grid {
    display: grid;
    font-size: 16px;
    font-weight: bold;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
}

.form-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 30px; 
}

.form-item label {
    font-weight: bold; 
    margin-bottom: 8px;
}

.form-item input,
.form-item textarea {
        padding: 10px; 
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;
}

.submit-button {
    margin-top: 20px;
    text-align: right;
}

.submit-button input {
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold; 
    color: black;
    background-color: #fadfa1;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.submit-button input:hover {
    background-color: #f1d186;
}

.sessions-section {
    margin-top: 20px;
    border-top: 2px solid #eee;
    padding-top: 20px;
}

.sessions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.add-session-btn {
    padding: 8px 16px;
    background-color: #8dce90;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.add-session-btn:hover {
    background-color: #66b96a;
}

.session-item {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 4px;
}

.session-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto;
    gap: 15px;
    align-items: end;
}

.session-date,
.session-time {
    display: flex;
    flex-direction: column;
}

.session-date label,
.session-time label {
    font-size: 14px;
    margin-bottom: 5px;
}

.session-date select,
.session-time input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.remove-session-btn {
    padding: 8px 16px;
    background-color: #df8484;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    height: fit-content;
}

.remove-session-btn:hover {
    background-color: #ff4444;
}
</style>