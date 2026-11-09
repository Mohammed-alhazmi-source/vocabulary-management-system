import * as db from "./db.js";
import { renderAllWords } from "./renderer.js";
import { UI } from "./elements.js";

export async function loadMoreWords(lastFetchId, limit = 9) {
  try {
    const items = await db.fetchWordsBatch(lastFetchId, limit);

    if (items.length > 0) {
      renderAllWords(items);
    }

    return items.length;
  } catch (err) {
    console.log(err);
    return 0;
  }
}

export async function updateUIState() {
  try {
    const lastCard = UI.vocabularyGrid.lastElementChild;
    const lastId = lastCard ? Number.parseInt(lastCard.dataset.id) : null;

    const moreExists = await db.hasMoreData(lastId);

    if (moreExists) {
      UI.btnLoadMore.style.display = "flex";
    } else {
      UI.btnLoadMore.style.display = "none";
    }
  } catch (err) {
    UI.btnLoadMore.style.display = "none";
  }
}
