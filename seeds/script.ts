import { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('sales_order_item').del();
  await knex('sales_order').del();
  await knex('daily_stock').del();
  await knex('products').del();

  // Seed products
  const products = [];
  for (let i = 0; i < 50; i++) { // Increase number for more coverage
    products.push({
      product_name: faker.commerce.productName(),
      created_at: faker.date.past(),
      is_long_term_unavailable: faker.datatype.boolean(),
    });
  }

  const insertedProducts = await knex('products').insert(products).returning('product_id');

  // Seed daily_stock with some products having stockouts
  const dailyStockEntries = [];
  const today = new Date();

  // Generate historical data for products
  for (const product of insertedProducts) {
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 100); // Create data for the last 100 days

    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Randomly set stock to 0 or some positive number
      const qtyLeftOnHand = i % 10 === 0 ? 0 : faker.number.int({ min: 0, max: 50 });

      dailyStockEntries.push({
        product_id: product.product_id,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        on_hand_qty: qtyLeftOnHand,
      });
    }
  }

  // Insert daily stock data
  await knex('daily_stock').insert(dailyStockEntries);

  // Seed sales_order and sales_order_item
  const salesOrders = [];
  const salesOrderItems = [];

  for (const product of insertedProducts) {
    const randomDates = Array.from({ length: 10 }, () => faker.date.past(1)).sort();

    for (const date of randomDates) {
      const salesOrder = {
        status: faker.helpers.arrayElement(['complete', 'sent', 'canceled', 'pending', 'processing']),
        customer_id: faker.number.int({ min: 1, max: 1000 }),
        base_subtotal: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
        base_currency_code: 'USD',
        base_to_global_rate: 1.0,
        global_currency_code: 'USD',
        shipping_method: faker.helpers.arrayElement(['ground', 'air', 'sea']),
        created_at: date,
        updated_at: date,
      };

      const [insertedSalesOrder] = await knex('sales_order').insert(salesOrder).returning('order_id');

      // Seed sales order items
      const orderedQty = faker.number.int({ min: 1, max: 50 });
      const salesOrderItem = {
        order_id: insertedSalesOrder.order_id,
        product_id: product.product_id,
        ordered_qty: orderedQty,
        base_price: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
        base_row_total: orderedQty * parseFloat(faker.commerce.price({ min: 10, max: 100 })),
        is_free_shipping: faker.datatype.boolean(),
      };
      salesOrderItems.push(salesOrderItem);
    }
  }

  // Insert sales order items
  await knex('sales_order_item').insert(salesOrderItems);
}
