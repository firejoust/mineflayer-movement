import { Vec3 } from "vec3"

declare class Heuristic {
    configure: (object: object) => this
    cost: (yaw: number) => number
}

type AvoidBlocks = {
    [name: String]: boolean
}

declare class Distance extends Heuristic {
    weight: (weight: number) => this
    radius: (radius: number) => this
    spread: (spread: number) => this
    offset: (offset: number) => this
    count: (count: number) => this
    avoid: (avoid: AvoidBlocks) => this
    increment: (increment: number) => this
}

declare class Danger extends Heuristic {
    weight: (weight: number) => this
    radius: (radius: number) => this
    count: (count: number) => this
    height: (height: number) => this
    descent: (descent: boolean) => this
    depth: (depth: number) => this
    avoid: (avoid: AvoidBlocks) => this
    increment: (increment: number) => this
}

declare class Proximity extends Heuristic {
    weight: (weight: number) => this
    target: (target: Vec3) => this
    avoid: (avoid: boolean) => this
}

declare class Conformity extends Heuristic {
    weight: (weight: number) => this
    avoid: (avoid: boolean) => this
}

type HeuristicType = 'distance' | 'danger' | 'proximity' | 'conformity'

type HeuristicsMap = {
    distance: Distance,
    danger: Danger,
    proximity: Proximity,
    conformity: Conformity
}

type Goal = {
    [label: string]: Distance | Danger | Proximity | Conformity
}

export type Heuristics = {
    setGoal: (goal: Goal) => void
    new: <Type extends HeuristicType>(type: Type) => HeuristicsMap[Type]
    register: <Type extends HeuristicType>(type: Type, label?: string) => HeuristicsMap[Type],
    get: <Label extends HeuristicType>(label: string | Label) => HeuristicsMap[Label]
}