import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { NavigationItemAdditionalField } from '../../../../../schemas';

const externalPathRegexps = [
  /^mailto:[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/,
  /^tel:(\+\d{1,3})?[\s]?(\(?\d{2,3}\)?)?[\s.-]?(\d{3})?[\s.-]?\d{3,4}$/,
  /^#.*/,
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
];

interface FormSchemaBuilderInput {
  isSingleSelected?: boolean;
  additionalFields: Array<NavigationItemAdditionalField>;
}

const navigationItemCommon = ({ additionalFields }: FormSchemaBuilderInput) =>
  z.object({
    title: z.string(),
    autoSync: z.boolean().optional(),
    removed: z.boolean().optional(),
    updated: z.boolean().optional(),
    uiRouterKey: z.string(),
    levelPath: z.string().optional(),
    isMenuAllowedLevel: z.boolean().optional(),
    parentAttachedToMenu: z.boolean().optional(),
    viewId: z.number().optional(),
    structureId: z.string().optional(),
    menuAttached: z.boolean().optional(),
    collapsed: z.boolean().optional(),
    isSearchActive: z.boolean().optional(),
    viewParentId: z.number().optional(),
    id: z.number().optional(),
    audience: z.number().array().optional(),
    order: z.number().optional(),
    items: z.any().array().optional(),
    additionalFields: z.object(
      additionalFields.reduce<
        Record<
          string,
          | z.ZodString
          | z.ZodBoolean
          | z.ZodAny
          | z.ZodArray<z.ZodString>
          | z.ZodOptional<z.ZodString>
          | z.ZodOptional<z.ZodBoolean>
          | z.ZodOptional<z.ZodAny>
          | z.ZodOptional<z.ZodArray<z.ZodString>>
        >
      >((acc, field) => {
        if (typeof field === 'string') {
          return acc;
        }

        switch (field.type) {
          case 'string':
            acc[field.name] = field.required ? z.string() : z.string().optional();
            break;
          case 'boolean':
            acc[field.name] = field.required ? z.boolean() : z.boolean().optional();
          case 'media':
            acc[field.name] = field.required ? z.any() : z.any().optional();
          case 'select': {
            if (field.multi) {
              acc[field.name] = field.required ? z.string().array() : z.string().array().optional();
            } else {
              acc[field.name] = field.required ? z.string() : z.string().optional();
            }

            break;
          }
          default:
            break;
        }

        return acc;
      }, {})
    ),
  });

const navigationInternalItemFormSchema = ({
  additionalFields,
  isSingleSelected,
}: FormSchemaBuilderInput) =>
  navigationItemCommon({
    additionalFields,
    isSingleSelected,
  }).extend({
    type: z.literal('INTERNAL'),
    path: z.string(),
    externalPath: z.string().optional(),
    relatedType: z.string(),
    related: isSingleSelected ? z.number().optional() : z.number(),
  });

const navigationExternalItemFormSchema = ({
  isSingleSelected,
  additionalFields,
}: FormSchemaBuilderInput) =>
  navigationItemCommon({
    additionalFields,
    isSingleSelected,
  }).extend({
    type: z.literal('EXTERNAL'),
    path: z.string().or(z.null()).optional(),
    externalPath: z
      .string()
      .min(1)
      .refine((path) => externalPathRegexps.some((re) => re.test(path))),
    relatedType: z.string().optional(),
    related: z.number().optional(),
  });

export type NavigationItemFormSchema = z.infer<ReturnType<typeof navigationItemFormSchema>>;
const navigationItemFormSchema = (input: FormSchemaBuilderInput) =>
  z.discriminatedUnion('type', [
    navigationExternalItemFormSchema(input),
    navigationInternalItemFormSchema(input),
  ]);

export const useNavigationItemForm = ({
  input,
  current = defaultValues,
}: {
  input: FormSchemaBuilderInput;
  current?: NavigationItemFormSchema;
}) => {
  return useForm({
    resolver: zodResolver(navigationItemFormSchema(input)),
    values: {
      ...defaultValues,
      ...current,
      updated: !!current.id,
    },
  });
};

export const defaultValues: NavigationItemFormSchema = {
  autoSync: true,
  type: 'INTERNAL',
  relatedType: '',
  menuAttached: false,
  title: '',
  externalPath: '',
  path: '',
  additionalFields: {},
  audience: [],
  updated: false,
  uiRouterKey: '',
};
