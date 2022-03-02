import Env from '@ioc:Adonis/Core/Env'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: Env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: Env.get('CLOUDINARY_API_KEY'),
  api_secret: Env.get('CLOUDINARY_API_SECRET'),
})

class Cloudinary {
  public upload(file: any, userEmail: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await cloudinary.uploader.upload(file.tmpPath, {
          folder: `user-clips/${userEmail}`,
          resource_type: 'video',
        })

        resolve(response)
      } catch (error) {
        reject(error)
      }
    })
  }
}

export default new Cloudinary()
