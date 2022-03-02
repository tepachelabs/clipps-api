import { LucidRow } from '@ioc:Adonis/Lucid/Orm'

export const profileSerializer = (profile: LucidRow | null) => {
  return profile?.serialize({
    fields: {
      pick: ['first_name', 'last_name', 'created_at'],
    },
  })
}
