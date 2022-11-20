import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../ExpressError.js'
import { SECRET_KEY } from '../config.js'
import {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureSelfOrAdmin
} from './auth.js'

const testJwt = jwt.sign({ username: 'test', isAdmin: false }, SECRET_KEY)
const badJwt = jwt.sign({ username: 'test', isAdmin: false }, 'wrong')

describe('authenticateJWT', () => {
  test('works: via header', () => {
    expect.assertions(2)
    // there are multiple ways to pass an authorization token, this is how you pass it in the header.
    // this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const req = { headers: { authorization: `Bearer ${testJwt}` } }
    const res = { locals: {} }
    const next = (err) => {
      expect(err).toBeFalsy()
    }
    authenticateJWT(req, res, next)
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: 'test',
        isAdmin: false
      }
    })
  })

  test('works: no header', () => {
    expect.assertions(2)
    const req = {}
    const res = { locals: {} }
    const next = (err) => {
      expect(err).toBeFalsy()
    }
    authenticateJWT(req, res, next)
    expect(res.locals).toEqual({})
  })

  test('works: invalid token', () => {
    expect.assertions(2)
    const req = { headers: { authorization: `Bearer ${badJwt}` } }
    const res = { locals: {} }
    const next = (err) => {
      expect(err).toBeFalsy()
    }
    authenticateJWT(req, res, next)
    expect(res.locals).toEqual({})
  })
})

describe('ensureLoggedIn', () => {
  test('works', () => {
    expect.assertions(1)
    const req = {}
    const res = { locals: { user: { username: 'test', is_admin: false } } }
    const next = (err) => {
      expect(err).toBeFalsy()
    }
    ensureLoggedIn(req, res, next)
  })

  test('unauth if no login', () => {
    expect.assertions(1)
    const req = {}
    const res = { locals: {} }
    const next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy()
    }
    ensureLoggedIn(req, res, next)
  })
})

describe('ensureAdmin', () => {
  test('works', () => {
    expect.assertions(1)
    const req = {}
    const res = { locals: { user: { username: 'test', isAdmin: true } } }
    const next = (err) => {
      expect(err).toBeFalsy()
    }
    ensureAdmin(req, res, next)
  })

  test('unauth if not admin', () => {
    expect.assertions(1)
    const req = {}
    const res = { locals: { user: { username: 'test', isAdmin: false } } }
    const next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy()
    }
    ensureAdmin(req, res, next)
  })

  test('unauth if anon', () => {
    expect.assertions(1)
    const req = {}
    const res = { locals: {} }
    const next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy()
    }
    ensureAdmin(req, res, next)
  })
})

describe('ensureSelfOrAdmin', () => {
  test('works: as admin', () => {
    expect.assertions(1)
    const req = { params: { username: 'test' } }
    const res = { locals: { user: { username: 'admin', isAdmin: true } } }
    const next = (err) => {
      expect(err).toBeFalsy()
    }
    ensureSelfOrAdmin(req, res, next)
  })

  test('works: as self', () => {
    expect.assertions(1)
    const req = { params: { username: 'test' } }
    const res = { locals: { user: { username: 'test', isAdmin: false } } }
    const next = (err) => {
      expect(err).toBeFalsy()
    }
    ensureSelfOrAdmin(req, res, next)
  })

  test('unauth on mismatch', () => {
    expect.assertions(1)
    const req = { params: { username: 'wrong' } }
    const res = { locals: { user: { username: 'test', isAdmin: false } } }
    const next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy()
    }
    ensureSelfOrAdmin(req, res, next)
  })

  test('unauth if anon', () => {
    expect.assertions(1)
    const req = { params: { username: 'test' } }
    const res = { locals: {} }
    const next = (err) => {
      expect(err instanceof UnauthorizedError).toBeTruthy()
    }
    ensureSelfOrAdmin(req, res, next)
  })
})