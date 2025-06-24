app.import(function (lib, game, ui, get, ai, _status, app) {
	// 常量定义
	const CONSTANTS = {
		EXTENSION_PATH: lib.assetURL + "extension/十周年UI/shoushaUI/",
		SUPPORTED_GROUPS: ["wei", "shu", "wu", "qun", "ye", "jin", "daqin", "western", "shen", "key", "devil"],
		DEFAULT_GROUP: "default",
		UNKNOWN_NAME: "unknown",
		UNKNOWN_DISPLAY: "未知",
		CLASSIC_SKIN: "经典形象",
		NO_PACK: "暂无分包",
	};

	// 千幻聆音皮肤等级映射
	const SKIN_LEVEL_MAP = {
		xiyou: "rare",
		shishi: "epic",
		chuanshuo: "legend",
		putong: "common",
		dongtai: "legend",
		jueban: "unique",
		xianding: "restrictive",
	};

	// 工具函数
	const utils = {
		// 获取有效的势力组
		getValidGroup: function (group) {
			return CONSTANTS.SUPPORTED_GROUPS.includes(group) ? group : CONSTANTS.DEFAULT_GROUP;
		},

		// 获取皮肤等级
		getSkinLevel: function (name) {
			if (lib.config["extension_千幻聆音_enable"] && typeof game.qhly_getSkinLevel === "function" && typeof game.qhly_getSkin === "function") {
				const level = game.qhly_getSkinLevel(name, game.qhly_getSkin(name), true, false);
				return SKIN_LEVEL_MAP[level] || "junk";
			}
			return game.getRarity(name) || "junk";
		},

		// 获取皮肤信息
		getSkinInfo: function (name) {
			if (lib.config["extension_千幻聆音_enable"] && typeof game.qhly_getSkinInfo === "function" && typeof game.qhly_getSkin === "function") {
				return game.qhly_getSkinInfo(name, game.qhly_getSkin(name), null).translation || CONSTANTS.CLASSIC_SKIN;
			}
			return CONSTANTS.CLASSIC_SKIN;
		},

		// 提取图片路径
		extractImagePath: function (styleBackground) {
			if (!styleBackground) return "";

			if (styleBackground.indexOf('url("') === 0) {
				return styleBackground.slice(5, styleBackground.indexOf('")'));
			} else if (styleBackground.indexOf("url('") === 0) {
				return styleBackground.slice(5, styleBackground.indexOf("')"));
			}
			return "";
		},

		// 设置立绘背景
		setCharacterSkin: function (skinElement, playerSkin, isUnknown = false) {
			if (isUnknown) {
				skinElement.style.backgroundImage = `url("${CONSTANTS.EXTENSION_PATH}character/images/unknown.png")`;
				return;
			}

			const originalPath = utils.extractImagePath(playerSkin);
			if (!originalPath) return;

			const testImg = new Image();
			testImg.onerror = function () {
				// lihui路径不存在，使用默认路径
				const defaultPath = originalPath.replace(/image\/character/, "image/lihui/default");
				skinElement.style.backgroundImage = `url("${defaultPath}")`;
			};
			testImg.onload = function () {
				// lihui路径存在，使用lihui路径
				skinElement.style.backgroundImage = `url("${this.src}")`;
			};
			// 尝试lihui路径
			testImg.src = originalPath.replace(/image\/character/, "image/lihui");
		},

		// 获取分包信息
		getPackInfo: function (name) {
			const pack = Object.keys(lib.characterPack).find(pack => lib.characterPack[pack][name]);
			if (!pack) return CONSTANTS.NO_PACK;

			if (lib.characterSort[pack]) {
				const sort = Object.keys(lib.characterSort[pack]).find(sort => lib.characterSort[pack][sort].includes(name));
				if (sort) return lib.translate[sort];
			}
			return lib.translate[pack + "_character_config"] || lib.translate[pack];
		},

		// 获取武将显示名称
		getDisplayName: function (name) {
			if (name === CONSTANTS.UNKNOWN_NAME) return CONSTANTS.UNKNOWN_DISPLAY;
			return lib.translate[name + "_ab"] || get.translation(name);
		},
	};

	// 对话框创建器
	const dialogCreator = {
		// 创建基础对话框
		createBaseDialog: function () {
			const container = ui.create.div(".popup-container.hidden", ui.window, function (e) {
				if (e.target === container) {
					container.hide();
					game.resume2();
				}
			});

			const dialog = ui.create.div(".character-dialog.popped", container);
			const leftPane = ui.create.div(".left", dialog);
			const rightPane = ui.create.div(".right", dialog);

			return { container, dialog, leftPane, rightPane };
		},

		// 设置背景和立绘
		setupBackgroundAndSkins: function (dialog, player, skin1, skin2) {
			const group = utils.getValidGroup(player.group);
			const bgUrl = `${CONSTANTS.EXTENSION_PATH}character/images/shizhounian/skt_${group}.png`;
			dialog.style.backgroundImage = `url("${bgUrl}")`;

			// 获取主副将姓名
			const name = player.name1 || player.name;
			const name2 = player.name2;
			const isUnseen = player.classList.contains("unseen") && player !== game.me;
			const isUnseen2 = player.classList.contains("unseen2") && player !== game.me;

			const actualName = isUnseen ? CONSTANTS.UNKNOWN_NAME : name;
			const actualName2 = isUnseen2 ? CONSTANTS.UNKNOWN_NAME : name2;

			// 设置主将立绘
			if (actualName !== CONSTANTS.UNKNOWN_NAME) {
				let playerSkin = player.style.backgroundImage;
				if (!playerSkin) playerSkin = player.childNodes[0].style.backgroundImage;
				utils.setCharacterSkin(skin1, playerSkin);
			} else {
				utils.setCharacterSkin(skin1, null, true);
			}

			// 设置副将立绘
			if (actualName2) {
				if (actualName2 !== CONSTANTS.UNKNOWN_NAME) {
					const playerSkin2 = player.childNodes[1].style.backgroundImage;
					utils.setCharacterSkin(skin2, playerSkin2);
				} else {
					utils.setCharacterSkin(skin2, null, true);
				}
			}

			return { actualName, actualName2, group };
		},

		// 创建等阶显示
		createRarityDisplay: function (dialog, name, name2) {
			const rarity = utils.getSkinLevel(name);
			const pe = ui.create.div(".pe1", dialog);
			const peUrl = `${CONSTANTS.EXTENSION_PATH}character/images/shizhounian/pe_${rarity}.png`;
			pe.style.backgroundImage = `url("${peUrl}")`;

			// 创建皮肤信息文本
			const skinInfo1 = utils.getSkinInfo(name);
			let value = `${skinInfo1}*${get.translation(name)}`;

			if (name2) {
				const skinInfo2 = utils.getSkinInfo(name2);
				value += `<br>${skinInfo2}*${get.translation(name2)}`;
			}

			const pn = ui.create.div(".pn1", value);
			pe.appendChild(pn);

			return { rarity, pe };
		},

		// 创建武将姓名显示
		createNameDisplay: function (dialog, name, name2, group) {
			let nameText = "";
			if (name && name2) {
				nameText += utils.getDisplayName(name) + " / " + utils.getDisplayName(name2);
			} else {
				nameText += utils.getDisplayName(name);
			}

			const nameStyle = ui.create.div(".name", nameText, dialog);
			nameStyle.dataset.camp = group;

			if (name && name2) {
				nameStyle.style.fontSize = "18px";
				nameStyle.style.letterSpacing = "1px";
			}

			// 添加等阶图标
			const rarity = utils.getSkinLevel(name);
			const head = ui.create.node("img");
			head.src = `${CONSTANTS.EXTENSION_PATH}character/images/shizhounian/rarity_${rarity}.png`;
			head.style.cssText = "display:inline-block;width:61.6px;height:53.2px;top:-13px; position:absolute;background-color: transparent;z-index:1;margin-left:5px;";
			nameStyle.appendChild(head);

			return nameStyle;
		},

		// 创建技能显示
		createSkillDisplay: function (rightPane, player) {
			const oSkills = player.getSkills(null, false, false).slice(0);
			if (player === game.me) {
				oSkills.push(...player.hiddenSkills);
			}

			oSkills.forEach(function (skillName) {
				const translation = lib.translate[skillName];
				if (!translation || !lib.translate[skillName + "_info"] || translation === "" || lib.translate[skillName + "_info"] === "") {
					return;
				}

				const isHidden = !player.getSkills().includes(skillName) || player.awakenedSkills.includes(skillName);
				const opacity = isHidden ? "opacity:0.5" : "";
				const indent = isHidden ? "opacity:0.5;text-indent:10px" : "text-indent:10px";

				ui.create.div(".xskill", `<div data-color><span style="${opacity}">${translation}： </span></div>` + `<div><span style="${indent}">${get.skillInfoTranslation(skillName, player)}</span></div>`, rightPane.firstChild);

				// 自动发动设置
				if (lib.skill[skillName].frequent || lib.skill[skillName].subfrequent) {
					const autoNode = ui.create.div(".xskill", `<div class="underlinenode on gray" style="position:relative;padding-left:0;padding-bottom:3px">【${translation}】自动发动</div></div></div>`, rightPane.firstChild);

					const underlinenode = rightPane.firstChild.querySelector(".underlinenode");

					// 检查自动技能状态
					if (lib.skill[skillName].frequent && lib.config.autoskilllist.includes(skillName)) {
						underlinenode.classList.remove("on");
					}

					if (lib.skill[skillName].subfrequent) {
						lib.skill[skillName].subfrequent.forEach(function (subSkill) {
							if (lib.config.autoskilllist.includes(skillName + "_" + subSkill)) {
								underlinenode.classList.remove("on");
							}
						});
					}

					underlinenode.link = skillName;
					underlinenode.listen(ui.click.autoskill2);
				}
			});
		},

		// 创建手牌显示
		createHandcardDisplay: function (rightPane, player) {
			const hSkills = player.getCards("h");
			if (!hSkills.length) return;

			const allShown = player.isUnderControl() || (!game.observe && game.me?.hasSkillTag("viewHandcard", null, player, true));
			const shownHs = player.getShownCards();

			if (shownHs.length) {
				const hasHiddenCards = player.hasCard(card => !shownHs.includes(card), "h");
				ui.create.div(".xcaption", hasHiddenCards ? "明置的手牌" : "手牌区域", rightPane.firstChild);

				shownHs.forEach(function (item) {
					const card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
					card.style.zoom = "0.6";
					rightPane.firstChild.appendChild(card);
				});

				if (allShown) {
					const hs = hSkills.slice();
					hs.removeArray(shownHs);
					if (hs.length) {
						ui.create.div(".xcaption", "其他手牌", rightPane.firstChild);
						hs.forEach(function (item) {
							const card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
							card.style.zoom = "0.6";
							rightPane.firstChild.appendChild(card);
						});
					}
				}
			} else if (allShown) {
				ui.create.div(".xcaption", "手牌区域", rightPane.firstChild);
				hSkills.forEach(function (item) {
					const card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
					card.style.zoom = "0.6";
					rightPane.firstChild.appendChild(card);
				});
			}
		},

		// 创建装备显示
		createEquipmentDisplay: function (rightPane, player) {
			const eSkills = player.getCards("e");
			if (!eSkills.length) return;

			ui.create.div(".xcaption", "装备区域", rightPane.firstChild);
			eSkills.forEach(function (card) {
				const cards = card.cards;
				let str = [get.translation(card), get.translation(card.name + "_info")];

				if (Array.isArray(cards) && cards.length) {
					str[0] += "（" + get.translation(card.cards) + "）";
				}

				if (lib.card[card.name]?.cardPrompt) {
					str[1] = lib.card[card.name].cardPrompt(card, player);
				}

				ui.create.div(".xskill", `<div data-color>${str[0]}</div><div>${str[1]}</div>`, rightPane.firstChild);
			});
		},

		// 创建判定显示
		createJudgeDisplay: function (rightPane, player) {
			const judges = player.getCards("j");
			if (!judges.length) return;

			ui.create.div(".xcaption", "判定区域", rightPane.firstChild);
			judges.forEach(function (card) {
				const cards = card.cards;
				let str = [get.translation(card), get.translation(card.name + "_info")];

				if ((Array.isArray(cards) && cards.length && !lib.card[card]?.blankCard) || player.isUnderControl(true)) {
					str[0] += "（" + get.translation(cards) + "）";
				}

				ui.create.div(".xskill", `<div data-color>${str[0]}</div><div>${str[1]}</div>`, rightPane.firstChild);
			});
		},
	};

	var plugin = {
		name: "character",
		filter: function () {
			return !["chess", "tafang"].includes(get.mode());
		},
		content: function (next) {},
		precontent: function () {
			app.reWriteFunction(lib, {
				setIntro: [
					function (args, node) {
						if (get.itemtype(node) === "player") {
							if (lib.config.touchscreen) {
								lib.setLongPress(node, plugin.click.playerIntro);
							} else {
								if (lib.config.right_info) {
									node.oncontextmenu = plugin.click.playerIntro;
								}
							}
							return node;
						}
					},
				],
			});
		},

		click: {
			identity: function (e) {
				e.stopPropagation();
				var player = this.parentNode;
				if (!game.getIdentityList) return;

				if (player.node.guessDialog) {
					player.node.guessDialog.classList.toggle("hidden");
				} else {
					var list = game.getIdentityList(player);
					if (!list) return;
					var guessDialog = ui.create.div(".guessDialog", player);
					var container = ui.create.div(guessDialog);

					lib.setScroll(guessDialog);
					player.node.guessDialog = guessDialog;
				}
			},

			playerIntro: function (e) {
				e.stopPropagation();

				if (plugin.playerDialog) {
					return plugin.playerDialog.show(this);
				}

				// 创建对话框基础结构
				const { container, dialog, leftPane, rightPane } = dialogCreator.createBaseDialog();

				container.show = function (player) {
					// 创建皮肤元素
					const skin1 = ui.create.div(".skin1", dialog);
					const skin2 = ui.create.div(".skin2", dialog);

					// 设置背景和立绘
					const { actualName, actualName2, group } = dialogCreator.setupBackgroundAndSkins(dialog, player, skin1, skin2);

					// 创建等阶显示
					dialogCreator.createRarityDisplay(dialog, actualName, actualName2);

					// 创建武将姓名显示
					dialogCreator.createNameDisplay(dialog, actualName, actualName2, group);

					// 创建分包信息
					ui.create.div(".pack", utils.getPackInfo(actualName), dialog);

					// 初始化面板
					leftPane.innerHTML = "<div></div>";
					rightPane.innerHTML = "<div></div>";
					lib.setScroll(rightPane.firstChild);

					// 创建各种信息显示
					dialogCreator.createSkillDisplay(rightPane, player);
					dialogCreator.createHandcardDisplay(rightPane, player);
					dialogCreator.createEquipmentDisplay(rightPane, player);
					dialogCreator.createJudgeDisplay(rightPane, player);

					// 显示对话框
					container.classList.remove("hidden");
					game.pause2();
				};

				plugin.characterDialog = container;
				container.show(this);
			},
		},
	};

	return plugin;
});
