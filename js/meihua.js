"use strict";
decadeModule.import(function (lib, game, ui, get, ai, _status) {
	if (lib.config["extension_十周年UI_translate"]) {
		lib.init.js(lib.assetURL + "extension/十周年UI/js/cardtranslate.js");
		game.saveConfig("enable_drag", false);
	} else {
		game.saveConfig("enable_drag", true);
	}

	//OL随机框 by柳下跖
	if (lib.config.extension_十周年UI_newDecadeStyle && lib.config.extension_十周年UI_newDecadeStyle == "onlineUI") {
		//给龙头添加OL等阶框
		lib.skill._longLevel = {
			trigger: {
				global: "gameStart",
			},
			silent: true,
			forced: true,
			filter: function (event, player) {
				return lib.config.extension_十周年UI_longLevel == "ten" || lib.config.extension_十周年UI_longLevel == "eleven";
			},
			content: function () {
				// 稀有度配置
				const rarityConfig = {
					silver: { k: "k2", border: "border_campOL5", top: "-20.5px", right: "-5px", height: "115%", width: "120%" },
					gold: { k: "k4", border: "border_campOL2", top: "-5px", right: "-3px", height: "107.5%", width: "105%" },
					yu: { k: "k6", border: "border_campOL3", top: "-3px", right: "-3px", height: "107.5%", width: "105%" },
					bing: { k: "k8", border: "border_campOL4", top: "-6px", right: "-5.5px", height: "109%", width: "113%" },
					yan: { k: "k2", border: "border_campOL5", top: "-20.5px", right: "-5px", height: "115%", width: "120%" },
				};

				// 稀有度映射
				const rarityMap = ["silver", "gold", "yu", "bing", "yan"];

				let rarity;
				if (lib.config.extension_十周年UI_longLevel == "ten") {
					const rarityTypes = {
						junk: "silver",
						common: "gold",
						rare: "yu",
						epic: "bing",
						legend: "yan",
					};
					rarity = rarityTypes[game.getRarity(player.name)] || "silver";
				} else if (lib.config.extension_十周年UI_longLevel == "eleven") {
					rarity = rarityMap.randomGet();
				}

				if (rarity && rarityConfig[rarity]) {
					const config = rarityConfig[rarity];

					// 创建龙头图片
					const longtou = document.createElement("img");
					longtou.src = decadeUIPath + "/assets/image/OL/" + config.k + ".png";
					longtou.style.cssText = "pointer-events:none;position:absolute;display:block;top:" + config.top + ";right:" + config.right + ";height:" + config.height + ";width:" + config.width + ";z-index:60";
					player.appendChild(longtou);

					// 创建龙尾边框
					const longwei = document.createElement("img");
					longwei.src = decadeUIPath + "/assets/image/OL/" + config.border + ".png";
					longwei.style.cssText = "pointer-events:none;position:absolute;display:block;top:" + config.top + ";right:" + config.right + ";height:" + config.height + ";width:" + config.width + ";z-index:72";
					player.appendChild(longwei);
				}
			},
		};
	}

	//势力选择
	if (lib.config["extension_十周年UI_shiliyouhua"]) {
		Object.defineProperty(lib, "group", {
			get: () => {
				if (get.mode() === "guozhan") return ["wei", "shu", "wu", "qun", "jin"];
				return ["wei", "shu", "wu", "qun", "jin"];
			},
			set: () => {},
		});
		lib.skill._slyh = {
			trigger: {
				global: "gameStart",
				player: "enterGame",
			},
			forced: true,
			popup: false,
			silent: true,
			priority: Infinity,
			filter(_, player) {
				if (get.mode() === "guozhan") return false;
				return player.group && !lib.group.includes(player.group);
			},
			async content(event, trigger, player) {
				const list = lib.group.slice(0, 5);
				const result = await player
					.chooseControl(list)
					.set("ai", () => get.event().controls.randomGet())
					.set("prompt", "请选择你的势力")
					.forResult();
				if (result?.control) {
					player.group = result.control;
					player.node.name.dataset.nature = get.groupnature(result.control);
				}
			},
		};
	}

	//武将背景
	if (lib.config["extension_十周年UI_wujiangbeijing"]) {
		lib.skill._wjBackground = {
			charlotte: true,
			forced: true,
			popup: false,
			trigger: {
				global: ["gameStart", "modeSwitch"],
				player: ["enterGame", "showCharacterEnd"],
			},
			priority: 100,
			content() {
				const setBackground = player => {
					if (!player) return;
					const mode = get.mode();
					const isDoubleCharacter = lib.config.mode_config[mode] && lib.config.mode_config[mode].double_character;
					if (mode === "guozhan" || isDoubleCharacter) {
						player.setAttribute("data-mode", "guozhan");
					} else {
						player.setAttribute("data-mode", "normal");
					}
				};
				game.players.forEach(setBackground);
				game.dead.forEach(setBackground);
			},
		};
		lib.arenaReady.push(function () {
			const mode = get.mode();
			const isDoubleCharacter = lib.config.mode_config[mode] && lib.config.mode_config[mode].double_character;
			if (mode === "guozhan" || isDoubleCharacter) {
				document.body.setAttribute("data-mode", "guozhan");
			} else {
				document.body.setAttribute("data-mode", "normal");
			}
		});
	}

	// 全选按钮功能 by奇妙工具做修改
	lib.hooks.checkBegin.add("Selectall", () => {
		const event = get.event();
		const needMultiSelect = event.selectCard?.[1] > 1 && event.player == game.me;
		const isDiscardPhase = event.name === "phaseDiscard" || event.parent?.name === "phaseDiscard";
		if (needMultiSelect && !ui.Selectall && !isDiscardPhase) {
			ui.Selectall = ui.create.control("全选", () => {
				ai.basic.chooseCard(card => (get.position(card) === "h" ? 114514 : 0));
				event.custom?.add?.card?.();
				ui.selected.cards?.forEach(card => card.updateTransform(true));
			});
		} else if (!needMultiSelect || isDiscardPhase) {
			removeCardQX();
		}
	});
	lib.hooks.uncheckBegin.add("Selectall", () => {
		if (get.event().result?.bool) {
			removeCardQX();
		}
	});
	const removeCardQX = () => {
		if (ui.Selectall) {
			ui.Selectall.remove();
			delete ui.Selectall;
		}
	};

	// 局内交互优化
	if (lib.config["extension_十周年UI_jiaohuyinxiao"]) {
		lib.skill._useCardAudio = {
			trigger: {
				player: "useCard",
			},
			forced: true,
			popup: false,
			priority: -10,
			content() {
				const card = trigger.card;
				const cardType = get.type(card);
				let audioName;

				if (cardType === "basic" || cardType === "trick") {
					audioName = "GameShowCard";
				} else if (cardType === "equip") {
					const equipType = get.subtype(card);
					const audioMap = {
						equip1: "weapon_equip", // 武器
						equip2: "horse_equip", // 防具
						equip3: "armor_equip", // -1马
						equip4: "armor_equip", // +1马
						equip5: "horse_equip", // 宝物
					};
					audioName = audioMap[equipType];
				}

				if (audioName) {
					game.playAudio("..", "extension", "十周年UI", `audio/${audioName}`);
				}
			},
		};
		document.body.addEventListener("mousedown", function (e) {
			const target = e.target;
			let audioToPlay = null;

			if (target.closest("#dui-controls") && (target.classList.contains("control") || target.parentElement.classList.contains("control"))) {
				audioToPlay = "BtnSure";
			} else if (target.matches(".menubutton, .button, .card")) {
				audioToPlay = "card_click";
			}

			if (audioToPlay) {
				game.playAudio("..", "extension", "十周年UI", `audio/${audioToPlay}`);
			}
		});
	}

	//手气卡美化
	if (lib.config["extension_十周年UI_shouqikamh"]) {
		lib.element.content.gameDraw = async function () {
			const event = get.event();
			const player = event.player;
			const num = event.num;
			if (_status.brawl && _status.brawl.noGameDraw) return;
			const end = player;
			let currentPlayer = player;
			do {
				let numx = typeof num === "function" ? num(currentPlayer) : num;
				const cards = [];
				const otherGetCards = event.otherPile?.[currentPlayer.playerid]?.getCards;
				if (otherGetCards) cards.addArray(otherGetCards(numx));
				if (currentPlayer.getTopCards) cards.addArray(currentPlayer.getTopCards(numx - cards.length));
				cards.addArray(get.cards(numx - cards.length));
				if (event.gaintag?.[currentPlayer.playerid]) {
					const gaintag = event.gaintag[currentPlayer.playerid];
					const list = typeof gaintag === "function" ? gaintag(numx, cards) : [[cards, gaintag]];
					game.broadcastAll(
						(p, l) => {
							for (let i = l.length - 1; i >= 0; i--) {
								p.directgain(l[i][0], null, l[i][1]);
							}
						},
						currentPlayer,
						list
					);
				} else {
					currentPlayer.directgain(cards);
				}

				if (currentPlayer.singleHp && get.mode() !== "guozhan" && (lib.config.mode !== "doudizhu" || _status.mode !== "online")) {
					currentPlayer.doubleDraw();
				}
				currentPlayer._start_cards = currentPlayer.getCards("h");
				currentPlayer = currentPlayer.next;
			} while (currentPlayer !== end);
			let changeCard = get.config("change_card");
			const isDisabled = _status.connectMode || (lib.config.mode === "single" && _status.mode !== "wuxianhuoli") || (lib.config.mode === "doudizhu" && _status.mode === "online") || !["identity", "guozhan", "doudizhu", "single"].includes(lib.config.mode);

			if (isDisabled) {
				changeCard = "disabled";
			}
			if (changeCard !== "disabled" && !_status.auto && game.me.countCards("h")) {
				let numsy = 5; // 手气卡次数
				let numsl = 10000 + Math.floor(Math.random() * 90000);
				let changing = true;
				_status.imchoosing = true;
				while (changing && numsy > 0) {
					const str = `本场还可更换${numsy}次手牌(剩余${numsl}张手气卡)`;
					const { bool } = await new Promise(resolve => {
						const dialog = ui.create.dialog(str);
						ui.create.confirm("oc");
						event.custom.replace.confirm = function (ok) {
							dialog.close();
							ui.confirm.close();
							game.resume();
							resolve({ bool: ok });
						};
						event.switchToAuto = function () {
							dialog.close();
							ui.confirm.close();
							game.resume();
							resolve({ bool: false });
						};
						game.pause();
					});
					if (bool) {
						if (changeCard === "once") {
							changeCard = "disabled";
							changing = false;
						} else if (changeCard === "twice") {
							changeCard = "once";
						}
						if (game.changeCoin) game.changeCoin(-3);
						const hs = game.me.getCards("h");
						const count = hs.length;
						const otherDiscard = event.otherPile?.[game.me.playerid]?.discard;
						game.addVideo("lose", game.me, [get.cardsInfo(hs), [], [], []]);
						hs.forEach(card => {
							card.removeGaintag(true);
							if (otherDiscard) otherDiscard(card);
							else card.discard(false);
						});
						const cards = [];
						const otherGetCards = event.otherPile?.[game.me.playerid]?.getCards;
						if (otherGetCards) cards.addArray(otherGetCards(count));
						if (cards.length < count) cards.addArray(get.cards(count - cards.length));

						if (event.gaintag?.[game.me.playerid]) {
							const gaintag = event.gaintag[game.me.playerid];
							const list = typeof gaintag === "function" ? gaintag(count, cards) : [[cards, gaintag]];
							for (let i = list.length - 1; i >= 0; i--) {
								game.me.directgain(list[i][0], null, list[i][1]);
							}
						} else {
							game.me.directgain(cards);
						}
						numsl--;
						numsy--;
					} else {
						changing = false;
					}
				}
				_status.imchoosing = false;
			}
			game.me._start_cards = game.me.getCards("h");
			setTimeout(decadeUI.effect.gameStart, 51);
		};
	}

	// 卡牌边框
	const borderImageName = lib.config.extension_十周年UI_cardkmh;
	if (borderImageName && borderImageName !== "off") {
		const style = document.createElement("style");
		const borderImageUrl = `${lib.assetURL}extension/十周年UI/assets/image/${borderImageName}.png`;
		const commonBorderStyles = `
				border: 1px solid;
				border-radius: 6px;
				border-image-source: url('${borderImageUrl}');
				border-image-slice: 20 20 20 20;
			`;
		const handCardStyles = `
				.hand-cards > .handcards > .card {
					margin: 0px;
					width: 108px;
					height: 150px;
					position: absolute;
					transition-property: transform, opacity, left, top;
					${commonBorderStyles}
					border-image-width: 20px 20px 20px 20px;
					z-index: 51;
				}
			`;
		const playedCardStyles = `
				#arena > .card,
				#arena.oblongcard:not(.chess) > .card,
				#arena.oblongcard:not(.chess) .handcards > .card {
					width: 108px;
					height: 150px;
					${commonBorderStyles}
					border-image-width: 16px 16px 16px 16px;
				}
			`;
		style.innerHTML = `${handCardStyles}${playedCardStyles}`;
		document.head.appendChild(style);
	}

	//卡牌背景
	if (lib.config.extension_十周年UI_cardbj && lib.config.extension_十周年UI_cardbj !== "kb1") {
		const style = document.createElement("style");
		style.innerHTML = `.card:empty,.card.infohidden{background:url('${lib.assetURL}extension/十周年UI/assets/image/${lib.config.extension_十周年UI_cardbj}.png');background-size:100% 100% !important;}`;
		document.head.appendChild(style);
	}

	//阶段提示
	if (lib.config.extension_十周年UI_JDTS) {
		game.showJDTsImage = (imageName, durationOrPersistent) => {
			const style = lib.config.extension_十周年UI_JDTSYangshi;
			const extMap = { 2: "png", 3: "webp", 4: "jpeg" };
			const ext = extMap[style] || "jpg";
			const imgPath = `extension/十周年UI/shoushaUI/lbtn/images/JDTS/${imageName}.${ext}`;

			let position;
			if (style == "1") {
				const isSpecialMode = get.mode() === "taixuhuanjing" || lib.config.extension_EngEX_SSServant;
				position = isSpecialMode ? [10, 58, 7, 6] : [3, 58, 7, 6];
			} else {
				position = [18, 65, 8, 4.4];
			}

			game.as_showImage(imgPath, position, durationOrPersistent);
		};

		//游戏结束消失
		lib.onover.push(function (bool) {
			game.as_removeImage();
		});
		//等待响应
		lib.skill._jd_ddxyA = {
			trigger: {
				player: ["chooseToRespondBegin"],
			},
			silent: true,
			direct: true,
			filter(event, player) {
				return player == game.me && _status.auto == false;
			},
			content() {
				trigger._jd_ddxy = true;
				game.showJDTsImage("ddxy", 10);
			},
		};
		//成为杀的目标开始
		lib.skill._jd_ddxyB = {
			trigger: {
				target: "shaBegin",
			},
			silent: true,
			filter(event, player) {
				return game.me == event.target;
			},
			charlotte: true,
			forced: true,
			content() {
				trigger._jd_ddxy = true;
				game.showJDTsImage("ddxy", true);
			},
		};
		lib.skill._jd_ddxyC = {
			trigger: {
				player: ["useCardToBegin", "phaseJudge"],
			},
			silent: true,
			filter(event, player) {
				if (event.card.storage && event.card.storage.nowuxie) return false;
				var card = event.card;
				var info = get.info(card);
				if (info.wuxieable === false) return false;
				if (event.name != "phaseJudge") {
					if (event.getParent().nowuxie) return false;
					if (!event.target) {
						if (info.wuxieable) return true;
						return false;
					}
					if (event.player.hasSkillTag("playernowuxie", false, event.card)) return false;
					if (get.type(event.card) != "trick" && !info.wuxieable) return false;
				}
				return player == game.me && _status.auto == false;
			},
			charlotte: true,
			forced: true,
			content() {
				trigger._jd_ddxy = true;
				game.showJDTsImage("ddxy", true);
			},
		};
		//使用或打出闪后
		lib.skill._jd_shiyongshanD = {
			forced: true,
			charlotte: true,
			trigger: {
				player: ["useCard", "respondAfter"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && event.card.name == "shan";
			},
			content() {
				trigger._jd_ddxy = true;
				game.as_removeImage();
				if (_status.as_showImage_phase) {
					game.showJDTsImage(_status.as_showImage_phase, true);
				}
			},
		};
		//等待响应及游戏结束
		lib.skill._jd_ddxyE = {
			trigger: {
				player: ["chooseToRespondEnd", "useCardToEnd", "phaseJudgeEnd", "respondSha", "shanBegin"],
			},
			silent: true,
			filter(event, player) {
				if (!event._jd_ddxy) return false;
				return player == game.me && _status.auto == false;
			},
			direct: true,
			content() {
				game.as_removeImage();
				if (_status.as_showImage_phase) {
					game.showJDTsImage(_status.as_showImage_phase, true);
				}
			},
		};
		//对方正在思考
		lib.skill._jd_dfsk = {
			trigger: {
				global: ["phaseBegin", "phaseEnd", "phaseJudgeBegin", "phaseDrawBegin", "phaseUseBegin", "phaseDiscardBegin"],
			},
			silent: true,
			charlotte: true,
			forced: true,
			filter(event, player) {
				//剩余人数两人时
				if (game.players.length == 2 && _status.currentPhase != game.me) return true;
			},
			content() {
				game.showJDTsImage("dfsk", true);
			},
		};
		//死亡或回合结束消失
		lib.skill._jd_wjsw = {
			trigger: {
				global: ["phaseEnd", "useCardAfter"],
			},
			silent: true,
			filter(event, player) {
				return _status.currentPhase != game.me && player != game.me;
			},
			forced: true,
			charlotte: true,
			content() {
				game.as_removeImage();
			},
		};
		lib.skill._jd_swxs = {
			trigger: {
				global: ["dieAfter"],
			},
			silent: true,
			forced: true,
			charlotte: true,
			filter(event, player) {
				return player == game.me && _status.auto == false;
			},
			content() {
				game.as_removeImage();
			},
		};
		//回合开始
		lib.skill._jd_hhks = {
			trigger: {
				player: ["phaseBegin"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			content() {
				game.showJDTsImage("hhks", true);
				_status.as_showImage_phase = "hhks";
			},
		};
		//准备阶段
		lib.skill._jd_zbjdb = {
			trigger: {
				player: ["phaseZhunbeiBefore"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			content() {
				game.showJDTsImage("pdjd", true);
				_status.as_showImage_phase = "zbjd";
			},
		};
		lib.skill._jd_zbjde = {
			trigger: {
				player: ["phaseZhunbeiAfter"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			content() {
				if (_status.as_showImage_phase && _status.as_showImage_phase == "zbjd") {
					game.as_removeImage();
					delete _status.as_showImage_phase;
				}
			},
		};
		//判定阶段
		lib.skill._jd_pdjdb = {
			trigger: {
				player: ["phaseJudgeBefore"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			content() {
				game.showJDTsImage("pdjd", true);
				_status.as_showImage_phase = "pdjd";
			},
		};
		lib.skill._jd_pdjde = {
			trigger: {
				player: ["phaseJudgeAfter"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			content() {
				if (_status.as_showImage_phase && _status.as_showImage_phase == "pdjd") {
					game.as_removeImage();
					delete _status.as_showImage_phase;
				}
			},
		};
		//摸牌阶段
		lib.skill._jd_mpjdb = {
			trigger: {
				player: ["phaseDrawBefore"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			content() {
				game.showJDTsImage("mpjd", true);
				_status.as_showImage_phase = "mpjd";
			},
		};
		lib.skill._jd_mpjde = {
			trigger: {
				player: ["phaseDrawAfter"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			content() {
				if (_status.as_showImage_phase && _status.as_showImage_phase == "mpjd") {
					game.as_removeImage();
					delete _status.as_showImage_phase;
				}
			},
		};
		//出牌阶段
		lib.skill._jd_cpjdb = {
			trigger: {
				player: ["phaseUseBefore"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			content() {
				game.showJDTsImage("cpjd", true);
				_status.as_showImage_phase = "cpjd";
			},
		};
		lib.skill._jd_cpjde = {
			trigger: {
				player: ["phaseUseAfter"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			content() {
				if (_status.as_showImage_phase && _status.as_showImage_phase == "cpjd") {
					game.as_removeImage();
					delete _status.as_showImage_phase;
				}
			},
		};
		//弃牌阶段
		lib.skill._jd_qpjdb = {
			trigger: {
				player: ["phaseDiscardBefore"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			content() {
				game.showJDTsImage("qpjd", true);
				_status.as_showImage_phase = "qpjd";
			},
		};
		lib.skill._jd_qpjde = {
			trigger: {
				player: ["phaseDiscardAfter"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			content() {
				if (_status.as_showImage_phase && _status.as_showImage_phase == "qpjd") {
					game.as_removeImage();
					delete _status.as_showImage_phase;
				}
			},
		};
		//结束阶段
		lib.skill._jd_jsjdb = {
			trigger: {
				player: ["phaseJieshuBefore"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			content() {
				game.showJDTsImage("pdjd", true);
				_status.as_showImage_phase = "jsjd";
			},
		};
		lib.skill._jd_jsjde = {
			trigger: {
				player: ["phaseJieshuAfter"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			content() {
				if (_status.as_showImage_phase && _status.as_showImage_phase == "jsjd") {
					game.as_removeImage();
					delete _status.as_showImage_phase;
				}
			},
		};
		//回合结束
		lib.skill._jd_hhjsb = {
			trigger: {
				player: ["phaseEnd"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			content() {
				game.showJDTsImage("hhjs", true);
				_status.as_showImage_phase = "hhjs";
			},
		};
		lib.skill._jd_hhjse = {
			trigger: {
				player: ["phaseAfter"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me && _status.currentPhase == player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			content() {
				if (_status.as_showImage_phase && _status.as_showImage_phase == "hhjs") {
					game.as_removeImage();
					delete _status.as_showImage_phase;
				}
			},
		};
	}

	// 伤害恢复优化
	if (lib.config.extension_十周年UI_newDecadeStyle === "othersOff" || lib.config.extension_十周年UI_newDecadeStyle === "on") {
		window._WJMHHUIFUSHUZITEXIAO = {
			shuzi2: {
				name: "../../../十周年UI/assets/animation/globaltexiao/huifushuzi/shuzi2",
			},
		};
		window._WJMHXUNISHUZITEXIAO = {
			SS_PaiJu_xunishanghai: {
				name: "../../../十周年UI/assets/animation/globaltexiao/xunishuzi/SS_PaiJu_xunishanghai",
			},
		};
		window._WJMHSHANGHAISHUZITEXIAO = {
			SZN_shuzi: {
				name: "../../../十周年UI/assets/animation/globaltexiao/shanghaishuzi/SZN_shuzi",
			},
		};
		lib.skill._wjmh_huifushuzi_ = {
			priority: 10,
			forced: true,
			trigger: {
				player: "recoverBegin",
			},
			filter(event, player) {
				return event.num && event.num > 0 && event.num <= 9;
			},
			content() {
				var action = trigger.num.toString();
				if (action) {
					dcdAnim.loadSpine(window._WJMHHUIFUSHUZITEXIAO.shuzi2.name, "skel", function () {
						window._WJMHHUIFUSHUZITEXIAO.shuzi2.action = action;
						dcdAnim.playSpine(window._WJMHHUIFUSHUZITEXIAO.shuzi2, {
							speed: 0.6,
							scale: 0.5,
							parent: player,
						});
					});
				}
			},
		};
		lib.skill._wjmh_xunishuzi_ = {
			priority: 10,
			forced: true,
			trigger: {
				player: "damage",
			},
			filter(event, player) {
				if ((event.num != 0 && !event.num) || (event.num < 0 && event.num > 9)) return false;
				return event.unreal; // 判断是否是虚拟伤害
			},
			content() {
				var action = "play" + trigger.num.toString();
				if (action) {
					dcdAnim.loadSpine(window._WJMHXUNISHUZITEXIAO.SS_PaiJu_xunishanghai.name, "skel", function () {
						window._WJMHXUNISHUZITEXIAO.SS_PaiJu_xunishanghai.action = action;
						dcdAnim.playSpine(window._WJMHXUNISHUZITEXIAO.SS_PaiJu_xunishanghai, {
							speed: 0.6,
							scale: 0.5,
							parent: player,
						});
					});
				}
			},
		};
		lib.skill._wjmh_shanghaishuzi_ = {
			priority: 210,
			forced: true,
			trigger: {
				player: "damageBegin4",
			},
			filter(event, player) {
				return event.num && event.num > 1 && event.num <= 9;
			},
			content() {
				var action = trigger.num.toString();
				if (action) {
					dcdAnim.loadSpine(window._WJMHSHANGHAISHUZITEXIAO.SZN_shuzi.name, "skel", function () {
						window._WJMHSHANGHAISHUZITEXIAO.SZN_shuzi.action = action;
						dcdAnim.playSpine(window._WJMHSHANGHAISHUZITEXIAO.SZN_shuzi, {
							speed: 0.6,
							scale: 0.5,
							parent: player,
						});
					});
				}
			},
		};
	}

	//目标指示特效
	lib.element.player.inits = [].concat(lib.element.player.inits || []).concat(player => {
		if (player.ChupaizhishiXObserver) return;
		const ChupaizhishiX = {
			attributes: true,
			attributeFilter: ["class"],
		};
		let timer = null;
		const animations = {
			jiangjun: "SF_xuanzhong_eff_jiangjun",
			weijiangjun: "SF_xuanzhong_eff_weijiangjun",
			cheqijiangjun: "SF_xuanzhong_eff_cheqijiangjun",
			biaoqijiangjun: "SF_xuanzhong_eff_biaoqijiangjun",
			dajiangjun: "SF_xuanzhong_eff_dajiangjun",
			dasima: "SF_xuanzhong_eff_dasima",
			shoushaX: "aar_chupaizhishiX",
			shousha: "aar_chupaizhishi",
		};
		const ChupaizhishiXObserver = new globalThis.MutationObserver(mutationRecords => {
			for (let mutationRecord of mutationRecords) {
				if (mutationRecord.attributeName !== "class") continue;
				const targetElement = mutationRecord.target;

				if (targetElement.classList.contains("selectable")) {
					if (!targetElement.ChupaizhishiXid) {
						if (!window.chupaiload) {
							window.chupaiload = true;
						}
						if (timer) return;

						timer = setTimeout(() => {
							const config = decadeUI.config.chupaizhishi;
							if (config !== "off" && animations[config]) {
								targetElement.ChupaizhishiXid = dcdAnim.playSpine(
									{
										name: animations[config],
										loop: true,
									},
									{
										parent: targetElement,
										scale: config === "biaoqijiangjun" ? 0.5 : 0.6,
									}
								);
							}
							timer = null;
						}, 300);
					}
				} else {
					if (targetElement.ChupaizhishiXid) {
						dcdAnim.stopSpine(targetElement.ChupaizhishiXid);
						delete targetElement.ChupaizhishiXid;
						if (timer) {
							clearTimeout(timer);
							timer = null;
						}
					}
				}
			}
		});
		ChupaizhishiXObserver.observe(player, ChupaizhishiX);
		player.ChupaizhishiXObserver = ChupaizhishiXObserver;
	});

	// 技能外显-仅在babysha样式下且斗地主/对决模式生效
	if (lib.config.extension_十周年UI_newDecadeStyle === "babysha" && (get.mode() === "doudizhu" || get.mode() === "versus")) {
		// 玩家技能数组管理
		const playerSkillArrays = new Map();

		// 缓存原有并重写技能添加/移除方法
		const originalAddSkill = lib.element.player.addSkill;
		const originalRemoveSkill = lib.element.player.removeSkill;

		lib.element.player.addSkill = function (skill, ...args) {
			const result = originalAddSkill.apply(this, [skill, ...args]);
			requestAnimationFrame(() => addSkillToArray(this, skill));
			return result;
		};

		lib.element.player.removeSkill = function (skill, ...args) {
			const result = originalRemoveSkill.apply(this, [skill, ...args]);
			requestAnimationFrame(() => removeSkillFromArray(this, skill));
			return result;
		};

		// 添加技能到数组
		function addSkillToArray(player, skill) {
			if (player === game.me || !isOtherSkill(skill)) return;

			if (!playerSkillArrays.has(player)) {
				playerSkillArrays.set(player, []);
			}
			const skillArray = playerSkillArrays.get(player);

			if (!skillArray.includes(skill)) {
				skillArray.push(skill);
				updateSkillDisplay(player);
			}
		}

		// 从数组移除技能
		function removeSkillFromArray(player, skill) {
			if (!playerSkillArrays.has(player)) return;

			const skillArray = playerSkillArrays.get(player);
			const index = skillArray.indexOf(skill);

			if (index > -1) {
				skillArray.splice(index, 1);
				updateSkillDisplay(player);
			}
		}

		// 更新技能显示
		function updateSkillDisplay(player) {
			const avatar = player.node.avatar;
			if (!avatar) return;

			const existingLists = avatar.parentNode.querySelectorAll(".baby_skill");
			existingLists.forEach(list => list.remove());

			const skillArray = playerSkillArrays.get(player) || [];

			// 根据翻译名称去重，确保翻译相同的技能只显示一个
			const uniqueSkillMap = new Map();
			skillArray.forEach(skill => {
				const skillName = getSkillName(skill);
				if (!uniqueSkillMap.has(skillName)) {
					uniqueSkillMap.set(skillName, skill);
				}
			});

			// 显示去重后的技能
			Array.from(uniqueSkillMap.values()).forEach((skill, index) => {
				showSkillInList(avatar, skill, index);
			});
		}

		// 显示单个技能
		function showSkillInList(avatar, skill, index) {
			const skillName = getSkillName(skill);
			const skillList = createSkillList(avatar, index);
			createSkillBox(skillList, skill, skillName);
		}

		// 创建技能列表容器
		function createSkillList(avatar, index) {
			const skillList = document.createElement("div");
			Object.assign(skillList.style, {
				position: "absolute",
				bottom: `${index * 40 + 30}px`,
				zIndex: "102",
			});
			skillList.className = "baby_skill";
			setSkillListPosition(skillList, avatar);
			avatar.parentNode.appendChild(skillList);

			return skillList;
		}

		// 设置列表位置，让步手牌可见
		function setSkillListPosition(skillList, avatar) {
			const avatarRect = avatar.getBoundingClientRect();
			const isLeftSide = avatarRect.left < window.innerWidth / 2;
			Object.assign(skillList.style, {
				right: isLeftSide ? `${avatar.offsetWidth + 75}px` : "",
				left: isLeftSide ? "" : `${avatar.offsetWidth + 10}px`,
			});
		}

		// 创建技能框
		function createSkillBox(skillList, skill, skillName) {
			const skillBox = document.createElement("div");
			skillBox.className = "baby_skill_box";
			skillBox.setAttribute("data-skill", skill);
			skillBox.textContent = skillName;
			skillList.appendChild(skillBox);
		}

		// 检查是否为其他玩家技能
		function isOtherSkill(skill) {
			return !!lib.translate?.[skill];
		}

		// 获取技能名称
		function getSkillName(skill) {
			return lib.translate?.[skill] || skill;
		}

		// 刷新玩家技能
		function refreshPlayerSkills(player) {
			const avatar = player.node.avatar;
			if (!avatar) return;

			playerSkillArrays.delete(player);

			if (player.skills?.length) {
				player.skills.forEach(skill => addSkillToArray(player, skill));
			}
			if (player.additionalSkills) {
				Object.keys(player.additionalSkills).forEach(skill => {
					addSkillToArray(player, skill);
				});
			}
		}

		// 监听角色事件
		const eventNames = ["showCharacterEnd", "hideCharacter", "changeCharacter", "removeCharacter"];
		eventNames.forEach(eventName => {
			if (!lib.element.player[eventName]) return;
			const oldHandler = lib.element.player[eventName];
			lib.element.player[eventName] = function (...args) {
				if (typeof oldHandler === "function") {
					oldHandler.apply(this, args);
				}
				refreshPlayerSkills(this);
			};
		});

		// 游戏结束时清理
		lib.onover.push(function () {
			playerSkillArrays.clear();
		});
	}
});
