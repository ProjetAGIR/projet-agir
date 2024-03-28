/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('buddySystemEvent', (table) => {
        table.increments('buddySystemEventId').primary();
        table.timestamp('eventDate').notNullable();
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('buddySystemEventParticipant', (table) => {
        table.integer('buddySystemEventId').unsigned().notNullable();
        table.integer('userId').unsigned().notNullable();
        table.boolean('isNewStudent').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());

        table.primary(['buddySystemEventId', 'userId']);
        table
            .foreign('buddySystemEventId')
            .references('buddySystemEvent.buddySystemEventId');
        table.foreign('userId').references('users.userId');
    });

    await knex.schema.createTable('buddySystemEventMatch', (table) => {
        table.integer('buddySystemEventId').unsigned().notNullable();
        table.integer('userId1').unsigned().notNullable();
        table.integer('userId2').unsigned().notNullable();

        table.primary(['buddySystemEventId', 'userId1', 'userId2']);
        table
            .foreign('buddySystemEventId')
            .references('buddySystemEvent.buddySystemEventId');
        table.foreign('userId1').references('users.userId');
        table.foreign('userId2').references('users.userId');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('buddySystemEventMatch');
    await knex.schema.dropTable('buddySystemEventParticipant');
    await knex.schema.dropTable('buddySystemEvent');
};
