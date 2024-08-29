import { Core, UID } from '@strapi/strapi';

export const getGenericRepository = (context: { strapi: Core.Strapi }, uid: UID.Schema) => ({
  findById(id: number, populate: any) {
    return context.strapi.query(uid).findOne({ where: { id }, populate });
  },

  findManyById(ids: number[], populate: any) {
    return context.strapi.query(uid).findMany({ where: { id: { $in: ids } }, populate });
  },

  findMany(where: any, populate: any) {
    return context.strapi.query(uid).findMany({ where, populate });
  },

  count(where: Record<string, any>) {
    return context.strapi.query(uid).count({
      where,
    });
  },
});
