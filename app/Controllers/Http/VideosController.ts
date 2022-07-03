import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import { adjectives, animals, colors, Config, uniqueNamesGenerator } from 'unique-names-generator'

import Cloudinary from 'App/Services/Cloudinary'
import Video from 'App/Models/Video'
import { updateVideoSchema } from 'App/Schemas/UpdateVideoSchema'
import { videoSerializer } from 'App/Serializers/VideoSerializer'
import Profile from 'App/Models/Profile'
import { cloudinaryEagerPayloadSchema } from 'App/Schemas/CloudinaryEagerPayloadSchema'
import cloudinary from 'App/Services/Cloudinary'

const QUOTA_LIMIT_PER_ACCOUNT = 980000000 // ~100MB

const customConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: '-',
}
const getPosterUrl = (videoUrl: string) => videoUrl.replace(/\.(mp4|mov)$/, '.jpg')

interface CloudinaryResponse {
  duration: string
  original_filename: string
  secure_url: string
  format: string
  height: number
  width: number
  public_id: string
  asset_id: string
  bytes: number
  metadata: object
}

export default class VideosController {
  public async anonymousShow({ request, response }: HttpContextContract) {
    const { id } = request.params()

    const video = await Video.query()
      .where('asset_id', id)
      .whereNull('deleted_at')
      .where('is_private', false)
      .limit(1)
      .first()

    if (!video) {
      return response.status(404).send('Video not found.')
    }

    return videoSerializer(video)
  }

  public async index({ auth, request }: HttpContextContract) {
    const user = await auth.authenticate()
    const { deleted: includedDeleted } = request.qs()

    const videos = await Video.query()
      .where('user_id', user.id)
      .whereNull('is_permanent_deleted')
      .unless(includedDeleted, (query) => {
        query.whereNull('deleted_at')
      })

    return videos.map(videoSerializer)
  }

  public async show({ auth, request, response }: HttpContextContract) {
    const user = await auth.authenticate()
    const { id } = request.params()

    const video = await Video.query().where('asset_id', id).whereNull('deleted_at').limit(1).first()

    if (!video) {
      return response.status(404).send('Video not found.')
    }

    if (video.isPrivate && video.userId !== user?.id) {
      return response.status(404).send('Video not found.')
    }

    return videoSerializer(video)
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const requestFile = request.file('video')

    try {
      if (request.file('video')) {
        const user = await auth.authenticate()
        const profile = await Profile.query().where('user_id', user.id).limit(1).first()

        if (!profile) {
          return response.status(403).send('Profile not found.')
        }

        const currentBytes = profile.bytesUsed || 0
        const nextQuota = currentBytes + (requestFile?.size || 0)

        if (nextQuota > QUOTA_LIMIT_PER_ACCOUNT) {
          return response.status(413).send('Quota exceeded!')
        }

        const cloudinaryResponse = (await Cloudinary.upload(
          request.file('video', { size: '100mb' }),
          Env.get('NODE_ENV') === 'production' ? `user-clips/${user.email}` : 'test'
        )) as CloudinaryResponse

        const video = new Video()

        video.title = uniqueNamesGenerator(customConfig)
        video.assetId = cloudinaryResponse.asset_id
        video.publicId = cloudinaryResponse.public_id
        video.width = cloudinaryResponse.width
        video.height = cloudinaryResponse.height
        video.format = cloudinaryResponse.format
        video.originalUrl = cloudinaryResponse.secure_url
        video.originalFilename = cloudinaryResponse.original_filename
        video.duration = parseInt(cloudinaryResponse.duration, 10)
        video.posterUrl = getPosterUrl(cloudinaryResponse.secure_url)
        video.bytes = cloudinaryResponse.bytes
        video.isPrivate = false

        await user.related('videos').save(video)
        await video.refresh()
        profile.bytesUsed = nextQuota
        await profile.save()

        return videoSerializer(video)
      }

      return response.status(400).send('Please upload a video.')
    } catch (error) {
      console.error(error)
      return response.status(400).send(error.message)
    }
  }

  public async update({ auth, request, response }: HttpContextContract) {
    const { title, deletedAt, isPrivate } = await request.validate({ schema: updateVideoSchema })
    const user = await auth.authenticate()
    const { id } = request.params()

    const video = await Video.query()
      .where('asset_id', id)
      .where('user_id', user.id)
      .limit(1)
      .first()

    if (!video) return response.status(400).send('Video not found.')

    video.title = title
    video.deletedAt = deletedAt || null
    video.isPrivate = Boolean(isPrivate)
    await video.save()

    return videoSerializer(video)
  }

  public async destroy({ auth, request, response }: HttpContextContract) {
    const { permanent } = request.qs()
    const { id } = request.params()
    const user = await auth.authenticate()

    if (permanent) {
      const video = await Video.query().where('asset_id', id).where('user_id', user.id).first()
      if (!video) return response.status(400).send('Video not found.')

      const profile = await Profile.query().where('user_id', user.id).limit(1).first()
      if (!profile) return response.status(403).send('Profile not found.')

      await Cloudinary.destroy(video.publicId)
      video.isPermanentDeleted = true
      await video.save()

      const currentBytes = profile.bytesUsed || 0
      profile.bytesUsed = currentBytes - video.bytes
      await profile.save()
    } else {
      // soft delete
      await Video.query()
        .where('asset_id', id)
        .where('user_id', user.id)
        .update({ deleted_at: new Date() })
    }

    return 'ok'
  }

  // TODO: track every failure, it might be an attacker!
  public async videoProcessed({ request, response }: HttpContextContract) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { asset_id, eager } = await request.validate({
      schema: cloudinaryEagerPayloadSchema,
    })

    // We need to verify the request is actually from Cloudinary
    // Cloudinary adds the following headers to its requests
    const cloudinaryTimestamp = request.header('X-Cld-Timestamp')
    const cloudinarySignature = request.header('X-Cld-Signature')

    if (!cloudinaryTimestamp || !cloudinarySignature) return response.status(200)

    // Next is to verify the signature, this includes the API's secret key; and
    // a timestamp verification so the request was created within the last 30 mins
    const isValidSignature = cloudinary.validateSignature(
      request.body(),
      Number(cloudinaryTimestamp),
      cloudinarySignature
    )

    if (!isValidSignature) return response.status(200)

    // Finally, we check the video actually exists
    const video = await Video.query().where('asset_id', asset_id).limit(1).first()

    // If video does not exist OR if it already has an url, just abort
    // Every video can be set its URL once by this API.
    if (!video || video.secureUrl) return response.status(200)

    const patch = eager[0]
    video.secureUrl = patch.secure_url
    video.width = patch.width
    video.height = patch.height
    await video.save()
  }
}
