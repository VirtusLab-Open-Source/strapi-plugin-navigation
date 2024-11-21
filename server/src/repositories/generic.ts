import { Core, UID } from '@strapi/strapi';
import { parsePopulateQuery } from '../utils';

type PublicationStatus = 'published' | 'draft';

export const getGenericRepository = (context: { strapi: Core.Strapi }, uid: UID.ContentType) => ({
  findFirst(populate: any, status?: PublicationStatus, extra: any = {}) {
    return context.strapi
      .documents(uid)
      .findFirst({ populate: parsePopulateQuery(populate), status, ...extra });
  },

  findById(documentId: string, populate: any, status?: PublicationStatus, extra: any = {}) {
    return context.strapi
      .documents(uid)
      .findOne({ documentId, populate: parsePopulateQuery(populate), status, ...extra });
  },

  findManyById(documentIds: string[], populate: any, status?: PublicationStatus) {
    return context.strapi.documents(uid).findMany({
      where: { documentId: { $in: documentIds } },
      populate: parsePopulateQuery(populate),
      status,
    });
  },

  findMany(where: any, populate: any, status?: PublicationStatus, locale?: string) {
    return context.strapi
      .documents(uid)
      .findMany({ where, populate: parsePopulateQuery(populate), status, locale });
  },

  count(where: Record<string, any>, status?: PublicationStatus) {
    return context.strapi.documents(uid).count({
      where,
      status,
    });
  },
});
