import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name_en', 255).notNullable();
    table.string('name_es', 255).notNullable();
    table.string('project_type', 50).notNullable();
    table.text('description_en').defaultTo('');
    table.text('description_es').defaultTo('');
    table.jsonb('default_costs').notNullable();
    table.jsonb('default_assumptions').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Add foreign key to projects now that templates table exists
  await knex.schema.alterTable('projects', (table) => {
    table.foreign('template_id').references('id').inTable('templates');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('projects', (table) => {
    table.dropForeign(['template_id']);
  });
  await knex.schema.dropTableIfExists('templates');
}
