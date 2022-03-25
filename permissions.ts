'use strict';

export = {
    render: function(uid: string) {
        return `plugin::navigation.${uid}`;
    },
    navigation: {
        read: 'read',
        update: 'update',
    },
};