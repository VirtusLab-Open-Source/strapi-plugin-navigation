import { first, get, isEmpty, isNil, isString, isArray, last, toNumber } from "lodash";
import { Id, StrapiContext } from "strapi-typed";
import { validate } from "uuid";
import { assertNotEmpty, ContentTypeEntity, IClientService, Navigation, NavigationItem, NavigationItemCustomField, NavigationItemEntity, RFRNavItem, ToBeFixed } from "../../types"
import { composeItemTitle, getPluginModels, filterByPath, filterOutUnpublished, getPluginService, templateNameFactory, RENDER_TYPES, compareArraysOfNumbers, getCustomFields } from "../utils";
//@ts-ignore
import { errors } from '@strapi/utils';
import { getI18nStatus, i18nAwareEntityReadHandler } from "../i18n";
import { NavigationError } from "../../utils/NavigationError";
import { identity, pick } from "lodash/fp";

const clientService: (context: StrapiContext) => IClientService = ({ strapi }) => ({
  async readAll({ locale, orderBy = 'createdAt', orderDirection = "DESC" }) {
    const { masterModel } = getPluginModels();
    const { enabled: i18nEnabled, locales } = await getI18nStatus({ strapi });

    let navigations = await strapi
      .query<Navigation>(masterModel.uid)
      .findMany({
        where: locale
          ? {
              localeCode: locale,
            }
          : undefined,
        orderBy: { [orderBy]: orderDirection } as ToBeFixed,
        limit: Number.MAX_SAFE_INTEGER,
        populate: false
      });

    if (i18nEnabled) {
      navigations = navigations.reduce((acc, navigation) => {
        if (navigation.localeCode && locales?.includes(navigation.localeCode)) {
          acc.push({
            ...navigation,
            localizations: navigation.localizations?.filter(({ localeCode }) => localeCode && locales?.includes(localeCode)),
          });
        }

        return acc;
      }, [] as Navigation[]);
    }

    return navigations;
  },

  async render({
    idOrSlug,
    type = RENDER_TYPES.FLAT,
    menuOnly = false,
    rootPath = null,
    wrapRelated = false,
    locale,
    populate,
  }) {
    const clientService = getPluginService('client');

    const findById = !isNaN(toNumber(idOrSlug)) || validate(idOrSlug as string);
    const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
    const itemCriteria = menuOnly ? { menuAttached: true } : {};
    return await clientService.renderType({
      type, criteria, itemCriteria, filter: null, rootPath, wrapRelated, locale, populate
    });
  },

  async renderChildren({
    idOrSlug,
    childUIKey,
    type = RENDER_TYPES.FLAT,
    menuOnly = false,
    wrapRelated = false,
    locale,
  }) {
    const clientService = getPluginService('client');
    const findById = !isNaN(toNumber(idOrSlug)) || validate(idOrSlug as string);
    const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
    const filter = type === RENDER_TYPES.FLAT ? null : childUIKey;

    const itemCriteria = {
      ...(menuOnly && { menuAttached: true }),
      ...(type === RENDER_TYPES.FLAT ? { uiRouterKey: childUIKey } : {}),
    };

    return clientService.renderType({ type, criteria, itemCriteria, filter, rootPath: null, wrapRelated, locale });
  },

  renderRFR({
    items,
    parent = null,
    parentNavItem = null,
    contentTypes = [],
    enabledCustomFieldsNames,
  }) {
    const clientService = getPluginService('client');
    let pages = {};
    let nav = {};
    let navItems: RFRNavItem[] = [];

    items.forEach(item => {
      const { items: itemChilds, ...itemProps } = item;
      const itemNav = clientService.renderRFRNav(itemProps);
      const itemPage = clientService.renderRFRPage(
        itemProps,
        parent,
        enabledCustomFieldsNames,
      );

      if (item.type !== "EXTERNAL") {
        pages = {
          ...pages,
          [itemPage.id]: {
            ...itemPage,
          },
        };
      }

      if (item.menuAttached) {
        navItems.push(itemNav);
      }

      if (!parent) {
        nav = {
          ...nav,
          root: navItems,
        };
      } else {
        const navLevel = navItems
          .filter(navItem => navItem.type !== "EXTERNAL");
        if (!isEmpty(navLevel))
          nav = {
            ...nav,
            [parent]: navLevel.concat(parentNavItem ? parentNavItem : []),
          };
      }

      if (!isEmpty(itemChilds)) {
        const { nav: nestedNavs } = clientService.renderRFR({
          items: itemChilds,
          parent: itemPage.id,
          parentNavItem: itemNav,
          contentTypes,
          enabledCustomFieldsNames,
        });
        const { pages: nestedPages } = clientService.renderRFR({
          items: (itemChilds).filter(child => child.type !== "EXTERNAL"),
          parent: itemPage.id,
          parentNavItem: itemNav,
          contentTypes,
          enabledCustomFieldsNames,
        });
        pages = {
          ...pages,
          ...nestedPages,
        };
        nav = {
          ...nav,
          ...nestedNavs,
        };
      }
    });

    return {
      pages,
      nav,
    };
  },

  renderRFRNav(item): RFRNavItem {
    const { uiRouterKey, title, path, type, audience } = item;
    const itemCommon = {
      label: title,
      type: type,
      audience,
    }

    if (type === "EXTERNAL") {
      assertNotEmpty(path, new NavigationError("External navigation item's path is undefined", item));
      return {
        ...itemCommon,
        url: path
      };
    }

    if (type === "INTERNAL") {
      return {
        ...itemCommon,
        page: uiRouterKey,
      };
    }

    if (type === "WRAPPER") {
      return {
        ...itemCommon,
      }
    }

    throw new NavigationError("Unknown item type", item);
  },

  renderRFRPage(
    item,
    parent,
    enabledCustomFieldsNames,
  ) {
    const { uiRouterKey, title, path, slug, related, type, audience, menuAttached } = item;
    const { __contentType, id, __templateName } = related || {};
    const contentType = __contentType || '';
    return {
      id: uiRouterKey,
      title,
      templateName: __templateName,
      related: type === "INTERNAL" ? {
        contentType,
        id,
      } : undefined,
      path,
      slug,
      parent,
      audience,
      menuAttached,
      ...enabledCustomFieldsNames.reduce((acc, field) => ({ ...acc, [field]: get(item, field) }), {})
    };
  },

  async renderTree(
    items = [],
    id = null,
    field = 'parent',
    path = '',
    itemParser = (i: ToBeFixed) => i,
  ) {
    return (await Promise.all(
      items
        .filter(
          (item) => {
            if (item[field] === null && id === null) {
              return true;
            }
            let data = item[field];
            if (data && typeof id === 'string') {
              data = data.toString();
            }
            if (!!data && typeof data === 'object' && 'id' in data) {
              return data.id === id
            }

            return (data && data === id);
          },
        )
        .filter(filterOutUnpublished)
        .map(async (item) => itemParser(
            {
              ...item,
            }, 
            path,
            field
          )
        )
      )
    )
    .sort((x, y) => {
      if (x.order !== undefined && y.order !== undefined)
        return x.order - y.order;
      else
        return 0;
    });
  },

  async renderType({
    type = RENDER_TYPES.FLAT,
    criteria = {},
    itemCriteria = {},
    filter = null,
    rootPath = null,
    wrapRelated = false,
    locale,
    populate,
  }) {
    const clientService = getPluginService('client');
    const adminService = getPluginService('admin');
    const commonService = getPluginService('common');
    const entityWhereClause = {
      ...criteria,
      visible: true,
    }

    const { masterModel, itemModel } = getPluginModels();

    const entity = await i18nAwareEntityReadHandler({
      entity: await strapi
        .query<Navigation>(masterModel.uid)
        .findOne({
          where: entityWhereClause,
        }),
      entityUid: masterModel.uid,
      strapi,
      whereClause: entityWhereClause,
      localeCode: locale,
    });

    if (entity && entity.id) {
      const entities = await strapi.query<NavigationItemEntity>(itemModel.uid).findMany({
        where: {
          master: entity.id,
          ...itemCriteria,
        },
        limit: Number.MAX_SAFE_INTEGER,
        orderBy: [{ order: 'asc', }],
        populate: ['related', 'audience', 'parent'],
      });

      if (!entities) {
        return [];
      }
      const items = await commonService.getRelatedItems(entities, populate);
      const { contentTypes, contentTypesNameFields, additionalFields } = await adminService.config(false);
      const enabledCustomFieldsNames = getCustomFields(additionalFields)
        .reduce<string[]>((acc, curr) => curr.enabled ? [...acc, curr.name] : acc, []);

      const wrapContentType = (itemContentType: ToBeFixed) => wrapRelated && itemContentType ? {
        id: itemContentType.id,
        attributes: { ...itemContentType }
      } : itemContentType;
      const pickMediaFields = pick(["name", "url", "mime", "width", "height", "previewUrl"]);
      const customFieldsDefinitions = additionalFields.filter(_ => typeof _ !== "string") as NavigationItemCustomField[];


      switch (type) {
        case RENDER_TYPES.TREE:
        case RENDER_TYPES.RFR:
          const getTemplateName = await templateNameFactory(items, strapi, contentTypes);
          const itemParser = async (item: NavigationItemEntity<ContentTypeEntity[]>, path = '', field: keyof NavigationItemEntity) => {
            const isExternal = item.type === "EXTERNAL";
            const parentPath = isExternal ? undefined : `${path === '/' ? '' : path}/${first(item.path) === '/'
              ? item.path!.substring(1)
              : item.path}`;
            const slug = isString(parentPath) ? await commonService.getSlug(
              (first(parentPath) === '/' ? parentPath.substring(1) : parentPath).replace(/\//g, '-')) : undefined;
            const lastRelated = isArray(item.related) ? last(item.related) : item.related;
            const relatedContentType = wrapContentType(lastRelated);
            const customFields = enabledCustomFieldsNames.reduce((acc, field) => {
              const mapper = customFieldsDefinitions.find(({ name }) => name === field)?.type === "media"
                ? (_: string) => pickMediaFields(JSON.parse(_))
                : identity;
              const content = get(item, `additionalFields.${field}`);

              return { ...acc, [field]: content ? mapper(content) : content }
            }, {});

            return {
              id: item.id,
              title: composeItemTitle(item, contentTypesNameFields, contentTypes),
              menuAttached: item.menuAttached,
              order: item.order,
              path: isExternal ? item.externalPath : parentPath,
              type: item.type,
              uiRouterKey: item.uiRouterKey,
              slug: !slug && item.uiRouterKey ? commonService.getSlug(item.uiRouterKey) : slug,
              external: isExternal,
              related: isExternal || !lastRelated ? undefined : {
                ...relatedContentType,
                __templateName: getTemplateName((lastRelated.relatedType || lastRelated.__contentType), lastRelated.id),
              },
              audience: !isEmpty(item.audience) ? item.audience!.map(({ key }) => key) : undefined,
              items: isExternal ? undefined : await clientService.renderTree(
                items,
                item.id,
                field,
                parentPath,
                itemParser,
              ),
              ...customFields
            };
          };

          const {
            items: itemsFilteredByPath,
            root: rootElement,
          } = filterByPath(items, rootPath);

          const treeStructure = await clientService.renderTree(
            isNil(rootPath) ? items : itemsFilteredByPath,
            get(rootElement, 'parent.id') ?? null,
            'parent',
            get(rootElement, 'parent.path'),
            itemParser,
          );

          const filteredStructure = filter
            ? treeStructure.filter((item: NavigationItem) => item.uiRouterKey === filter)
            : treeStructure;

          if (type === RENDER_TYPES.RFR) {
            return clientService.renderRFR({
              items: filteredStructure,
              contentTypes,
              enabledCustomFieldsNames,
            });
          }
          return filteredStructure;
        default:
          const publishedItems = items.filter(filterOutUnpublished);
          const result = isNil(rootPath) ? items : filterByPath(publishedItems, rootPath).items;

          const defaultCache = new Map<Id, Array<number>>();
          const getNestedOrders = (id: Id, cache: Map<Id, Array<number>> = defaultCache): Array<number> => {
            const cached = cache.get(id);
            if (!isNil(cached))
              return cached;

            const item = result.find(item => item.id === id);

            if (isNil(item))
              return [0];

            const { order, parent } = item;

            const nestedOrders = parent
              ? getNestedOrders(parent.id, cache).concat(order)
              : [order];

            cache.set(id, nestedOrders);

            return nestedOrders;
          }

          return result
            .map(({ additionalFields, ...item }: NavigationItemEntity<ContentTypeEntity>) => {
              const customFields = enabledCustomFieldsNames.reduce((acc, field) => {
                const mapper = customFieldsDefinitions.find(({ name }) => name === field)?.type === "media"
                  ? (_: string | boolean) => pickMediaFields(JSON.parse(_.toString()))
                  : identity;
                const content = get(additionalFields, field);
  
                return { ...acc, [field]: content ? mapper(content) : content }
              }, {});

              return ({
                ...item,
                audience: item.audience?.map(_ => (_).key),
                title: composeItemTitle({ ...item, additionalFields }, contentTypesNameFields, contentTypes) || '',
                related: wrapContentType(item.related),//omit(item.related, 'localizations'),
                items: null,
                ...customFields,
              })})
            .sort((a, b) => compareArraysOfNumbers(getNestedOrders(a.id), getNestedOrders(b.id)));
      }
    }
    throw new errors.NotFoundError();
  },
});

export default clientService;
