import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE MATERIALIZED VIEW product_sale_per_day AS
            SELECT 
                p.PRODUCT_ID,
                p.PRODUCT_NAME,
                DATE(so.CREATED_AT) AS sales_date,
                SUM(so_item.ORDERED_QTY) AS qty_sold,
                ds.ON_HAND_QTY AS qty_left_on_hand
            FROM 
                PRODUCTS p
            JOIN 
                SALES_ORDER_ITEM so_item 
                ON p.PRODUCT_ID = so_item.PRODUCT_ID
            JOIN 
                SALES_ORDER so 
                ON so.ORDER_ID = so_item.ORDER_ID
            JOIN 
                DAILY_STOCK ds 
                ON p.PRODUCT_ID = ds.PRODUCT_ID 
                AND DATE(so.CREATED_AT) = ds.DATE
            WHERE 
                so.STATUS IN ('complete', 'sent') -- Only include completed/sent orders
            GROUP BY 
                p.PRODUCT_ID,
                p.PRODUCT_NAME,
                DATE(so.CREATED_AT),
                ds.ON_HAND_QTY;

    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw('DROP MATERIALIZED VIEW IF EXISTS product_sale_per_day;');
}
