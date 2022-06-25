import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { animals, Config, NumberDictionary, uniqueNamesGenerator } from 'unique-names-generator'

import User from 'App/Models/User'
import Invite from 'App/Models/Invite'
import { newUserInvitedSchema } from 'App/Schemas/NewUserInvitedSchema'
import { loginSchema } from 'App/Schemas/LoginSchema'

const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 })

const customConfig: Config = {
  dictionaries: [animals, numberDictionary],
  separator: '',
  style: 'capital',
}

export default class AuthController {
  public async login({ request, auth }: HttpContextContract) {
    const payload = await request.validate({ schema: loginSchema })
    const token = await auth.use('api').attempt(payload.email, payload.password, {
      expiresIn: '10 days',
    })

    return token.toJSON()
  }

  public async register({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate({ schema: newUserInvitedSchema })
    const invite = await Invite.query().where('code', payload.code).limit(1).first()

    if (!invite) return response.status(400).send('Invite code is not valid.')

    const newUser = new User()

    newUser.email = payload.email
    newUser.password = payload.password

    await newUser.save()
    await newUser.related('profile').create({
      username: uniqueNamesGenerator(customConfig),
      bytesUsed: 0,
    })

    invite.inviteeId = newUser.id
    await invite.save()

    const token = await auth.use('api').login(newUser, {
      expiresIn: '10 days',
    })

    return token.toJSON()
  }
}
