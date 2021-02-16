```javascript
const { Base, AvailableAction } = require('strapi-plugin-audit-log');

class Navigation extends Base {
  constructor(strapi, user) {
    super(strapi, user);

    this.once('onChangeNavigation', ({ actionType, oldEntity, newEntity }) => {
      this.actionType = actionType;
      this.add('beforeUpdate', oldEntity);
      this.add('afterUpdate', newEntity);
    });
  }

  async run(method, ctx, config) {
    const data = this.sanitize(this.entities);
    switch (method) {
      case 'POST':
      case 'PUT': {
        const { beforeUpdate, afterUpdate } = data;
        if (beforeUpdate && afterUpdate) {
          const diffs = this.getDiff(beforeUpdate, afterUpdate);
          return this.save(
            ctx.params.id,
            this.actionType || AvailableAction.UPDATE,
            config.pluginName,
            diffs,
          );
        }
        break;
      }
    }
    return Promise.resolve();
  }
}

module.exports = Navigation;
```
