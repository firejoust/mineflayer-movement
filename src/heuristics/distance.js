const Vec3 = require("vec3")

module.exports.inject = function inject(bot, Set) {
    return class Distance {
        #weight    = 1

        #radius    = 5
        #spread    = 90
        #count     = 5
        #increment = 0.2

        radius    = Set(this, radius => this.#radius = radius)
        spread    = Set(this, spread => this.#spread = spread)
        count     = Set(this, count => this.#count = count)
        increment = Set(this, increment => this.#increment = increment)

        constructor(weight) {
            this.#weight = weight
        }

        cost(yaw) {
            let cost = 0
            const vectors = new Array(this.#count)

            {
                // angular components
                const total = this.#spread * Math.PI / 180
                const increment = total / this.#count
                const base  = increment / 2 - total / 2  // centered pitch

                // initialise relative vectors
                for (let i = 0; i < this.#count; i++) {
                    const theta = base + increment * i

                    // get the horizontal/vertical 2D components
                    const h = Math.cos(theta)
                    const v = Math.sin(theta)

                    // find the actual x and z
                    const x = -Math.sin(yaw) * h
                    const z = -Math.cos(yaw) * h

                    // directional component only vector
                    vectors[i] = [x, v, z]
                }
            }

            {
                const { x, y, z } = bot.entity.position.offset(0, bot.physics.playerHeight, 0)

                // find where the raycasts intercept with blocks
                for (let i = 0; i < this.#count; i++) {

                    const length = this.#radius / this.#increment

                    // initialise raycast iterator
                    for (let j = 0; j < length; j++) {
                        const pos = new Vec3(
                            vectors[i][0] * this.#increment * j,
                            vectors[i][1] * this.#increment * j,
                            vectors[i][2] * this.#increment * j
                        )

                        if (bot.blockAt(pos.offset(x, y, z))?.boundingBox === 'block') {
                            cost += 1 - Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2) / this.#radius
                            break
                        }
                    }
                }

                cost /= this.#count
            }

            return cost * this.#weight
        }
    }
}