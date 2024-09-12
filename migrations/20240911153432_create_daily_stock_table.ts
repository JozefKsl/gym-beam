import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('daily_stock', (table) => {
    table.increments('id').primary();
    table.date('date').notNullable();
    table.integer('product_id').notNullable();
    table.integer('on_hand_qty').notNullable();
    table.foreign('product_id').references('product_id').inTable('products');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('daily_stock');
}
