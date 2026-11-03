const resources = new Map();
let cacheGeneration = 0;

function getResource(key) {
  if (!resources.has(key)) {
    resources.set(key, {
      snapshot: {
        data: undefined,
        error: null,
        isLoading: false,
        updatedAt: 0,
      },
      promise: null,
      requestVersion: 0,
      listeners: new Set(),
    });
  }

  return resources.get(key);
}

function notify(resource) {
  resource.listeners.forEach((listener) => listener());
}

export function getResourceSnapshot(key) {
  return getResource(key).snapshot;
}

export function subscribeToResource(key, listener) {
  const resource = getResource(key);
  resource.listeners.add(listener);

  return () => resource.listeners.delete(listener);
}

export function loadResource(key, fetcher, staleTime) {
  const resource = getResource(key);
  const { snapshot } = resource;

  if (
    snapshot.data !== undefined &&
    Date.now() - snapshot.updatedAt < staleTime
  ) {
    return Promise.resolve(snapshot.data);
  }

  if (resource.promise) {
    return resource.promise;
  }

  const generation = cacheGeneration;
  const requestVersion = resource.requestVersion;
  resource.snapshot = {
    ...snapshot,
    error: null,
    isLoading: snapshot.data === undefined,
  };
  notify(resource);

  const request = fetcher()
    .then((data) => {
      if (
        generation === cacheGeneration &&
        requestVersion === resource.requestVersion &&
        resources.get(key) === resource
      ) {
        resource.snapshot = {
          data,
          error: null,
          isLoading: false,
          updatedAt: Date.now(),
        };
        notify(resource);
      }

      return data;
    })
    .catch((error) => {
      if (
        generation === cacheGeneration &&
        requestVersion === resource.requestVersion &&
        resources.get(key) === resource
      ) {
        resource.snapshot = {
          ...resource.snapshot,
          error,
          isLoading: false,
        };
        notify(resource);
      }

      throw error;
    })
    .finally(() => {
      if (resources.get(key) === resource && resource.promise === request) {
        resource.promise = null;
      }
    });

  resource.promise = request;
  return request;
}

export function updateCachedResource(key, update) {
  const resource = getResource(key);

  if (resource.snapshot.data === undefined) {
    return;
  }

  const data =
    typeof update === 'function' ? update(resource.snapshot.data) : update;

  resource.requestVersion += 1;
  resource.promise = null;
  resource.snapshot = {
    data,
    error: null,
    isLoading: false,
    updatedAt: Date.now(),
  };
  notify(resource);
}

export function invalidateResource(key) {
  const resource = resources.get(key);

  if (!resource || resource.snapshot.data === undefined) {
    return;
  }

  resource.requestVersion += 1;
  resource.promise = null;
  resource.snapshot = {
    ...resource.snapshot,
    error: null,
    updatedAt: 0,
  };
  notify(resource);
}

export function clearResourceCache() {
  cacheGeneration += 1;
  resources.forEach(notify);
  resources.clear();
}
