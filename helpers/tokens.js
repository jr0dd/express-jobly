import jwt from 'jsonwebtoken'
import { SECRET_KEY } from '../config.js'

/** return signed JWT from user data. */

const createToken = (user) => {
  console.assert(user.isAdmin !== undefined,
    'createToken passed user without isAdmin property'
  )

  const payload = {
    username: user.username,
    isAdmin: user.isAdmin || false
  }

  return jwt.sign(payload, SECRET_KEY)
}

export { createToken }
