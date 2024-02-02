<template>
    <ul class="flex flex-row flex-wrap gap-6">
        <li v-for="room of roomStore.getRooms" :key="room.id">
            <NuxtLink :to="`room/${room.id}`" class="btn btn-success">Sala: {{ room.id }}</NuxtLink>
        </li>
    </ul>
</template>

<script lang="ts" setup>


const roomStore = useRoomStore()

</script>
