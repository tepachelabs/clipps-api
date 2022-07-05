import { schema } from '@ioc:Adonis/Core/Validator'

export const updateVideoSchema = schema.create({
  title: schema.string.optional({ escape: true, trim: true }),
  deletedAt: schema.date.optional(),
  isPrivate: schema.boolean.optional(),
})
