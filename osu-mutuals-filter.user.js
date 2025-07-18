// ==UserScript==
// @name         osu! mutuals filter
// @version      1.0
// @description  Extra controls for the osu! friends list related to mutuals.
// @author       Agatem
// @match        https://osu.ppy.sh/home/friends*
// @license      MIT
// ==/UserScript==

/** @typedef {"all" | "mutual" | "following"} FilterMode */

/**
 * Adds CSS styles to the document.
 */
function addCSS() {
	const sheet = new CSSStyleSheet();
	sheet.insertRule(
		".user-list__toolbar-row { justify-content: space-between; }",
	);
	document.adoptedStyleSheets.push(sheet);
}

/**
 * Creates a toolbar element with filter buttons and mutual count.
 *
 * @returns {HTMLElement} The toolbar container element.
 */
function createToolbar() {
	const container = document.createElement("div");
	container.className = "user-list__toolbar-item mutual-filter";
	container.innerHTML = `
		<div class="sort sort--user-list">
			<div class="sort__items">
				<span class="sort__item sort__item--title">Filter by</span>
				<button class="sort__item sort__item--button" data-mode="all">All</button>
				<button class="sort__item sort__item--button" data-mode="mutual">Mutual</button>
				<button class="sort__item sort__item--button" data-mode="following">Following</button>
				<span class="sort__item sort__item--title mutual-count">Mutuals: -</span>
			</div>
		</div>
	`;
	return container;
}

/**
 * Retrieves all user card elements currently present in the document.
 *
 * @returns {NodeListOf<HTMLElement>} Array of user card elements.
 */
function getCards() {
	return document.querySelectorAll(
		".osu-page .user-card, .osu-page .user-card-brick",
	);
}

/**
 * Sets the active button in the toolbar based on the filter mode.
 * Removes active class from all buttons and adds it to the matching one.
 *
 * @param {NodeListOf<HTMLButtonElement>} buttons - Array of button elements.
 * @param {FilterMode} mode - The current filter mode.
 */
function setActiveButton(buttons, mode) {
	for (const btn of buttons) {
		btn.classList.toggle("sort__item--active", btn.dataset.mode === mode);
	}
}

/**
 * Updates the user cards visibility based on the current filter mode
 * and updates the mutual count displayed in the toolbar.
 *
 * @param {HTMLElement} toolbar - The toolbar element.
 * @param {FilterMode} filterMode - The current filter mode.
 */
function updateCountAndFilter(toolbar, filterMode) {
	const cards = getCards();
	let mutualCount = 0;

	for (const card of cards) {
		const isMutual =
			card.matches(".user-card-brick--mutual") ||
			!!card.querySelector(".user-action-button--mutual");
		if (isMutual) mutualCount++;

		if (filterMode === "mutual") {
			card.style.display = isMutual ? "" : "none";
		} else if (filterMode === "following") {
			card.style.display = !isMutual ? "" : "none";
		} else {
			card.style.display = "";
		}
	}

	toolbar.querySelector(".mutual-count").textContent =
		`Mutuals: ${mutualCount}`;
}

/**
 * Adds the toolbar with filtering buttons once to the page if it doesn't exist yet.
 * Sets up event listeners on filter buttons and observes dynamic changes
 * in the user list to refresh the filter and counts.
 */
function addToolbar() {
	const row = document.querySelector(".user-list__toolbar-row");
	if (!row || row.querySelector(".mutual-filter")) return;

	const toolbar = createToolbar();
	row.appendChild(toolbar);

	/** @type {FilterMode} */
	let mode = "all";

	const buttons = /** @type {NodeListOf<HTMLButtonElement>} */ (
		toolbar.querySelectorAll("[data-mode]")
	);

	const refresh = () => {
		updateCountAndFilter(toolbar, mode);
		setActiveButton(buttons, mode);
	};

	for (const btn of buttons) {
		btn.addEventListener("click", () => {
			mode = /** @type {FilterMode} */ (btn.dataset.mode);
			refresh();
		});
	}

	const list = document.querySelector(".user-list__items");
	const cardsObserver = new MutationObserver(refresh);
	cardsObserver.observe(list, { childList: true, subtree: true });

	refresh();
}

const observer = new MutationObserver(() => addToolbar());
observer.observe(document, {
	childList: true,
	subtree: true,
});

addCSS();
