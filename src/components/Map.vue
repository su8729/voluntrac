<script setup>
import { ref, onMounted } from 'vue';
import loader from '../google_setup';

const props = defineProps({
    location: {
        type: Object,
        required: true
    }
});

const mapElement = ref(null);

function initMap() {
    const { lat, lng } = props.location;

    const mapOptions = {
        center: { lat, lng },
        zoom: 15
    };

    const map = new google.maps.Map(mapElement.value, mapOptions);

    new google.maps.Marker({
        position: { lat, lng },
        map: map
    });
}

onMounted(() => {
    loader
        .load()
        .then(() => {
            initMap();
        })
        .catch((e) => {
            console.log('Error loading Google Maps:', e);
        });
});
</script>

<template>
<div>
    <div ref="mapElement" style="height: 400px; width: 100%;"></div>
</div>
</template>

<style scoped>
</style>