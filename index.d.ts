import { Bot } from "mineflayer"
import { Heuristics, Goal } from "./src/heuristics/"

declare interface Goals {
    Default: Goal
}

declare interface Movement {
    heuristic: Heuristics
    goals: Goals
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