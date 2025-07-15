// Sequelize migration for incidents table ENUMs and foreign key
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('incidents', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            type: {
                type: Sequelize.ENUM('fall', 'behaviour', 'medication', 'other'),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            summary: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed'),
                allowNull: false,
                defaultValue: 'open',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('incidents');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_incidents_type"');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_incidents_status"');
    },
};
