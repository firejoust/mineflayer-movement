import { Bot } from "mineflayer"
import { Heuristics, Goal } from "./src/heuristics/"

export interface Movement {
    heuristic: Heuristics
    Goal: (heuristics: object) => Goal
    setGoal: (goal: Goal) => void
    getYaw: (fov?: number, rotations?: number, blend?: number) => number
    steer: (yaw: number, force?: boolean) => Promise<void>
}

declare module 'mineflayer' {
    interface Bot {
        movement: Movement
    }
}

export function plugin(bot: Bot): void