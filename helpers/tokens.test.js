import jwt from 'jsonwebtoken'
import { createToken } from './tokens.js'
import { SECRET_KEY } from '../config.js'

describe('createToken', () => {
  test('works: not admin', () => {
    const token = createToken({ username: 'test', isAdmin: false })
    const payload = jwt.verify(token, SECRET_KEY)
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: 'test',
      isAdmin: false
    })
  })

  test('works: admin', () => {
    const token = createToken({ username: 'test', isAdmin: true })
    const payload = jwt.verify(token, SECRET_KEY)
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: 'test',
      isAdmin: true
    })
  })

  test('works: default no admin', () => {
    // given the security risk if this didn't work, checking this specifically
    const token = createToken({ username: 'test' })
    const payload = jwt.verify(token, SECRET_KEY)
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: 'test',
      isAdmin: false
    })
  })
})
