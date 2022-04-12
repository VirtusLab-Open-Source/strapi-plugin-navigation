import { first, get, isEmpty, isNil, isString, last, toNumber } from "lodash";
import slugify from "slugify";
import { Id, StrapiContext } from "strapi-typed";
import { validate } from "uuid";
import { ContentTypeEntity, IAdminService, IClientService, ICommonService, Navigation, NavigationItem, NavigationItemEntity, NestedStructure, RFRNavItem, ToBeFixed } from "../../types"
import { composeItemTitle, extractMeta, filterByPath, filterOutUnpublished, getPluginService, templateNameFactory } from "../utils";
//@ts-ignore
import { errors } from '@strapi/utils';
import { i18nAwareEntityReadHandler } from "../i18n";

const clientService: (context: StrapiContext) => IClientService = ({ strapi }) => ({
  async render({
    idOrSlug,
    type = 'flat',
    menuOnly = false,
    rootPath = null,
    locale,
  }) {
    const clientService = getPluginService<IClientService>('client');

    const findById = !isNaN(toNumber(idOrSlug)) || validate(idOrSlug as string);
    const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
    const itemCriteria = menuOnly ? { menuAttached: true } : {};
    return await clientService.renderType({
      type, criteria, itemCriteria, filter: null, rootPath, locale,
    });
  },

  async renderChildren({
    idOrSlug,
    childUIKey,
    type = 'flat',
    menuOnly = false,
    locale,
  }) {
    const clientService = getPluginService<IClientService>('client');
    const findById = !isNaN(toNumber(idOrSlug)) || validate(idOrSlug as string);
    const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
    const filter = type === 'flat' ? null : childUIKey;

    const itemCriteria = {
      ...(menuOnly && { menuAttached: true }),
      ...(type === 'flat' ? { uiRouterKey: childUIKey } : {}),
    };

    return clientService.renderType({ type, criteria, itemCriteria, filter, rootPath: null, locale });
  },

  renderRFR(
    items: NestedStructure<NavigationItem>[],
    parent: Id | null = null,
    parentNavItem: RFRNavItem | null = null,
    contentTypes = []
  ) {
    const clientService = getPluginService<IClientService>('client');
    let pages = {};
    let nav = {};
    let navItems: RFRNavItem[] = [];

    items.forEach(item => {
      const { items: itemChilds, ...itemProps } = item;
      const itemNav = clientService.renderRFRNav(itemProps);
      const itemPage = clientService.renderRFRPage(
        itemProps,
        parent,
      );

      if (item.type === "INTERNAL") {
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
          .filter(navItem => navItem.type === "INTERNAL");
        if (!isEmpty(navLevel))
          nav = {
            ...nav,
            [parent]: navLevel.concat(parentNavItem ? parentNavItem : []),
          };
      }

      if (!isEmpty(itemChilds)) {
        const { nav: nestedNavs } = clientService.renderRFR(
          itemChilds,
          itemPage.id,
          itemNav,
          contentTypes,
        );
        const { pages: nestedPages } = clientService.renderRFR(
          (itemChilds).filter(child => child.type === "INTERNAL"),
          itemPage.id,
          itemNav,
          contentTypes,
        );
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

  renderRFRNav(
    item: NavigationItem
  ): RFRNavItem {
    const { uiRouterKey, title, path, type, audience } = item;
    return {
      label: title,
      type: type,
      page: type === "INTERNAL" ? uiRouterKey : undefined,
      url: type === "EXTERNAL" ? path : undefined,
      audience,
    };
  },

  renderRFRPage(
    item: NavigationItem & { related: ToBeFixed },
    parent: Id | null,
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
    };
  },

  renderTree(
    items: NavigationItemEntity<ContentTypeEntity>[] = [],
    id: Id | null = null,
    field: keyof NavigationItemEntity = 'parent',
    path = '',
    itemParser: ToBeFixed = (i: ToBeFixed) => i,
  ): ToBeFixed {
    return items
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
      .map(item => itemParser({
        ...item,
      }, path, field))
      .sort((x, y) => {
        if (x.order !== undefined && y.order !== undefined)
          return x.order - y.order;
        else
          return 0;
      });
  },

  async renderType({
    type = 'flat',
    criteria = {},
    itemCriteria = {},
    filter = null,
    rootPath = null,
    locale
  }) {
    const clientService = getPluginService<IClientService>('client');
    const adminService = getPluginService<IAdminService>('admin');
    const commonService = getPluginService<ICommonService>('common');
    const entityWhereClause = {
      ...criteria,
      visible: true,
    }

    const { masterModel, itemModel } = extractMeta(
      strapi.plugins,
    );

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
      const items = await commonService.getRelatedItems(entities);
      const { contentTypes, contentTypesNameFields } = await adminService.config(false);

      switch (type) {
        case 'tree':
        case 'rfr':
          const getTemplateName = await templateNameFactory(items, strapi, contentTypes);
          const itemParser = (item: NavigationItemEntity<ContentTypeEntity[]>, path = '', field: keyof NavigationItemEntity) => {
            const isExternal = item.type === "EXTERNAL";
            const parentPath = isExternal ? undefined : `${path === '/' ? '' : path}/${first(item.path) === '/'
              ? item.path!.substring(1)
              : item.path}`;
            const slug = isString(parentPath) ? slugify(
              (first(parentPath) === '/' ? parentPath.substring(1) : parentPath).replace(/\//g, '-')) : undefined;
            const lastRelated = item.related ? last(item.related) : undefined;
            return {
              id: item.id,
              title: composeItemTitle(item, contentTypesNameFields, contentTypes),
              menuAttached: item.menuAttached,
              order: item.order,
              path: isExternal ? item.externalPath : parentPath,
              type: item.type,
              uiRouterKey: item.uiRouterKey,
              slug: !slug && item.uiRouterKey ? slugify(item.uiRouterKey) : slug,
              external: isExternal,
              related: isExternal || !lastRelated ? undefined : {
                ...lastRelated,
                __templateName: getTemplateName((lastRelated.relatedType || lastRelated.__contentType), lastRelated.id),
              },
              audience: !isEmpty(item.audience) ? item.audience!.map(aItem => (aItem).key) : undefined,
              items: isExternal ? undefined : clientService.renderTree(
                items,
                item.id,
                field,
                parentPath,
                itemParser,
              ),
            };
          };

          const {
            items: itemsFilteredByPath,
            root: rootElement,
          } = filterByPath(items, rootPath);

          const treeStructure = clientService.renderTree(
            isNil(rootPath) ? items : itemsFilteredByPath,
            get(rootElement, 'parent.id'),
            'parent',
            get(rootElement, 'parent.path'),
            itemParser,
          );

          const filteredStructure = filter
            ? treeStructure.filter((item: NavigationItem) => item.uiRouterKey === filter)
            : treeStructure;

          if (type === "rfr") {
            return clientService.renderRFR(
              filteredStructure,
              null,
              null,
              contentTypes,
            );
          }
          return filteredStructure;
        default:
          const publishedItems = items
            .filter(filterOutUnpublished)
            .map((item: NavigationItemEntity<ContentTypeEntity>) => ({
              ...item,
              audience: item.audience?.map(_ => (_).key),
              title: composeItemTitle(item, contentTypesNameFields, contentTypes) || '',
              related: item.related,//omit(item.related, 'localizations'),
              items: null,
            }));
          return isNil(rootPath) ? items : filterByPath(publishedItems, rootPath).items;
      }
    }
    throw new errors.NotFoundError();
  },
});

export default clientService;
