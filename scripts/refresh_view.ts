import Knex from 'knex';
import config from '../knexfile';

const environment = process.env.NODE_ENV || 'development';
const knexInstance = Knex(config[environment]);

const refreshMaterializedView = async () => {
    try {
        const result = await knexInstance.raw('REFRESH MATERIALIZED VIEW product_sale_per_day;');
        console.log('Materialized view refreshed successfully', result);
    } catch (error) {
        console.error('Failed to refresh materialized view:', error);
    } finally {
        await knexInstance.destroy();
    }
};

refreshMaterializedView().then(() => {
    console.log('Process finished and connection closed.');
});
