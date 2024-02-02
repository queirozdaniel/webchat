import { defineStore } from 'pinia'
import type { Room } from '~/types/room'

export const useRoomStore = defineStore('rooms', {
  state: () => {
    const activeRooms = ref<Room[]>([])
    return { activeRooms }
  },
  getters: { 
    getRooms: (state) => state.activeRooms
  },
  actions: {
    addRoom(id: string) {
        this.activeRooms = [
            ...this.activeRooms,
            { id }
        ]
    },
    removeRoom(room: Room) {
        this.activeRooms = [
            ...this.activeRooms.filter(item => item.id === room.id)
        ]
    }

  }
})