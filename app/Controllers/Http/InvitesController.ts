import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invite from 'App/Models/Invite'

const INVITE_EXISTS_RESPONSE = { result: 'exists' }
const INVITE_NOT_FOUND_RESPONSE = { result: 'not_found' }
const INVITE_USED_RESPONSE = { result: 'used' }

export default class InvitesController {
  public async check({ auth, request, response }: HttpContextContract) {
    const { code } = request.params()
    const user = await auth.authenticate()
    const invite = await Invite.query().where('code', code).limit(1).first()

    if (!invite) {
      return response.status(400).send(INVITE_NOT_FOUND_RESPONSE)
    }

    if (!user) {
      if (invite.inviteeId) {
        return response.status(200).send(INVITE_NOT_FOUND_RESPONSE)
      } else {
        return response.status(400).send(INVITE_EXISTS_RESPONSE)
      }
    }

    if (invite.invitorId === user.id) {
      if (invite.inviteeId) {
        return response.status(200).send(INVITE_USED_RESPONSE)
      } else {
        return response.status(200).send(INVITE_EXISTS_RESPONSE)
      }
    }

    if (invite.inviteeId === user.id) {
      return response.status(200).send(INVITE_USED_RESPONSE)
    } else {
      return response.status(400).send(INVITE_NOT_FOUND_RESPONSE)
    }
  }
}
