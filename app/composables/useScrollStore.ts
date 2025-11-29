import { useStorage } from '@vueuse/core'
import { isClient } from '@vueuse/core'

export function useScrollStore() {
    const scrollPositions = isClient
        ? useStorage<Record<string, number>>('scroll-positions', {}, sessionStorage)
        : { value: {} as Record<string, number> } // <-- type assertion

    const save = (routeKey: string) => {
        if (!isClient) return
        scrollPositions.value[routeKey] = window.scrollY
    }

    const restore = (routeKey: string) => {
        if (!isClient) return
        const pos = scrollPositions.value[routeKey] ?? 0
        window.scrollTo({ top: pos, behavior: 'instant' })
    }

    return { save, restore }
}
