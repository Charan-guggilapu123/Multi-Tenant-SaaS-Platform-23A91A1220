# Database Migration Strategy

## Migration System (Sequelize)

```javascript
// Create migration
npx sequelize migration:create --name add-column-to-users

// Run migrations
npx sequelize db:migrate

// Undo migration
npx sequelize db:migrate:undo

// Undo all migrations
npx sequelize db:migrate:undo:all
```

## Migration Best Practices

1. **Atomic Operations**: One logical change per migration
2. **Reversible**: Always include rollback (down) logic
3. **Zero-Downtime**: Don't block on large tables
4. **Backwards Compatible**: Maintain compatibility with previous version
5. **Data Validation**: Validate data integrity

## Schema Evolution Examples

### Add Column with Default
```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'newColumn', {
      type: Sequelize.STRING,
      defaultValue: 'default',
      allowNull: false
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'newColumn');
  }
};
```

### Large Table Migration (Backfill with Batching)
```javascript
module.exports = {
  up: async (queryInterface) => {
    const batchSize = 1000;
    let offset = 0;
    let count = await queryInterface.sequelize.query(
      'SELECT COUNT(*) FROM users'
    );
    
    while (offset < count[0][0].count) {
      await queryInterface.sequelize.query(
        'UPDATE users SET status = ? WHERE ... LIMIT ?',
        { replacements: ['active', batchSize] }
      );
      offset += batchSize;
    }
  }
};
```

## Production Migration Checklist

- [ ] Test migration on staging first
- [ ] Backup database before migration
- [ ] Plan rollback strategy
- [ ] Schedule during low-traffic window
- [ ] Monitor during migration
- [ ] Verify data integrity after migration
- [ ] Keep migration code in version control
