import { rules, schema } from '@ioc:Adonis/Core/Validator'

export const newUserSchema = schema.create({
  email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
  password: schema.string({}, [rules.confirmed()]),
})
