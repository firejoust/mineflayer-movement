import { Vec3 } from "vec3"
import { Bot } from "mineflayer"

declare interface Rotations {
    angles: number[],
    costs: number[]
}

declare interface Rotation {
    yaw: number,
    cost: number
}

declare class Movement {
    setHeuristics(...heuristics: Heuristic[]): void
    getRotations(position: Vec3, rotations: number): Rotations
    getRotation(position: Vec3, rotations: number, average: boolean): Rotation
    getYaw(position: Vec3, rotations: number, average: boolean): number
    steer(position: Vec3, rotations: number, average: boolean): Promise<void>
    move(yaw: number, headless: boolean): Promise<void>
}

declare class DangerHeuristic {
    constructor(weight: number, radius: number, depth: number, spread: number)
}

declare class DistanceHeuristic {
    constructor(weight: number, radius: number, count: number)
}

declare class ProximityHeuristic {
    constructor(weight: number)
}

declare class ConformityHeuristic {
    constructor(weight: number)
}

declare type Heuristic = DangerHeuristic | DistanceHeuristic | ProximityHeuristic | ConformityHeuristic

declare interface Heuristics {
    DangerHeuristic: (weight: number, radius: number, depth: number, spread: number) => DangerHeuristic
    DistanceHeuristic: (weight: number, radius: number, count: number) => DistanceHeuristic
    ProximityHeuristic: (weight: number) => ProximityHeuristic
    ConformityHeuristic: (weight: number) => ConformityHeuristic
}

declare interface exports {
    heuristics: Heuristics,
    getPlugin: (...heuristics: Heuristic[]) => (bot: Bot) => void
}

declare module "mineflayer" {
    interface Bot {
        movement: Movement
    }
}

declare const exports: exports
export = exports