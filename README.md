How to run this POC:

Requirements: node.js, npm, docker

1. `cd gym-beam`
2. Run docker container (that will start the postgres instance locally): `docker-compose up -d`
3. Install dependencies: `npm i`
4. Create sql tables: `npx knex migrate:latest`
5. Seed the database with mock data: `npx knex seed:run`
6. Refresh the view to reflect data changes: `npm run refresh-view`
7. Connect to the database with BI tool of your choice to perform analysis and visualizations

Case Study Documentation: Hybrid Approach for Data Analysis
Overview

I chose to tackle this case study by following the hybrid approach, where I pre-process data in SQL by creating a `product_sale_per_day` dataset utilising materialized view (script to create this view can be found in `/migrations/20240911202814_create_product_sale_per_day_view.ts`), this materialized view contains all the necessary data that might be used by a BI tool to answer relevant business question. Because the view would not be refreshed automatically, I added a script (`scripts/refresh_view.ts`) to refresh it manually by running `npm run refresh-view`, in practice we would probably configure a cron job to run this script at midnight every day, so that we would not overload source tables during a rush hour. Also we only need historical data, so running it as a batch job at midnight every day should be sufficient.

Materialized View Structure

The materialized view (`product_sale_per_day` dataset) is designed with the following structure:

-----------------------------------------------
| Column	       | Type                     |  
----------------------------------------------
| product_id	   | integer                  |  
| product_name	   | character varying(255)   |
| sales_date	   | date                     |
| qty_sold	       | bigint                   |
| qty_left_on_hand | integer                  |
-----------------------------------------------

Addressing Business Questions

1. When do we expect the stock of individual products to run out, based on current inventory levels and average sales over the past 90 days?

    View Analysis: The view provides both `qty_sold` per day and `qty_left_on_hand`. We can calculate the average sales `qty_sold` over the past 90 days and divide the current stock (qty_left_on_hand) by this value to estimate when stock will run out.

    Example dashboard built in Tableau:

    ![alt text](<dashboard_stockout_forecast.png>)

    I followed these steps:

        for each product
        
        1. get a total number of units sold in the past 90 days
        2. divide it by 90 to get average per day 
        3. get the qty_left_on_hand of the given product, this we should get from the row with the latest sales_date for a given product
        4. then divide the value from the step 2 (avg_sales_per_day) by the qty_left_on_hand from the step 3

2. What were the past sales figures for products?

    View Analysis: The `qty_sold` field already provides the daily sales figures for each product, so this question is fully answered by the view.

    Example dashboard built in Tableau: 

    ![alt text](<dashboard_past_sales_figures.png>)


3. How many products were sold out at the end of the day in the past? Which ones were they?

    View Analysis: The `qty_left_on_hand` field in the view indicates the stock level at the end of the day. You can filter for `qty_left_on_hand` = 0 to identify products that were sold out.

    Example dashboard built in Tableau

    ![alt text](<dashboard_eod_stockouts.png>)

4. Which products were out of stock for 5 or more consecutive days?

    View Analysis: This requires consecutive days where `qty_left_on_hand` was 0 for a product. The view has enough data to analyze this using SQL window functions or BI tool logic.


5. Which products were out of stock the longest?

    View Analysis: Again, this requires detecting the longest consecutive streaks of `qty_left_on_hand` = 0. We can identify the longest period of stockouts for each product.


6. How many bestsellers were sold out at the end of the day in the past? Which ones were they?

    View Analysis: We would first need to define bestsellers by `sum(qty_sold)` for each product in the previous calendar month (we would limit the number of results by `total_count * 0.1`). After identifying the top-selling products, we can check when they had `qty_left_on_hand` = 0.

    
