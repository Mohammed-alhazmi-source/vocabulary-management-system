import theme from "./theme.js";
import * as dbObj from "./db.js";
import * as Util from "./utilites.js";
import { UI } from "./elements.js";
import * as rendererObj from "./renderer.js";
import { loadMoreWords, updateUIState } from "./pagination.js";
import createWordCard from "./createWordCard.js";

async function initApp() {
  try {
    // let year = new Date().getFullYear();
    // UI.year.textContent = year;
    // year = null;

    await dbObj.openDatabase();
    const items = await dbObj.fetchWordsBatch(null, 9);

    if (!items.length) {
      Util.messageDuringEmptyCards();
      UI.searchInput.readOnly = "true";
      return;
    }

    UI.searchInput.focus();

    UI.vocabularyGrid.style.display = "grid";
    UI.vocabularyGrid.innerHTML = "";
    rendererObj.renderAllWords(items);
    await updateUIState();
  } catch (err) {
    console.log("Failed to initialize application:", err);
  }
}

await initApp();

UI.btnAddWordCard.addEventListener("click", () => {
  UI.wordFormDialog.dataset.id = "Add";
  Util.openWordFromDialog();
});

UI.wordFormDialog.addEventListener("click", (e) => {
  if (e.target.closest("#word-form-dialog")) {
    if (
      e.target.closest("#btn-close-form-dialog") ||
      e.target.matches("#btn-cancel-dialog")
    ) {
      Util.closeWordFromDialog();
    }
  }
});

UI.btnCancelConfirmDialog.addEventListener("click", (e) => {
  e.target.dataset.id = undefined;
  Util.closeConfirmDeleteWordFormDialog();
});

UI.btnCloseFormConfirmDialog.addEventListener("click", (e) => {
  e.target.dataset.id = undefined;
  Util.closeConfirmDeleteWordFormDialog();
});

UI.btnLoadMore.addEventListener("click", async (e) => {
  const lastCard = UI.vocabularyGrid.lastElementChild;
  const lastId = lastCard ? Number.parseInt(lastCard.dataset.id) : null;

  await loadMoreWords(lastId);
  await updateUIState();
});

UI.btnCloseDetailsDialog.addEventListener("click", () =>
  Util.closeWordDetailsDialog(),
);

UI.btnCloseDetailsFooter.addEventListener("click", () =>
  Util.closeWordDetailsDialog(),
);

UI.wordImageInput.addEventListener("change", (e) => {
  Util.setPreviewImage(UI.previewImage, e.target.files[0]);
});

UI.btnRemoveImage.addEventListener("click", () => {
  Util.setPreviewImage(UI.previewImage, null);
  UI.previewImage.src = "";
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!UI.uploadDropzone.contains(e.target)) {
    e.dataTransfer.dropEffect = "none";
  }
});
document.addEventListener("drop", (e) => {
  e.preventDefault();
});

UI.uploadDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
});
UI.uploadDropzone.addEventListener("drop", (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];

  if (file && file.type.startsWith("image/")) {
    const dt = new DataTransfer();
    dt.items.add(file);
    UI.wordImageInput.files = dt.files;
    Util.setPreviewImage(UI.previewImage, UI.wordImageInput.files[0]);
    UI.previewImage.src = URL.createObjectURL(file);
  }
});

UI.examplesListContainer.addEventListener("click", (e) => {
  if (!e.target.closest(".btn-remove-example")) return;

  const parent = e.target.closest(".example-item-row");
  parent.remove();
  if (UI.examplesListContainer.children.length === 1) {
    UI.examplesEmptyMessage.style.display = "block";
  }
  UI.exampleSentenceInput.focus();
});

UI.exampleSentenceInput.addEventListener("keydown", (e) => {
  let elementExample;
  if (e.key === "Enter" && UI.exampleSentenceInput.value) {
    elementExample = Util.exampleCard(UI.exampleSentenceInput.value);
    UI.examplesListContainer.append(elementExample);
    UI.examplesEmptyMessage.style.display = "none";
    UI.exampleSentenceInput.value = "";
  }
});

function updateCardState(card, updateWord) {
  if (!card || !card.matches(".vocab-card")) return;

  const img = card.querySelector(".card-image");
  img.src = Util.resolveImageSource(updateWord.wordImage);

  const wordTitle = card.querySelector(".card-word-title");
  wordTitle.textContent = updateWord.word;

  const sentencePreview = card.querySelector(".card-sentence-preview");
  sentencePreview.textContent = updateWord.examples.size
    ? updateWord.examples.values().next().value
    : "No example";
}

UI.btnSaveWord.addEventListener("click", async (e) => {
  try {
    if (UI.vocabEntryForm.checkValidity()) {
      if (UI.wordFormDialog.dataset.id === "Add") {
        const examplesOfWord = Util.getArrayOfExamplesWord();

        const newItem = {
          word: UI.wordInput.value,
          wordImage:
            UI.wordImageInput.files[0] ||
            "assets/assets/images/default_img.svg",
          examples: new Set(examplesOfWord),
        };

        await dbObj.addItem(newItem);

        // تنظيف صورة الكلمة لمنع التسريب عند الإغلاق
        if (UI.previewImage && UI.previewImage.src.startsWith("blob:")) {
          URL.revokeObjectURL(UI.previewImage.src);
          UI.previewImage.src = "";
        }

        Util.cleanAddEditDialog();
        Util.closeWordFromDialog();

        UI.searchInput.readOnly = "";

        UI.vocabularyGrid.style.display = "grid";
        UI.vocabularyGrid.innerHTML = "";
        const lastItems = await loadMoreWords(null);

        if (lastItems) {
          rendererObj.renderAllWords(lastItems);
        }

        await updateUIState();
      } else {
        const wordId = e.target.dataset.id;

        // جلب البيانات القديمة لضمان عدم ضياع الصورة القديمة إذا لم يرفع المستخدم صورة جديدة
        const existingData = await dbObj.getItemById(wordId);
        const examplesOfWord = Util.getArrayOfExamplesWord();

        const updateWord = {
          id: e.target.dataset.id,
          word: UI.wordInput.value.trim(),
          // إذا لم يتم اختيار صورة جديدة، نحتفظ بالصورة القديمة الموجودة مسبقاً في الداتا بيس
          wordImage: UI.wordImageInput.files[0] || existingData.wordImage,
          examples: new Set(examplesOfWord),
        };

        await dbObj.updateItem(updateWord);
        updateCardState(UI.eventTargetCard, updateWord); // تحديث البطاقة

        e.target.dataset.id = undefined;
        Util.closeWordFromDialog();
      }
    } else {
      UI.vocabEntryForm.reportValidity();
      UI.wordInput.focus();
    }
  } catch (err) {
    console.log(err);
  }
});

UI.vocabularyGrid.addEventListener("click", async (e) => {
  try {
    const actionButton = e.target.closest("[data-action]");

    if (!actionButton) return;

    const action = actionButton.dataset.action;

    const card = actionButton.closest(".vocab-card");
    UI.eventTargetCard = card;
    const wordId = card ? card.dataset.id : null;

    if (!wordId) return;

    if (action === "view") {
      const wordData = await dbObj.getItemById(wordId);
      console.table(wordData);
      rendererObj.renderWordDetails(wordData);
      Util.openWordDetailsDialog();
    } else if (action === "edit") {
      const wordData = await dbObj.getItemById(wordId);
      if (wordData.wordImage instanceof Blob) {
        const dt = new DataTransfer();
        dt.items.add(wordData.wordImage);
        UI.wordImageInput.files = dt.files;
      }
      rendererObj.renderWordForEdit(wordData);
      UI.wordFormDialog.dataset.id = "edit";
      UI.btnSaveWord.dataset.id = wordId;
      Util.openWordFromDialog();
    } else if (action === "delete") {
      UI.btnDeleteWord.dataset.id = wordId;
      Util.openConfirmDeleteWordFormDialog();
    }
  } catch (err) {
    console.log(err);
  }
});

async function deleteCard(id) {
  try {
    if (!id) return;

    await dbObj.deleteItem(id);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

UI.btnDeleteWord.addEventListener("click", async (e) => {
  const deleted = await deleteCard(e.target.dataset.id);
  if (deleted) {
    e.target.dataset.id = undefined;

    // الخاص بالصورة تجنبا لتسريب في الذاكرة URL تحرير مساحة لكائن
    const imgElement = UI.eventTargetCard.querySelector(".card-image");
    if (imgElement && imgElement.src.startsWith("blob:")) {
      URL.revokeObjectURL(imgElement.src);
    }

    UI.eventTargetCard.remove();
    UI.eventTargetCard = undefined;

    const lastCard = UI.vocabularyGrid.lastElementChild;
    const lastId = lastCard ? Number.parseInt(lastCard.dataset.id) : null;

    await loadMoreWords(lastId, 1);

    if (UI.btnLoadMore.style.display !== "none") {
      await updateUIState();
    }
  }
  Util.closeConfirmDeleteWordFormDialog();

  if (!UI.vocabularyGrid.children.length) {
    UI.searchInput.readOnly = "";
    Util.messageDuringEmptyCards();
  }
});

let debounceTimer = null;
UI.searchInput.addEventListener("input", async () => {
  const query = UI.searchInput.value.trim();
  clearTimeout(debounceTimer);

  if (!query) {
    const items = await dbObj.fetchWordsBatch(null, 9);
    UI.vocabularyGrid.innerHTML = "";
    if (items) {
      rendererObj.renderAllWords(items);
    }

    await updateUIState();
    return;
  }

  debounceTimer = setTimeout(async () => {
    const items = await dbObj.searchWords(query);
    UI.vocabularyGrid.innerHTML = "";

    if (!items.length) {
      UI.vocabularyGrid.textContent = `not found any vocabluary containse '${UI.searchInput.value}'`;
    } else {
      rendererObj.renderAllWords(items);
    }
    UI.btnLoadMore.style.display = "none";
  }, 400);
});
