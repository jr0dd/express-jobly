/** Routes for companies. */

import jsonschema from 'jsonschema'
import express from 'express'
import { ensureAdmin } from '../middleware/auth.js'
import { BadRequestError } from '../ExpressError.js'
import { Company } from '../models/Company.js'
import companyNewSchema from '../schemas/companyNew.json' assert { type : 'json' }
import companySearchSchema from '../schemas/companySearch.json' assert { type : 'json' }
import companyUpdateSchema from '../schemas/companyUpdate.json' assert { type : 'json' }
const router = new express.Router()

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post('/', ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema)
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack)
      throw new BadRequestError(errs)
    }

    const company = await Company.create(req.body)
    return res.status(201).json({ company })
  } catch (err) {
    return next(err)
  }
})

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get('/', async (req, res, next) => {
  const query = req.query

  // convert to integers
  if (query.minEmployees !== undefined) {
    query.minEmployees = +query.minEmployees
  }
  if (query.maxEmployees !== undefined) {
    query.maxEmployees = +query.maxEmployees
  }

  try {
    const result = jsonschema.validate(query, companySearchSchema)
    if (!result.valid) {
      throw new BadRequestError(result.errors.map(e => e.stack))
    }
    const companies = await Company.findAll(query)
    return res.json({ companies })
  } catch (err) {
    return next(err)
  }
})

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get('/:handle', async (req, res, next) => {
  try {
    const company = await Company.get(req.params.handle)
    return res.json({ company })
  } catch (err) {
    return next(err)
  }
})

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch('/:handle', ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema)
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack)
      throw new BadRequestError(errs)
    }

    const company = await Company.update(req.params.handle, req.body)
    return res.json({ company })
  } catch (err) {
    return next(err)
  }
})

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete('/:handle', ensureAdmin, async (req, res, next) => {
  try {
    await Company.remove(req.params.handle)
    return res.json({ deleted: req.params.handle })
  } catch (err) {
    return next(err)
  }
})

export { router }
