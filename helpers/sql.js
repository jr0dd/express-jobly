import { BadRequestError } from '../ExpressError.js'

/**
 * @function sqlForPartialUpdate
 * 
 * @param  {object} dataToUpdate
 * @param  {object} jsToSql
 * 
 * @returns {object} Returns object with setCols & values keys
 * 
 * @example
 *   sqlForPartialUpdate({ firstName: 'Aliyaah', age: 37 })
 *   // returns
 *   {
 *     setCols: 'first_name'=$1, 'age'=$2,
 *     values: ['Aliyaah', 37]
 *   }
 */

const sqlForPartialUpdate = (dataToUpdate, jsToSql) => {
  const keys = Object.keys(dataToUpdate)
  if (keys.length === 0) throw new BadRequestError('No data')

  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`
  )

  return {
    setCols: cols.join(', '),
    values: Object.values(dataToUpdate)
  }
}

export { sqlForPartialUpdate }
