"use strict";
decadeModule.import((lib, game, ui, get) => {
	if (!lib.config["extension_十周年UI_cardPrompt"]) return;

	const decPrompt = text => (typeof text === "string" ? text.replace(/＃/g, "") : text);
	window.getDecPrompt = decPrompt;
	const stripTags = text => (typeof text === "string" ? text.replace(/<\/?.+?\/?>/g, "") : "");
	const sanitizePrompt = text => stripTags(decPrompt(text ?? "")).replace(/#/g, "");
	const getSingleTarget = target => {
		if (!target) return null;
		return Array.isArray(target) ? (target[0] ?? null) : target;
	};
	const resolveName = target => (target ? get.translation(target) : null);
	const closeDialog = dialog => {
		if (!dialog) return;
		if (typeof dialog === "object" && dialog.close) dialog.close();
	};
	const resetHandTips = () => {
		closeDialog(ui.cardDialog);
		delete ui.cardDialog;
		const tips = dui?.statics?.handTips;
		if (!Array.isArray(tips)) return;
		tips.forEach(tip => {
			if (!tip) return;
			tip.clear?.();
			tip.hide?.();
			if (tip.$info) tip.$info.innerHTML = "";
			tip.closed = true;
		});
	};
	const ensureTip = () => {
		if (ui.cardDialog) {
			ui.cardDialog.close();
			delete ui.cardDialog;
		}
		return (ui.cardDialog = dui.showHandTip());
	};
	const appendTipText = (tipNode, content) => {
		if (!content) return;
		if (Array.isArray(content)) {
			content.forEach(segment => {
				if (segment?.text) tipNode.appendText(segment.text, segment.style);
			});
			return;
		}
		tipNode.appendText(content);
	};
	const isAskWuxie = event => {
		if (!event) return false;
		if (event.card?.name === "wuxie") return true;
		return sanitizePrompt(event.prompt).includes("无懈可击");
	};
	const buildWuxieTipText = event => {
		const [sourcePlayer, respondCard] = Array.isArray(event.respondTo) ? event.respondTo : [];
		const sourceName = resolveName(sourcePlayer) ?? "未知角色";
		const cardName = respondCard ? get.translation(respondCard.name || respondCard) : "该牌";
		let targetName = resolveName(getSingleTarget(respondCard?.target ?? respondCard?.targets));
		if (!targetName && event.target) targetName = resolveName(getSingleTarget(event.target));
		const parentEvent = typeof event.getParent === "function" ? event.getParent() : null;
		const parentMap = parentEvent?._info_map;
		const resolveParentTarget = target => {
			if (targetName) return;
			targetName = resolveName(getSingleTarget(target));
		};
		if (!targetName && parentMap) {
			resolveParentTarget(parentMap.target);
			resolveParentTarget(parentMap.targets);
			if (!targetName && parentMap.isJudge) targetName = resolveName(parentMap.player);
		}
		if (!targetName) {
			const fallback = event.target || parentMap?.target || parentMap?.targets?.[0] || respondCard?.target || respondCard?.targets?.[0] || parentMap?.player || sourcePlayer;
			targetName = resolveName(getSingleTarget(fallback)) ?? "未知目标";
		}
		let stateWord = null;
		const mapState = parentMap?.state;
		if (typeof mapState === "number") stateWord = mapState > 0 ? "生效" : "失效";
		if (!stateWord) {
			const matchState = sanitizePrompt(event.prompt).match(/即将(生|失)效/);
			if (matchState) stateWord = matchState[1] === "生" ? "生效" : "失效";
		}
		if (!stateWord) stateWord = "生效或失效";
		const segment = text => decPrompt(sanitizePrompt(text));
		return [{ text: segment(sourceName), style: "phase" }, { text: segment("对") }, { text: segment(targetName), style: "phase" }, { text: segment("使用的【") }, { text: segment(cardName), style: "phase" }, { text: segment("】即将") }, { text: segment(stateWord) }, { text: segment("，是否使用【") }, { text: segment("无懈可击"), style: "phase" }, { text: segment("】？") }];
	};
	const buildRespondTipText = event => {
		if (!event) return null;
		if (isAskWuxie(event)) return buildWuxieTipText(event);
		const promptText = sanitizePrompt(event.prompt);
		const wrapText = text => decPrompt(sanitizePrompt(text));
		const matchOriginal = promptText?.match(/^请打出(.+?)张【(.+?)】(?:响应【(.+?)】)?$/);
		if (matchOriginal) {
			const [, countWord = "", cardName = "", respondName = ""] = matchOriginal;
			const segments = [{ text: wrapText("请打出") }, { text: wrapText(`${countWord}张`) }, { text: wrapText("【") }, { text: wrapText(cardName), style: "phase" }, { text: wrapText("】") }];
			if (respondName) {
				segments.push({ text: wrapText("响应") }, { text: wrapText("【") }, { text: wrapText(respondName), style: "phase" }, { text: wrapText("】") });
			}
			return segments;
		}
		if (!promptText) return null;
		let respondCardName = "";
		let respondTargetName = "";
		const [min = 1, max = min] = get.select(event.selectCard) ?? [];
		const needCount = max >= 0 ? max : min;
		if (promptText.includes("响应")) {
			const [before, after] = promptText.split("响应");
			respondTargetName = after?.trim() || "";
			const matchCard = before?.match(/张(.+)/);
			if (matchCard) respondCardName = matchCard[1].trim();
		}
		if (!respondCardName && Array.isArray(event._args)) {
			const argCard = event._args.find(arg => typeof arg === "object" && arg?.name);
			if (argCard?.name) respondCardName = get.translation(argCard.name);
		}
		if (!respondCardName && typeof event.filterCard === "object") {
			const filterName = event.filterCard.name;
			if (filterName) respondCardName = get.translation(filterName);
		}
		if (!respondCardName && typeof event.filterCard === "function" && event.player) {
			const positions = typeof event.position === "string" ? event.position : "hs";
			const matchedCard = event.player.getCards(positions).find(card => event.filterCard(card, event.player, event.target));
			const cardName = matchedCard ? get.name(matchedCard, event.player) : null;
			if (cardName) respondCardName = get.translation(cardName);
		}
		if (!respondTargetName && Array.isArray(event.respondTo)) {
			const respondCard = event.respondTo[1];
			const respondName = respondCard?.name || respondCard;
			if (respondName) respondTargetName = get.translation(respondName);
		}
		if (!respondTargetName && typeof event.getParent === "function") {
			const parent = event.getParent();
			const parentName = parent?.skill || parent?.name;
			if (parentName) respondTargetName = get.skillTranslation(parentName, event.player);
		}
		if (!respondCardName) respondCardName = "牌";
		if (!respondTargetName) respondTargetName = "当前请求";
		return [{ text: wrapText(`请打出${needCount}张【`) }, { text: wrapText(respondCardName), style: "phase" }, { text: wrapText("】响应【") }, { text: wrapText(respondTargetName), style: "phase" }, { text: wrapText("】") }];
	};
	const markPhaseDiscard = event => {
		if (typeof event.getParent !== "function") return false;
		let parent = event.getParent();
		for (let depth = 0; depth < 5 && parent; depth++) {
			if (parent.name === "phaseDiscard") return true;
			parent = typeof parent.getParent === "function" ? parent.getParent() : null;
		}
		return false;
	};
	lib.hooks.checkBegin.add(event => {
		if (event.player !== game.me) return;
		if (event.name === "chooseToUse" && event.type === "dying" && event.dying) event.prompt = false;
		if (event.name === "chooseToDiscard") event.prompt = false;
	});
	lib.hooks.checkButton.add(event => {
		const dialog = event.dialog;
		if (!dialog?.buttons) return;
		const range = get.select(event.selectButton);
		let selectableButtons = false;
		dialog.buttons.forEach(button => {
			if (button.classList.contains("unselectable")) return;
			const isFiltered = event.filterButton(button, event.player) && lib.filter.buttonIncluded(button);
			if (isFiltered) {
				if (ui.selected.buttons.length < range[1]) {
					button.classList.add("selectable");
				} else if (range[1] === -1) {
					button.classList.add("selected");
					ui.selected.buttons.add(button);
				} else {
					button.classList.remove("selectable");
				}
			} else {
				button.classList.remove("selectable");
				if (range[1] === -1) {
					button.classList.remove("selected");
					ui.selected.buttons.remove(button);
				}
			}
			if (button.classList.contains("selected")) {
				button.classList.add("selectable");
			} else if (!selectableButtons && button.classList.contains("selectable")) {
				selectableButtons = true;
			}
		});
		event.custom?.add?.button?.();
	});
	lib.hooks.checkEnd.add(event => {
		const handleDiscard = () => {
			closeDialog(ui.cardDialog);
			delete ui.cardDialog;
			closeDialog(event.dialog);
			event.dialog = false;
			event.prompt = false;
			const discardTip = ensureTip();
			const showPhase = markPhaseDiscard(event);
			if (showPhase) discardTip.appendText("弃牌阶段", "phase");
			const selectedCount = (ui.selected?.cards ?? []).length;
			const [min = 0, max = min] = get.select(event.selectCard) ?? [];
			const needCount = max >= 0 ? max : min;
			const prefix = showPhase
				? "，"
				: (() => {
						discardTip.appendText("【");
						let name = event.getParent().skill || event.getParent().name || "";
						if (name.endsWith("_cost")) name = name.slice(0, -"_cost".length);
						if (name.endsWith("_backup")) name = name.slice(0, -"_backup".length);
						discardTip.appendText(get.skillTranslation(name, event.player), "phase");
						discardTip.appendText("】：");
						return "";
					})();
			const positionWord = (() => {
				if (!event.position || event.position === "h") return "手";
				if (event.position === "e") return "装备";
				return "";
			})();
			let tipText = `${prefix}${event.forced ? "请" : "是否"}弃置${selectedCount}/${needCount}张${positionWord}牌${min !== needCount ? `（至少${min}张）` : ""}${event.forced ? "" : "？"}`;
			tipText = decPrompt(stripTags(tipText));
			discardTip.appendText(tipText);
			discardTip.strokeText();
			discardTip.show();
			event.filterStop = function () {
				if (this.step > 1 && ui.cardDialog) {
					ui.cardDialog.close();
					delete ui.cardDialog;
				}
			};
		};
		const handleUse = () => {
			closeDialog(ui.cardDialog);
			delete ui.cardDialog;
			const promptIncludesRespond = typeof event.prompt === "string" && event.prompt.includes("响应");
			const respondTipText = event.respondTo || promptIncludesRespond ? buildRespondTipText(event) : null;
			if (respondTipText) {
				event.prompt = false;
				const respondTip = ensureTip();
				appendTipText(respondTip, respondTipText);
				respondTip.strokeText();
				respondTip.show();
				return;
			}
			if (event.type === "dying" && event.dying) {
				closeDialog(event.dialog);
				event.dialog = false;
				event.prompt = false;
				const dyingTip = ensureTip();
				dyingTip.appendText(get.translation(event.dying), "phase");
				let tipText = `濒死，需要${1 - event.dying.hp}个桃，是否帮助？`;
				tipText = decPrompt(stripTags(tipText));
				dyingTip.appendText(tipText);
				dyingTip.strokeText();
				dyingTip.show();
				return;
			}
			if (event.skill) {
				if (event.skillDialog === true) event.skillDialog = false;
				const skillTip = ensureTip();
				let name = event.skill;
				if (name.endsWith("_cost")) name = name.slice(0, -"_cost".length);
				if (name.endsWith("_backup")) name = name.slice(0, -"_backup".length);
				const skillName = get.skillTranslation(name, event.player);
				skillTip.appendText("是否发动【");
				skillTip.appendText(skillName, "phase");
				let tipText = "】？";
				tipText = decPrompt(stripTags(tipText));
				skillTip.appendText(tipText);
				skillTip.strokeText();
				skillTip.show();
				return;
			}
			const selectedCards = ui.selected?.cards ?? [];
			if (event.type === "phase" && selectedCards.length === 1) {
				const tip = ensureTip();
				let text = get
					.plainText(get.translation(`${get.name(selectedCards[0])}_info`))
					.replace(/出牌阶段，/g, "")
					.replace(/每回合限一次。/g, "")
					.replace(/准备阶段，/g, "")
					.replace(/锁定技。/g, "")
					.replace(/锁定技，/g, "");
				text = decPrompt(stripTags(text));
				tip.appendText(text);
				tip.strokeText();
				tip.show();
				return;
			}
			if (event.type === "phase") {
				const tip = ensureTip();
				tip.appendText("出牌阶段", "phase");
				let text = "，请选择一张卡牌";
				text = decPrompt(stripTags(text));
				tip.appendText(text);
				tip.strokeText();
				tip.show();
				return;
			}
		};
		const handleRespond = () => {
			closeDialog(ui.cardDialog);
			delete ui.cardDialog;
			closeDialog(event.dialog);
			event.dialog = false;
			const tip = ensureTip();
			const respondTipText = buildRespondTipText(event);
			event.prompt = false;
			appendTipText(tip, respondTipText);
			tip.strokeText();
			tip.show();
		};
		if (event.player !== game.me) {
			if (ui.cardDialog) {
				ui.cardDialog.close();
				delete ui.cardDialog;
			}
			return;
		}
		if (event.name === "chooseToDiscard") {
			handleDiscard();
			return;
		}
		if (event.name === "chooseToUse") {
			handleUse();
			return;
		}
		if (event.name === "chooseToRespond") {
			handleRespond();
			return;
		}
		if (ui.cardDialog) {
			ui.cardDialog.close();
			delete ui.cardDialog;
		}
	});
	const installPromptCleanup = () => {
		if (game.__decadePromptCleanupInstalled || typeof game.over !== "function") return;
		game.__decadePromptCleanupInstalled = true;
		const originalGameOver = game.over;
		game.over = function decadeUIPromptCleanup(...args) {
			try {
				resetHandTips();
			} catch (error) {}
			return originalGameOver.apply(this, args);
		};
	};
	installPromptCleanup();
});
