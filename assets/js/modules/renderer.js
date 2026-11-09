import createWordCard from "./createWordCard.js";
import { UI } from "./elements.js";
import * as Util from "./utilites.js";

export function renderAllWords(items) {
  if (items.length > 0) {
    let firstExample = null;

    for (let item of items) {
      firstExample =
        item.examples instanceof Set
          ? item.examples.values().next().value
          : item.examples[0];

      const wordCard = createWordCard(
        item.id,
        item.word,
        item.wordImage,
        firstExample,
      );
      UI.vocabularyGrid.append(wordCard);
    }
  }
}

export function renderWord(item) {
  if (!item) return;

  const firstExample =
    item.examples instanceof Set
      ? item.examples.values().next().value
      : item.examples[0];

  const wordCard = createWordCard(
    item.id,
    item.word,
    item.wordImage,
    firstExample,
  );
  UI.vocabularyGrid.append(wordCard);
}

export function renderWordDetails(wordData) {
  if (!wordData) return;

  UI.viewDialogExamplesList.innerHTML = "";
  // UI.viewDialogModalSubtitle.textContent = `Vocabulary ${wordData.word} Details`;
  UI.viewDialogModalSubtitle.textContent = `Vocabulary Word Details`;

  UI.viewDialogImage.src = Util.resolveImageSource(wordData.wordImage);

  UI.viewDialogWordHeading.textContent = wordData.word;

  let li = null;
  if (wordData.examples instanceof Set) {
    if (wordData.examples.size) {
      wordData.examples.forEach((example) => {
        li = document.createElement("li");
        li.classList.add("details-example-bullet");
        li.textContent = example;
        UI.viewDialogExamplesList.append(li);
      });
    }
  } else {
    // wordData.examples is array
    if (wordData.examples.length) {
      wordData.examples.forEach((example) => {
        li = document.createElement("li");
        li.classList.add("details-example-bullet");
        li.textContent = example;
        UI.viewDialogExamplesList.append(li);
      });
    }
  }

  if (!UI.viewDialogExamplesList.children.length) {
    UI.viewDialogNoExamplesMsg.style.display = "block";
  } else {
    UI.viewDialogNoExamplesMsg.style.display = "none";
  }
}

export function renderWordForEdit(wordData) {
  if (!wordData) return;

  // UI.wordFormDialogTitle.textContent = `Edit ${wordData.word}`;
  UI.wordFormDialogTitle.textContent = `Edit Word`;

  UI.wordInput.value = wordData.word;

  UI.previewImage.src = Util.resolveImageSource(wordData.wordImage);

  UI.examplesListContainer.innerHTML = "";
  UI.examplesListContainer.append(UI.examplesEmptyMessage);

  const length =
    wordData.examples instanceof Set
      ? wordData.examples.size
      : wordData.examples.length;

  if (length) {
    UI.examplesEmptyMessage.style.display = "none";

    wordData.examples.forEach((example) => {
      UI.examplesListContainer.append(Util.exampleCard(example));
    });
  } else {
    UI.examplesEmptyMessage.style.display = "block";
  }
}
