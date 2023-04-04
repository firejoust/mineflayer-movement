import { Vec3 } from "vec3";

class Heuristic {
    cost: (yaw: number) => number;
}

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

type HeuristicsMap = {
    distance: Distance,
    danger: Danger,
    proximity: Proximity,
    conformity: Conformity
}

export type Heuristics = {
    register: <Type extends HeuristicType>(type: Type, label?: string) => HeuristicsMap[Type],
    get: <Label extends HeuristicType>(label: string | Label) => HeuristicsMap[Label]
}