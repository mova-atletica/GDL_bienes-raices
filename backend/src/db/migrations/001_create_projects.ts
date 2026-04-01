import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('projects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('project_type', 50).notNullable();
    table.uuid('template_id').nullable();
    table.string('location', 255).defaultTo('');
    table.text('description').defaultTo('');
    table.string('status', 30).defaultTo('draft');
    table.string('currency', 3).defaultTo('MXN');
    table.decimal('exchange_rate', 12, 4).defaultTo(17.5);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('projects');
}
