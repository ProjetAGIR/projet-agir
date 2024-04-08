/**
 * This migration adds a 'usertype' column to the 'userProfiles' table.
 * The 'usertype' field can contain values like 'student' or 'association' to indicate the user's type.
 * 
 * @param {import("knex").Knex} knex - The Knex connection object.
 * @returns {Promise<void>} - A promise that resolves when the migration is complete.
 */
exports.up = async function(knex) {
    // Add the 'usertype' column to the 'userProfiles' table
    await knex.schema.alterTable('userProfiles', function(table) {
        table.string('usertype', 255).comment('Indicates whether the user is a student or an association');
    });
};

/**
 * This migration undoes the addition of the 'usertype' column from the 'userProfiles' table.
 * 
 * @param {import("knex").Knex} knex - The Knex connection object.
 * @returns {Promise<void>} - A promise that resolves when the migration is rolled back.
 */
exports.down = async function(knex) {
    // Remove the 'usertype' column from the 'userProfiles' table
    await knex.schema.alterTable('userProfiles', function(table) {
        table.dropColumn('usertype');
    });
};
