import * as Util from "./utilites.js";

export default function createWordCard(
  wordId,
  word,
  imageSource,
  firstExample,
) {
  let imageUrl = Util.resolveImageSource(imageSource);

  const article = document.createElement("article");
  article.classList.add("vocab-card");
  article.dataset.id = wordId;

  const cardMedia = document.createElement("div");
  cardMedia.classList.add("card-media");
  const imgCard = document.createElement("img");
  imgCard.classList.add("card-image");
  imgCard.src = imageUrl;
  imgCard.alt = `Visual illustration of ${word}`;
  cardMedia.append(imgCard);

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const cardHeaderInfo = document.createElement("div");
  cardHeaderInfo.classList.add("card-header-info");

  const cardWordTitle = document.createElement("h2");
  cardWordTitle.classList.add("card-word-title");
  cardWordTitle.textContent = word;

  const cardSentencePreview = document.createElement("p");
  cardSentencePreview.classList.add("card-sentence-preview");
  cardSentencePreview.textContent = firstExample ? firstExample : "No example";

  cardHeaderInfo.append(cardWordTitle, cardSentencePreview);

  const cardActions = document.createElement("div");
  cardActions.classList.add("card-actions");
  cardActions.innerHTML = `
  <button
            type="button"
            class="btn-action btn-action-view"
            data-action="view"
            id="btn-view"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View
          </button>

          <button
            type="button"
            class="btn-action btn-action-edit"
            data-action="edit"
            id="btn-edit"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              ></path>
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              ></path>
            </svg>
            Edit
          </button>

          <button
            type="button"
            class="btn-action btn-action-delete"
            data-action="delete"
            id="btn-delete"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
            </svg>
            Delete
          </button>`;

  cardBody.append(cardHeaderInfo, cardActions);

  article.append(cardMedia, cardBody);

  return article;
}
