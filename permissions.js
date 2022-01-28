'use strict';

module.exports = {
    render: function(uid) {
        return `plugin::navigation.${uid}`;
    },
    navigation: {
        read: 'read',
        update: 'update',
    },
};