import { NavigationDBSchema } from '../schemas';
import { NavigationItemDTO } from './navigation-item';

export type NavigationDTO = Omit<NavigationDBSchema, 'items'> & {
  items?: NavigationItemDTO[];
};
