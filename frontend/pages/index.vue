<template>
    <main class="flex flex-col mx-10 items-center mt-12">
        <button class="btn" @click="createRandomRoom()"> CRIAR SALA</button>
        <list-rooms class="mt-8"></list-rooms>
    </main>
</template>

<script lang="ts" setup>

const roomStore = useRoomStore()

const createRandomRoom = async () => {
    const response = await useFetch("http://localhost:8000/create")
    const { room_id } = JSON.parse(response.data.value)
    roomStore.addRoom(room_id)
}
</script>
