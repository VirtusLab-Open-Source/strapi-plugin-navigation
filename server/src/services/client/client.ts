import { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { cloneDeep, first, get, isArray, isEmpty, isNil, last, pick } from 'lodash';
import { NavigationError } from '../../app-errors';
import { NavigationItemDTO, RFRNavigationItemDTO, RFRPageDTO } from '../../dtos';
import {
  getNavigationItemRepository,
  getNavigationRepository,
} from '../../repositories';
import { NavigationItemAdditionalField, NavigationItemCustomField } from '../../schemas';
import { assertNotEmpty, getPluginService } from '../../utils';
import {
  ReadAllInput,
  RenderChildrenInput,
  RenderInput,
  RenderRFRInput,
  RenderRFRNavInput,
  RenderRFRPageInput,
  RenderTreeInput,
  RenderTypeInput,
} from './types';
import {
  compareArraysOfNumbers,
  composeItemTitle,
  filterByPath,
  filterOutUnpublished,
} from './utils';

export type ClientService = ReturnType<typeof clientService>;

const clientService = (context: { strapi: Core.Strapi }) => ({
  async readAll({ locale, orderBy = 'createdAt', orderDirection = 'DESC' }: ReadAllInput) {
    const repository = getNavigationRepository(context);

    const navigations = repository.find({
      where: locale
        ? {
          localeCode: locale,
        }
        : {},
      orderBy: { [orderBy]: orderDirection },
    });

    return navigations;
  },

  renderRFRNavigationItem({ item }: RenderRFRNavInput): RFRNavigationItemDTO {
    const { uiRouterKey, title, path, type, audience } = item;

    const itemCommon = {
      label: title,
      type: type,
      audience: audience?.map(({ key }) => key),
    };

    if (type === 'EXTERNAL') {
      assertNotEmpty(
        path,
        new NavigationError("External navigation item's path is undefined", item)
      );

      return {
        ...itemCommon,
        url: path,
      };
    }

    if (type === 'INTERNAL') {
      return {
        ...itemCommon,
        page: uiRouterKey,
      };
    }

    if (type === 'WRAPPER') {
      return {
        ...itemCommon,
      };
    }

    throw new NavigationError('Unknown item type', item);
  },

  renderRFRPage({ item, parent, enabledCustomFieldsNames }: RenderRFRPageInput): RFRPageDTO {
    const { documentId, uiRouterKey, title, path, related, type, audience, menuAttached } = item;

    return {
      id: uiRouterKey,
      documentId,
      title,
      related:
        type === 'INTERNAL' && related?.documentId && related?.uid
          ? {
            contentType: related.uid,
            documentId: related.documentId,
          }
          : undefined,
      path,
      parent,
      audience,
      menuAttached,
      ...enabledCustomFieldsNames.reduce(
        (acc, field) => ({ ...acc, [field]: get(item, field) }),
        {}
      ),
    };
  },

  renderRFR({
    items,
    parent,
    parentNavItem,
    contentTypes = [],
    enabledCustomFieldsNames,
  }: RenderRFRInput) {
    const navItems: RFRNavigationItemDTO[] = [];

    let nav = {};
    let pages = {};

    items.forEach((item) => {
      const { items: itemChildren, ...restOfItem } = item;

      const itemNav = this.renderRFRNavigationItem({
        item: restOfItem,
      });
      const itemPage = this.renderRFRPage({
        item: restOfItem,
        parent,
        enabledCustomFieldsNames,
      });

      if (item.type !== 'EXTERNAL') {
        pages = {
          ...pages,
          [itemPage.documentId]: {
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
        const navigationLevel = navItems.filter((navItem) => navItem.type !== 'EXTERNAL');

        if (!isEmpty(navigationLevel))
          nav = {
            ...nav,
            [parent]: navigationLevel.concat(parentNavItem ? parentNavItem : []),
          };
      }

      if (!isEmpty(itemChildren)) {
        const { nav: nestedNavs } = this.renderRFR({
          items: itemChildren ?? [],
          parent: itemPage.documentId,
          parentNavItem: itemNav,
          contentTypes,
          enabledCustomFieldsNames,
        });
        const { pages: nestedPages } = this.renderRFR({
          items: itemChildren?.filter((child) => child.type !== 'EXTERNAL') || [],
          parent: itemPage.documentId,
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

  renderTree({
    items = [],
    documentId,
    path = '',
    itemParser = (i: NavigationItemDTO) => Promise.resolve(i),
  }: RenderTreeInput): Promise<NavigationItemDTO[]> {
    return Promise.all(
      items.reduce((acc, item) => {
        if (item.parent?.documentId === documentId && filterOutUnpublished(item)) {
          acc.push(itemParser(cloneDeep(item), path));
        }

        return acc;
      }, [] as Promise<NavigationItemDTO>[])
    ).then((result) =>
      result.sort((x, y) => {
        if (x.order !== undefined && y.order !== undefined) {
          return x.order - y.order;
        }

        return 0;
      })
    );
  },

  getCustomFields(additionalFields: NavigationItemAdditionalField[]): NavigationItemCustomField[] {
    return additionalFields.reduce<NavigationItemCustomField[]>((acc, field) => {
      if (field !== 'audience') {
        acc.push(field);
      }

      return acc;
    }, []);
  },

  async renderType({
    criteria = {},
    filter,
    itemCriteria = {},
    locale,
    populate,
    rootPath,
    type = 'FLAT',
    wrapRelated,
  }: RenderTypeInput) {
    const adminService = getPluginService(context, 'admin');
    const commonService = getPluginService(context, 'common');
    const entityWhereClause = {
      ...criteria,
      visible: true,
    };

    const navigationRepository = getNavigationRepository(context);
    const navigationItemRepository = getNavigationItemRepository(context);

    let navigation = await navigationRepository.findOne({
      where: entityWhereClause,
    });

    if (locale && locale !== navigation.localeCode) {
      navigation = await navigationRepository.findOne({
        where: {
          ...entityWhereClause,
          localeCode: locale,
        },
      });
    }

    console.log('navigation', navigation);

    if (navigation && navigation.documentId) {
      const navigationItems = await navigationItemRepository.find({
        where: {
          master: navigation,
          ...itemCriteria,
        },
        limit: Number.MAX_SAFE_INTEGER,
        order: [{ order: 'asc' }],
        populate: ['related', 'audience', 'parent'],
      });

      console.log('navigationItems', navigationItems);

      const mappedItems = await commonService.mapToNavigationItemDTO({
        navigationItems,
        populate,
        master: navigation,
      });

      console.log('mappedItems', mappedItems);

      const { contentTypes, contentTypesNameFields, additionalFields } = await adminService.config({
        viaSettingsPage: false,
      });

      const enabledCustomFieldsNames = this.getCustomFields(additionalFields).reduce<string[]>(
        (acc, curr) => (curr.enabled ? [...acc, curr.name] : acc),
        []
      );

      const wrapContentType = (itemContentType: any) =>
        wrapRelated && itemContentType
          ? {
            documentId: itemContentType.documentId,
            attributes: { ...itemContentType },
          }
          : itemContentType;

      const mediaFields = ['name', 'url', 'mime', 'width', 'height', 'previewUrl'] as const;
      const customFieldsDefinitions = additionalFields.filter(
        (_) => typeof _ !== 'string'
      ) as NavigationItemCustomField[];

      switch (type) {
        case 'TREE':
        case 'RFR':
          const itemParser = async (
            item: NavigationItemDTO,
            path = ''
          ): Promise<NavigationItemDTO> => {
            const isExternal = item.type === 'EXTERNAL';
            const parentPath = isExternal
              ? undefined
              : `${path === '/' ? '' : path}/${first(item.path) === '/' ? item.path!.substring(1) : item.path
              }`;
            const slug =
              typeof parentPath === 'string'
                ? await commonService.getSlug({
                  query: (first(parentPath) === '/'
                    ? parentPath.substring(1)
                    : parentPath
                  ).replace(/\//g, '-'),
                })
                : undefined;
            const lastRelated = isArray(item.related) ? last(item.related) : item.related;
            const relatedContentType = wrapContentType(lastRelated);
            const customFields = enabledCustomFieldsNames.reduce((acc, field) => {
              const mapper =
                customFieldsDefinitions.find(({ name }) => name === field)?.type === 'media'
                  ? (_: string) => pick(JSON.parse(_), mediaFields)
                  : (_: string) => _;
              const content = get(item, `additionalFields.${field}`);

              return { ...acc, [field]: content ? mapper(content as string) : content };
            }, {});

            return {
              id: item.id,
              documentId: item.documentId,
              title:
                composeItemTitle(item, contentTypesNameFields, contentTypes) ?? 'Title missing',
              menuAttached: item.menuAttached,
              order: item.order,
              path: (isExternal ? item.externalPath : parentPath) ?? 'Path is missing',
              type: item.type,
              uiRouterKey: item.uiRouterKey,
              slug:
                !slug && item.uiRouterKey
                  ? await commonService.getSlug({ query: item.uiRouterKey })
                  : slug,
              related:
                isExternal || !lastRelated
                  ? undefined
                  : {
                    ...relatedContentType,
                  },
              audience: !isEmpty(item.audience) ? item.audience : undefined,
              items: isExternal
                ? []
                : await this.renderTree({
                  itemParser,
                  path: parentPath,
                  documentId: item.documentId,
                  items: mappedItems,
                }),
              collapsed: item.collapsed,
              ...customFields,
            };
          };

          console.log('rootPath', rootPath);
          console.log('mappedItems', mappedItems);

          const { items: itemsFilteredByPath, root: rootElement } = filterByPath(
            mappedItems,
            rootPath
          );

          console.log('itemsFilteredByPath', itemsFilteredByPath);
          console.log('rootElement', rootElement);

          const treeStructure = (await this.renderTree({
            itemParser,
            items: isNil(rootPath) ? mappedItems : itemsFilteredByPath,
            path: rootElement?.parent?.path,
            documentId: rootElement?.parent?.documentId,
          })) as NavigationItemDTO[];

          console.log('treeStructure', treeStructure);

          const filteredStructure = filter
            ? treeStructure.filter((item: NavigationItemDTO) => item.uiRouterKey === filter)
            : treeStructure;

          console.log('filteredStructure', filteredStructure);

          if (type === 'RFR') {
            return this.renderRFR({
              items: filteredStructure,
              contentTypes: contentTypes.map((_) => _.contentTypeName),
              enabledCustomFieldsNames,
            });
          }
          return filteredStructure;
        default:
          const publishedItems = mappedItems.filter(filterOutUnpublished);
          const result = isNil(rootPath)
            ? mappedItems
            : filterByPath(publishedItems, rootPath).items;

          const defaultCache = new Map<string, Array<number>>();
          const getNestedOrders = (
            documentId: string,
            cache: Map<string, Array<number>> = defaultCache
          ): Array<number> => {
            const cached = cache.get(documentId);
            if (!isNil(cached)) return cached;

            const item = result.find((item) => item.documentId === documentId);

            if (isNil(item)) return [];

            const { order, parent } = item;

            const nestedOrders = parent ? getNestedOrders(parent.documentId, cache).concat(order) : [order];

            cache.set(documentId, nestedOrders);

            return nestedOrders;
          };

          return result
            .map(({ additionalFields, ...item }: NavigationItemDTO) => {
              const customFields = enabledCustomFieldsNames.reduce((acc, field) => {
                const mapper =
                  customFieldsDefinitions.find(({ name }) => name === field)?.type === 'media'
                    ? (_: string | boolean) => pick(JSON.parse(_.toString()), mediaFields)
                    : (_: string | boolean) => _;
                const content = get(additionalFields, field);

                return {
                  ...acc,
                  [field]: content
                    ? mapper(typeof content === 'boolean' ? content : content.toString())
                    : content,
                };
              }, {});

              return {
                ...item,
                audience: item.audience?.map((_) => _.key),
                title:
                  composeItemTitle(
                    { ...item, additionalFields },
                    contentTypesNameFields,
                    contentTypes
                  ) || '',
                related: wrapContentType(item.related),
                items: null,
                ...customFields,
              };
            })
            .sort((a, b) => compareArraysOfNumbers(getNestedOrders(a.documentId), getNestedOrders(b.documentId)));
      }
    }

    throw new errors.NotFoundError();
  },

  renderChildren({
    childUIKey,
    idOrSlug,
    locale,
    menuOnly,
    type = 'FLAT',
    wrapRelated,
  }: RenderChildrenInput) {
    const criteria = { $or: [{ documentId: idOrSlug }, { slug: idOrSlug }] };
    const filter = type === 'FLAT' ? undefined : childUIKey;
    const itemCriteria = {
      ...(menuOnly && { menuAttached: true }),
      ...(type === 'FLAT' ? { uiRouterKey: childUIKey } : {}),
    };

    return this.renderType({
      type,
      criteria,
      itemCriteria,
      filter,
      wrapRelated,
      locale,
    });
  },

  render({
    idOrSlug,
    locale,
    menuOnly,
    populate,
    rootPath,
    type = 'FLAT',
    wrapRelated,
  }: RenderInput) {
    const criteria = { $or: [{ documentId: idOrSlug }, { slug: idOrSlug }] };
    const itemCriteria = menuOnly ? { menuAttached: true } : {};

    return this.renderType({
      type,
      criteria,
      itemCriteria,
      rootPath,
      wrapRelated,
      locale,
      populate,
    });
  },
});

export default clientService;
