let db;

export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("VocabularySite", 1);

    request.onsuccess = function (e) {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = function (e) {
      reject("Error opening database: " + e.target.error);
    };

    request.onupgradeneeded = function (e) {
      db = e.target.result;

      const wordStore = db.createObjectStore("words", {
        keyPath: "id",
        autoIncrement: true,
      });

      wordStore.createIndex("wordIndex", "word", { unique: true });
    };
  });
}

export function fetchAllItemsFromDB() {
  let allItems = [];

  return new Promise((resolve, reject) => {
    const tx = db.transaction("words", "readonly");
    const store = tx.objectStore("words");
    const req = store.openCursor();

    req.onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        allItems.push(cursor.value);
        cursor.continue();
      }
    };

    req.onerror = function (e) {
      reject("Error fetching items:" + e.target.error);
    };

    tx.oncomplete = () => {
      resolve(allItems);
    };
  });
}

export function fetchWordsBatch(lastId, limit = 9) {
  return new Promise((resolve, reject) => {
    let tx = db.transaction("words", "readonly");
    let store = tx.objectStore("words");

    let range = lastId ? IDBKeyRange.upperBound(lastId, true) : null;
    let request = store.openCursor(range, "prev");
    let batch = [];

    request.onsuccess = function (e) {
      let cursor = e.target.result;

      if (cursor && batch.length < limit) {
        batch.push(cursor.value);
        cursor.continue();
      } else {
        resolve(batch);
      }
    };

    request.onerror = function (e) {
      reject("Failed Fetch Words Batch : " + e.target.error);
    };
  });
}

export function hasMoreData(lastId) {
  return new Promise((resolve, reject) => {
    let tx = db.transaction("words", "readonly");
    let store = tx.objectStore("words");
    const range = lastId ? IDBKeyRange.upperBound(lastId, true) : null;

    // نفتح مؤشر ونطلب سجلاً واحداً فقط لنرى هل هو موجود أم لا
    let request = store.openCursor(range, "prev");

    request.onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        resolve(true);
      } else {
        resolve(false);
      }
    };

    request.onerror = function (e) {
      reject("Error checking more data: " + e.target.error);
    };
  });
}

export function addItem(newWord) {
  return new Promise((resolve, reject) => {
    let tx = db.transaction("words", "readwrite");
    let store = tx.objectStore("words");

    const request = store.add({
      word: newWord.word,
      wordImage: newWord.wordImage,
      examples: newWord.examples,
    });

    request.onsuccess = function (e) {
      resolve(e.target.result);
    };

    request.onerror = function (e) {
      reject("Failed Add item : " + e.target.error);
    };
  });
}

export function updateItem(updatedWord) {
  return new Promise((resolve, reject) => {
    let tx = db.transaction("words", "readwrite");
    let store = tx.objectStore("words");

    const primaryId = Number.parseInt(updatedWord.id);
    const request = store.put({
      id: primaryId,
      word: updatedWord.word,
      wordImage: updatedWord.wordImage,
      examples: updatedWord.examples,
    });

    request.onsuccess = function (e) {
      resolve(true);
    };

    request.onerror = function (e) {
      reject(e.target.error);
    };
  });
}

export function deleteItem(itemId) {
  return new Promise((resolve, reject) => {
    let tx = db.transaction("words", "readwrite");
    let store = tx.objectStore("words");

    const id = Number.parseInt(itemId);

    const request = store.delete(id);

    request.onsuccess = function (e) {
      resolve(true);
    };

    request.onerror = function (e) {
      reject(false);
    };
  });
}

export function getItemById(itemId) {
  return new Promise((resolve, reject) => {
    let tx = db.transaction("words", "readonly");
    let store = tx.objectStore("words");

    const id = Number.parseInt(itemId);

    const req = store.get(id);

    req.onsuccess = function (e) {
      const wordId = e.target.result;
      resolve(wordId);
    };

    req.onerror = function (e) {
      reject("Not Found id : ", e.target.error);
    };
  });
}

export function searchWords(word) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("words", "readonly");
    const store = tx.objectStore("words");
    let words = [];

    const wordIndex = store.index("wordIndex");

    const request = wordIndex.openCursor();

    request.onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        if (cursor.value.word.toLowerCase().includes(word.toLowerCase())) {
          words.push(cursor.value);
        }

        cursor.continue();
      }
    };

    request.onerror = function (e) {
      reject("Failed not any words : " + e.target.error);
    };

    tx.oncomplete = () => {
      resolve(words);
    };
  });
}
