import { schema } from '@ioc:Adonis/Core/Validator'

export const newVideoSchema = schema.create({
  title: schema.string({ escape: true, trim: true }),
})
