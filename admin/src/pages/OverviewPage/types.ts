import { NavigationSchema } from '../../api/validators';

export type Navigation = Pick<
  NavigationSchema,
  'id' | 'items' | 'name' | 'locale' | 'visible' | 'documentId' | 'slug'
>;

export type NewNavigation = Omit<Navigation, 'id' | 'documentId' | 'slug'>;
