const Vec3 = require("vec3")

module.exports.inject = function inject(bot, Set) {
    return class Danger {
        #weight = 0.4
        #radius = 4
        #step   = 1
        #height = 4
        #depth  = 3
        #descent   = 3
        #increment = 0.2
        #avoid = [
            'lava',
            'water'
        ]

        weight    = Set(this, weight => this.#weight = weight)
        radius    = Set(this, radius => this.#radius = radius)
        //step   = Set(this, step => this.#step = step) // will be supported later
        height = Set(this, height => this.#height = height)
        depth     = Set(this, depth => this.#depth = depth)
        descent = Set(this, descent => this.#descent = descent)
        avoid     = Set(this, (...args) => this.#avoid = args)
        increment = Set(this, increment => this.#increment = increment)

        configure = Set(this, object => {
            for (let key in object) {
                try {
                    this[key](object[key])
                } catch (e) {
                    throw new Error(`Cannot configure invalid heuristic option ${key}`)
                }
            }
        })

        cost(yaw) {
            const x = -Math.sin(yaw)
            const z = -Math.cos(yaw)
            const box = new Float64Array(2)

            // initialise player bounding box offset
            {
                if (Math.abs(x) > Math.abs(z)) {
                    box[0] = Math.sign(x)
                    box[1] = z * Math.abs(1 / x)
                } else {
                    box[0] = x * Math.abs(1 / z)
                    box[1] = Math.sign(z)
                }

                box[0] *= 0.3
                box[1] *= 0.3
            }

            // find where the raycast intercepts with blocks
            {
                let y = 0

                const maxAscent = this.#height
                const maxDescent = -this.#descent

                // how many iterations will be executed
                const length = this.#radius / this.#increment

                // floor the player's y position to prevent partial block checking
                const position = new Vec3(
                    bot.entity.position.x,
                    Math.floor(bot.entity.position.y),
                    bot.entity.position.z
                )

                for (let j = 0; j < length; j++) {

                    // position outside of range; apply cost penalty
                    if (maxAscent < y && y < maxDescent) {
                        return this.#weight * (1 - Math.sqrt(offset[0] ** 2, offset[1] ** 2) / this.#radius)
                    }

                    const offset = new Float64Array(2)
                    offset[0] = x * this.#increment * j
                    offset[1] = z * this.#increment * j

                    // get absolute positional offset
                    const pos = position.offset(offset[0], y, offset[1])

                    // set boundingbox offset (half player width)
                    pos.x += box[0]
                    pos.z += box[1]

                    // check the raycast at step height for an intercept
                    if (bot.blockAt(pos.offset(0, this.#step, 0))?.boundingBox === 'block') {
                        return 0 // no penalty for block obstruction
                    } else

                    // check the raycast below it to determine if a block can be climbed
                    if (bot.blockAt(pos)?.boundingBox === 'block') {
                        const height = new Float64Array(2)
                        height[0] = x * this.#increment * (j - 1)
                        height[1] = z * this.#increment * (j - 1)

                        // position of the block above player's head
                        const lastPos = position.offset(
                            height[0],
                            y + this.#step + 1,
                            height[1]
                        )

                        lastPos.x += box[0]
                        lastPos.z += box[1]

                        // check block above the player's head, otherwise climb the block
                        if (bot.blockAt(lastPos)?.boundingBox === 'block') {
                            return 0 // no penalty for block obstruction
                        } else {
                            y += this.#step
                        }
                    } else

                    // verify if the player can descend on the current block
                    {
                        let landed = false

                        for (let i = 0; i <= this.#depth; i++) {
                            const block = bot.blockAt(pos.offset(0, -(i + 1), 0))

                            // air
                            if (block === null) {
                                y -= 1
                                continue
                            }

                            // verify the block we're standing on isn't dangerous
                            for (let type of this.#avoid) {
                                if (block.name === type) {
                                    return this.#weight * (1 - Math.sqrt(offset[0] ** 2, offset[1] ** 2) / this.#radius)
                                }
                            }

                            // if it's a solid block, we can ignore it and keep going
                            if (block.boundingBox === 'block') {
                                landed = true
                                break
                            // descend a single block
                            } else {
                                y -= 1
                            }
                        }

                        if (!landed) {
                            return this.#weight * (1 - Math.sqrt(offset[0] ** 2, offset[1] ** 2) / this.#radius)
                        }
                    }
                }
            }

            // no intercepts
            return 0
        }
    }
}