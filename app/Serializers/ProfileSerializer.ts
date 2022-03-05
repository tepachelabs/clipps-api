import { LucidRow } from '@ioc:Adonis/Lucid/Orm'

export const profileSerializer = (profile: LucidRow | null) => {
  return profile?.serialize({
    fields: {
      pick: ['username', 'avatar', 'bytes_used'],
    },
  })
}
