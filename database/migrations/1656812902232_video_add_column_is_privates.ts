import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class VideoAddColumnIsPrivates extends BaseSchema {
  protected tableName = 'videos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_private').defaultTo(false)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_private')
    })
  }
}
