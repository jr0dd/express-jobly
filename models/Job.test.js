import { db } from '../db.js'
import { Job } from './Job.js'
import {
  NotFoundError,
  BadRequestError
} from '../ExpressError.js'
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
} from './_testCommon.js'

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/** ************************************ create */

describe('create', () => {
  const newJob = {
    companyHandle: 'c1',
    title: 'Test',
    salary: 100,
    equity: '0.1'
  }

  test('works', async () => {
    const job = await Job.create(newJob)
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number)
    })
  })
})

/** ************************************ findAll */

describe('findAll', () => {
  test('works: no filter', async () => {
    const jobs = await Job.findAll()
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: 'Job1',
        salary: 100,
        equity: '0.1',
        companyHandle: 'c1',
        companyName: 'C1'
      },
      {
        id: jobIds[1],
        title: 'Job2',
        salary: 200,
        equity: '0.2',
        companyHandle: 'c1',
        companyName: 'C1'
      },
      {
        id: jobIds[2],
        title: 'Job3',
        salary: 300,
        equity: '0',
        companyHandle: 'c1',
        companyName: 'C1'
      },
      {
        id: jobIds[3],
        title: 'Job4',
        salary: null,
        equity: null,
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })

  test('works: filter by min salary', async () => {
    const jobs = await Job.findAll({ minSalary: 250 })
    expect(jobs).toEqual([
      {
        id: jobIds[2],
        title: 'Job3',
        salary: 300,
        equity: '0',
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })

  test('works: filter by equity', async () => {
    const jobs = await Job.findAll({ hasEquity: true })
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: 'Job1',
        salary: 100,
        equity: '0.1',
        companyHandle: 'c1',
        companyName: 'C1'
      },
      {
        id: jobIds[1],
        title: 'Job2',
        salary: 200,
        equity: '0.2',
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })

  test('works: filter by min salary & equity', async () => {
    const jobs = await Job.findAll({ minSalary: 150, hasEquity: true })
    expect(jobs).toEqual([
      {
        id: jobIds[1],
        title: 'Job2',
        salary: 200,
        equity: '0.2',
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })

  test('works: filter partial by name', async () => {
    const jobs = await Job.findAll({ title: 'ob1' })
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: 'Job1',
        salary: 100,
        equity: '0.1',
        companyHandle: 'c1',
        companyName: 'C1'
      }
    ])
  })
})

/** ************************************ get */

describe('get', () => {
  test('works', async () => {
    const job = await Job.get(jobIds[0])
    expect(job).toEqual({
      id: jobIds[0],
      title: 'Job1',
      salary: 100,
      equity: '0.1',
      company: {
        handle: 'c1',
        name: 'C1',
        description: 'Desc1',
        numEmployees: 1,
        logoUrl: 'http://c1.img'
      }
    })
  })

  test('not found if no such job', async () => {
    try {
      await Job.get(0)
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  })
})

/** ************************************ update */

describe('update', () => {
  const updateData = {
    title: 'New',
    salary: 500,
    equity: '0.5'
  }
  test('works', async () => {
    const job = await Job.update(jobIds[0], updateData)
    expect(job).toEqual({
      id: jobIds[0],
      companyHandle: 'c1',
      ...updateData
    })
  })

  test('not found if no such job', async () => {
    try {
      await Job.update(0, {
        title: 'test'
      })
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  })

  test('bad request with no data', async () => {
    try {
      await Job.update(jobIds[0], {})
      fail()
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy()
    }
  })
})

/** ************************************ remove */

describe('remove', () => {
  test('works', async () => {
    await Job.remove(jobIds[0])
    const res = await db.query(
      'SELECT id FROM jobs WHERE id=$1', [jobIds[0]])
    expect(res.rows.length).toEqual(0)
  })

  test('not found if no such job', async () => {
    try {
      await Job.remove(0)
      fail()
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy()
    }
  })
})
