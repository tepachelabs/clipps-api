import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Videos extends BaseSchema {
  protected tableName = 'videos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')

      table.string('title')
      table.string('asset_id')
      table.string('public_id')
      table.integer('width')
      table.integer('height')
      table.string('format')
      table.string('secure_url')
      table.string('original_filename')
      table.string('poster_url')
      table.integer('duration')
      table.integer('bytes')
      table.boolean('is_permanent_deleted')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
