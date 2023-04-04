import { Bot } from "mineflayer"
import { Heuristics } from "./src/heuristics/"

export interface Movement {
    heuristic: Heuristics
    setControls: (yaw: number, angleRadius?: number) => void
    getYaw: (fov?: number, rotations?: number, blend?: number) => number
    steer: (yaw: number, force?: boolean) => Promise<void>
}

declare module 'mineflayer' {
    interface Bot {
        movement: Movement
    }
}

export function plugin(bot: Bot): void