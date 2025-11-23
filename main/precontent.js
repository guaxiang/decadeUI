import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import { initPrecontentCore } from "./precontent-core.js";
import { initPrecontentChat } from "./precontent-chat.js";
import { initPrecontentUI } from "./precontent-ui.js";

export async function precontent() {
	const mode = get.mode();
	if (mode === "chess" || mode === "tafang" || mode === "hs_hearthstone") return;

	// 按顺序初始化各个模块
	initPrecontentCore();
	initPrecontentChat();
	initPrecontentUI();
}
