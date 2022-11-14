/** Express app for jobly. */

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { NotFoundError } from './ExpressError.js'
import { authenticateJWT } from './middleware/auth.js'
import { router as authRoutes } from './routes/auth.js'
import { router as companiesRoutes } from './routes/companies.js'
import { router as usersRoutes } from './routes/users.js'
const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(authenticateJWT)

app.use('/auth', authRoutes)
app.use('/companies', companiesRoutes)
app.use('/users', usersRoutes)

/** Handle 404 errors -- this matches everything */
app.use((req, res, next) => {
  return next(new NotFoundError())
})

/** Generic error handler; anything unhandled goes here. */
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') console.error(err.stack)
  const status = err.status || 500
  const message = err.message

  return res.status(status).json({
    error: { message, status }
  })
})

export { app }
