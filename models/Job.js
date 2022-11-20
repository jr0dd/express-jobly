import { db } from '../db.js'
import { NotFoundError } from '../ExpressError.js'
import { sqlForPartialUpdate } from '../helpers/sql.js'

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   **/

  static async create ({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs (title,
                          salary,
                          equity,
                          company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    )
    const job = result.rows[0]

    return job
  }

  /** Find all jobs (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - minSalary
   * - hasEquity (true returns only jobs with equity > 0)
   * - title (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   * */

  static async findAll (filters = {}) {
    let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                 FROM jobs j 
                   LEFT JOIN companies AS c ON c.handle = j.company_handle`
    const exp = []
    const values = []
    const { minSalary, hasEquity, title } = filters

    if (minSalary !== undefined) {
      values.push(minSalary)
      exp.push(`salary >= $${values.length}`)
    }

    if (hasEquity === true) {
      exp.push('equity > 0')
    }

    // seaech partials and case insensitive
    if (title !== undefined) {
      values.push(`%${title}%`)
      exp.push(`title ILIKE $${values.length}`)
    }

    if (exp.length > 0) {
      query += ' WHERE ' + exp.join(' AND ')
    }

    query += ' ORDER BY title'
    const result = await db.query(query, values)
    return result.rows
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *   where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get (id) {
    const jobRes = await db.query(
      `SELECT id,
        title,
        salary,
        equity,
        company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`,
      [id]
    )
    const job = jobRes.rows[0]
    if (!job) {
      throw new NotFoundError(`No job: ${id}`)
    }

    const companiesRes = await db.query(
      `SELECT handle,
          name,
          description,
          num_employees AS "numEmployees",
          logo_url AS "logoUrl"
        FROM companies
        WHERE handle = $1`,
      [job.companyHandle]
    )

    delete job.companyHandle
    job.company = companiesRes.rows[0]

    return job
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update (id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {})
    const idVarIdx = '$' + (values.length + 1)

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                company_handle AS "companyHandle"`

    const result = await db.query(querySql, [...values, id])
    const job = result.rows[0]
    if (!job) throw new NotFoundError(`No job: ${id}`)

    return job
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove (id) {
    const result = await db.query(
      `DELETE
      FROM jobs
      WHERE id = $1
      RETURNING id`,
      [id]
    )
    const job = result.rows[0]
    if (!job) throw new NotFoundError(`No job: ${id}`)
  }
}

export { Job }
