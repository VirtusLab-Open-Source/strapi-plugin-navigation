import { Core, UID } from '@strapi/strapi';

type PublicationStatus = 'published' | 'draft';

export const getGenericRepository = (context: { strapi: Core.Strapi }, uid: UID.ContentType) => ({
  findById(documentId: string, populate: any, status?: PublicationStatus) {
    return context.strapi.documents(uid).findOne({ documentId, populate, status });
  },

  findManyById(documentIds: string[], populate: any, status?: PublicationStatus) {
    return context.strapi.documents(uid).findMany({ where: { documentId: { $in: documentIds } }, populate, status });
  },

  findMany(where: any, populate: any, status?: PublicationStatus) {
    return context.strapi.documents(uid).findMany({ where, populate, status});
  },

  count(where: Record<string, any>, status?: PublicationStatus) {
    return context.strapi.documents(uid).count({
      where,
      status,
    });
  },
});
