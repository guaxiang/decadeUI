"use strict";
decadeModule.import(function (lib, game, ui, get, ai, _status) {
	decadeUI.animateSkill = {
		//涉及game.start自定义brawl模式无法播放开局动画，故搬运到此处做成技能播放
		mx_start: {
			trigger: {
				global: "gameDrawAfter",
			},
			filter(event, player) {
				return lib.config.extension_十周年UI_gameAnimationEffect;
			},
			direct: true,
			priority: Infinity + 114514 + 1919810,
			firstDo: true,
			content() {
				game.removeGlobalSkill("mx_start");
				if (lib.config.extension_十周年UI_newDecadeStyle != "othersOn" || lib.config.extension_十周年UI_newDecadeStyle != "off") {
					game.playAudio("../extension", decadeUI.extensionName, "audio/game_start.mp3");
					var animation = decadeUI.animation;
					var bounds = animation.getSpineBounds("effect_youxikaishi");
					if (bounds == null) return;
					var sz = bounds.size;
					var scale = Math.min(animation.canvas.width / sz.x, animation.canvas.height / sz.y) * 0.76;
					animation.playSpine({
						name: "effect_youxikaishi",
						scale: scale,
					});
				} else {
					game.playAudio("../extension", decadeUI.extensionName, "audio/game_start_shousha.mp3");
					var animation = decadeUI.animation;
					var bounds = animation.getSpineBounds("effect_youxikaishi_shousha");
					if (bounds == null) return;
					var sz = bounds.size;
					var scale = Math.min(animation.canvas.width / sz.x, animation.canvas.height / sz.y) * 1.5;
					animation.playSpine({
						name: "effect_youxikaishi_shousha",
						scale: scale,
					});
				}
			},
		},
		//龙头
		mx_longLevel: {
			trigger: {
				global: "gameStart",
			},
			silent: true,
			forced: true,
			filter(event, player) {
				return lib.config.extension_十周年UI_longLevel == "sex" || lib.config.extension_十周年UI_longLevel == "seven";
			},
			content: function () {
				game.removeGlobalSkill("mx_longLevel");
				game.players.forEach(target => {
					let rarity;
					if (lib.config.extension_十周年UI_longLevel == "seven") {
						const rarityList = ["silver", "gold", "yu", "yan"];
						switch (game.getRarity(player.name)) {
							case "junk":
								rarity = rarityList[0];
								break;
							case "common":
								rarity = rarityList[1];
								break;
							case "rare":
								rarity = rarityList[2];
								break;
							case "epic":
								rarity = rarityList[3];
								break;
							case "legend":
								rarity = rarityList[4];
								break;
							default:
								break;
						}
					}
					if (lib.config.extension_十周年UI_longLevel == "sex") {
						const rarityList = ["gold", "yu", "yan"];
						rarity = rarityList[Math.floor(Math.random() * rarityList.length)];
					}
					let longtou;
					let longwei;
					if (rarity === "yan") {
						const wholeYanDragon = document.createElement("img");
						wholeYanDragon.src = decadeUIPath + "/assets/image/long1_yan.png";
						wholeYanDragon.style.cssText = "pointer-events:none";
						wholeYanDragon.style.position = "absolute";
						wholeYanDragon.style.display = "block";
						wholeYanDragon.style.top = "-88px";
						wholeYanDragon.style.left = "-23px";
						wholeYanDragon.style.height = "213%";
						wholeYanDragon.style.width = "160%";
						wholeYanDragon.style.zIndex = "98";
						target.appendChild(wholeYanDragon);
					} else if (rarity === "yu") {
						const wholeYuDragon = document.createElement("img");
						wholeYuDragon.src = decadeUIPath + "/assets/image/long1_yu.png";
						wholeYuDragon.style.cssText = "pointer-events:none";
						wholeYuDragon.style.position = "absolute";
						wholeYuDragon.style.display = "block";
						wholeYuDragon.style.top = "-40px";
						wholeYuDragon.style.left = "-25px";
						wholeYuDragon.style.height = "139%";
						wholeYuDragon.style.width = "156%";
						wholeYuDragon.style.zIndex = "85";
						target.appendChild(wholeYuDragon);
					} else {
						longtou = document.createElement("img");
						longtou.src = decadeUIPath + "/assets/image/long_" + rarity + "1.png";
						longtou.style.cssText = "pointer-events:none";
						longtou.style.position = "absolute";
						longtou.style.display = "block";
						longtou.style.top = "-36px";
						longtou.style.right = "-26px";
						longtou.style.height = "133px";
						longtou.style.width = "80px";
						longtou.style.zIndex = "80";
						target.appendChild(longtou);

						longwei = document.createElement("img");
						longwei.src = decadeUIPath + "/assets/image/long_" + rarity + "2.png";
						longwei.style.cssText = "pointer-events:none";
						longwei.style.position = "absolute";
						longwei.style.display = "block";
						longwei.style.bottom = "-10px";
						longwei.style.right = "-13px";
						longwei.style.height = "40px";
						longwei.style.width = "92px";
						longwei.style.zIndex = "99";
						target.appendChild(longwei);
					}
				});
			},
		},
		//属性赋予
		decadeUI_usecardBegin: {
			trigger: {
				global: "useCardBegin",
			},
			forced: true,
			popup: false,
			priority: -100,
			silent: true,
			filter(event) {
				return !ui.clear.delay && event.card.name != "wuxie";
			},
			content() {
				ui.clear.delay = "usecard";
			},
		},
		//击杀特效
		decadeUI_dieKillEffect: {
			trigger: {
				source: ["dieBegin"],
			},
			forced: true,
			popup: false,
			priority: -100,
			lastDo: true,
			silent: true,
			content() {
				if (!(trigger.source && trigger.player)) return;
				game.broadcastAll(
					function (source, player) {
						if (!window.decadeUI) return;
						if (!decadeUI.config.playerKillEffect) return;
						decadeUI.effect.kill(source, player);
					},
					trigger.source,
					trigger.player
				);
			},
		},
		//游戏开始分发手牌停顿
		decadeUI_gameDrawDelay: {
			trigger: {
				global: "gameDrawBegin",
			},
			filter() {
				return !(_status.brawl && _status.brawl.noGameDraw);
			},
			priority: 100,
			firstDo: true,
			silent: true,
			forced: true,
			popup: false,
			content() {
				game.removeGlobalSkill("decadeUI_gameDrawDelay");
				decadeUI.delay(250);
			},
		},
		decadeUI_gameDrawDelayx: {
			trigger: {
				global: "gameDrawEnd",
			},
			filter() {
				return !(_status.brawl && _status.brawl.noGameDraw);
			},
			priority: -100,
			lastDo: true,
			silent: true,
			forced: true,
			popup: false,
			content() {
				game.removeGlobalSkill("decadeUI_gameDrawDelayx");
				setTimeout(decadeUI.effect.gameStart, 51);
			},
		},
	};
	decadeUI.skill = {
		ghujia: {
			mark: false,
		},
		_usecard: {
			trigger: {
				global: "useCardAfter",
			},
			forced: true,
			popup: false,
			silent: true,
			priority: -100,
			filter(event) {
				return ui.clear.delay === "usecard" && event.card.name != "wuxie";
			},
			content() {
				ui.clear.delay = false;
				game.broadcastAll(function () {
					ui.clear();
				});
			},
		},
		_discard: {
			trigger: {
				global: ["discardAfter", "loseToDiscardpileAfter", "loseAsyncAfter"],
			},
			filter(event) {
				return ui.todiscard[event.discardid] ? true : false;
			},
			forced: true,
			silent: true,
			popup: false,
			priority: -100,
			content() {
				game.broadcastAll(function (id) {
					if (window.decadeUI) {
						ui.todiscard = [];
						ui.clear();
						return;
					}
					var todiscard = ui.todiscard[id];
					delete ui.todiscard[id];
					if (todiscard) {
						var time = 1000;
						if (typeof todiscard._discardtime == "number") {
							time += todiscard._discardtime - get.time();
						}
						if (time < 0) {
							time = 0;
						}
						setTimeout(function () {
							for (var i = 0; i < todiscard.length; i++) {
								todiscard[i].delete();
							}
						}, time);
					}
				}, trigger.discardid);
			},
		},
		wuxin: {
			audio: 2,
			trigger: {
				player: "phaseDrawBegin1",
			},
			content() {
				var num = get.population("qun");
				if (player.hasSkill("huangjintianbingfu")) {
					num += player.getExpansions("huangjintianbingfu").length;
				}

				var cards = get.cards(num);
				var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
				dialog.caption = "【悟心】";
				game.broadcast(
					function (player, cards, callback) {
						if (!window.decadeUI) return;
						var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
						dialog.caption = "【悟心】";
						dialog.callback = callback;
					},
					player,
					cards,
					dialog.callback
				);

				event.switchToAuto = function () {
					var cards = dialog.cards[0].concat();
					var cheats = [];

					var next = player.getNext();
					var friend = player;
					var judges = friend.node.judges.childNodes;
					if (judges.length > 0) cheats = decadeUI.get.cheatJudgeCards(cards, judges, friend != null);

					if (friend) {
						cards = decadeUI.get.bestValueCards(cards, friend);
					} else {
						cards.sort(function (a, b) {
							return get.value(a, next) - get.value(b, next);
						});
					}

					cards = cheats.concat(cards);
					var time = 500;
					for (var i = 0; i < cards.length; i++) {
						setTimeout(
							function (card, index, finished) {
								dialog.move(card, index, 0);
								if (finished) dialog.finishTime(cards.length <= 1 ? 250 : 1000);
							},
							time,
							cards[i],
							i,
							i >= cards.length - 1
						);
						time += 500;
					}
				};

				if (event.isOnline()) {
					event.player.send(function () {
						if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
					}, event.player);

					event.player.wait();
					decadeUI.game.wait();
				} else if (!event.isMine()) {
					event.switchToAuto();
				}
			},
		},
	};

	if (!_status.connectMode) {
		for (var key in decadeUI.animateSkill) {
			lib.skill[key] = decadeUI.animateSkill[key];
			game.addGlobalSkill(key);
		}
		for (var key in decadeUI.skill) {
			/*if (lib.skill[key]) */
			lib.skill[key] = decadeUI.skill[key];
		}
		for (var key in decadeUI.inheritSkill) {
			if (lib.skill[key]) {
				for (var j in decadeUI.inheritSkill[key]) {
					lib.skill[key][j] = decadeUI.inheritSkill[key][j];
				}
			}
		}
		for (const key in decadeUI.inheritSubSkill) {
			if (lib.skill[key]) {
				if (!lib.skill[key].subSkill) continue;
				for (const j in decadeUI.inheritSubSkill[key]) {
					if (!lib.skill[key].subSkill[j]) continue;
					for (const k in decadeUI.inheritSubSkill[key][j]) {
						lib.skill[key].subSkill[j][k] = decadeUI.inheritSubSkill[key][j][k];
					}
				}
			}
		}
	}
});
