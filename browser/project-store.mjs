const DATABASE = 'laser-link-local-projects';
const STORE = 'projects';
let connection;

function database() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('Browser project storage is unavailable.'));
  if (!connection) {
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return connection;
}

export async function saveLocalProject(record) {
  const db = await database();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(record);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function listLocalProjects() {
  const db = await database();
  const records = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return records.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function removeLocalProjects(ids) {
  const db = await database();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    for (const id of ids) transaction.objectStore(STORE).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
