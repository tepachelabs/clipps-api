import Env from '@ioc:Adonis/Core/Env'
import { v2 as cloudinary } from 'cloudinary'
import * as crypto from 'crypto'

const cloudinaryApiSecret = Env.get('CLOUDINARY_API_SECRET')

cloudinary.config({
  cloud_name: Env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: Env.get('CLOUDINARY_API_KEY'),
  api_secret: cloudinaryApiSecret,
})

class Cloudinary {
  public upload(file: any, folder: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await cloudinary.uploader.upload(file.tmpPath, {
          folder,
          resource_type: 'video',
          eager: [{ quality: 70, width: 1080, fetch_format: 'auto' }],
          eager_async: true,
          eager_notification_url: Env.get('CLOUDINARY_WEBHOOK'),
        })

        resolve(response)
      } catch (error) {
        reject(error)
      }
    })
  }

  public destroy(publicId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await cloudinary.uploader.destroy(publicId, {
          resource_type: 'video',
        })

        resolve(response)
      } catch (error) {
        reject(error)
      }
    })
  }

  public validateSignature<T>(body: T, timestampHeader: number, signature: string): boolean {
    const unsignedPayload = `${JSON.stringify(body)}${timestampHeader}${cloudinaryApiSecret}`
    const sha1Hash = crypto.createHash('sha1')
    sha1Hash.update(unsignedPayload)
    const hexSha1 = sha1Hash.digest('hex')

    const twoHoursAgo = Number(new Date()) - 1000 * 60 * 30 // The last 30 minutes...
    const isValidTimestamp = timestampHeader <= twoHoursAgo
    const isValidSignature = signature === hexSha1

    return isValidTimestamp && isValidSignature
  }
}

export default new Cloudinary()
