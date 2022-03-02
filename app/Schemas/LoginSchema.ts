import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const loginSchema = schema.create({
  email: schema.string({}, [rules.email(), rules.exists({ table: 'users', column: 'email' })]),
  password: schema.string(),
})
