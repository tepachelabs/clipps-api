import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Video extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public title: string

  @column()
  public assetId: string

  @column()
  public publicId: string

  @column()
  public width: number

  @column()
  public height: number

  @column()
  public format: string

  @column()
  public secureUrl: string

  @column()
  public originalFilename: string

  @column()
  public posterUrl: string

  @column()
  public duration: number

  @column()
  public bytes: number

  @column()
  public isPrivate: boolean

  @column()
  public isPermanentDeleted: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null
}
