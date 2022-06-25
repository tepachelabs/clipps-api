import { rules, schema } from '@ioc:Adonis/Core/Validator'

export const newUserInvitedSchema = schema.create({
  email: schema.string({}, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
  password: schema.string({}, [rules.confirmed()]),
  code: schema.string({}, [rules.exists({ table: 'invites', column: 'code' })]),
})
