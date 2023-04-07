const Vec3 = require("vec3")

const HALF_PI = Math.PI / 2

module.exports.inject = function inject(bot, Set) {
    return class Distance {
        #weight = 0.55
        #radius = 10
        #count  = 2
        #height = 8
        #step   = 1
        #increment = 0.2

        weight = Set(this, weight => this.#weight = weight)
        radius = Set(this, radius => this.#radius = radius)
        count  = Set(this, count => this.#count = count)
        height = Set(this, height => this.#height = height)
        //step   = Set(this, step => this.#step = step) // will be supported later
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

            const xOffset = new Float64Array(this.#count)
            const zOffset = new Float64Array(this.#count)

            // initialise player bounding box raycast width offset
            {
                if (this.#count > 1) {
                    const length = this.#count - 1
                    // 90 degrees from raycast drection
                    const x0 = -Math.sin(yaw + HALF_PI)
                    const z0 = -Math.cos(yaw + HALF_PI)
                    // starting position
                    const x1 = -(x0 * 0.3)
                    const z1 = -(z0 * 0.3)
                    // ending position (offset)
                    const x2 = x0 * 0.6
                    const z2 = z0 * 0.6
                    
                    for (let i = 0; i < this.#count; i++) {
                        xOffset[i] = x1 + x2 * i / length
                        zOffset[i] = z1 + z2 * i / length
                    }
                }
            }

            const hxOffset = new Float64Array(this.#count)
            const hzOffset = new Float64Array(this.#count)

            // initialise player ceiling check bounding box length offset
            {
                if (this.#count > 1) {
                    const length = this.#count - 1
                    // starting position
                    const x1 = -(x * 0.3)
                    const z1 = -(z * 0.3)
                    // ending position (offset)
                    const x2 = x * 0.6
                    const z2 = z * 0.6
                    
                    for (let i = 0; i < this.#count; i++) {
                        hxOffset[i] = x1 + x2 * i / length
                        hzOffset[i] = z1 + z2 * i / length
                    }
                }
            }

            // find where the raycast intercepts with blocks
            {
                let y = 0

                const length = this.#radius / this.#increment

                const position = new Vec3(
                    bot.entity.position.x,
                    Math.floor(bot.entity.position.y),
                    bot.entity.position.z
                )

                let ceilingCheck = false

                for (let i = 0; i < length; i++) {
                    const yOffset = new Float64Array(this.#count).fill(y)
                    const ceilCheck = ceilingCheck
                    let yChanged = false // flag for performance reasons

                    // reset ceiling check for the current iteration
                    ceilingCheck = false

                    // initialise next raycast iterator position
                    const offset = new Float64Array(2)
                    offset[0] = x * this.#increment * i
                    offset[1] = z * this.#increment * i

                    // set boundingbox offset from middle of player
                    offset[0] += box[0]
                    offset[1] += box[1]

                    for (let j = 0; j < this.#count; j++) {
                        const pos = position.offset(offset[0], y, offset[1])

                        // set boundingbox width offset
                        pos.x += xOffset[j]
                        pos.z += zOffset[j]

                        if (ceilCheck) {
                            for (let k = 0; k < this.#count; k++) {
                                const height = new Float64Array(2)
                                height[0] = x * this.#increment * (i - 2)
                                height[1] = z * this.#increment * (i - 2)

                                // set boundingbox length offset
                                height[0] += hxOffset[k]
                                height[1] += hzOffset[k]

                                // position of the block above player's head
                                const lastPos = position.offset(
                                    height[0],
                                    (y - 1) + this.#step + 1, // y in last iteration
                                    height[1]
                                )

                                // set boundingbox width offset
                                lastPos.x += xOffset[j]
                                lastPos.z += zOffset[j]
        
                                // set boundingbox border offset
                                lastPos.x += box[0]
                                lastPos.z += box[1]

                                // check block above the player's head, otherwise climb the block
                                if (bot.blockAt(lastPos)?.boundingBox === 'block') {
                                    return this.#weight * (1 - Math.sqrt(height[0] ** 2 + height[1] ** 2) / this.#radius)
                                } else {
                                    ceilingCheck ||= false // don't stop doing ceiling checks in current iteration
                                }
                            }
                        }

                        if (y > this.#height) {
                            return this.#weight * (1 - Math.sqrt(offset[0] ** 2 + offset[1] ** 2) / this.#radius)
                        } else

                        // check the raycast at step height for an intercept
                        if (bot.blockAt(pos.offset(0, this.#step, 0))?.boundingBox === 'block') {
                            return this.#weight * (1 - Math.sqrt(offset[0] ** 2 + offset[1] ** 2) / this.#radius)
                        } else

                        // check the raycast below it to determine if a block can be climbed
                        if (bot.blockAt(pos)?.boundingBox === 'block') {
                            ceilingCheck = true // check the last position's ceiling in the next iteration
                            yChanged = true
                            yOffset[j] += this.#step
                        }
                    }

                    // set new Y value to the highest offset
                    if (yChanged) {
                        let highest = -Infinity
                        yOffset.forEach(value => {
                            if (value > highest) {
                                highest = value
                            }
                        })
                        y = highest
                    }
                }
            }

            // no intercepts
            return 0
        }
    }
}