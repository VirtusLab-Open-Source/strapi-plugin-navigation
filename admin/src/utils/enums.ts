export const navigationItemType = {
  INTERNAL: "INTERNAL",
  EXTERNAL: "EXTERNAL",
  WRAPPER: "WRAPPER",
};

export const navigationItemAdditionalFields = {
  AUDIENCE: 'audience',
};

export const ItemTypes = {
  NAVIGATION_ITEM: 'navigationItem'
};

export const ResourceState = {
    RESOLVED: 'RESOLVED',
    LOADING: 'LOADING',
    ERROR: 'ERROR',
};

export const resolvedResourceFor = (value: unknown) => ({
    type: ResourceState.RESOLVED,
    value,
});

export const errorStatusResourceFor = (errors: unknown) => ({
    type: ResourceState.ERROR,
    errors,
});