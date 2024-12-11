<script setup>
import { defineProps } from 'vue';

const props = defineProps({
session: {
    type: Object,
    required: true
}
});
</script>

<template>
<div class="session-card">
    <div class="session-date">{{ session.date }}</div>
    <div class="session-time">
        <span>{{ session.start_time }}</span>
        <span class="time-separator">to</span>
        <span>{{ session.end_time }}</span>
    </div>
</div>
</template>

<style>
.session-card {
    margin-top: 10px;
    border-radius: 6px;
    padding: 15px;
    border: 1px solid #ccc;
    max-width: fit-content
    /* transition: transform 0.2s ease;
    cursor: pointer; */
}

/* .sessionCard:hover {
    transform: translateY(-2px);
} */

.session-date {
    font-weight: bold;
    margin-bottom: 8px;
}

.session-time {
    display: flex;
    align-items: center;
    color: #6c757d;
    gap: 8px;
    flex-direction: row;
}

.time-separator {
    color: #adb5bd;
}
</style>
