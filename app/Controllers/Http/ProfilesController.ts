import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Profile from 'App/Models/Profile'
import { profileSerializer } from 'App/Serializers'

export default class ProfilesController {
  public async me({ auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const profile = await Profile.query().where('user_id', user.id).limit(1).first()

    return profileSerializer(profile)
  }
}
