import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cost_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('category', 50).notNullable();
    table.string('subcategory', 100).defaultTo('');
    table.text('description').defaultTo('');
    table.decimal('amount_mxn', 16, 2).notNullable();
    table.decimal('amount_usd', 16, 2).defaultTo(0);
    table.boolean('is_recurring').defaultTo(false);
    table.integer('recurrence_months').nullable();
    table.text('notes').defaultTo('');
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cost_items');
}
