import { UI } from "./elements.js";

export function openWordFromDialog() {
  if (UI.wordFormDialog.dataset.id === "Add") {
    UI.wordFormDialogTitle.textContent = "Add New Word";
    cleanAddEditDialog();
  }

  UI.wordFormDialog.showModal();
  UI.wordInput.focus();
}

export function openWordDetailsDialog() {
  UI.wordDetailsDialog.showModal();
  UI.btnCloseDetailsDialog.focus();
}

export function closeWordFromDialog() {
  if (UI.wordFormDialog.dataset.id === "Add") {
    cleanAddEditDialog();
  } else {
    UI.wordFormDialog.dataset.id = undefined;
  }

  // تنظيف صورة الكلمة لمنع التسريب عند الإغلاق
  if (UI.previewImage && UI.previewImage.src.startsWith("blob:")) {
    URL.revokeObjectURL(UI.previewImage.src);
    UI.previewImage.src = "";
  }

  UI.wordImageInput.value = "";
  UI.wordFormDialog.close();
  UI.searchInput.focus();
  UI.msgError.style.display = "none";
}

export function closeWordDetailsDialog() {
  // تنظيف صورة الكلمة لمنع التسريب عند الإغلاق
  if (UI.viewDialogImage && UI.viewDialogImage.src.startsWith("blob:")) {
    URL.revokeObjectURL(UI.viewDialogImage.src);
    UI.viewDialogImage.src = "";
  }
  UI.wordDetailsDialog.close();
  UI.searchInput.focus();
}

export function openConfirmDeleteWordFormDialog() {
  UI.confirmDeleteWordFormDialog.showModal();
}

export function closeConfirmDeleteWordFormDialog() {
  UI.confirmDeleteWordFormDialog.close();
}

export function messageDuringEmptyCards(msg = "No words yet. Add your first vocabulary!") {
  UI.vocabularyGrid.style.display = "flex";
  UI.vocabularyCardsGrid.style.margin = "auto";
  UI.vocabularyGrid.style.justifyContent = "center";
  UI.vocabularyGrid.style.alignItems = "center";

  const div = document.createElement("div");
  div.classList.add("fade-text");
  div.textContent = msg;

  UI.vocabularyGrid.append(div);
}

export function cleanAddEditDialog() {
  UI.wordInput.value = "";
  UI.previewImage.src = "";
  UI.exampleSentenceInput.value = "";
  cleanExamplesSentenceInput();
  UI.wordInput.focus();
}

export function exampleCard(example) {
  let div = document.createElement("div");
  div.classList.add("example-item-row");

  const exampleItemText = document.createElement("span");
  exampleItemText.classList.add("example-item-text");
  exampleItemText.textContent = example;

  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("btn-remove-example");
  button.innerHTML = `
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>`;

  div.append(exampleItemText, button);

  return div;
}

export function cleanExamplesSentenceInput() {
  // queueMicrotask(() => {
  //   for (let i = 0; i < UI.examplesListContainer.children.length; i++) {
  //     if (UI.examplesListContainer.children[i].localName === "div") {
  //       UI.examplesListContainer.removeChild(
  //         UI.examplesListContainer.children[i],
  //       );
  //       i--;
  //     }
  //   }
  //   UI.examplesListContainer.innerHTML = "";
  //   UI.examplesListContainer.append(UI.examplesEmptyMessage);
  //   UI.examplesEmptyMessage.style.display = "block";
  // });

  UI.examplesListContainer.innerHTML = "";
  UI.examplesListContainer.append(UI.examplesEmptyMessage);
  UI.examplesEmptyMessage.style.display = "block";
}

export function getArrayOfExamplesWord() {
  let examplesWord = [];
  let textSpan = null;

  Array.from(UI.examplesListContainer.children).forEach((c) => {
    if (c.matches("div")) {
      textSpan = c.querySelector(".example-item-text");
      examplesWord.push(textSpan.textContent.trim());
    }
  });

  return examplesWord;
}

export function resolveImageSource(image) {
  if (image instanceof Blob) {
    let currentObjectURL = URL.createObjectURL(image);
    return currentObjectURL;
  } else {
    return "assets/images/default_img.svg";
  }
}

export function setPreviewImage(imgElement, image) {
  if (imgElement && imgElement.src.startsWith("blob:")) {
    URL.revokeObjectURL(imgElement.src);
  }

  imgElement.src = resolveImageSource(image);
}
