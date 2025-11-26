import { lib, game, ui, get, _status } from "../../../noname.js";

const registerLegacyModules = config => {
	//手杀UI
	// ========== 工具函数统一挂载 ==========
	if (!lib.removeFirstByClass) {
		lib.removeFirstByClass = function (parent, className) {
			const el = parent.getElementsByClassName(className);
			if (el[0]) el[0].parentNode.removeChild(el[0]);
		};
	}
	if (!lib.createTipImg) {
		lib.createTipImg = function (className, src, style) {
			const img = document.createElement("img");
			img.classList.add("tipshow", className);
			img.src = src;
			img.style.cssText = style;
			return img;
		};
	}
	// ========== 思考提示技能模板 ==========
	function createThinkSkill({ card, tipClass, img, style }) {
		return {
			trigger: { player: ["useCardBegin", "respondBegin"] },
			silent: true,
			forced: true,
			charlotte: true,
			filter(event, player) {
				if (!event.card) return false;
				const cname = event.card.name || (event.card.viewAs ? event.card.viewAs : undefined);
				return cname == card && _status.currentPhase != player && player != (_status.event.player || game.me) && lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff";
			},
			async content(event, trigger, player) {
				lib.removeFirstByClass(player, "tipskill");
				if (player.getElementsByClassName(tipClass).length <= 0) {
					player.appendChild(lib.createTipImg(tipClass, lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/shoushatip/" + img, style));
				}
			},
		};
	}
	// ========== 清除提示技能模板 ==========
	function createClearSkill({ tipClass }) {
		return {
			trigger: { global: ["useCardEnd", "respondEnd", "dieBegin", "phaseBegin", "phaseEnd"] },
			silent: true,
			forced: true,
			charlotte: true,
			filter(event, player) {
				event.respondix = 0;
				for (let i = 0; i < game.players.length; i++) {
					if (game.players[i].getElementsByClassName(tipClass)[0]) event.respondix++;
				}
				return event.respondix > 0;
			},
			async content(event, trigger, player) {
				for (let i = 0; i < game.players.length; i++) {
					lib.removeFirstByClass(game.players[i], tipClass);
				}
			},
		};
	}
	//-------------AI进度条-----------//
	if (get.mode() != "connect") {
		lib.onover.push(function (bool) {
			if (document.getElementById("jindutiaoAI")) {
				document.getElementById("jindutiaoAI").remove();
			}
		});
		lib.skill._jindutiaoAI_operation = {
			trigger: {
				player: ["chooseToUseBegin", "chooseToRespondBegin", "chooseToDiscardBegin", "chooseToTargetBegin", "chooseToButtonBegin", "chooseToMoveBegin", "chooseToGainBegin", "chooseToLoseBegin", "chooseToExchangeBegin"],
			},
			silent: true,
			filter(event, player) {
				return player != game.me;
			},
			forced: true,
			async content(event, trigger, player) {
				lib.removeFirstByClass(player, "timeai");
				lib.removeFirstByClass(player, "timePhase");
				if (window.timerai) {
					clearInterval(window.timerai);
					delete window.timerai;
				}
				game.JindutiaoAIplayer();
				if (_status.currentPhase == player) {
					window.boxContentAI.classList.add("timePhase");
				} else {
					window.boxContentAI.classList.add("timeai");
				}

				player.appendChild(window.boxContentAI);
			},
			group: ["_jindutiaoAI_operation_end"],
			subSkill: {
				end: {
					trigger: {
						player: ["chooseToUseAfter", "chooseToRespondAfter", "chooseToDiscardAfter", "chooseToTargetAfter", "chooseToButtonAfter", "chooseToMoveAfter", "chooseToGainAfter", "chooseToLoseAfter", "chooseToExchangeAfter"],
					},
					forced: true,
					filter(event, player) {
						return player != game.me;
					},
					async content(event, trigger, player) {
						if (window.timerai) {
							clearInterval(window.timerai);
							delete window.timerai;
						}
						lib.removeFirstByClass(player, "timeai");
						lib.removeFirstByClass(player, "timePhase");

						if (document.getElementById("jindutiaoAI")) {
							document.getElementById("jindutiaoAI").remove();
						}
					},
				},
			},
		};
		//-------多目标-------//
		lib.skill._jindutiaoMB = {
			trigger: {
				player: "useCardToPlayered",
			},
			forced: true,
			silent: true,
			priority: -10,
			charlotte: true,
			filter(event, player) {
				return event.card && event.targets && event.targets.length;
			},
			async content(event, trigger, player) {
				const boxContent = document.createElement("div");
				const boxTime = document.createElement("div");
				const imgBg = document.createElement("img");
				boxContent.classList.add("timeai");
				if (lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff") {
					//--------手杀样式-------------//
					boxContent.style.cssText = "display:block;position:absolute;z-index:90;--w: 122px;--h: calc(var(--w) *4/145);width: var(--w);height: var(--h);left:3.5px;bottom:-6.2px;";
					boxTime.data = 125;
					boxTime.style.cssText = "z-index:92;--w: 33px;--h: calc(var(--w) * 4/120);width: var(--w);height: var(--h);margin:1px;background-color: #dd9900;position: absolute;top: 0px;";
					imgBg.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/uibutton/time.png";
					imgBg.style.cssText = "position:absolute;z-index:91;--w: 122px;--h: calc(var(--w) * 4/145);width: var(--w);height: var(--h);top: 0;";
					//-------------------------//
				} else {
					//----------十周年样式--------//
					boxContent.style.cssText = "display:block;position:absolute;z-index:90;--w: 122px;--h: calc(var(--w) *8/162);width: var(--w);height: var(--h);left:1.5px;bottom:-14px;";
					boxTime.data = 120;
					boxTime.style.cssText = "z-index:91;width: 115px;height: 3.3px;margin:1px;background-color: #f2c84b;position: absolute;top: 0px;border-radius: 3px;";
					imgBg.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/uibutton/timeX.png";
					imgBg.style.cssText = "position:absolute;z-index:90;--w: 122px;--h: calc(var(--w) * 8/162);width: var(--w);height: var(--h);top: 0;";
					//--------------------//
				}
				boxContent.appendChild(boxTime);
				boxContent.appendChild(imgBg);
				if (trigger.target != (_status.event.player || game.me)) {
					const ab = trigger.target.getElementsByClassName("timeai");
					if (!ab[0]) trigger.target.appendChild(boxContent);
				}
				window.timerix = setInterval(() => {
					boxTime.data--;
					boxTime.style.width = boxTime.data + "px";
					if (boxTime.data == 0) {
						clearInterval(window.timerix);
						delete window.timerix;
						boxContent.remove();
					}
				}, 150); //进度条时间
			},
			group: ["_jindutiaoMB_close"],
			subSkill: {
				//------容错清除 全场-------------//
				close: {
					trigger: {
						global: ["phaseEnd", "useCardAfter", "dieBegin"],
					},
					filter(event, player) {
						event.respondix = 0;
						for (let i = 0; i < game.players.length; i++) {
							const ab = game.players[i].getElementsByClassName("timeai");
							if (ab[0]) event.respondix++;
						}
						return event.respondix > 0;
					},
					forced: true,
					silent: true,
					priority: -1,
					charlotte: true,
					async content(event, trigger, player) {
						for (let i = 0; i < game.players.length; i++) {
							lib.removeFirstByClass(game.players[i], "timeai");
						}
					},
				},
			},
		};
		//---------游戏开场and响应类----------//
		lib.skill._jindutiaoKS = {
			trigger: {
				global: "gameStart",
			},
			silent: true,
			forced: true,
			priority: -1,
			charlotte: true,
			filter(event, player) {
				return true;
			},
			async content(event, trigger, player) {
				const boxContent = document.createElement("div");
				const boxTime = document.createElement("div");
				const imgBg = document.createElement("img");
				boxContent.classList.add("timeai");
				if (lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff") {
					//--------手杀样式-------------//
					boxContent.style.cssText = "display:block;position:absolute;z-index:90;--w: 122px;--h: calc(var(--w) *4/145);width: var(--w);height: var(--h);left:3.5px;bottom:-6.2px;";
					boxTime.data = 125;
					boxTime.style.cssText = "z-index:92;--w: 33px;--h: calc(var(--w) * 4/120);width: var(--w);height: var(--h);margin:1px;background-color: #dd9900;position: absolute;top: 0px;";
					imgBg.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/uibutton/time.png";
					imgBg.style.cssText = "position:absolute;z-index:91;--w: 122px;--h: calc(var(--w) * 4/145);width: var(--w);height: var(--h);top: 0;";
					//-------------------------//
				} else {
					//----------十周年样式--------//
					boxContent.style.cssText = "display:block;position:absolute;z-index:90;--w: 122px;--h: calc(var(--w) *8/162);width: var(--w);height: var(--h);left:1.5px;bottom:-14px;";
					boxTime.data = 120;
					boxTime.style.cssText = "z-index:91;width: 115px;height: 3.3px;margin:1px;background-color: #f2c84b;position: absolute;top: 0px;border-radius: 3px;";
					imgBg.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/uibutton/timeX.png";
					imgBg.style.cssText = "position:absolute;z-index:90;--w: 122px;--h: calc(var(--w) * 8/162);width: var(--w);height: var(--h);top: 0;";
					//--------------------//
				}
				boxContent.appendChild(boxTime);
				boxContent.appendChild(imgBg);
				if (player != game.me) player.appendChild(boxContent);
				window.timerx = setInterval(() => {
					boxTime.data--;
					boxTime.style.width = boxTime.data + "px";
					if (boxTime.data == 0) {
						clearInterval(window.timerx);
						delete window.timerx;
						boxContent.remove();
					}
				}, 150); //进度条时间
			},
			group: ["_jindutiaoKS_close"],
			subSkill: {
				close: {
					trigger: {
						global: "phaseBefore",
					},
					filter(event, player) {
						event.respondx = 0;
						for (let i = 0; i < game.players.length; i++) {
							const ab = game.players[i].getElementsByClassName("timeai");
							if (ab[0]) event.respondx++;
						}
						if (game.phaseNumber == 0) return event.respondx > 0;
						return false;
					},
					forced: true,
					silent: true,
					priority: -1,
					charlotte: true,
					async content(event, trigger, player) {
						for (let i = 0; i < game.players.length; i++) {
							lib.removeFirstByClass(game.players[i], "timeai");
						}
					},
				},
			},
		};
		//------------回合外进度条消失------------//
		lib.skill._jindutiao_close = {
			close: {
				silent: true,
				trigger: {
					player: ["phaseEnd", "useCardAfter", "gainEnd", "loseEnd", "damageAfter"],
				},
				filter(event, player) {
					return player != (_status.event.player || game.me) && _status.currentPhase != player;
				},
				forced: true,
				priority: -1,
				charlotte: true,
				async content(event, trigger, player) {
					lib.removeFirstByClass(player, "timeai");
				},
			},
		};
	}
	//玩家进度条
	if (get.mode() != "connect" && config.jindutiao == true) {
		lib.onover.push(function () {
			const bar = document.getElementById("jindutiaopl");
			if (bar) bar.remove();
		});
		lib.skill._jindutiao_operation = {
			trigger: {
				player: ["chooseToUseBegin", "chooseToRespondBegin", "chooseToDiscardBegin", "chooseToTargetBegin", "chooseToButtonBegin", "chooseToMoveBegin", "chooseToGainBegin", "chooseToLoseBegin", "chooseToExchangeBegin"],
			},
			silent: true,
			filter(event, player) {
				return player == game.me;
			},
			forced: true,
			async content(event, trigger, player) {
				const existingBar = document.getElementById("jindutiaopl");
				if (existingBar) {
					existingBar.remove();
				}
				if (window.timer) {
					clearInterval(window.timer);
					delete window.timer;
				}
				if (window.timer2) {
					clearInterval(window.timer2);
					delete window.timer2;
				}
				game.Jindutiaoplayer();
			},
			group: ["_jindutiao_operation_end"],
			subSkill: {
				end: {
					trigger: {
						player: ["chooseToUseAfter", "chooseToRespondAfter", "chooseToDiscardAfter", "chooseToTargetAfter", "chooseToButtonAfter", "chooseToMoveAfter", "chooseToGainAfter", "chooseToLoseAfter", "chooseToExchangeAfter"],
					},
					forced: true,
					filter(event, player) {
						return player == game.me;
					},
					async content(event, trigger, player) {
						if (window.timer) {
							clearInterval(window.timer);
							delete window.timer;
						}
						if (window.timer2) {
							clearInterval(window.timer2);
							delete window.timer2;
						}
						const bar = document.getElementById("jindutiaopl");
						if (bar) bar.remove();
					},
				},
			},
		};
	}
	// ========== 思考提示技能静态注册 ==========
	lib.skill._chupaiE = {
		trigger: { player: ["useCardBegin", "respondBegin"] },
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			if (!event.card) return false;
			const cname = event.card.name || (event.card.viewAs ? event.card.viewAs : undefined);
			return cname == "shan" && _status.currentPhase != player && player != (_status.event.player || game.me) && lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff";
		},
		async content(event, trigger, player) {
			lib.removeFirstByClass(player, "tipskill");
			if (player.getElementsByClassName("playertipshan").length <= 0) {
				player.appendChild(lib.createTipImg("playertipshan", lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/shoushatip/tipshan.png", "display:block;position:absolute;z-index:91;--w:133px;--h:calc(var(--w)*50/431);width:var(--w);height:var(--h);bottom:-22px;"));
			}
		},
	};
	lib.skill._chupaiG = {
		trigger: { player: ["useCardBegin", "respondBegin"] },
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			if (!event.card) return false;
			const cname = event.card.name || (event.card.viewAs ? event.card.viewAs : undefined);
			return cname == "sha" && _status.currentPhase != player && player != (_status.event.player || game.me) && lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff";
		},
		async content(event, trigger, player) {
			lib.removeFirstByClass(player, "tipskill");
			if (player.getElementsByClassName("playertipsha").length <= 0) {
				player.appendChild(lib.createTipImg("playertipsha", lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/shoushatip/tipsha.png", "display:block;position:absolute;z-index:91;--w:133px;--h:calc(var(--w)*50/431);width:var(--w);height:var(--h);bottom:-22px;"));
			}
		},
	};
	lib.skill._chupaiM = {
		trigger: { player: ["useCardBegin", "respondBegin"] },
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			if (!event.card) return false;
			const cname = event.card.name || (event.card.viewAs ? event.card.viewAs : undefined);
			return cname == "tao" && _status.currentPhase != player && player != (_status.event.player || game.me) && lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff";
		},
		async content(event, trigger, player) {
			lib.removeFirstByClass(player, "tipskill");
			if (player.getElementsByClassName("playertiptao").length <= 0) {
				player.appendChild(lib.createTipImg("playertiptao", lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/shoushatip/tiptao.png", "display:block;position:absolute;z-index:91;--w:133px;--h:calc(var(--w)*50/431);width:var(--w);height:var(--h);bottom:-22px;"));
			}
		},
	};
	lib.skill._chupaiO = {
		trigger: { player: ["useCardBegin", "respondBegin"] },
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			if (!event.card) return false;
			const cname = event.card.name || (event.card.viewAs ? event.card.viewAs : undefined);
			return cname == "jiu" && _status.currentPhase != player && player != (_status.event.player || game.me) && lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff";
		},
		async content(event, trigger, player) {
			lib.removeFirstByClass(player, "tipskill");
			if (player.getElementsByClassName("playertipjiu").length <= 0) {
				player.appendChild(lib.createTipImg("playertipjiu", lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/shoushatip/tipjiu.png", "display:block;position:absolute;z-index:91;--w:133px;--h:calc(var(--w)*50/431);width:var(--w);height:var(--h);bottom:-22px;"));
			}
		},
	};
	// ========== 清除提示技能静态注册 ==========
	lib.skill._chupaiF = {
		trigger: { global: ["useCardEnd", "respondEnd", "dieBegin", "phaseBegin", "phaseEnd"] },
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			event.respondix = 0;
			for (let i = 0; i < game.players.length; i++) {
				if (game.players[i].getElementsByClassName("playertipshan")[0]) event.respondix++;
			}
			return event.respondix > 0;
		},
		async content(event, trigger, player) {
			for (let i = 0; i < game.players.length; i++) {
				lib.removeFirstByClass(game.players[i], "playertipshan");
			}
		},
	};
	lib.skill._chupaiH = {
		trigger: { global: ["useCardEnd", "respondEnd", "dieBegin", "phaseBegin", "phaseEnd"] },
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			event.respondix = 0;
			for (let i = 0; i < game.players.length; i++) {
				if (game.players[i].getElementsByClassName("playertipsha")[0]) event.respondix++;
			}
			return event.respondix > 0;
		},
		async content(event, trigger, player) {
			for (let i = 0; i < game.players.length; i++) {
				lib.removeFirstByClass(game.players[i], "playertipsha");
			}
		},
	};
	lib.skill._chupaiN = {
		trigger: { global: ["useCardEnd", "respondEnd", "dieBegin", "phaseBegin", "phaseEnd"] },
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			event.respondix = 0;
			for (let i = 0; i < game.players.length; i++) {
				if (game.players[i].getElementsByClassName("playertiptao")[0]) event.respondix++;
			}
			return event.respondix > 0;
		},
		async content(event, trigger, player) {
			for (let i = 0; i < game.players.length; i++) {
				lib.removeFirstByClass(game.players[i], "playertiptao");
			}
		},
	};
	lib.skill._chupaiP = {
		trigger: { global: ["useCardEnd", "respondEnd", "dieBegin", "phaseBegin", "phaseEnd"] },
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			event.respondix = 0;
			for (let i = 0; i < game.players.length; i++) {
				if (game.players[i].getElementsByClassName("playertipjiu")[0]) event.respondix++;
			}
			return event.respondix > 0;
		},
		async content(event, trigger, player) {
			for (let i = 0; i < game.players.length; i++) {
				lib.removeFirstByClass(game.players[i], "playertipjiu");
			}
		},
	};
	//--------------------其他特殊技能--------------------//
	lib.skill._chupaiA = {
		trigger: {
			player: ["phaseUseBegin", "useCardEnd", "loseEnd"],
		},
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			const a = player.getElementsByClassName("playertip");
			return player != (_status.event.player || game.me) && _status.currentPhase == player && player.isPhaseUsing() && a.length <= 0;
		},
		async content(event, trigger, player) {
			lib.removeFirstByClass(player, "tipskill");
			const a = player.getElementsByClassName("playertip");
			if (a.length <= 0) {
				const tipAB = document.createElement("img");
				tipAB.classList.add("tipshow", "playertip");
				if (lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff") {
					tipAB.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/shoushatip/tip.png";
					tipAB.style.cssText = "display:block;position:absolute;z-index:91;--w: 133px;--h: calc(var(--w) * 50/431);width: var(--w);height: var(--h);bottom:-22px;";
				} else {
					tipAB.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/shoushatip/phasetip.png";
					tipAB.style.cssText = "display:block;position:absolute;z-index:92;--w: 129px;--h: calc(var(--w) * 50/431);width: var(--w);height: var(--h);bottom:-20px;transform:scale(1.2);";
				}
				player.appendChild(tipAB);
			}
		},
	};
	lib.skill._chupaiB = {
		trigger: {
			global: ["phaseUseEnd", "dieBegin", "phaseBegin"],
		},
		silent: true,
		forced: true,
		priority: -1,
		charlotte: true,
		filter(event, player) {
			event.respondix = 0;
			for (let i = 0; i < game.players.length; i++) {
				const ab = game.players[i].getElementsByClassName("playertip");
				if (ab[0]) event.respondix++;
			}
			return event.respondix > 0;
		},
		async content(event, trigger, player) {
			for (let i = 0; i < game.players.length; i++) {
				lib.removeFirstByClass(game.players[i], "playertip");
			}
		},
	};
	lib.skill._chupaiC = {
		trigger: {
			player: "phaseDiscardBegin",
		},
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			return player != (_status.event.player || game.me);
		},
		async content(event, trigger, player) {
			lib.removeFirstByClass(player, "tipskill");
			const a = player.getElementsByClassName("playertipQP");
			if (a.length <= 0) {
				const tipCD = document.createElement("img");
				tipCD.classList.add("tipshow", "playertipQP");
				if (lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff") {
					tipCD.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/shoushatip/tipQP.png";
					tipCD.style.cssText = "display:block;position:absolute;z-index:91;--w: 133px;--h: calc(var(--w) * 50/431);width: var(--w);height: var(--h);bottom:-22px;";
				} else {
					tipCD.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/shoushatip/discardtip.png";
					tipCD.style.cssText = "display:block;position:absolute;z-index:92;--w: 129px;--h: calc(var(--w) * 50/431);width: var(--w);height: var(--h);bottom:-20px;transform:scale(1.2);";
				}
				player.appendChild(tipCD);
			}
		},
	};
	lib.skill._chupaiD = {
		trigger: {
			global: ["phaseDiscardEnd", "dieBegin"],
		},
		silent: true,
		forced: true,
		charlotte: true,
		filter(event, player) {
			event.respondix = 0;
			for (let i = 0; i < game.players.length; i++) {
				const ab = game.players[i].getElementsByClassName("playertipQP");
				if (ab[0]) event.respondix++;
			}
			return event.respondix > 0;
		},
		async content(event, trigger, player) {
			for (let i = 0; i < game.players.length; i++) {
				lib.removeFirstByClass(game.players[i], "playertipQP");
			}
		},
	};
	// 技能提示条（容错清除）
	lib.skill._skilltip_closeB = {
		trigger: {
			global: ["phaseUseEnd", "dieBegin", "dying", "phaseBegin", "useCardAfter", "loseAfter", "phaseEnd"],
		},
		silent: true,
		forced: true,
		priority: -2,
		charlotte: true,
		filter(event, player) {
			event.respondix = 0;
			for (const player of game.players) {
				const ab = player.getElementsByClassName("tipskill");
				if (ab[0]) event.respondix++;
			}
			return event.respondix > 0;
		},
		async content(event, trigger, player) {
			for (const player of game.players) {
				lib.removeFirstByClass(player, "tipskill");
			}
		},
	};
	//狗托播报
	if (config.GTBB) {
		const gtbbUI = {};
		// 从字符包中获取数据的公共函数
		function getCharactersFromPacks(filterFn) {
			const results = [];
			// 从标准字符包获取
			for (const packName of lib.config.characters) {
				const pack = lib.characterPack[packName];
				if (!pack) continue;
				for (const [charName, characterInfo] of Object.entries(pack)) {
					if (characterInfo.isUnseen) continue;
					if (lib.filter.characterDisabled(charName)) continue;
					const result = filterFn(charName, characterInfo);
					if (result) results.push(result);
				}
			}
			// 从扩展字符包获取
			for (const packName of Object.keys(lib.characterPack)) {
				if (!packName.startsWith("mode_extension_")) continue;
				const extName = packName.slice(15);
				if (lib.config[`extension_${extName}_characters_enable`] !== true) continue;
				const pack = lib.characterPack[packName];
				if (!pack) continue;
				for (const [charName, characterInfo] of Object.entries(pack)) {
					if (characterInfo.isUnseen) continue;
					if (lib.filter.characterDisabled(charName)) continue;
					const result = filterFn(charName, characterInfo);
					if (result) results.push(result);
				}
			}
			return results;
		}
		function showGTBB() {
			const playerLabel = "玩家";
			const nickname = lib.config.connect_nickname;
			// 获取随机名称
			const randomNames = getCharactersFromPacks(charName => {
				const displayName = get.translation(charName);
				return displayName && displayName !== charName ? displayName : null;
			});
			// 获取皮肤
			const skins = getCharactersFromPacks(charName => {
				const displayName = get.translation(charName);
				return displayName && displayName !== charName ? `${displayName}×1` : null;
			});
			// 获取武将
			const generals = getCharactersFromPacks(charName => {
				let title = lib.characterTitle[charName] || "";
				if (title.startsWith("#")) title = title.slice(2);
				title = get.plainText(title);
				const displayName = get.translation(charName);
				if (title && displayName && displayName !== charName) {
					return `${title}·${displayName}*1（动+静）`;
				}
				return null;
			});
			const suiji = randomNames.randomGet();
			const name = [suiji, nickname].randomGet();
			const action = ["通过", "使用", "开启"].randomGet();
			const stories = ["周年", "五一", "踏青", "牛年", "开黑", "冬至", "春分", "鼠年", "盛典", "魏魂", "群魂", "蜀魂", "吴魂", "猪年", "圣诞", "国庆", "狗年", "金秋", "奇珍", "元旦", "小雪", "冬日", "招募", "梦之回廊", "虎年", "新春", "七夕", "大雪", "端午", "武将", "中秋", "庆典"];
			const story = stories.randomGet();
			const boxTypes = ["盒子", "宝盒", "礼包", "福袋", "礼盒", "庆典", "盛典"];
			const box = boxTypes.randomGet();
			const getText = "获得了";
			const skin = skins.randomGet();
			const general = generals.randomGet();
			//奖励颜色
			const reward = [`<font color="#56e4fa">${skin}</font>`, `<font color="#f3c20f">${general}</font>`].randomGet();
			const tailMsgs = [",大家快恭喜TA吧！", ",大家快恭喜TA吧。无名杀是一款非盈利游戏(づ ●─● )づ", ",祝你新的一年天天开心，万事如意"];
			const tail = tailMsgs.randomGet();
			/*定义部分属性--默认手杀*/
			let fontset = "FZLBJW"; /*字体*/
			let colorA = "#efe8dc"; /*颜色a*/
			let colorB = "#22c622"; /*颜色b*/
			if (lib.config.extension_十周年UI_GTBBFont === "off") {
				fontset = "yuanli";
				colorA = "#86CC5B";
				colorB = "#B3E1EC";
			}
			gtbbUI.div.show();
			setTimeout(() => {
				gtbbUI.div.hide();
			}, 15500);
			gtbbUI.div2.innerHTML = `
				<marquee direction="left" behavior="scroll" scrollamount="9.8" loop="1" width="100%" height="50" align="absmiddle">
					<font face="${fontset}">
						${playerLabel}
						<font color="${colorA}"><b>${name}</b></font>
						${action}
						<font color="${colorB}"><b>${story}${box}</b></font>
						${getText}<b>${reward}</b>${tail}
					</font>
				</marquee>
			`;
		}
		gtbbUI.div = ui.create.div("");
		gtbbUI.div2 = ui.create.div("", gtbbUI.div);
		/*----------手杀样式-------*/
		if (config.GTBBYangshi === "on") {
			gtbbUI.div.style.cssText = "pointer-events:none;width:100%;height:25px;font-size:23px;z-index:6;";
			gtbbUI.div2.style.cssText = "pointer-events:none;background:rgba(0,0,0,0.5);width:100%;height:27px;";
			/*------------------------*/
		} else {
			/*-------十周年样式-------*/
			gtbbUI.div.style.cssText = "pointer-events:none;width:56%;height:35px;font-size:18px;z-index:20;background-size:100% 100%;background-repeat:no-repeat;left:50%;top:15%;transform:translateX(-50%);";
			gtbbUI.div.style["background-image"] = `url(${lib.assetURL}extension/十周年UI/shoushaUI/lbtn/images/uibutton/goutuo.png`;
			gtbbUI.div2.style.cssText = "pointer-events:none;width:85.5%;height:35px;left:8%;line-height:35px;";
			/*------------------------*/
		}
		const id = setInterval(() => {
			if (!gtbbUI.div.parentNode && ui.window) {
				ui.window.appendChild(gtbbUI.div);
				clearInterval(id);
				showGTBB();
				setInterval(showGTBB, parseFloat(lib.config["extension_十周年UI_GTBBTime"]));
			}
		}, 5000);
	}
};

export { registerLegacyModules };
