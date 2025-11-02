"use strict";
decadeModule.import(function (lib, game, ui, get, ai, _status) {
	decadeUI.animateSkill = {
		//涉及game.start自定义brawl模式无法播放开局动画，故搬运到此处做成技能播放
		mx_start: {
			trigger: {
				global: "gameDrawAfter",
			},
			direct: true,
			priority: Infinity + 114514 + 1919810,
			firstDo: true,
			async content(event, trigger, player) {
				game.removeGlobalSkill("mx_start");
				const style = lib.config.extension_十周年UI_newDecadeStyle;
				const isShousha = style === "off";
				const effectName = isShousha ? "effect_youxikaishi_shousha" : "effect_youxikaishi";
				const audio = isShousha ? "audio/game_start_shousha.mp3" : "audio/game_start.mp3";
				const scaleFactor = isShousha ? 1.5 : 0.76;
				game.playAudio("../extension", decadeUI.extensionName, audio);
				const animation = decadeUI.animation;
				const bounds = animation.getSpineBounds(effectName);
				if (!bounds) return;
				const sz = bounds.size;
				const scale = Math.min(animation.canvas.width / sz.x, animation.canvas.height / sz.y) * scaleFactor;
				animation.playSpine({
					name: effectName,
					scale: scale,
				});
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
				return ["sex", "seven"].includes(lib.config.extension_十周年UI_longLevel);
			},
			async content(event, trigger, player) {
				game.removeGlobalSkill("mx_longLevel");
				const longLevel = lib.config.extension_十周年UI_longLevel;
				const createAndAppendDragon = (target, src, styles) => {
					const img = document.createElement("img");
					img.src = src;
					Object.assign(img.style, {
						pointerEvents: "none",
						position: "absolute",
						display: "block",
						...styles,
					});
					target.appendChild(img);
				};
				const dragonData = {
					yan: {
						src: `${decadeUIPath}/assets/image/long1_yan.png`,
						style: { top: "-88px", left: "-23px", height: "213%", width: "160%", zIndex: "98" },
					},
					yu: {
						src: `${decadeUIPath}/assets/image/long1_yu.png`,
						style: { top: "-40px", left: "-25px", height: "139%", width: "156%", zIndex: "85" },
					},
				};
				game.players.forEach(target => {
					let rarity;
					if (longLevel === "seven") {
						const rarityMap = {
							junk: "silver",
							common: "gold",
							rare: "yu",
							epic: "yan",
							legend: "yan",
						};
						rarity = rarityMap[game.getRarity(target.name)];
					} else if (longLevel === "sex") {
						const rarityList = ["gold", "yu", "yan"];
						rarity = rarityList[Math.floor(Math.random() * rarityList.length)];
					}
					if (dragonData[rarity]) {
						const data = dragonData[rarity];
						createAndAppendDragon(target, data.src, data.style);
					} else {
						const src1 = `${decadeUIPath}/assets/image/long_${rarity}1.png`;
						const styles1 = { top: "-36px", right: "-26px", height: "133px", width: "80px", zIndex: "80" };
						createAndAppendDragon(target, src1, styles1);
						const src2 = `${decadeUIPath}/assets/image/long_${rarity}2.png`;
						const styles2 = { bottom: "-10px", right: "-13px", height: "40px", width: "92px", zIndex: "99" };
						createAndAppendDragon(target, src2, styles2);
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
			async content(event, trigger, player) {
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
			filter(event) {
				return lib.config.extension_十周年UI_killEffect;
			},
			async content(event, trigger, player) {
				if (!(trigger.source && trigger.player)) return;
				game.broadcastAll(
					function (source, player) {
						if (!window.decadeUI) return;
						decadeUI.effect.kill(source, player);
					},
					trigger.source,
					trigger.player
				);
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
			async content(event, trigger, player) {
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
			async content(event, trigger, player) {
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
			filter(event, player) {
				return get.population("qun") > 0;
			},
			async content(event, trigger, player) {
				var num = get.population("qun");
				if (player.hasSkill("hongfa", null, null, false)) {
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
		olddanshou: {
			audio: "danshou",
			trigger: { source: "damageSource" },
			check(event, player) {
				return get.attitude(player, event.player) <= 0;
			},
			async content(event, trigger, player) {
				await player.draw();
				var cards = Array.from(ui.ordering.childNodes);
				while (cards.length) {
					cards.shift().discard();
				}
				var evt = _status.event.getParent("phase", true);
				if (evt) {
					if (window.decadeUI && decadeUI.eventDialog) {
						decadeUI.eventDialog.finished = true;
						decadeUI.eventDialog.finishing = false;
						decadeUI.eventDialog = undefined;
					}
					game.resetSkills();
					_status.event = evt;
					_status.event.finish();
					_status.event.untrigger(true);
				}
			},
			ai: {
				jueqing: true,
			},
		},
	};
	decadeUI.inheritSkill = {
		identity_junshi: {
			async content(event, trigger, player) {
				await player.chooseToGuanxing(3);
			},
		},
		xinfu_zuilun: {
			content: [
				async (event, trigger, player) => {
					event.num = 0;
					event.cards = get.cards(3);
					if (
						player.getHistory("lose", function (evt) {
							return evt.type == "discard";
						}).length
					)
						event.num++;
					if (!player.isMinHandcard()) event.num++;
					if (!player.getStat("damage")) event.num++;
					if (event.num == 0) {
						await player.gain(event.cards, "draw");
						return;
					}
					var cards = event.cards;
					var gains = cards.length - event.num;
					var zuiLun = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, gains);
					zuiLun.caption = "【罪论】";
					zuiLun.header2 = "获得的牌";
					zuiLun.tip = "可获得" + gains + "张牌<br>" + zuiLun.tip;
					zuiLun.callback = function () {
						return this.cards[1].length == gains;
					};
					game.broadcast(
						function (player, cards, gains, callback) {
							if (!window.decadeUI) return;
							var zuiLun = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, gains);
							zuiLun.caption = "【罪论】";
							zuiLun.header2 = "获得的牌";
							zuiLun.tip = "可获得" + gains + "张牌<br>" + zuiLun.tip;
							zuiLun.callback = callback;
						},
						player,
						cards,
						gains,
						zuiLun.callback
					);
					var player2 = event.player;
					event.switchToAuto = function () {
						var cheats = [];
						var cards = zuiLun.cards[0].concat();
						var next = player2.getNext();
						var hasFriend = get.attitude(player2, next) > 0;
						var judges = next.node.judges.childNodes;
						if (judges.length > 0) cheats = decadeUI.get.cheatJudgeCards(cards, judges, hasFriend);
						if (hasFriend && player2.hasSkill("xinfu_fuyin")) {
							cards = decadeUI.get.bestValueCards(cards, next);
						} else {
							cards.sort(function (a, b) {
								return get.value(a, player2) - get.value(b, player2);
							});
						}
						cards = cheats.concat(cards);
						var time = 500;
						var gainNum = gains;
						for (var i = cards.length - 1; i >= 0; i--) {
							setTimeout(
								function (card, index, finished, moveDown) {
									zuiLun.move(card, index, moveDown ? 1 : 0);
									if (finished) zuiLun.finishTime(1000);
								},
								time,
								cards[i],
								i,
								i == 0,
								gainNum > 0
							);
							time += 500;
							gainNum--;
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
				async (event, trigger, player) => {
					event.cards = event.cards2 || [];
					if (event.result && event.result.bool) {
						var cards1 = event.cards1 || [];
						var first = ui.cardPile.firstChild;
						for (var i = 0; i < cards1.length; i++) {
							ui.cardPile.insertBefore(cards1[i], first);
						}
					}
					game.updateRoundNumber();
					if (event.cards.length) {
						await player.gain(event.cards, "draw");
						return;
					}
					let chooseTarget = player.chooseTarget("请选择一名角色，与其一同失去1点体力", true, function (card, player, target) {
						return target != player;
					});
					chooseTarget.ai = function (target) {
						return -get.attitude(_status.event.player, target);
					};
					let { result: cRes } = await chooseTarget;
					player.line(cRes.targets[0], "fire");
					await player.loseHp();
					await cRes.targets[0].loseHp();
				}
			]
		},
		xinfu_pingcai: {
			contentx: [
				async (event, trigger, player) => {
					event.pingcai_delayed = true;
					var name = lib.skill.xinfu_pingcai_backup.takara;
					event.cardname = name;
					event.videoId = lib.status.videoId++;
					if (player.isUnderControl()) {
						game.swapPlayerAuto(player);
					}
					var switchToAuto = function () {
						game.pause();
						game.countChoose();
						event.timeout = setTimeout(function () {
							_status.imchoosing = false;
							event._result = {
								bool: true,
							};
							game.resume();
						}, 9000);
					};
					var createDialog = function (player, id, name) {
						if (player == game.me) return;
						var dialog = ui.create.dialog("forcebutton", "hidden");
						var str = get.translation(player) + "正在擦拭宝物上的灰尘…";
						var canSkip = !_status.connectMode;
						if (canSkip) str += "<br>（点击宝物可以跳过等待AI操作）";
						dialog.textPrompt = dialog.add('<div class="text center">' + str + "</div>");
						dialog.classList.add("fixed");
						dialog.classList.add("scroll1");
						dialog.classList.add("scroll2");
						dialog.classList.add("fullwidth");
						dialog.classList.add("fullheight");
						dialog.classList.add("noupdate");
						dialog.videoId = id;
						var canvas2 = document.createElement("canvas");
						dialog.canvas_viewer = canvas2;
						dialog.appendChild(canvas2);
						canvas2.classList.add("grayscale");
						canvas2.style.position = "absolute";
						canvas2.style.width = "249px";
						canvas2.style.height = "249px";
						canvas2.style["border-radius"] = "6px";
						canvas2.style.left = "calc(50% - 125px)";
						canvas2.style.top = "calc(50% - 125px)";
						canvas2.width = 249;
						canvas2.height = 249;
						canvas2.style.border = "3px solid";
						var ctx2 = canvas2.getContext("2d");
						var img = new Image();
						img.src = lib.assetURL + "image/card/" + name + ".png";
						img.onload = function () {
							ctx2.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas2.width, canvas2.height);
						};
						if (canSkip) {
							var skip = function () {
								if (event.pingcai_delayed) {
									delete event.pingcai_delayed;
									clearTimeout(event.timeout);
									event._result = {
										bool: true,
									};
									game.resume();
									canvas2.removeEventListener(lib.config.touchscreen ? "touchend" : "click", skip);
								}
							};
							canvas2.addEventListener(lib.config.touchscreen ? "touchend" : "click", skip);
						}
						dialog.open();
					};
					var chooseButton = function (id, name) {
						var event = _status.event;
						_status.xinfu_pingcai_finished = false;
						var dialog = ui.create.dialog("forcebutton", "hidden");
						dialog.textPrompt = dialog.add('<div class="text center">擦拭掉宝物上的灰尘吧！</div>');
						event.switchToAuto = function () {
							event._result = {
								bool: _status.xinfu_pingcai_finished,
							};
							game.resume();
							_status.imchoosing = false;
							_status.xinfu_pingcai_finished = true;
						};
						dialog.classList.add("fixed");
						dialog.classList.add("scroll1");
						dialog.classList.add("scroll2");
						dialog.classList.add("fullwidth");
						dialog.classList.add("fullheight");
						dialog.classList.add("noupdate");
						dialog.videoId = id;
						var canvas = document.createElement("canvas");
						var canvas2 = document.createElement("canvas");
						dialog.appendChild(canvas2);
						dialog.appendChild(canvas);
						canvas.style.position = "absolute";
						canvas.style.width = "249px";
						canvas.style.height = "249px";
						canvas.style["border-radius"] = "6px";
						canvas.style.left = "calc(50% - 125px)";
						canvas.style.top = "calc(50% - 125px)";
						canvas.width = 249;
						canvas.height = 249;
						canvas.style.border = "3px solid";
						canvas2.style.position = "absolute";
						canvas2.style.width = "249px";
						canvas2.style.height = "249px";
						canvas2.style["border-radius"] = "6px";
						canvas2.style.left = "calc(50% - 125px)";
						canvas2.style.top = "calc(50% - 125px)";
						canvas2.width = 249;
						canvas2.height = 249;
						canvas2.style.border = "3px solid";
						var ctx = canvas.getContext("2d");
						var ctx2 = canvas2.getContext("2d");
						var img = new Image();
						img.src = lib.assetURL + "image/card/" + name + ".png";
						img.onload = function () {
							ctx2.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas2.width, canvas2.height);
						};
						ctx.fillStyle = "lightgray";
						ctx.fillRect(0, 0, canvas.width, canvas.height);
						canvas.onmousedown = function (ev) {
							canvas.onmousemove = function (e) {
								if (_status.xinfu_pingcai_finished) return;
								ctx.beginPath();
								ctx.clearRect(e.offsetX / game.documentZoom - 16, e.offsetY / game.documentZoom - 16, 32, 32);
								var data = ctx.getImageData(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8).data;
								var sum = 0;
								for (var i = 3; i < data.length; i += 4) {
									if (data[i] == 0) {
										sum++;
									}
								}
								if (sum >= canvas.width * canvas.height * 0.6) {
									if (!_status.xinfu_pingcai_finished) {
										_status.xinfu_pingcai_finished = true;
										event.switchToAuto();
									}
								}
							};
						};
						canvas.ontouchstart = function (ev) {
							canvas.ontouchmove = function (e) {
								if (_status.xinfu_pingcai_finished) return;
								ctx.beginPath();
								var rect = canvas.getBoundingClientRect();
								var X = ((e.touches[0].clientX / game.documentZoom - rect.left) / rect.width) * canvas.width;
								var Y = ((e.touches[0].clientY / game.documentZoom - rect.top) / rect.height) * canvas.height;
								ctx.clearRect(X - 16, Y - 16, 32, 32);
								var data = ctx.getImageData(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8).data;
								var sum = 0;
								for (var i = 3; i < data.length; i += 4) {
									if (data[i] == 0) {
										sum++;
									}
								}
								if (sum >= canvas.width * canvas.height * 0.6) {
									if (!_status.xinfu_pingcai_finished) {
										_status.xinfu_pingcai_finished = true;
										event.switchToAuto();
									}
								}
							};
						};
						canvas.onmouseup = function (ev) {
							canvas.onmousemove = null;
						};
						canvas.ontouchend = function (ev) {
							canvas.ontouchmove = null;
						};
						dialog.open();
						game.pause();
						game.countChoose();
					};
					game.broadcastAll(createDialog, player, event.videoId, name);
					if (event.isMine()) {
						chooseButton(event.videoId, name);
					} else if (event.isOnline()) {
						event.player.send(chooseButton, event.videoId, name);
						event.player.wait();
						game.pause();
					} else {
						switchToAuto();
					}
				},
				async (event, trigger, player) => {
					var result = event._result || event.result || { bool: false };
					event._result = result;
					game.broadcastAll(
						function (id, result, player) {
							_status.xinfu_pingcai_finished = true;
							var dialog = get.idDialog(id);
							if (dialog) {
								dialog.textPrompt.innerHTML = '<div class="text center">' + (get.translation(player) + "擦拭宝物" + (result.bool ? "成功！" : "失败…")) + "</div>";
								if (result.bool && dialog.canvas_viewer) dialog.canvas_viewer.classList.remove("grayscale");
							}
							if (!_status.connectMode) delete event.pingcai_delayed;
						},
						event.videoId,
						result,
						player
					);
					await game.delay(2.5);
				},
				async (event, trigger, player) => {
					game.broadcastAll("closeDialog", event.videoId);
					if (event._result && event._result.bool) {
						player.logSkill("pcaudio_" + event.cardname);
						event.insert(lib.skill.xinfu_pingcai[event.cardname], {
							player: player,
						});
					}
				}
			]
			,ai: {
				order: 7,
				fireAttack: true,
				threaten: 1.7,
				result: {
					player: 1,
				},
			},
		},
		xunxun: {
			content: [
				async (event, trigger, player) => {
					var cards = get.cards(4);
					var xunxun = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, 2);
					xunxun.caption = "【恂恂】";
					xunxun.header1 = "牌堆底";
					xunxun.header2 = "牌堆顶";
					xunxun.callback = function () {
						return this.cards[0].length == 2 && this.cards[1].length == 2;
					};
					game.broadcast(
						function (player, cards, callback) {
							if (!window.decadeUI) return;
							var xunxun = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, 2);
							xunxun.caption = "【恂恂】";
							xunxun.header1 = "牌堆底";
							xunxun.header2 = "牌堆顶";
							xunxun.callback = callback;
						},
						player,
						cards,
						xunxun.callback
					);
					event.switchToAuto = function () {
						var cards = decadeUI.get.bestValueCards(xunxun.cards[0].concat(), player);
						var time = 500;
						for (var i = 0; i < 2; i++) {
							setTimeout(
								function (card, index, finished) {
									xunxun.move(card, index, 1);
									if (finished) xunxun.finishTime(1000);
								},
								time,
								cards[i],
								i,
								i >= 1
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
				async (event, trigger, player) => {
					var first = ui.cardPile.firstChild;
					var cardsTop = event.cards2 || [];
					for (var i = 0; i < cardsTop.length; i++) {
						ui.cardPile.insertBefore(cardsTop[i], first);
					}
					var cardsBottom = event.cards1 || [];
					for (var i = 0; i < cardsBottom.length; i++) {
						ui.cardPile.appendChild(cardsBottom[i]);
					}
				}
			],
		},
		xz_xunxun: {
			inherit: "xunxun",
			filter(event, player) {
				return game.hasPlayer(current => current.isDamaged()) && !player.hasSkill("xunxun");
			},
		},
		dddfenye: {
			$compareFenye(players, cards1, targets, cards2) {
				game.broadcast(
					function (players, cards1, targets, cards2) {
						lib.skill.dddfenye.$compareFenye(players, cards1, targets, cards2);
					},
					players,
					cards1,
					targets,
					cards2
				);
				game.addVideo("compareFenye", [get.targetsInfo(players), get.cardsInfo(cards1), get.targetsInfo(targets), get.cardsInfo(cards2)]);
				for (var i = players.length - 1; i >= 0; i--) {
					players[i].$throwordered2(cards1[i].copy(false));
				}
				for (var i = targets.length - 1; i >= 0; i--) {
					targets[i].$throwordered2(cards2[i].copy(false));
				}
			},
		},
		dcqixin: {
			mark: undefined,
			init(player, skill) {
				if (_status.gameStarted && !player.storage.dcqixin_hp) {
					player.storage.dcqixin_hp = [player.maxHp, player.maxHp];
				}
				const mark = player.marks[skill];
				if (!mark) player.markSkill(skill);
				game.broadcastAll(
					(player, skill) => {
						lib.skill.dcqixin.$zhuanhuanji(skill, player);
					},
					player,
					skill
				);
			},
			$zhuanhuanji(skill, player) {
				const character = Boolean(player.storage[skill]) ? "caojie" : "liuxie";
				const mark = player.marks[skill];
				if (mark) {
					mark.setBackground(character, "character");
					mark._name = character;
					mark.style.setProperty("background-size", "cover", "important");
					mark.text.style.setProperty("font-size", "0px", "important");
				}
				player.changeSkin(
					{
						characterName: "liuxiecaojie",
					},
					"liuxiecaojie" + (player.storage[skill] ? "_shadow" : "")
				);
			},
		},
		olyicheng: {
			async content(event, trigger, player) {
				let num = player.maxHp,
					cards = get.cards(num, true);
				await player.showCards(cards, get.translation(player) + "发动了【易城】");
				if (player.countCards("h")) {
					const sum = cards.reduce((num, card) => num + get.number(card), 0);
					const {
						result: { bool, moved },
					} = await player
						.chooseToMove("易城：请选择你要交换的牌")
						.set("filterMove", (from, to) => {
							return typeof to !== "number";
						})
						.set("list", [
							[
								"牌堆顶",
								cards,
								list => {
									const sum2 = list.reduce((num, card) => num + get.number(card, false), 0);
									return (
										"牌堆顶（现" +
										sum2 +
										{
											0: "=",
											"-1": "<",
											1: ">",
										}[get.sgn(sum2 - sum).toString()] +
										"原" +
										sum +
										"）"
									);
								},
							],
							["手牌", player.getCards("h")],
						])
						.set("filterOk", moved => moved[1].some(i => !get.owner(i)))
						.set("processAI", list => {
							const player = get.event("player"),
								limit = Math.min(get.event("num"), player.countCards("h"));
							let cards = list[0][1].slice(),
								hs = player.getCards("h");
							if (cards.reduce((num, card) => num + get.value(card), 0) > player.getCards("h").reduce((num, card) => num + get.value(card), 0)) {
								cards.sort((a, b) => get.number(a) - get.number(b));
								hs.sort((a, b) => get.number(b) - get.number(a));
								let cards2 = cards.slice(0, limit),
									hs2 = hs.slice(0, limit);
								if (hs2.reduce((num, card) => num + get.number(card), 0) > cards2.reduce((num, card) => num + get.number(card), 0)) {
									cards.removeArray(cards2);
									hs.removeArray(hs2);
									return [cards.concat(hs2), hs.concat(cards2)];
								}
								return [cards, hs];
							} else {
								cards.sort((a, b) => get.value(b) - get.value(a));
								hs.sort((a, b) => get.value(a) - get.value(b));
								let cards2 = cards.slice(0, limit),
									hs2 = hs.slice(0, limit),
									list = [cards, hs];
								for (let i = 0; i < limit; i++) {
									if (get.value(cards2[i]) > get.value(hs2[i])) {
										const change = [cards2[i], hs2[i]];
										cards[i] = change[1];
										hs[i] = change[0];
									} else break;
								}
								return list;
							}
						})
						.set("num", num);
					if (bool) {
						const puts = player.getCards("h", i => moved[0].includes(i));
						const gains = cards.filter(i => moved[1].includes(i));
						if (puts.length && gains.length) {
							player.$throw(puts, 1000);
							await player.lose(puts, ui.special);
							await player.gain(gains, "gain2");
							//调整手牌顺序
							let hs = moved[1].reverse();
							hs.forEach((i, j) => {
								player.node.handcards1.insertBefore(hs[j], player.node.handcards1.firstChild);
							});
							dui.queueNextFrameTick(dui.layoutHand, dui);
							cards = moved[0].slice();
							if (cards.length) {
								await game.cardsGotoOrdering(cards);
								for (let i = cards.length - 1; i >= 0; i--) {
									ui.cardPile.insertBefore(cards[i], ui.cardPile.firstChild);
								}
								game.log(cards, "被放回了牌堆顶");
								game.updateRoundNumber();
							}
							await player.showCards(cards, get.translation(player) + "【易城】第一次交换后");
							if (cards.reduce((num, card) => num + get.number(card), 0) > sum && player.countCards("h")) {
								const {
									result: { bool },
								} = await player.chooseBool("易城：是否使用全部手牌交换" + get.translation(cards) + "？").set(
									"choice",
									(() => {
										return cards.reduce((num, card) => num + get.value(card), 0) > player.getCards("h").reduce((num, card) => num + get.value(card), 0);
									})()
								);
								if (bool) {
									const hs = player.getCards("h");
									player.$throw(hs, 1000);
									await player.lose(hs, ui.special);
									await player.gain(cards, "gain2");
									cards = hs.slice();
									if (cards.length) {
										await game.cardsGotoOrdering(cards);
										for (let i = cards.length - 1; i >= 0; i--) {
											ui.cardPile.insertBefore(cards[i], ui.cardPile.firstChild);
										}
										game.log(cards, "被放回了牌堆顶");
										game.updateRoundNumber();
									}
									await player.showCards(cards, get.translation(player) + "【易城】第二次交换后");
								}
							}
						}
					}
				}
			},
		},
		nk_shekong: {
			async content(event, trigger, player) {
				var baseCards = event.cards || [];
				var baseLen = baseCards.length;
				event.cardsx = baseCards.slice(0);
				var num = get.cnNumber(baseLen);
				var trans = get.translation(player);
				var prompt = "弃置" + num + "张牌，然后" + trans + "摸一张牌";
				if (baseLen > 1) prompt += "；或弃置一张牌，然后" + trans + "摸" + num + "张牌";
				var target = event.target;
				var next = target.chooseToDiscard(prompt, "he", true);
				next.numx = baseLen;
				next.selectCard = function () {
					if (ui.selected.cards.length > 1) return _status.event.numx;
					return [1, _status.event.numx];
				};
				next.complexCard = true;
				next.ai = function (card) {
					if (
						ui.selected.cards.length == 0 ||
						_status.event.player.countCards("he", function (cardxq) {
							return get.value(cardxq) < 7;
						}) >= _status.event.numx
					)
						return 7 - get.value(card);
					return -1;
				};
				let { result } = await next;
				if (!result || !result.bool) return;
				if (result.cards.length == baseLen) await player.draw();
				else await player.draw(baseLen);
				event.cardsx.addArray(result.cards);
				for (var i = 0; i < event.cardsx.length; i++) {
					if (get.position(event.cardsx[i]) != "d") event.cardsx.splice(i--, 1);
				}
				if (!event.cardsx.length) return;
				var cards2 = event.cardsx;
				var dialog = decadeUI.content.chooseGuanXing(player, cards2, cards2.length);
				dialog.caption = "【设控】";
				game.broadcast(
					function (player, cards, callback) {
						if (!window.decadeUI) return;
						var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
						dialog.caption = "【设控】";
						dialog.callback = callback;
					},
					player,
					cards2,
					dialog.callback
				);
				event.switchToAuto = function () {
					var cards = dialog.cards[0].concat();
					var cheats = [];
					var judges;
					var next = player.getNext();
					var friend = get.attitude(player, next) < 0 ? null : next;
					judges = next.node.judges.childNodes;
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
		kamome_huanmeng: {
			async content(event, trigger, player) {
				if (player.isUnderControl()) {
					game.modeSwapPlayer(player);
				}
				var num = 1 + player.countCards("e");
				var cards = get.cards(num);
				var guanxing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
				guanxing.caption = "【幻梦】";
				game.broadcast(
					function (player, cards, callback) {
						if (!window.decadeUI) return;
						var guanxing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
						guanxing.caption = "【幻梦】";
						guanxing.callback = callback;
					},
					player,
					cards,
					guanxing.callback
				);
				event.switchToAuto = function () {
					var cards = guanxing.cards[0].concat();
					var cheats = [];
					var judges = player.node.judges.childNodes;
					if (judges.length) cheats = decadeUI.get.cheatJudgeCards(cards, judges, true);
					if (cards.length) {
						for (var i = 0; i >= 0 && i < cards.length; i++) {
							if (get.value(cards[i], player) >= 5) {
								cheats.push(cards[i]);
								cards.splice(i, 1);
							}
						}
					}
					var time = 500;
					for (var i = 0; i < cheats.length; i++) {
						setTimeout(
							function (card, index, finished) {
								guanxing.move(card, index, 0);
								if (finished) guanxing.finishTime(1000);
							},
							time,
							cheats[i],
							i,
							i >= cheats.length - 1 && cards.length == 0
						);
						time += 500;
					}
					for (var i = 0; i < cards.length; i++) {
						setTimeout(
							function (card, index, finished) {
								guanxing.move(card, index, 1);
								if (finished) guanxing.finishTime(1000);
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
				player.popup(get.cnNumber(event.num1) + "上" + get.cnNumber(event.num2) + "下");
				game.log(player, "将" + get.cnNumber(event.num1) + "张牌置于牌堆顶，" + get.cnNumber(event.num2) + "张牌置于牌堆底");
				game.updateRoundNumber();
			},
		},
		//注意：twtanfeng非版本不可用而修改，而是为了适配视为使用XX牌的转化写的以viewAs方法实现效果的技能的“示例”
		//玩家可以以此chooseToUse为模板，对自己想要实现的“将XX牌当作XX牌使用”的技能写成支持viewAs的模板以实现萌修十周年对viewAs卡牌选中美化的支持
		twtanfeng: {
			async content(event, trigger, player) {
				let choose = player
					.chooseTarget(get.prompt2("twtanfeng"), function (card, player, target) {
						return target != player && target.countDiscardableCards(player, "hej") > 0;
					})
					.set("ai", function (target) {
						var player = _status.event.player,
							num = 1;
						if (get.attitude(player, target) > 0) num = 3;
						else if (!target.countCards("he") || !target.canUse("sha", player)) {
							if (
								target.hp +
									target.countCards("hs", {
										name: ["tao", "jiu"],
									}) <=
								1
							)
								num = 2;
							else num = 1.2;
						}
						return (
							get.effect(
								target,
								{
									name: "guohe",
								},
								player,
								player
							) *
							num *
							(player.hp <= 1 && get.attitude(player, target) <= 0 ? 0 : 1)
						);
					})
					.setHiddenSkill("twtanfeng");
				let { result } = await choose;
				if (!result || !result.bool) return;
				let target = result.targets[0];
				event.target = target;
				player.logSkill("twtanfeng", target);
				await player.discardPlayerCard(target, "hej", true);
				let next = target.chooseToUse();
				next.set("openskilldialog", "###探锋：选择一张牌当作【杀】对" + get.translation(player) + "使用###或点击“取消”，受到其造成的1点火焰伤害，并令其跳过本回合的一个阶段（准备阶段和结束阶段除外）");
				next.set("norestore", true);
				next.set("_backupevent", "twtanfeng_backup");
				next.set("custom", {
					add: {},
					replace: {
						window() {},
					},
				});
				next.backup("twtanfeng_backup");
				next.set("targetRequired", true);
				next.set("complexSelect", true);
				next.set("filterTarget", function (card, player, target) {
					if (target != _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) return false;
					return lib.filter.targetEnabled.apply(this, arguments);
				});
				next.set("sourcex", player);
				next.set("addCount", false);
				let useRes = await next;
				if (!useRes || !useRes.bool) {
					player.line(target, "fire");
					await target.damage(1, "fire");
				} else {
					return;
				}
				if (!target.isIn()) return;
				var list = [],
					list2 = [];
				event.map = {
					phaseJudge: "判定阶段",
					phaseDraw: "摸牌阶段",
					phaseUse: "出牌阶段",
					phaseDiscard: "弃牌阶段",
				};
				for (var i of ["phaseJudge", "phaseDraw", "phaseUse", "phaseDiscard"]) {
					if (!player.skipList.includes(i)) {
						i = event.map[i];
						list.push(i);
						if (i != "判定阶段" && i != "弃牌阶段") list2.push(i);
					}
				}
				let ctrl = target
					.chooseControl(list)
					.set("prompt", "探锋：令" + get.translation(player) + "跳过一个阶段")
					.set("ai", function () {
						return _status.event.choice;
					})
					.set(
						"choice",
						(function () {
							var att = get.attitude(target, player);
							var num = player.countCards("j");
							if (att > 0) {
								if (list.includes("判定阶段") && num > 0) return "判定阶段";
								return "弃牌阶段";
							}
							if (list.includes("摸牌阶段") && player.hasJudge("lebu")) return "摸牌阶段";
							if ((list.includes("出牌阶段") && player.hasJudge("bingliang")) || player.needsToDiscard() > 0) return "出牌阶段";
							return list2.randomGet();
						})()
					);
				let { result: cResult } = await ctrl;
				for (var i in event.map) {
					if (event.map[i] == cResult.control) player.skip(i);
				}
				target.popup(cResult.control);
				target.line(player);
				game.log(player, "跳过了", "#y" + cResult.control);
			},
			subSkill: {
				backup: {
					viewAs: {
						name: "sha",
					},
					filterCard: true,
					position: "hes",
					check(card) {
						var player = _status.event.player,
							target = _status.event.getParent().player;
						var eff = get.effect(
							target,
							get.autoViewAs(
								{
									name: "sha",
								},
								[card]
							),
							player,
							player
						);
						var eff2 = get.damageEffect(player, target, player, "fire");
						if (eff < 0 || eff2 > 0 || eff2 > eff || get.tag(card, "recover")) return 0;
						return (player.hp == 1 ? 10 : 6) - get.value(card);
					},
				},
			},
		},
		olhedao: {
			tianshuClear(skill, player, num = 1) {
				if (num > 0 && get.info(skill)?.nopop) {
					game.broadcastAll(
						(player, skill) => {
							delete lib.skill[skill].nopop;
							lib.skill[skill].markimage = "image/card/tianshu1.png";
							if (player.marks[skill]) player.marks[skill].text.setBackgroundImage(lib.skill[skill].markimage);
						},
						player,
						skill
					);
					player.update();
				}
				player.storage[skill][0] -= num;
				player[player.storage[skill][0] <= 0 ? "removeSkill" : "markSkill"](skill);
			},
		},
	};
	decadeUI.inheritSubSkill = {
		olziruo: {
			sort: {
				async content(event, trigger, player) {
					event.getParent(2).goto(0);
					if (_status.connectMode || !event.isMine()) {
						player.tempBanSkill("olziruo_sort", {
							player: ["useCard1", "useSkillBegin", "chooseToUseEnd"],
						});
					}
					const next = player.chooseToMove("自若：请整理手牌顺序", true);
					next.set("list", [["手牌", player.getCards("h")]]);
					next.set("processAI", list => {
						let player = get.player(),
							cards = list[0][1].slice(0);
						cards.sort((a, b) => get.useful(b, player) - get.useful(a, player));
						if (player.storage.olziruo) cards.reverse();
						return [cards];
					});
					const result = await next.forResult();
					if (!result || !result.bool) return;
					let hs = result.moved[0].reverse();
					hs.forEach((i, j) => {
						player.node.handcards1.insertBefore(hs[j], player.node.handcards1.firstChild);
					});
					dui.queueNextFrameTick(dui.layoutHand, dui);
				},
			},
		},
		jsrgzhasi: {
			undist: {
				init(player, skill) {
					if (player._distanceDisplay) {
						player._distanceDisplay.style.display = 'none';
					}
				},
				onremove(player, skill) {
					if (player._distanceDisplay) {
						player._distanceDisplay.style.display = '';
					}
				}
			}
		}
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