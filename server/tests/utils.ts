const ignoredProps = new Set(['asymmetricMatch']);

export const asProxy = <T extends any>(base: Partial<T>): T =>
  new Proxy(base as any, {
    get(target: any, property) {
      if (
        typeof property === 'string' &&
        target[property] === undefined &&
        !ignoredProps.has(property)
      ) {
        console.warn(`Property "${property}" unavailable at ${JSON.stringify(target)}`);
      }

      return target[property];
    },
  }) as T;
