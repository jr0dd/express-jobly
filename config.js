/** Shared config for application; can be required many places. */

import chalk from 'chalk'
import * as dotenv from 'dotenv'
dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY || 'secret-dev'

const PORT = +process.env.PORT || 3001

// Use dev database, testing database, or via env var, production database
const getDatabaseUri = () => {
  return (process.env.NODE_ENV === 'test')
    ? 'jobly_test'
    : process.env.DATABASE_URL || 'jobly'
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === 'test' ? 1 : 12

console.log(chalk.green('Jobly Config:'))
console.log(chalk.yellow('SECRET_KEY:'), SECRET_KEY)
console.log(chalk.yellow('PORT:'), PORT.toString())
console.log(chalk.yellow('BCRYPT_WORK_FACTOR'), BCRYPT_WORK_FACTOR)
console.log(chalk.yellow('Database:'), getDatabaseUri())
console.log(chalk.green('---'))

export {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri
}
