const redis = require("../config/redis")

const DEFAULT_TTL = 60 * 5

exports.getCache = async (key) => {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
}

exports.setCache = async (key, value, ttl = DEFAULT_TTL) => {
    await redis.set(key, JSON.stringify(value), "EX", ttl)
}

exports.invalidateCache = async (...keys) => {
    if (keys.length > 0) await redis.del(...keys)
}

exports.invalidatePattern = async (pattern) => {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await redis.del(...keys)
}