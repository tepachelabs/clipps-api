import { LucidRow } from '@ioc:Adonis/Lucid/Orm'

export const videoSerializer = (video: LucidRow | null) => {
  return video?.serialize({
    fields: {
      pick: ['asset_id', 'title', 'secure_url', 'duration', 'created_at'],
    },
  })
}
