'use strict';

const { capitalize } = require("lodash");

const UID_REGEX = /^(?<type>[a-z0-9-]+)\:{2}(?<api>[a-z0-9-]+)\.{1}(?<contentType>[a-z0-9-]+)$/i;

const splitTypeUid = (uid = '') => {
    return uid.split(UID_REGEX).filter((s) => s && s.length > 0);
};

module.exports = {
    resolveGlobalLikeId(uid = '') {
        const parse = (str) => str.split('-')
            .map(_ => capitalize(_))
            .join('');

        const [type, scope, contentTypeName] = splitTypeUid(uid);
        if (type === 'api') {
            return parse(contentTypeName);
        }
        return `${parse(scope)}${parse(contentTypeName)}`;
    },

    isContentTypeEligible(uid = '', config = {}) {
        const { allowedContentTypes = [], restrictedContentTypes = []} = config;
        const isOneOfAllowedType = allowedContentTypes.filter(_ => uid.includes(_) || (uid === _)).length > 0;
        const isNoneOfRestricted = restrictedContentTypes.filter(_ => uid.includes(_) || (uid === _)).length === 0;
        return !!uid && isOneOfAllowedType && isNoneOfRestricted;
    },
}