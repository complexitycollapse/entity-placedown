let cache = undefined;

export default function getCache() { return cache; }
export function initCache(api, instrumentation) {
  cache = SimpleCache(api, instrumentation);
  return cache;
}

function SimpleCache(api, instrumentation) {
  let filenamesPromise = undefined;
  let filenamesList = undefined;
  const leaves = new Map();
  let promises = undefined;

  function loadCache() {
    if (promises) { return; }

    promises = new Map();

    for (const name of filenamesList) {
      promises.set(name, api.loadFile(name).then(content => {
        leaves.set(name, content);
        promises.delete(name);
        if (instrumentation) {
          console.log("Cache: loaded", name);
        }

        return content;
      }));
    }
  }

  function filenames() {
    if (filenamesPromise) { return filenamesPromise; }

    filenamesPromise = (async () => {
      if (!filenamesList) {
        filenamesList = await api.loadFiles();
        if (instrumentation) {
          console.log("Cache: loaded file list", filenamesList);
        }
        loadCache(); // Don't await. Let them load in the background.
      }
      return filenamesList;
    })();

    return filenamesPromise;
  }

  return {
    filenames,

    get: async function(name) {
      await filenames();
      if (leaves.has(name)) { return leaves.get(name); }
      if (promises.has(name)) {
        return await promises.get(name);
      }
      throw new Error("Cache miss! Item not found: " + name);
    }
  };
}
