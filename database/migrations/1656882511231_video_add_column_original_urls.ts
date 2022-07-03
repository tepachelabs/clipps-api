import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class VideoAddColumnIsPrivates extends BaseSchema {
  protected tableName = 'videos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('original_url').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('original_url')
    })
  }
}
