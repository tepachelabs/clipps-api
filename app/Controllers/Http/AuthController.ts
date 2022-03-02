import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { newUserSchema } from 'App/Schemas/NewUserSchema'
import { loginSchema } from 'App/Schemas/LoginSchema'

export default class AuthController {
  public async login({ request, auth }: HttpContextContract) {
    const payload = await request.validate({ schema: loginSchema })
    const token = await auth.use('api').attempt(payload.email, payload.password, {
      expiresIn: '10 days',
    })

    return token.toJSON()
  }

  public async register({ request, auth }: HttpContextContract) {
    const payload = await request.validate({ schema: newUserSchema })
    const newUser = new User()

    newUser.email = payload.email
    newUser.password = payload.password

    await newUser.save()
    await newUser.related('profile').create({})

    const token = await auth.use('api').login(newUser, {
      expiresIn: '10 days',
    })

    return token.toJSON()
  }
}
