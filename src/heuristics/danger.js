module.exports.inject = function inject(bot, Set) {
    return class Danger {
        #weight    = 0.6
        #radius    = 3
        #step      = 1
        #depth     = 2
        #increment = 0.2

        weight    = Set(this, weight => this.#weight = weight)
        radius    = Set(this, radius => this.#radius = radius)
        //step   = Set(this, step => this.#step = step) // will be supported later
        depth     = Set(this, depth => this.#depth = depth)
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

                // how many iterations will be executed
                const length = this.#radius / this.#increment

                // floor the player's y position to prevent partial block checking
                const position = new Vec3(
                    bot.entity.position.x,
                    Math.floor(bot.entity.position.y),
                    bot.entity.position.z
                )

                for (let j = 0; j < length; j++) {
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
                        return this.#weight * (1 - Math.sqrt(offset[0] ** 2, offset[1] ** 2) / this.#radius)
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
                            return this.#weight * (1 - Math.sqrt(offset[0] ** 2, offset[1] ** 2) / this.#radius)
                        } else {
                            y += this.#step
                        }
                    } else

                    // descend if the floor is empty
                    // wip
                    if (bot.blockAt(pos.offset(0, -1, 0)).boundingBox === 'empty') {
                        for (let i = 1; i < this.#depth; i++) {
                            const block = bot.blockAt(pos.offset(0, -i, 0))

                            if (block.boundingBox === 'solid') {
                                y -= i
                                break
                            }
                        }

                        // too deep
                        return this.#weight * (1 - Math.sqrt(offset[0] ** 2, offset[1] ** 2) / this.#radius)
                    }
                }
            }

            // no intercepts
            return 0
        }
    }
}