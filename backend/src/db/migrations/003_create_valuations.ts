import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('valuations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('method', 30).notNullable();
    table.decimal('estimated_value_mxn', 16, 2).defaultTo(0);
    table.decimal('estimated_value_usd', 16, 2).defaultTo(0);
    table.decimal('cap_rate', 6, 4).nullable();
    table.decimal('noi_annual_mxn', 16, 2).nullable();
    table.jsonb('data').defaultTo('{}');
    table.text('notes').defaultTo('');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('valuations');
}
