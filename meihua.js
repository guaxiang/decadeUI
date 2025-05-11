"use strict";
decadeModule.import(function (lib, game, ui, get, ai, _status) {
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
				if (lib.config.extension_十周年UI_longLevel == "ten") {
					var rarity = ["silver", "gold", "yu", "bing", "yan"];
					switch (game.getRarity(player.name)) {
						case "junk":
							rarity = rarity[0];
							break;
						case "common":
							rarity = rarity[1];
							break;
						case "rare":
							rarity = rarity[2];
							break;
						case "epic":
							rarity = rarity[3];
							break;
						case "legend":
							rarity = rarity[4];
							break;
						default:
							break;
					}
				}
				if (lib.config.extension_十周年UI_longLevel == "eleven") {
					var rarity = ["silver", "gold", "yu", "bing", "yan"].randomGet();
				}
				if (rarity === "yan") {
					var longtou = document.createElement("img");
					longtou.src = decadeUIPath + "/assets/image/OL等阶露头框/k2.png";
					longtou.style.cssText = "pointer-events:none";
					longtou.style.position = "absolute";
					longtou.style.display = "block";
					longtou.style.top = "-20.5px";
					longtou.style.right = "-5px";
					longtou.style.height = "115%";
					longtou.style.width = "130%";
					longtou.style.zIndex = "60";
					player.appendChild(longtou);
					var longwei = document.createElement("img");
					longwei.src = decadeUIPath + "/assets/image/OL等阶露头框/border_campOL5.png";
					longwei.style.cssText = "pointer-events:none";
					longwei.style.position = "absolute";
					longwei.style.display = "block";
					longwei.style.top = "-20.5px";
					longwei.style.right = "-5px";
					longwei.style.height = "115%";
					longwei.style.width = "130%";
					longwei.style.zIndex = "72";
					player.appendChild(longwei);
				}
				if (rarity === "bing") {
					var longtou = document.createElement("img");
					longtou.src = decadeUIPath + "/assets/image/OL等阶露头框/k8.png";
					longtou.style.cssText = "pointer-events:none";
					longtou.style.position = "absolute";
					longtou.style.display = "block";
					longtou.style.top = "-6px";
					longtou.style.right = "-5.5px";
					longtou.style.height = "109%";
					longtou.style.width = "123%";
					longtou.style.zIndex = "60";
					player.appendChild(longtou);
					var longwei = document.createElement("img");
					longwei.src = decadeUIPath + "/assets/image/OL等阶露头框/border_campOL4.png";
					longwei.style.cssText = "pointer-events:none";
					longwei.style.position = "absolute";
					longwei.style.display = "block";
					longwei.style.top = "-6px";
					longwei.style.right = "-5.5px";
					longwei.style.height = "107%";
					longwei.style.width = "123%";
					longwei.style.zIndex = "72";
					player.appendChild(longwei);
				}
				if (rarity === "yu") {
					var longtou = document.createElement("img");
					longtou.src = decadeUIPath + "/assets/image/OL等阶露头框/k6.png";
					longtou.style.cssText = "pointer-events:none";
					longtou.style.position = "absolute";
					longtou.style.display = "block";
					longtou.style.top = "-3px";
					longtou.style.right = "-3px";
					longtou.style.height = "107.5%";
					longtou.style.width = "114.5%";
					longtou.style.zIndex = "60";
					player.appendChild(longtou);
					var longwei = document.createElement("img");
					longwei.src = decadeUIPath + "/assets/image/OL等阶露头框/border_campOL3.png";
					longwei.style.cssText = "pointer-events:none";
					longwei.style.position = "absolute";
					longwei.style.display = "block";
					longwei.style.top = "-3px";
					longwei.style.right = "-3px";
					longwei.style.height = "105.5%";
					longwei.style.width = "114.5%";
					longwei.style.zIndex = "72";
					player.appendChild(longwei);
				}
				if (rarity === "gold") {
					var longtou = document.createElement("img");
					longtou.src = decadeUIPath + "/assets/image/OL等阶露头框/k4.png";
					longtou.style.cssText = "pointer-events:none";
					longtou.style.position = "absolute";
					longtou.style.display = "block";
					longtou.style.top = "-5px";
					longtou.style.right = "-3px";
					longtou.style.height = "107.5%";
					longtou.style.width = "114.5%";
					longtou.style.zIndex = "60";
					player.appendChild(longtou);
					var longwei = document.createElement("img");
					longwei.src = decadeUIPath + "/assets/image/OL等阶露头框/border_campOL2.png";
					longwei.style.cssText = "pointer-events:none";
					longwei.style.position = "absolute";
					longwei.style.display = "block";
					longwei.style.top = "-5px";
					longwei.style.right = "-3px";
					longwei.style.height = "107.5%";
					longwei.style.width = "114.5%";
					longwei.style.zIndex = "72";
					player.appendChild(longwei);
				}
				if (rarity === "silver") {
					var longtou = document.createElement("img");
					longtou.src = decadeUIPath + "/assets/image/OL等阶露头框/k2.png";
					longtou.style.cssText = "pointer-events:none";
					longtou.style.position = "absolute";
					longtou.style.display = "block";
					longtou.style.top = "-20.5px";
					longtou.style.right = "-5px";
					longtou.style.height = "115%";
					longtou.style.width = "130%";
					longtou.style.zIndex = "60";
					player.appendChild(longtou);
					var longwei = document.createElement("img");
					longwei.src = decadeUIPath + "/assets/image/OL等阶露头框/border_campOL5.png";
					longwei.style.cssText = "pointer-events:none";
					longwei.style.position = "absolute";
					longwei.style.display = "block";
					longwei.style.top = "-20.5px";
					longwei.style.right = "-5px";
					longwei.style.height = "115%";
					longwei.style.width = "130%";
					longwei.style.zIndex = "72";
					player.appendChild(longwei);
				}
			},
		};
	}

	//势力选择
	if (lib.config["extension_十周年UI_shiliyouhua"]) {
		Object.defineProperty(lib, "group", {
			get: () => {
				if (get.mode() === "guozhan") return ["wei", "shu", "wu", "qun", "jin", "key"];
				return ["wei", "shu", "wu", "qun", "jin", "key"];
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
			filter: (_, player) => {
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
				let card = trigger.card;
				let cardType = get.type(card);
				let cardName = get.name(card);
				let cardNature = get.nature(card);
				if (cardType == "basic") {
					switch (cardName) {
						case "sha":
							if (cardNature == "fire") {
								game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
							} else if (cardNature == "thunder") {
								game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
							} else {
								game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
							}
							break;
						case "shan":
							game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
							break;
						case "tao":
							game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
							break;
						case "jiu":
							game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
							break;
						default:
							game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
					}
				} else if (cardType == "trick") {
					if (get.tag(card, "damage")) {
						game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
					} else if (get.tag(card, "recover")) {
						game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
					} else {
						game.playAudio("..", "extension", "十周年UI", "audio/GameShowCard");
					}
				} else if (cardType == "equip") {
					let equipType = get.subtype(card);
					switch (equipType) {
						case "equip1": // 武器
							game.playAudio("..", "extension", "十周年UI", "audio/weapon_equip");
							break;
						case "equip2": // 防具
							game.playAudio("..", "extension", "十周年UI", "audio/horse_equip");
							break;
						case "equip3": // -1马
							game.playAudio("..", "extension", "十周年UI", "audio/armor_equip");
							break;
						case "equip4": // +1马
							game.playAudio("..", "extension", "十周年UI", "audio/armor_equip");
							break;
						case "equip5": // 宝物
							game.playAudio("..", "extension", "十周年UI", "audio/horse_equip");
							break;
					}
				}
			},
		};
		document.body.addEventListener("mousedown", function (e) {
			const target = e.target;
			if (target.closest("#dui-controls")) {
				if (target.classList.contains("control") || target.parentElement.classList.contains("control")) {
					game.playAudio("..", "extension", "十周年UI", "audio/BtnSure");
				}
			}
			if (target.classList.contains("menubutton") || target.classList.contains("button")) {
				game.playAudio("..", "extension", "十周年UI", "audio/card_click");
			}
			if (target.classList.contains("card")) {
				game.playAudio("..", "extension", "十周年UI", "audio/card_click");
			}
		});
	}

	//宝宝杀人机技能显示
	lib.skill._babyskill = {
		trigger: {
			global: ["gameStart", "addSkill", "removeSkill"],
		},
		forced: true,
		popup: false,
		priority: 114514,
		filter: function () {
			return (get.mode() == "doudizhu" || get.mode() == "versus") && lib.config.extension_十周年UI_newDecadeStyle == "babysha";
		},
		content: function () {
			game.players.forEach(function (player) {
				if (player != game.me) {
					var skills = player.skills.filter(function (skill) {
						return lib.skill[skill];
					});
					console.log(player.name, player.skills, skills);
					if (!skills.length) return;
					var skillBox = ui.create.div(".doudizhu-skill-box");
					skillBox.style.position = "absolute";
					skillBox.style.right = "30px";
					skillBox.style.top = "10px";
					skillBox.style.display = "flex";
					skillBox.style.flexDirection = "column";
					skillBox.style.zIndex = 10;
					skills.forEach(function (skill) {
						var btn = ui.create.div(".doudizhu-skill-btn", get.translation(skill));
						btn.style.margin = "2px 0";
						skillBox.appendChild(btn);
					});
					player.node.babyskillBox = skillBox;
					let avatarNode = player.node.name || player.node.avatar;
					let rect = avatarNode && avatarNode.getBoundingClientRect ? avatarNode.getBoundingClientRect() : null;
					let showRight = false;
					if (rect && rect.left < 120) {
						showRight = true;
					}
					skillBox.style.top = "10px";
					skillBox.style.bottom = "auto";
					skillBox.style.left = showRight ? "440%" : "auto";
					skillBox.style.right = showRight ? "auto" : "100%";
					if (player.node.name && player.node.name.parentNode) {
						player.node.name.parentNode.style.position = "relative";
						player.node.name.parentNode.appendChild(skillBox);
					} else if (player.node.avatar && player.node.avatar.parentNode) {
						player.node.avatar.parentNode.style.position = "relative";
						player.node.avatar.parentNode.appendChild(skillBox);
					} else {
						player.appendChild(skillBox);
					}
				}
			});
		},
	};
});
