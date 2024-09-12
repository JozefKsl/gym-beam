import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('sales_order_item', (table) => {
    table.increments('order_item_id').primary();
    table.integer('order_id').notNullable();
    table.integer('product_id').notNullable();
    table.integer('ordered_qty').notNullable();
    table.decimal('base_price', 10, 2).notNullable();
    table.decimal('base_row_total', 10, 2).notNullable();
    table.boolean('is_free_shipping').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('order_id').references('order_id').inTable('sales_order');
    table.foreign('product_id').references('product_id').inTable('products');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('sales_order_item');
}
