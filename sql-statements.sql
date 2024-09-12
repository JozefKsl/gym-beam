SELECT product_id, 
       SUM(qty_sold) AS total_qty_sold,
       ROUND(SUM(qty_sold) / 90, 2) AS avg_qty_sold_per_day
FROM product_sale_per_day
WHERE sales_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY product_id;