import { isNil } from "lodash";
import { useMemo } from "react";
import { UseQueryResult } from "react-query";

type LoadingState = { state: typeof ResourceState.LOADING };
type ErrorState<T extends unknown = unknown> = {
  state: typeof ResourceState.ERROR;
  error: T;
};
type ResolvedState<T> = { state: typeof ResourceState.RESOLVED; value: T };

export type ResourceState<
  TValue extends unknown = unknown,
  TError extends unknown = unknown
> = LoadingState | ErrorState<TError> | ResolvedState<TValue>;

export const navigationItemType = {
  INTERNAL: "INTERNAL",
  EXTERNAL: "EXTERNAL",
  WRAPPER: "WRAPPER",
};

export const navigationItemAdditionalFields = {
  AUDIENCE: "audience",
};

export const ItemTypes = {
  NAVIGATION_ITEM: "navigationItem",
};

export const ResourceState = {
  RESOLVED: "RESOLVED",
  LOADING: "LOADING",
  ERROR: "ERROR",
} as const;

export const resolvedResourceFor = <T = unknown>(
  value: T
): ResourceState<T, never> => ({
  state: ResourceState.RESOLVED,
  value,
});

export const errorStatusResourceFor = <T extends unknown>(
  error: T
): ResourceState<never, T> => ({
  state: ResourceState.ERROR,
  error,
});

export const loadingStatusResource = (): ResourceState<never, never> => ({
  state: ResourceState.LOADING,
});

export const mapUseQueryResourceToState = <T, U>(
  resource: UseQueryResult<T, U>
): ResourceState<T, U> => {
  const errorState = useMemo(
    () => errorStatusResourceFor(resource.error!),
    [resource.error]
  );
  const loadingState = useMemo(() => loadingStatusResource(), []);
  const successState = useMemo(
    () => resolvedResourceFor(resource.data!),
    [resource.data]
  );

  if (resource.error) {
    return errorState;
  }

  if (resource.isLoading || isNil(resource.data)) {
    return loadingState;
  }

  return successState;
};
