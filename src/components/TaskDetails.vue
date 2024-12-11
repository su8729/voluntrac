<script setup>
import { defineProps } from 'vue';
import Map from './Map.vue';

const props = defineProps({
    taskName: String,
    startDateTime: String,
    endDateTime: String,
    location: String,
    description: String,
    location_lat: Number,
    location_lng: Number,
    requirements: Array,
    sessions: Array 
});
</script>

<template>
<div>
    <div class="task-detail-header">
        <h1>{{ taskName }}</h1>
        <div>
        <slot name="task-detail-button"></slot>
        </div>
    </div>
    <div class="task-details">
        <p v-if="description">{{ description }}</p>
        
        <strong v-if="requirements.length && requirements[0] != ''">Requirements</strong>
        <p v-if="requirements.length && requirements[0] != ''">Requirements: {{ requirements.join(', ') }}</p>

        <strong>Task Details:</strong>
        <p>Start Date: {{ startDateTime }}</p>
        <p>End Date: {{ endDateTime }}</p>

        <div v-if="sessions.length > 0" class="session-detail-container">
        <strong>Session Schedule</strong>
        <div class="sessions-container">
            <slot name="session-cards"></slot>
        </div>
        </div>

        <p v-if="location">Location: {{ location }}</p>
        
        <Map v-if="location_lat && location_lng" :location="{ lat: location_lat, lng: location_lng }" />
    </div>
</div>
</template>

<style scoped>
.task-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.session-detail-container {
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.session-detail-container:last-child {
    border-bottom: none;
}

.sessions-container {
    display: grid;
    gap: 15px;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
</style>
