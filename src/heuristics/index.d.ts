import { Vec3 } from "vec3";

class Heuristic {
    cost: (yaw: number) => number;
}

type Set<T, G> = (instance: T, callback: (...args: G[]) => void) => (...args: G[]) => T;

class Distance extends Heuristic {
    weight: (weight: number) => this
    radius: (radius: number) => this;
    spread: (spread: number) => this;
    offset: (offset: number) => this;
    count: (count: number) => this;
    increment: (increment: number) => this;
}

class Danger extends Heuristic {
    weight: (weight: number) => this;
    radius: (radius: number) => this;
    count: (count: number) => this;
    depth: (depth: number) => this;
    increment: (increment: number) => this;
    descent: (descent: boolean) => this;
}

class Proximity extends Heuristic {
    weight: (weight: number) => this;
    target: (target: Vec3) => this;
    avoid: (avoid: boolean) => this;
}

class Conformity extends Heuristic {
    weight: (weight: number) => this;
    avoid: (avoid: boolean) => this;
}

type HeuristicType = 'distance' | 'danger' | 'proximity' | 'conformity';

export type Heuristics = {
    register: (type: HeuristicType, label?: string) => Distance | Danger | Proximity | Conformity,
    get: (label: string) => Distance | Danger | Proximity | Conformity
}