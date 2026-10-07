var VelfileHandoff = (function () {

  const DB_NAME = "velfile";
  const STORE = "handoff";
  const KEY = "files";

  function openDB() {
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = function () {
        request.result.createObjectStore(STORE);
      };

      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  // Simpan daftar file (dipanggil dari halaman utama)
  async function save(files) {
    try {
      const db = await openDB();

      await new Promise(function (resolve, reject) {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(files, KEY);
        tx.oncomplete = resolve;
        tx.onerror = function () { reject(tx.error); };
      });

      db.close();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Ambil file lalu hapus dari penyimpanan (dipanggil dari halaman tool)
  async function take() {
    try {
      const db = await openDB();

      const files = await new Promise(function (resolve, reject) {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        const request = store.get(KEY);

        request.onsuccess = function () {
          store.delete(KEY);
        };

        tx.oncomplete = function () {
          resolve(request.result || []);
        };

        tx.onerror = function () { reject(tx.error); };
      });

      db.close();
      return files;
    } catch (error) {
      return [];
    }
  }

  return { save: save, take: take };

})();
