import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('projections', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('name', 255).defaultTo('');
    table.integer('projection_months').notNullable().defaultTo(36);
    table.decimal('monthly_revenue_mxn', 16, 2).defaultTo(0);
    table.decimal('monthly_expenses_mxn', 16, 2).defaultTo(0);
    table.decimal('sale_price_mxn', 16, 2).defaultTo(0);
    table.integer('sale_month').nullable();
    table.decimal('discount_rate', 6, 4).defaultTo(0.10);
    table.decimal('roi', 8, 4).nullable();
    table.decimal('irr', 8, 4).nullable();
    table.jsonb('cash_flows').defaultTo('[]');
    table.jsonb('sensitivity').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('projections');
}
