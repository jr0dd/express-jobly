/** Database setup for jobly. */
import pg from 'pg'
import { getDatabaseUri } from './config.js'

let db

if (process.env.NODE_ENV === 'production') {
  db = new pg.Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  })
} else {
  db = new pg.Client({
    connectionString: getDatabaseUri()
  })
}

db.connect()

export { db }
