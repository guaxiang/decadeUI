import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import { initPrecontentCore } from "./precore.js";
import { initPrecontentChat } from "./prechat.js";
import { initPrecontentUI } from "./preui.js";

export async function precontent() {
	const mode = get.mode();
	if (mode === "chess" || mode === "tafang" || mode === "hs_hearthstone") return;

	initPrecontentCore();
	initPrecontentChat();
	initPrecontentUI();
}
