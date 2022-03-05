import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import { adjectives, animals, colors, Config, uniqueNamesGenerator } from 'unique-names-generator'

import Cloudinary from 'App/Services/Cloudinary'
import Video from 'App/Models/Video'
import { newVideoSchema } from 'App/Schemas/NewVideoSchema'
import { videoSerializer } from 'App/Serializers/VideoSerializer'

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
  public async index({ auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const videos = await Video.query().where('user_id', user.id).whereNull('deleted_at')

    return videos.map(videoSerializer)
  }

  public async show({ request }: HttpContextContract) {
    const { assetId } = request.params()

    const video = await Video.query()
      .where('asset_id', assetId)
      .whereNull('deleted_at')
      .limit(1)
      .first()

    return videoSerializer(video)
  }

  public async store({ auth, request }: HttpContextContract) {
    const user = await auth.authenticate()

    try {
      if (request.file('video')) {
        const response = (await Cloudinary.upload(
          request.file('video', { size: '100mb' }),
          Env.get('NODE_ENV') === 'production' ? `user-clips/${user.email}` : 'test'
        )) as CloudinaryResponse

        const video = new Video()

        video.title = uniqueNamesGenerator(customConfig)
        video.assetId = response.asset_id
        video.publicId = response.public_id
        video.width = response.width
        video.height = response.height
        video.format = response.format
        video.secureUrl = response.secure_url
        video.originalFilename = response.original_filename
        video.duration = parseInt(response.duration, 10)
        video.posterUrl = getPosterUrl(response.secure_url)
        video.bytes = response.bytes

        await user.related('videos').save(video)
        await video.refresh()

        return videoSerializer(video)
      }

      return { status: false, message: 'Please upload a video.' }
    } catch (error) {
      console.error(error)
      return { status: false, error: error.message }
    }
  }

  public async update({ auth, request }: HttpContextContract) {
    const { title } = await request.validate({ schema: newVideoSchema })
    const user = await auth.authenticate()
    const { id } = request.params()

    const video = await Video.query()
      .where('asset_id', id)
      .where('user_id', user.id)
      .whereNull('deleted_at')
      .limit(1)
      .first()

    if (!video) return { status: false, message: 'Video not found.' }

    video.title = title
    await video.save()

    return videoSerializer(video)
  }

  public async destroy({ auth, request }: HttpContextContract) {
    const { id } = request.params()
    const user = await auth.authenticate()

    await Video.query()
      .where('asset_id', id)
      .where('user_id', user.id)
      .update({ deleted_at: new Date() })

    return 'ok'
  }
}
