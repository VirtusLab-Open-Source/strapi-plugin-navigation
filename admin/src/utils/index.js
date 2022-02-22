import { useIntl } from 'react-intl';
import { isString } from 'lodash';

import pluginId from '../pluginId';

export const getMessage = (input, defaultMessage = '', inPluginScope = true) => {
    const { formatMessage } = useIntl();
    let formattedId = ''
    if (isString(input)) {
        formattedId = input;
    } else {
        formattedId = input?.id;
    }
    return formatMessage({
        id: `${inPluginScope ? pluginId : 'app.components'}.${formattedId}`,
        defaultMessage,
    }, input?.props || undefined)
};

export const ItemTypes = {
    NAVIGATION_ITEM: 'navigationItem'
}