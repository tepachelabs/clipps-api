import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import { profileSerializer } from 'App/Serializers'
import Video from 'App/Models/Video'

export default class ProfilesController {
  public async me({ auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const profile = await Profile.query().where('user_id', user.id).limit(1).first()
    const videos = await Video.query()
      .where('user_id', user.id)
      .andWhereNotNull('deleted_at')
      .andWhere('is_permanent_deleted', false)
      .count('*', 'total')

    return { ...profileSerializer(profile), videos_in_trash: Number(videos[0].$extras.total) || 0 }
  }
}
