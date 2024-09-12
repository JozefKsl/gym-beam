import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('sales_order', (table) => {
    table.increments('order_id').primary();
    table.enum('status', ['complete', 'sent', 'canceled', 'pending', 'processing']).notNullable();
    table.integer('customer_id').notNullable();
    table.decimal('base_subtotal', 10, 2).notNullable();
    table.string('base_currency_code').notNullable();
    table.decimal('base_to_global_rate', 10, 6).notNullable();
    table.string('global_currency_code').notNullable();
    table.string('shipping_method').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('sales_order');
}
