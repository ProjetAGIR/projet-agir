/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('events', (table) => {
        table.increments('eventId').primary();
        table.integer('userId').unsigned().notNullable();
        table.string('eventName').notNullable();
        table.string('eventDescription').notNullable();
        table.string('eventLocation').notNullable();
        table.string('eventCategory').notNullable();
        table.string('eventPicture').notNullable();
        table.string('repeatPattern').notNullable();
        table.timestamp('eventDateStart').notNullable();
        table.timestamp('eventDateEnd').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.foreign('userId').references('userId').inTable('users');
    });

    await knex.schema.createTable('eventParticipants', (table) => {
        table.integer('eventId').unsigned().notNullable();
        table.integer('userId').unsigned().notNullable();
        table.string('response').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.primary(['eventId', 'userId']);
        table.foreign('eventId').references('eventId').inTable('events');
        table.foreign('userId').references('userId').inTable('users');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('eventParticipants');
    await knex.schema.dropTable('events');
};
