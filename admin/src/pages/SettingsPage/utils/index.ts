import { capitalize } from 'lodash';

type Config = {
  allowedContentTypes?: string[];
  restrictedContentTypes?: string[];
  preferCustomContentTypes?: boolean;
  contentTypes?: string[];
};

const UID_REGEX = /^(?<type>[a-z0-9-]+)\:{2}(?<api>[a-z0-9-]+)\.{1}(?<contentType>[a-z0-9-]+)$/i;

export const isContentTypeEligible = (uid = '', config: Config = {}) => {
  const {
    allowedContentTypes: baseAllowedContentTypes = [],
    restrictedContentTypes = [],
    contentTypes = [],
    preferCustomContentTypes = false,
  } = config;

  const allowedContentTypes = preferCustomContentTypes
    ? ['api::', ...contentTypes]
    : baseAllowedContentTypes;

  const isOneOfAllowedType =
    allowedContentTypes.filter((_) => uid.includes(_) || uid === _).length > 0;
  const isNoneOfRestricted =
    restrictedContentTypes.filter((_) => uid.includes(_) || uid === _).length === 0;

  return !!uid && isOneOfAllowedType && isNoneOfRestricted;
};

export const resolveGlobalLikeId = (uid = '') => {
  const parse = (str: string) =>
    str
      .split('-')
      .map((_) => capitalize(_))
      .join('');

  const [type, scope, contentTypeName] = splitTypeUid(uid);
  if (type === 'api') {
    return parse(contentTypeName);
  }
  return `${parse(scope)}${parse(contentTypeName)}`;
};

const splitTypeUid = (uid = '') => {
  return uid.split(UID_REGEX).filter((s) => s && s.length > 0);
};