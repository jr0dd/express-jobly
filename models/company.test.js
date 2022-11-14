import { db } from '../db.js'
import { BadRequestError, NotFoundError } from '../ExpressError.js'
import { Company } from './Company.js'
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} from './_testCommon.js'

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/** ************************************ create */

describe('create', () => {
  const newCompany = {
    handle: 'new',
    name: 'New',
    description: 'New Description',
    numEmployees: 1,
    logoUrl: 'http://new.img'
  }

  test('works', async () => {
    const company = await Company.create(newCompany)
    expect(company).toEqual(newCompany)

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`)
    expect(result.rows).toEqual([
      {
        handle: 'new',
        name: 'New',
        description: 'New Description',
        num_employees: 1,
        logo_url: 'http://new.img'
      }
    ])
  })

  test('bad request with dupe', async () => {
    try {
      await Company.create(newCompany)
      await Company.create(newCompany)
      fail()
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy()
    }
  })
})

/** ************************************ findAll */

describe('findAll', () => {
  test('works: no filter', async () => {
    const companies = await Company.findAll()
    expect(companies).toEqual([
      {
        handle: 'c1',
        name: 'C1',
        description: 'Desc1',
        numEmployees: 1,
        logoUrl: 'http://c1.img'
      },
      {
        handle: 'c2',
        name: 'C2',
        description: 'Desc2',
        numEmployees: 2,
        logoUrl: 'http://c2.img'
      },
      {
        handle: 'c3',
        name: 'C3',
        description: 'Desc3',
        numEmployees: 3,
        logoUrl: 'http://c3.img'
      }
    ])
  })
})

/** ************************************ get */

describe('get', () => {
  test('works', async () => {
    const company = await Company.get('c1')
    expect(company).toEqual({
      handle: 'c1',
      name: 'C1',
      description: 'Desc1',
      numEmployees: 1,
      logoUrl: 'http://c1.img'
    })
  })

  test('not found if no such company', async () => {
    try {
      await Company.get('nope')
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  })
})

/** ************************************ update */

describe('update', () => {
  const updateData = {
    name: 'New',
    description: 'New Description',
    numEmployees: 10,
    logoUrl: 'http://new.img'
  }

  test('works', async () => {
    const company = await Company.update('c1', updateData)
    expect(company).toEqual({
      handle: 'c1',
      ...updateData
    })

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`)

    expect(result.rows).toEqual([{
      handle: 'c1',
      name: 'New',
      description: 'New Description',
      num_employees: 10,
      logo_url: 'http://new.img'
    }])
  })

  test('works: null fields', async () => {
    const updateDataSetNulls = {
      name: 'New',
      description: 'New Description',
      numEmployees: null,
      logoUrl: null
    }

    const company = await Company.update('c1', updateDataSetNulls)
    expect(company).toEqual({
      handle: 'c1',
      ...updateDataSetNulls
    })

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`)
    expect(result.rows).toEqual([{
      handle: 'c1',
      name: 'New',
      description: 'New Description',
      num_employees: null,
      logo_url: null
    }])
  })

  test('not found if no such company', async () => {
    try {
      await Company.update('nope', updateData)
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  })

  test('bad request with no data', async () => {
    try {
      await Company.update('c1', {})
      fail()
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy()
    }
  })
})

/** ************************************ remove */

describe('remove', () => {
  test('works', async () => {
    await Company.remove('c1')
    const res = await db.query(
      "SELECT handle FROM companies WHERE handle='c1'")
    expect(res.rows.length).toEqual(0)
  })

  test('not found if no such company', async () => {
    try {
      await Company.remove('nope')
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  })
})
