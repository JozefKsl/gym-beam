import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('products', (table) => {
    table.increments('product_id').primary();
    table.string('product_name').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.boolean('is_long_term_unavailable').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('products');
}
