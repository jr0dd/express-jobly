import { sqlForPartialUpdate } from './sql.js'

describe('sqlForPartialUpdate', () => {
  test('works: both objects', () => {
    const payload = sqlForPartialUpdate(
      { firstName: 'Aliyaah', age: 37 },
      { firstName: 'first_name', age: 'age' }
    )
    expect(payload).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Aliyaah', 37]
    })
  })

  test('broke: missing jsToSql ', () => {
    try {
      sqlForPartialUpdate({ first_name: 'Aliyaah', age: 37 })
      fail()
    } catch (err) {
      expect(err instanceof TypeError).toBeTruthy()
    }
  })
})
