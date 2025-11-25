"use strict";
decadeModule.import((lib, game, ui, get, ai, _status) => {
	if (lib.config["extension_十周年UI_translate"]) {
		lib.init.js(`${lib.assetURL}extension/十周年UI/js/cardtranslate.js`);
		game.saveConfig("enable_drag", false);
	} else {
		game.saveConfig("enable_drag", true);
	}
	//OL随机框 by柳下跖
	if (lib.config.extension_十周年UI_newDecadeStyle && lib.config.extension_十周年UI_newDecadeStyle === "onlineUI") {
		lib.skill._longLevel = {
			trigger: {
				global: "gameStart",
			},
			silent: true,
			forced: true,
			filter(event, player) {
				return lib.config.extension_十周年UI_longLevel === "ten" || lib.config.extension_十周年UI_longLevel === "eleven";
			},
			async content() {
				const player = _status.event.player;
				const rarityConfig = {
					silver: { k: "k2", border: "border_campOL5", top: "-20.5px", right: "-5px", height: "115%", width: "120%" },
					gold: { k: "k4", border: "border_campOL2", top: "-5px", right: "-3px", height: "107.5%", width: "105%" },
					yu: { k: "k6", border: "border_campOL3", top: "-3px", right: "-3px", height: "107.5%", width: "105%" },
					bing: { k: "k8", border: "border_campOL4", top: "-6px", right: "-5.5px", height: "109%", width: "113%" },
					yan: { k: "k2", border: "border_campOL5", top: "-20.5px", right: "-5px", height: "115%", width: "120%" },
				};
				const rarityMap = ["silver", "gold", "yu", "bing", "yan"];
				let rarity;
				const levelMode = lib.config.extension_十周年UI_longLevel;
				const rarityHandlers = {
					ten: () => {
						const rarityTypes = { junk: "silver", common: "gold", rare: "yu", epic: "bing", legend: "yan" };
						return rarityTypes[game.getRarity(player.name)] || "silver";
					},
					eleven: () => rarityMap.randomGet(),
				};
				if (rarityHandlers[levelMode]) rarity = rarityHandlers[levelMode]();
				if (rarity && rarityConfig[rarity]) {
					const config = rarityConfig[rarity];
					const longtou = document.createElement("img");
					longtou.src = `${decadeUIPath}/assets/image/OL/${config.k}.png`;
					longtou.style.cssText = `pointer-events:none;position:absolute;display:block;top:${config.top};right:${config.right};height:${config.height};width:${config.width};z-index:60`;
					player.appendChild(longtou);
					const longwei = document.createElement("img");
					longwei.src = `${decadeUIPath}/assets/image/OL/${config.border}.png`;
					longwei.style.cssText = `pointer-events:none;position:absolute;display:block;top:${config.top};right:${config.right};height:${config.height};width:${config.width};z-index:72`;
					player.appendChild(longwei);
				}
			},
		};
	}
	//势力选择
	if (lib.config["extension_十周年UI_shiliyouhua"]) {
		Object.defineProperty(lib, "group", {
			get: () => ["wei", "shu", "wu", "qun", "jin"],
			set: () => {},
		});
		lib.skill._slyh = {
			trigger: { global: "gameStart", player: "enterGame" },
			forced: true,
			popup: false,
			silent: true,
			priority: Infinity,
			filter(_, player) {
				return get.mode() !== "guozhan" && player.group && !lib.group.includes(player.group);
			},
			async content() {
				const player = _status.event.player;
				const result = await player
					.chooseControl(lib.group.slice(0, 5))
					.set("ai", () => get.event().controls.randomGet())
					.set("prompt", "请选择你的势力")
					.forResult();
				if (result?.control) {
					player.group = result.control;
					player.node.name.dataset.nature = get.groupnature(result.control);
				}
			},
		};
		const originalChooseControl = lib.element.player.chooseControl;
		lib.element.player.chooseControl = function (...args) {
			const next = originalChooseControl.apply(this, args);
			if (this === game.me) {
				const groupTranslations = lib.group.map(i => get.translation(i));
				if (Array.isArray(next.controls) && next.controls.length > 0 && next.controls.every(val => lib.group.includes(val) || groupTranslations.includes(val))) {
					next.setContent(async (event, trigger, player) => {
						const list = event.controls;
						if (!list?.length) return;
						const dialog = ui.create.dialog("hidden", [list, "vcard"]);
						dialog.classList.add("noupdate", "faction-choice");
						dialog.setBackgroundImage("extension/十周年UI/image/group/scdialog.png");
						if (!ui.skepk) ui.skepk = ui.create.div(".groupTitle", dialog);
						ui.skepk.innerHTML = "请选择势力";
						const getGroupImagePath = buttonName => {
							const style = lib.config.extension_十周年UI_newDecadeStyle;
							const styleFolderMap = {
								on: "decade",
								off: "off",
							};
							const folder = styleFolderMap[style];
							const prefix = folder ? `${folder}/` : "";
							return `extension/十周年UI/image/group/${prefix}group_${buttonName}.png`;
						};
						for (const button of dialog.buttons) {
							if (!button) continue;
							// 移除 decade-card 类以避免卡牌美化逻辑干扰势力图
							button.classList.remove("decade-card");
							const groupImagePath = getGroupImagePath(button.name);
							// 更新 asset 以防止异步加载干扰势力图显示
							const dui = window.dui;
							if (dui && dui.statics && dui.statics.cards && !dui.statics.cards.READ_OK) {
								const asset = dui.statics.cards[button.name];
								if (asset) {
									// 禁用异步图片加载
									asset.loaded = true;
									asset.url = groupImagePath;
									asset.rawUrl = `url("${lib.assetURL}${groupImagePath}")`;
									// 清空 image 对象，防止触发 onerror
									if (asset.image && asset.image.onerror) {
										asset.image.onerror = null;
									}
								}
							}
							button.setBackgroundImage(groupImagePath);
							button.style.setProperty("box-shadow", "unset", "important");
							button.innerHTML = "";
							button.addEventListener("click", () => {
								const duiControls = document.getElementById("dui-controls");
								if (duiControls) {
									duiControls.style.scale = "1";
								}
							});
						}
						// 创建进度条背景
						if (!ui.dialogbar) ui.dialogbar = ui.create.div(".groupJindutiao", dialog);
						const progressBarBg = ui.create.div(".groupJindutiao1", ui.dialogbar);
						progressBarBg.setBackgroundImage("extension/十周年UI/image/group/TimeBarBg.png");
						progressBarBg.style.height = "13px";
						// 创建进度条
						const progressBar = ui.create.div(".groupJindutiao2", ui.dialogbar);
						progressBar.setBackgroundImage("extension/十周年UI/image/group/TimeBarFull.png");
						progressBar.style.height = "13px";
						progressBar.style.width = "0%";
						// 创建进度条文本
						if (!ui.dialogtext) ui.dialogtext = ui.create.div(".groupJindutiaoText", ui.dialogbar);
						ui.dialogtext.innerHTML = "";
						progressBar.data = 100;
						if (event.progressInterval) {
							clearInterval(event.progressInterval);
							delete event.progressInterval;
						}
						event.progressInterval = setInterval(() => {
							progressBar.data -= 100 / 150; // 15秒 = 1500ms，每100ms更新一次
							if (progressBar.data <= 0) {
								progressBar.data = 0;
								clearInterval(event.progressInterval);
								delete event.progressInterval;
							}
							progressBar.style.width = `${progressBar.data}%`;
						}, 100);
						// 创建选择事件
						event.nextx = game.createEvent("chooseGroup");
						event.nextx.dialog = dialog;
						event.nextx.setContent(() => {
							game.me.chooseButton(1, event.dialog, true).set("newconfirm1", true);
						});
						const duiControls = document.getElementById("dui-controls");
						if (duiControls) {
							duiControls.style.scale = "0";
						}
						try {
							await event.nextx;
							const val = event.nextx._result?.links?.[0]?.[2];
							if (val) {
								event.result = {
									bool: true,
									control: val,
									index: event.controls.indexOf(val),
								};
							}
						} finally {
							if (duiControls) {
								duiControls.style.scale = "1";
							}
							if (event.progressInterval) {
								clearInterval(event.progressInterval);
								delete event.progressInterval;
							}
						}
					});
				}
			}
			return next;
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
			async content() {
				const setBackground = player => {
					if (!player) return;
					const mode = get.mode();
					const isDoubleCharacter = lib.config.mode_config[mode]?.double_character;
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
		lib.arenaReady.push(() => {
			const mode = get.mode();
			const isDoubleCharacter = lib.config.mode_config[mode]?.double_character;
			if (mode === "guozhan" || isDoubleCharacter) {
				document.body.setAttribute("data-mode", "guozhan");
			} else {
				document.body.setAttribute("data-mode", "normal");
			}
		});
	}
	// 局内交互优化
	if (lib.config["extension_十周年UI_bettersound"]) {
		// 拦截本体音效
		game._decadeUI_blockedEquipAudios = game._decadeUI_blockedEquipAudios || new Set(["loseHp"]);
		if (!game._decadeUI_playAudioWrapped) {
			const originalPlayAudio = game.playAudio;
			game.playAudio = function (...args) {
				if (args[0] === "effect" && game._decadeUI_blockedEquipAudios?.has(args[1])) return;
				return originalPlayAudio.apply(this, args);
			};
			game._decadeUI_playAudioWrapped = true;
		}
		if (!game._decadeUI_uiClickAudioHandler) {
			const uiClickAudioHandler = e => {
				if (e.button !== 0) return;
				const target = e.target;
				let audioToPlay = null;
				const rules = [
					{
						test: t => t.closest("#dui-controls") && (t.classList?.contains("control") || t.parentElement?.classList?.contains("control")),
						sound: "BtnSure",
					},
					{
						test: t => t.closest(".menubutton, .button, .card"),
						sound: "card_click",
					},
				];
				for (const rule of rules) {
					if (rule.test(target)) {
						audioToPlay = rule.sound;
						break;
					}
				}
				if (audioToPlay) {
					const now = Date.now();
					const last = game._decadeUI_lastUIAudioAt || 0;
					if (now - last < 60) return;
					game._decadeUI_lastUIAudioAt = now;
					game.playAudio("..", "extension", "十周年UI", `audio/${audioToPlay}`);
				}
			};
			document.body.addEventListener("pointerdown", uiClickAudioHandler, { capture: true, passive: true });
			game._decadeUI_uiClickAudioHandler = uiClickAudioHandler;
		}
		// 自己准备阶段音效
		lib.skill._preparePhaseAudio = {
			trigger: { player: ["phaseZhunbeiBefore"] },
			forced: true,
			popup: false,
			charlotte: true,
			filter(event, player) {
				return player === game.me && _status.currentPhase === player;
			},
			async content() {
				game.playAudio("..", "extension", "十周年UI", `audio/seatRoundState_start`);
			},
		};
		// 失去体力音效
		lib.skill._hpLossAudio = {
			trigger: { player: "loseHpBefore" },
			forced: true,
			popup: false,
			charlotte: true,
			filter(event) {
				return !!event.num;
			},
			async content(event, trigger, player) {
				// 播放音效
				game.playAudio("..", "extension", "十周年UI", "audio/hpLossSund.mp3");
			},
		};
	}
	window._effect = {
		effect_loseHp: {
			name: "../../../十周年UI/assets/animation/effect_loseHp",
		},
	};
	lib.skill._hpLossAnimation = {
		trigger: { player: "loseHpBefore" },
		forced: true,
		popup: false,
		charlotte: true,
		filter(event) {
			return !!event.num;
		},
		async content(event, trigger, player) {
			// 播放动画
			dcdAnim.loadSpine(window._effect.effect_loseHp.name, "skel", () => {
				window._effect.effect_loseHp.action = "play";
				dcdAnim.playSpine(window._effect.effect_loseHp, {
					speed: 0.8,
					scale: 0.6,
					parent: player,
				});
			});
		},
	};
	//手气卡美化
	if (lib.config["extension_十周年UI_luckycard"]) {
		lib.element.content.gameDraw = async function () {
			const event = get.event();
			const player = _status.event.player || event.player;
			const num = event.num;
			if (_status.brawl && _status.brawl.noGameDraw) return;
			const end = player;
			let currentPlayer = player;
			do {
				let numx = typeof num === "function" ? num(currentPlayer) : num;
				const cards = [];
				const otherGetCards = event.otherPile?.[currentPlayer.playerid]?.getCards;
				if (otherGetCards) {
					cards.addArray(otherGetCards(numx));
				} else if (currentPlayer.getTopCards) {
					cards.addArray(currentPlayer.getTopCards(numx));
				} else {
					cards.addArray(get.cards(numx));
				}
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
				if (currentPlayer.singleHp === true && get.mode() !== "guozhan" && (lib.config.mode !== "doudizhu" || _status.mode !== "online")) {
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
					const str = `本场还可更换<span style="color:#00c853">${numsy}次</span>手牌(剩余${numsl}张手气卡)`;
					const { bool } = await new Promise(resolve => {
						const dialog = ui.create.dialog(str);
						ui.create.confirm("oc");
						if (ui.confirm && ui.confirm.childNodes.length > 0 && lib.config.extension_十周年UI_newDecadeStyle !== "off") {
							const okButton = ui.confirm.childNodes[0];
							if (okButton && okButton.link === "ok") {
								okButton.innerHTML = "换牌";
							}
						}
						event.custom.replace.confirm = ok => {
							dialog.close();
							if (ui.confirm?.close) ui.confirm.close();
							game.resume();
							resolve({ bool: ok });
						};
						event.switchToAuto = () => {
							dialog.close();
							if (ui.confirm?.close) ui.confirm.close();
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
						game.me._start_cards = game.me.getCards("h");
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
				border-radius: 10px;
				border-image-source: url('${borderImageUrl}');
				border-image-slice: 17 17 17 17;
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
			if (style === "1") {
				const isSpecialMode = get.mode() === "taixuhuanjing" || lib.config.extension_EngEX_SSServant;
				position = isSpecialMode ? [10, 58, 7, 6] : [3, 58, 7, 6];
			} else {
				position = [18, 65, 8, 4.4];
			}
			game.as_showImage(imgPath, position, durationOrPersistent);
		};
		//游戏结束消失
		lib.onover.push(() => {
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
				return player === game.me && _status.auto === false;
			},
			async content(event, trigger, player) {
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
				return game.me === event.target;
			},
			charlotte: true,
			forced: true,
			async content(event, trigger, player) {
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
				if (event.card.storage?.nowuxie) return false;
				const card = event.card;
				const info = get.info(card);
				if (info.wuxieable === false) return false;
				if (event.name !== "phaseJudge") {
					if (event.getParent().nowuxie) return false;
					if (!event.target) {
						if (info.wuxieable) return true;
						return false;
					}
					if (event.player.hasSkillTag("playernowuxie", false, event.card)) return false;
					if (get.type(event.card) !== "trick" && !info.wuxieable) return false;
				}
				return player === game.me && _status.auto === false;
			},
			charlotte: true,
			forced: true,
			async content(event, trigger, player) {
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
				return player === game.me && event.card.name === "shan";
			},
			async content(event, trigger, player) {
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
				return player === game.me && _status.auto === false;
			},
			direct: true,
			async content() {
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
				if (game.players.length === 2 && _status.currentPhase !== game.me) return true;
			},
			async content() {
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
				return _status.currentPhase !== game.me && player !== game.me;
			},
			forced: true,
			charlotte: true,
			async content() {
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
				return player === game.me && _status.auto === false;
			},
			async content() {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			async content() {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			async content() {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			async content() {
				if (_status.as_showImage_phase === "zbjd") {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			async content() {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			async content() {
				if (_status.as_showImage_phase === "pdjd") {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			async content() {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			async content() {
				if (_status.as_showImage_phase === "mpjd") {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			async content() {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			async content() {
				if (_status.as_showImage_phase === "cpjd") {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			async content() {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			async content() {
				if (_status.as_showImage_phase === "qpjd") {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			async content() {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			async content() {
				if (_status.as_showImage_phase === "jsjd") {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: Infinity,
			firstDo: true,
			async content() {
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
				return player === game.me && _status.currentPhase === player;
			},
			charlotte: true,
			ruleSkill: true,
			direct: true,
			priority: -Infinity,
			lastDo: true,
			async content() {
				if (_status.as_showImage_phase === "hhjs") {
					game.as_removeImage();
					delete _status.as_showImage_phase;
				}
			},
		};
	}
	// 数字特效
	window._WJMHHUIFUSHUZITEXIAO = { shuzi2: { name: "../../../十周年UI/assets/animation/globaltexiao/huifushuzi/shuzi2" } };
	window._WJMHXUNISHUZITEXIAO = { SS_PaiJu_xunishanghai: { name: "../../../十周年UI/assets/animation/globaltexiao/xunishuzi/SS_PaiJu_xunishanghai" } };
	window._WJMHSHANGHAISHUZITEXIAO = {
		shuzi: { name: "../../../十周年UI/assets/animation/globaltexiao/shanghaishuzi/shuzi" },
		SZN_shuzi: { name: "../../../十周年UI/assets/animation/globaltexiao/shanghaishuzi/SZN_shuzi" },
	};
	lib.skill._wjmh_huifushuzi_ = {
		priority: 10,
		forced: true,
		trigger: { player: "recoverBegin" },
		filter(event) {
			return event.num && event.num > 0 && event.num <= 9 && lib.config.extension_十周年UI_newDecadeStyle !== "off";
		},
		async content(event, trigger, player) {
			const action = trigger.num.toString();
			if (action) {
				dcdAnim.loadSpine(window._WJMHHUIFUSHUZITEXIAO.shuzi2.name, "skel", () => {
					window._WJMHHUIFUSHUZITEXIAO.shuzi2.action = action;
					dcdAnim.playSpine(window._WJMHHUIFUSHUZITEXIAO.shuzi2, { speed: 0.6, scale: 0.5, parent: player, y: 20 });
				});
			}
		},
	};
	lib.skill._wjmh_xunishuzi_ = {
		priority: 10,
		forced: true,
		trigger: { player: "damage" },
		filter(event) {
			return event.num >= 0 && event.num <= 9 && event.unreal;
		},
		async content(event, trigger, player) {
			const action = "play" + trigger.num.toString();
			if (action) {
				dcdAnim.loadSpine(window._WJMHXUNISHUZITEXIAO.SS_PaiJu_xunishanghai.name, "skel", () => {
					window._WJMHXUNISHUZITEXIAO.SS_PaiJu_xunishanghai.action = action;
					dcdAnim.playSpine(window._WJMHXUNISHUZITEXIAO.SS_PaiJu_xunishanghai, { speed: 0.6, scale: 0.5, parent: player, y: 20 });
				});
			}
		},
	};
	lib.skill._wjmh_shanghaishuzi_ = {
		priority: 210,
		forced: true,
		trigger: { player: "damageBegin4" },
		filter(event) {
			return event.num && event.num > 1 && event.num <= 9 && lib.config.extension_十周年UI_newDecadeStyle;
		},
		async content(event, trigger, player) {
			const action = trigger.num.toString();
			if (action) {
				const anim = lib.config.extension_十周年UI_newDecadeStyle === "off" ? "shuzi" : "SZN_shuzi";
				dcdAnim.loadSpine(window._WJMHSHANGHAISHUZITEXIAO[anim].name, "skel", () => {
					window._WJMHSHANGHAISHUZITEXIAO[anim].action = action;
					const playOptions = { speed: 0.6, scale: 0.4, parent: player };
					if (lib.config.extension_十周年UI_newDecadeStyle !== "off") {
						playOptions.y = 20;
					}
					dcdAnim.playSpine(window._WJMHSHANGHAISHUZITEXIAO[anim], playOptions);
				});
			}
		},
	};
	//目标指示特效
	lib.element.player.inits = [].concat(lib.element.player.inits || []).concat(async player => {
		if (player.ChupaizhishiXObserver) return;
		const ANIMATION_CONFIG = {
			jiangjun: { name: "SF_xuanzhong_eff_jiangjun", scale: 0.6 },
			weijiangjun: { name: "SF_xuanzhong_eff_weijiangjun", scale: 0.6 },
			cheqijiangjun: { name: "SF_xuanzhong_eff_cheqijiangjun", scale: 0.6 },
			biaoqijiangjun: { name: "SF_xuanzhong_eff_biaoqijiangjun", scale: 0.5 },
			dajiangjun: { name: "SF_xuanzhong_eff_dajiangjun", scale: 0.6 },
			dasima: { name: "SF_xuanzhong_eff_dasima", scale: 0.6 },
			shoushaX: { name: "aar_chupaizhishiX", scale: 0.55 },
			shousha: { name: "aar_chupaizhishi", scale: 0.55 },
		};
		const DELAY_TIME = 300;
		let timer = null;
		const startAnimation = element => {
			if (element.ChupaizhishiXid || timer) return;
			if (!window.chupaiload) {
				window.chupaiload = true;
			}
			timer = setTimeout(() => {
				const config = decadeUI.config.chupaizhishi;
				const animationConfig = ANIMATION_CONFIG[config];
				if (config !== "off" && animationConfig) {
					element.ChupaizhishiXid = dcdAnim.playSpine(
						{
							name: animationConfig.name,
							loop: true,
						},
						{
							parent: element,
							scale: animationConfig.scale,
						}
					);
				}
				timer = null;
			}, DELAY_TIME);
		};
		const stopAnimation = element => {
			if (element.ChupaizhishiXid) {
				dcdAnim.stopSpine(element.ChupaizhishiXid);
				delete element.ChupaizhishiXid;
			}
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
		};
		const observer = new globalThis.MutationObserver(mutations => {
			for (const mutation of mutations) {
				if (mutation.attributeName !== "class") continue;
				const target = mutation.target;
				const isSelectable = target.classList.contains("selectable");
				if (isSelectable) {
					startAnimation(target);
				} else {
					stopAnimation(target);
				}
			}
		});
		observer.observe(player, {
			attributes: true,
			attributeFilter: ["class"],
		});
		player.ChupaizhishiXObserver = observer;
	});
	// 技能外显-仅在babysha样式下且场上人物小于等于5人时生效
	if (lib.config.extension_十周年UI_newDecadeStyle === "babysha" && game.players.length <= 5) {
		const getAllPlayersCount = () => game.players.length + (game.dead ? game.dead.length : 0);
		const skillDisplayManager = (() => {
			const playerSkillArrays = new WeakMap();
			const isOtherSkill = (skill, player) => {
				if (!player || player === game.me) return false;
				if (!lib.translate?.[skill]) return false;
				const info = get.info(skill);
				if (info && info.charlotte) return false;
				if (info && info.zhuSkill && !player.isZhu) return true;
				return !info || !info.nopop || skill.startsWith("olhedao_tianshu_");
			};
			const getSkillName = skill => lib.translate?.[skill] || skill;
			// 获取技能图标
			const getSkillIcon = (skill, player) => {
				const info = get.info(skill);
				if (!info) return null;
				// 限定技图标
				if (info.limited) {
					return "xiandingjihs.png";
				}
				// 觉醒技图标
				if (info.juexingji) {
					return "juexingjihs.png";
				}
				// 转换技图标
				if (get.is.zhuanhuanji(skill, player)) {
					const markNode = player?.node?.xSkillMarks?.querySelector(`.skillMarkItem.zhuanhuanji[data-id="${skill}"]`);
					const imgType = markNode?.classList.contains("yin") ? "ying" : "yang";
					return imgType === "yang" ? "mark_yanghs.png" : "mark_yinghs.png";
				}
				return null;
			};
			const showSkillDescription = (skill, targetElement) => {
				// 移除已存在的技能描述弹窗
				const existingPopup = document.querySelector(".baby_skill_popup");
				if (existingPopup) existingPopup.remove();
				const skillName = getSkillName(skill);
				const skillInfo = lib.skill[skill];
				if (!skillInfo) return;
				const popup = document.createElement("div");
				popup.className = "baby_skill_popup";
				const title = document.createElement("div");
				title.className = "skill_title";
				title.textContent = skillName;
				popup.appendChild(title);
				const description = document.createElement("div");
				description.className = "skill_description";
				// 使用本体相同的技能描述获取方法
				const skillDesc = get.translation(skill, "info") || "暂无描述";
				// 支持HTML标签渲染
				description.innerHTML = skillDesc;
				popup.appendChild(description);
				// 先添加到DOM中获取实际尺寸
				document.body.appendChild(popup);
				// 强制重新计算尺寸，确保完全包裹内容
				const titleHeight = title.scrollHeight;
				const descHeight = description.scrollHeight;
				const marginBetween = 8; // 标题和描述之间的间距
				const padding = 24; // 上下padding
				const totalContentHeight = titleHeight + descHeight + marginBetween + padding;
				// 设置精确的高度
				popup.style.height = `${totalContentHeight}px`;
				// 计算弹窗位置
				const rect = targetElement.getBoundingClientRect();
				const popupRect = popup.getBoundingClientRect();
				let left = rect.left + rect.width / 2 - popupRect.width / 2; // 居中显示
				let top = rect.top - popupRect.height - 10;
				// 边界检查
				if (left < 10) left = 10;
				if (left + popupRect.width > window.innerWidth - 10) left = window.innerWidth - popupRect.width - 10;
				if (top < 10) top = rect.bottom + 10;
				popup.style.left = `${left}px`;
				popup.style.top = `${top}px`;
				// 点击其他地方关闭弹窗
				const closePopup = e => {
					if (!popup.contains(e.target)) {
						popup.remove();
						document.removeEventListener("click", closePopup);
					}
				};
				setTimeout(() => document.addEventListener("click", closePopup), 100);
			};
			const updateSkillDisplay = player => {
				if (getAllPlayersCount() > 5) return;
				const avatar = player.node.avatar;
				if (!avatar) return;
				avatar.parentNode.querySelectorAll(".baby_skill").forEach(list => list.remove());
				const skillArray = playerSkillArrays.get(player) || [];
				const uniqueSkills = [];
				const seen = new Set();
				for (const skill of skillArray) {
					const name = getSkillName(skill);
					if (!seen.has(name)) {
						seen.add(name);
						uniqueSkills.push(skill);
					}
				}
				const rect = avatar.getBoundingClientRect();
				const isLeft = rect.left < window.innerWidth / 2;
				const mode = get.mode();
				const isDoubleCharacter = lib.config.mode_config[mode] && lib.config.mode_config[mode].double_character;
				const baseOffset = isDoubleCharacter ? 135 : 75;
				const frag = document.createDocumentFragment();
				uniqueSkills.forEach((skill, idx) => {
					const skillList = document.createElement("div");
					Object.assign(skillList.style, {
						position: "absolute",
						bottom: `${idx * 35 + 30}px`,
						zIndex: "102",
					});
					skillList.className = "baby_skill";
					Object.assign(skillList.style, {
						left: isLeft ? `${avatar.offsetWidth + (isDoubleCharacter ? 65 : 10)}px` : "",
						right: isLeft ? "" : `${avatar.offsetWidth + baseOffset}px`,
					});
					const skillBox = document.createElement("div");
					skillBox.className = "baby_skill_box";
					skillBox.setAttribute("data-skill", skill);
					skillBox.textContent = getSkillName(skill).slice(0, 2);
					skillBox.style.cursor = "pointer";
					// 添加技能图标
					const skillIcon = getSkillIcon(skill, player);
					if (skillIcon) {
						const iconImg = document.createElement("img");
						iconImg.src = `extension/十周年UI/shoushaUI/skill/babysha/${skillIcon}`;
						iconImg.style.position = "absolute";
						iconImg.style.top = "3px";
						iconImg.style.right = "-15px";
						iconImg.style.width = "16px";
						iconImg.style.height = "16px";
						iconImg.style.zIndex = "103";
						skillList.appendChild(iconImg);
					}
					skillBox.addEventListener("click", e => {
						e.stopPropagation();
						game.playAudio("..", "extension", "十周年UI", "audio/BtnSure");
						showSkillDescription(skill, e.target);
					});
					skillList.appendChild(skillBox);
					frag.appendChild(skillList);
				});
				avatar.parentNode.appendChild(frag);
			};
			const updateSkillArray = (player, skill, add = true) => {
				if (getAllPlayersCount() > 5) return;
				if (!isOtherSkill(skill, player)) return;
				if (!playerSkillArrays.has(player)) playerSkillArrays.set(player, []);
				const arr = playerSkillArrays.get(player);
				const idx = arr.indexOf(skill);
				if (add && idx === -1) arr.push(skill);
				if (!add && idx > -1) arr.splice(idx, 1);
				updateSkillDisplay(player);
			};
			const refreshPlayerSkills = player => {
				if (getAllPlayersCount() > 5 || !player) return;
				const avatar = player.node.avatar;
				if (!avatar) return;
				const merged = [...(player.skills || []), ...(player.additionalSkills ? Object.keys(player.additionalSkills) : [])].filter(skill => isOtherSkill(skill, player));
				playerSkillArrays.set(player, merged);
				updateSkillDisplay(player);
			};
			["showCharacterEnd", "hideCharacter", "changeCharacter", "removeCharacter"].forEach(eventName => {
				const oldHandler = lib.element.player[eventName];
				if (!oldHandler) return;
				lib.element.player[eventName] = function (...args) {
					if (typeof oldHandler === "function") oldHandler.apply(this, args);
					refreshPlayerSkills(this);
				};
			});
			const origAdd = lib.element.player.addSkill;
			const origRemove = lib.element.player.removeSkill;
			const origIsUnderControl = lib.element.player.isUnderControl;
			lib.element.player.addSkill = function (skill, ...args) {
				const res = origAdd.apply(this, [skill, ...args]);
				const applyAdd = s => requestAnimationFrame(() => updateSkillArray(this, s, true));
				if (Array.isArray(skill)) skill.forEach(applyAdd);
				else applyAdd(skill);
				return res;
			};
			lib.element.player.removeSkill = function (skill, ...args) {
				const res = origRemove.apply(this, [skill, ...args]);
				const applyRemove = s => requestAnimationFrame(() => updateSkillArray(this, s, false));
				if (Array.isArray(skill)) skill.forEach(applyRemove);
				else applyRemove(skill);
				return res;
			};
			if (typeof origIsUnderControl === "function") {
				lib.element.player.isUnderControl = function (...args) {
					const result = origIsUnderControl.apply(this, args);
					const prev = this.__babyshaUnderControl;
					this.__babyshaUnderControl = result;
					if (prev !== undefined && prev !== result && getAllPlayersCount() <= 5) {
						requestAnimationFrame(() => refreshPlayerSkills(this));
					}
					return result;
				};
			}
			lib.skill._zhuanhuanjiUpdate = {
				trigger: { global: "changeZhuanhuanji" },
				forced: true,
				popup: false,
				silent: true,
				filter(event, player) {
					return getAllPlayersCount() <= 5 && event.player && event.skill;
				},
				async content(event, trigger, player) {
					updateSkillDisplay(event.player);
				},
			};
			return { refreshPlayerSkills };
		})();
		lib.refreshPlayerSkills = skillDisplayManager.refreshPlayerSkills;
	}
	async function clearAllSkillDisplay() {
		for (const player of [...game.players, ...(game.dead || [])]) {
			const avatar = player.node.avatar;
			if (!avatar) continue;
			avatar.parentNode.querySelectorAll(".baby_skill").forEach(list => list.remove());
		}
	}
	lib.clearAllSkillDisplay = clearAllSkillDisplay;
	// 装备入手
	function createEquipCardCopy(originalCard) {
		const card = ui.create.card(ui.special);
		card.init([originalCard.suit, originalCard.number, originalCard.name, originalCard.nature]);
		card.cardid = originalCard.cardid;
		card.wunature = originalCard.wunature;
		card.storage = originalCard.storage;
		card.relatedCard = originalCard;
		card.owner = get.owner(originalCard);
		const observer = new MutationObserver(mutations => {
			if (get.position(card) === "s" && card.hasGaintag("equipHand")) {
				for (const m of mutations) {
					if (m.attributeName === "class") {
						ui.selected.cards.remove(card);
						if (card.classList.contains("selected")) {
							card.updateTransform(true, 0);
							card.relatedCard.classList.add("selected");
							ui.selected.cards.add(card.relatedCard);
						} else {
							card.updateTransform(false, 0);
							card.relatedCard.classList.remove("selected");
							ui.selected.cards.remove(card.relatedCard);
						}
					}
				}
			}
		});
		observer.observe(card, { attributes: true, attributeFilter: ["class"] });
		return card;
	}
	ui.create.cardChooseAll = function () {
		const event = get.event();
		if (!event.isMine() || !event.allowChooseAll || event.complexCard || event.complexSelect || !lib.config.choose_all_button) return null;
		const selectCard = event.selectCard;
		const range = get.select(selectCard);
		if (range[1] <= 1) return null;
		return (event.cardChooseAll = ui.create.control("全选", () => {
			const event2 = get.event();
			const player = event2.player;
			const selecteds = [...ui.selected.cards].map(card => player.getCards("s", i => i.relatedCard === card)[0] || card);
			ui.selected.cards.length = 0;
			game.check();
			const selectables = get.selectableCards();
			const cards = selecteds.length ? [...new Set(selectables).difference(selecteds)] : selectables;
			if (cards.length <= range[1]) ui.selected.cards.push(...cards);
			else ui.selected.cards.push(...cards.randomGets(range[1]));
			for (const card of ui.selected.cards) {
				card.classList.add("selected");
				card.updateTransform(true, 0);
			}
			for (const card of selecteds) {
				card.classList.remove("selected");
				card.updateTransform(false, 0);
			}
			game.check();
			if (typeof event2.custom?.add?.card === "function") _status.event.custom.add.card();
		}));
	};
	function createFilterCard(originalFilter, includeS) {
		return (card, player, target) => {
			const relatedCard = card.relatedCard || card;
			if (get.position(card) === "e") return false;
			if (includeS && get.position(card) === "s" && get.itemtype(card) === "card" && !card.hasGaintag("equipHand")) return false;
			return originalFilter(relatedCard, player, target);
		};
	}
	function processCardSelection(event, player, cardx, cardxF, cardxF2) {
		const hasFilter = !!event.filterCard;
		const isMultiSelect = typeof event.selectCard === "object" || event.selectCard > 1;
		if (hasFilter) {
			if (isMultiSelect) {
				cardxF2.addArray(cardxF);
				for (const cardF of player.getCards("he", j => {
					const relatedCard = j.relatedCard || j;
					return event.position.includes(get.position(relatedCard)) && event.filterCard(relatedCard, player, event.target);
				})) {
					if (!ui.selected.cards) ui.selected.cards = [];
					ui.selected.cards.add(cardF);
					cardxF2.addArray(
						cardx.filter(j => {
							if (cardxF2.includes(j)) return false;
							const relatedCard = j.relatedCard || j;
							return event.position.includes(get.position(relatedCard)) && event.filterCard(relatedCard, player, event.target);
						})
					);
					ui.selected.cards.remove(cardF);
				}
			}
		}
		const cardsToGive = isMultiSelect ? cardxF2 : hasFilter ? cardxF : cardx;
		if (cardsToGive.length) player.directgains(cardsToGive, null, "equipHand");
	}
	function setupCardStyles(cards) {
		cards.forEach(card => {
			card.node.gaintag.classList.remove("gaintag", "info");
			card.node.gaintag.innerHTML = '<div class="epclick"></div>';
		});
	}
	function sortCards(cards) {
		cards.sort((b, a) => {
			if (a.name !== b.name) return lib.sort.card(a.name, b.name);
			if (a.suit !== b.suit) return lib.suit.indexOf(a) - lib.suit.indexOf(b);
			return a.number - b.number;
		});
	}
	lib.hooks.checkBegin.add(async event => {
		if (lib.config["extension_十周年UI_aloneEquip"]) return;
		const player = event.player;
		const isValidEvent = event.position && typeof event.position === "string" && event.position.includes("e") && player.countCards("e") && !event.copyCards && ["chooseCard", "chooseToUse", "chooseToRespond", "chooseToDiscard", "chooseCardTarget", "chooseToGive"].includes(event.name);
		if (!isValidEvent) return;
		event.copyCards = true;
		const includeS = !event.position.includes("s");
		if (includeS) event.position += "s";
		let eventFilterCard;
		if (event.filterCard) eventFilterCard = createFilterCard(event.filterCard, includeS);
		const originalCards = player.getCards("e");
		const cardx = originalCards.map(createEquipCardCopy);
		let cardxF = [];
		let cardxF2 = [];
		if (event.filterCard) {
			cardxF = cardx.filter(card => {
				const relatedCard = card.relatedCard || card;
				return event.filterCard(relatedCard, player, event.target);
			});
		}
		processCardSelection(event, player, cardx, cardxF, cardxF2);
		if (eventFilterCard) event.filterCard = eventFilterCard;
		const allCards = [...cardx, ...cardxF, ...cardxF2];
		setupCardStyles(allCards);
		sortCards(cardx);
	});
	function cleanupEquipCards(event, player) {
		const cards = event.result?.cards;
		if (cards) {
			cards.forEach((card, index) => {
				if (card.hasGaintag("equipHand")) {
					const originalCard = player.getCards("e", c => c.cardid === card.cardid)[0];
					if (originalCard) cards[index] = originalCard;
				}
			});
		}
		if (player) {
			player
				.getCards("s", card => card.hasGaintag("equipHand"))
				.forEach(card => {
					card.discard();
					card.delete();
				});
		}
		event.copyCards = false;
		if (player === game.me) ui.updatehl();
	}
	lib.hooks.uncheckBegin.add(async (event, args) => {
		const player = event.player;
		const shouldCleanup = args.includes("card") && event.copyCards && (event.result || (["chooseToUse", "chooseToRespond"].includes(event.name) && !event.skill && !event.result));
		if (lib.config["extension_十周年UI_aloneEquip"] || shouldCleanup) cleanupEquipCards(event, player);
	});
	lib.hooks.checkCard.add((card, event) => {
		if (lib.config["extension_十周年UI_aloneEquip"] || !event.copyCards) return;
		if (get.position(card) === "e" && card.classList.contains("selected")) {
			const equipHandCopy = event.player.getCards("s", c => c.hasGaintag("equipHand") && c.relatedCard === card)[0];
			if (equipHandCopy && !equipHandCopy.classList.contains("selected")) {
				card.classList.remove("selected");
				ui.selected.cards.remove(card);
			}
		}
	});
	lib.hooks.checkEnd.add(function (event) {
		if (lib.config["extension_十周年UI_aloneEquip"] || !event.copyCards) return;
		const player = event.player;
		const equipCards = player.getCards("e");
		for (const equipCard of equipCards) {
			if (equipCard.classList.contains("selected")) {
				const equipHandCopy = player.getCards("s", c => c.hasGaintag("equipHand") && c.relatedCard === equipCard)[0];
				if (equipHandCopy && !equipHandCopy.classList.contains("selected")) {
					equipCard.classList.remove("selected");
					ui.selected.cards.remove(equipCard);
				}
			}
		}
	});
	// 出牌信息提示
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
		const [min = 1, max = min] = get.select(event.selectCard) ?? [];
		const needCount = max >= 0 ? max : min;
		const prompt = sanitizePrompt(event.prompt);
		let respondCardName = "";
		let respondTargetName = "";
		if (prompt.includes("响应")) {
			const [before, after] = prompt.split("响应");
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
		const wrapText = text => decPrompt(sanitizePrompt(text));
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
});
