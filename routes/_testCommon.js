import { db } from '../db.js'
import { User } from '../models/User.js'
import { Company } from '../models/Company.js'
import { Job } from '../models/Job.js'
import { createToken } from '../helpers/tokens.js'
const jobIds = []

const commonBeforeAll = async () => {
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM users')
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM companies')

  await Company.create(
    {
      handle: 'c1',
      name: 'C1',
      numEmployees: 1,
      description: 'Desc1',
      logoUrl: 'http://c1.img'
    })
  await Company.create(
    {
      handle: 'c2',
      name: 'C2',
      numEmployees: 2,
      description: 'Desc2',
      logoUrl: 'http://c2.img'
    })
  await Company.create(
    {
      handle: 'c3',
      name: 'C3',
      numEmployees: 3,
      description: 'Desc3',
      logoUrl: 'http://c3.img'
    })

  await User.register({
    username: 'u1',
    firstName: 'U1F',
    lastName: 'U1L',
    email: 'user1@user.com',
    password: 'password1',
    isAdmin: false
  })
  await User.register({
    username: 'u2',
    firstName: 'U2F',
    lastName: 'U2L',
    email: 'user2@user.com',
    password: 'password2',
    isAdmin: false
  })
  await User.register({
    username: 'u3',
    firstName: 'U3F',
    lastName: 'U3L',
    email: 'user3@user.com',
    password: 'password3',
    isAdmin: false
  })

  jobIds[0] = (await Job.create(
    { title: 'J1', salary: 100, equity: '0.1', companyHandle: 'c1' })).id
  jobIds[1] = (await Job.create(
    { title: 'J2', salary: 200, equity: '0.2', companyHandle: 'c1' })).id
  jobIds[2] = (await Job.create(
    { title: 'J3', salary: 300, equity: null, companyHandle: 'c1' })).id

  await User.application('u1', jobIds[0])
}

const commonBeforeEach = async () => {
  await db.query('BEGIN')
}

const commonAfterEach = async () => {
  await db.query('ROLLBACK')
}

const commonAfterAll = async () => {
  await db.end()
}

const u1Token = createToken({ username: 'u1', isAdmin: false })
const u2Token = createToken({ username: 'u2', isAdmin: false })
const adminToken = createToken({ username: 'admin', isAdmin: true })

export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
  jobIds
}
