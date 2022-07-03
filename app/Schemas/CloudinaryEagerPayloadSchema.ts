import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const cloudinaryEagerPayloadSchema = schema.create({
  notification_type: schema.string(),
  asset_id: schema.string({}, [rules.exists({ table: 'videos', column: 'asset_id' })]),
  eager: schema.array().members(
    schema.object().members({
      width: schema.number(),
      height: schema.number(),
      bytes: schema.number(),
      secure_url: schema.string(),
    })
  ),
})
