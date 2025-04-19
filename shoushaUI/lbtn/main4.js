app.import(function (lib, game, ui, get, ai, _status, app) {
	const originalChat = lib.message.server.chat;
	lib.message.server.chat = function (id, str) {
		if (str.slice(0, 6) === "/audio") {
			game.broadcastAll(function (url) {
				if (lib.config.background_speak) {
					game.playAudio(url);
				}
			}, str.slice(6));
		} else originalChat.call(this, id, str);
	};
	lib.ui.create.pause = function () {
		/*覆写历史记录*/
		if (_status.pausing) return;
		ui.click.shortcut(false);
		let node = ui.create.div(".pausedbg", ui.window);
		node.style.backgroundColor = "rgba(0,0,0,0.5)";
		node.style.backgroundSize = "100% 100%";
		let node_resume = ui.create.div(".resumedbg", node);
		node_resume.style.backgroundSize = "100% 100%";
		_status.pausing = true;
		setTimeout(function () {
			_status.pausing = false;
		}, 500);
		if (lib.config.touchscreen) {
			setTimeout(function () {
				node.addEventListener("touchend", ui.click.resume);
			}, 500);
		} else {
			node.addEventListener("click", ui.click.resume);
		}
		if (!lib.config.touchscreen) {
			node.oncontextmenu = ui.click.resume;
		}
		return node;
	};
	lib.ui.click.pause = function () {
		/*覆写历史记录*/
		if (_status.paused2 || _status.pausing || _status.nopause || !ui.pause) return;
		if (!_status.video) {
			if (ui.pause.classList.contains("hidden")) return;
			if (!_status.gameStarted) return;
		}
		ui.system.hide();
		game.pause2();
		let clonedSidebar = ui.sidebar.cloneNode(false);
		let sidebarChildren = Array.from(ui.sidebar.childNodes);
		sidebarChildren.reverse();
		sidebarChildren.forEach(child => {
			let clonedChild = child.cloneNode(true);
			clonedSidebar.appendChild(clonedChild);
		});
		for (let element of clonedSidebar.children) {
			element.style.display = "block";
		}
		let node = ui.create.pause();
		if (!node) return;
		node.animate("start");
		let bigbg = ui.create.div(".bigbgjilu", node);
		let historybg = ui.create.div(".historybg", node);
		let columnbox = ui.create.div(".content", bigbg);
		// 获取场上所有角色
		let player_list = [];
		let click = [];
		for (let player of game.players) {
			player_list.add(player);
			if (player.getElementsByClassName("yinni").length > 0) {
				player.name = "yinni";
				lib.translate.yinni = "主将";
			}
		}
		if (game.dead.length > 0) {
			for (let player of game.dead) {
				player_list.add(player);
			}
		}
		player_list.sort(function (a, b) {
			return a.getSeatNum() - b.getSeatNum();
		});
		function changeall(event) {
			event.stopPropagation();
			document.querySelectorAll(".gou").forEach(gou => {
				gou.remove();
			});
			ui.create.div(".gou", allOptionAnniu);
			for (let element of clonedSidebar.children) {
				element.style.display = "block";
			}
			if (clonedSidebar.childNodes.length && clonedSidebar.scrollHeight > clonedSidebar.offsetHeight) {
				clonedSidebar.scrollTop = clonedSidebar.scrollHeight - clonedSidebar.clientHeight;
			}
		}
		let allOptionBg = ui.create.div(".namebg", columnbox);
		let namebgbg = ui.create.div(".namebgbg", allOptionBg);
		let allOptionAnniu = ui.create.div(".jiluanniu", allOptionBg, function (event) {
			changeall(event);
		});
		ui.create.div(".gou", allOptionAnniu);
		let name = ui.create.div(".name", "全部", namebgbg, function (event) {
			changeall(event);
		});
		for (let tar of player_list) {
			let namebg = ui.create.div(".namebg", columnbox);
			if (game.dead.includes(tar)) namebg.style.filter = "grayscale(0%)";
			let namebgbg = ui.create.div(".namebgbg", namebg);
			function change(event) {
				event.stopPropagation();
				document.querySelectorAll(".gou").forEach(gou => {
					gou.remove();
				});
				let gou = ui.create.div(".gou", anniu);
				let seat = tar.getSeatNum();
				let targets = game.players.concat(game.dead).filter(function (current) {
					return current.getSeatNum() == seat;
				});
				if (targets.length) {
					let current = targets[0];
					let names = [current.name, current.name1, current.name2];
					names = [...new Set(names)];
					names = names.map(name => get.translation(name)).filter(name => name.length > 0);
					let hasEmpty = false;
					for (let element of clonedSidebar.children) {
						let hasPlayer = false;
						let text = element.innerText || element.textContent || "";
						if (text.trim().length === 0) {
							if (!hasEmpty) {
								element.style.display = "block";
								hasEmpty = true;
							} else {
								element.style.display = "none";
							}
							continue;
						}
						hasEmpty = false;
						for (let name of names) {
							if (text.includes(name)) {
								hasPlayer = true;
								element.style.display = "block";
								break;
							}
						}
						if (!hasPlayer) {
							element.style.display = "none";
						}
					}
				}
				if (clonedSidebar.childNodes.length && clonedSidebar.scrollHeight > clonedSidebar.offsetHeight) {
					clonedSidebar.scrollTop = clonedSidebar.scrollHeight - clonedSidebar.clientHeight;
				}
			}
			let prefixName = lib.translate[tar.name + "_prefix"] ? `${get.prefixSpan(get.translation(tar.name + "_prefix"), tar.name)}${get.rawName(tar.name)}` : get.translation(tar.name);
			let seatnum = "(" + (tar.getSeatNum() == 2 ? "二" : get.cnNumber(tar.getSeatNum())) + "号位)";
			let name = ui.create.div(".name", prefixName + seatnum, namebgbg, function (event) {
				change(event);
			});
			let anniu = ui.create.div(".jiluanniu", namebg, function (event) {
				change(event);
			});
		}
		ui.sidebar3.innerHTML = "";
		if (lib.config.show_discardpile) {
			for (let i = 0; i < ui.discardPile.childNodes.length; i++) {
				let div = ui.create.div(ui.sidebar3);
				div.innerHTML = get.translation(ui.discardPile.childNodes[i]);
				ui.sidebar3.insertBefore(div, ui.sidebar3.firstChild);
			}
		}
		historybg.appendChild(clonedSidebar);
		node.appendChild(ui.sidebar3);
		ui.historybar.classList.add("paused");
		ui.arena.classList.add("paused");
		ui.window.classList.add("touchinfohidden");
		ui.time.hide();
		if (game.onpause) {
			game.onpause();
		}
		if (clonedSidebar.childNodes.length && clonedSidebar.scrollHeight > clonedSidebar.offsetHeight) {
			clonedSidebar.scrollTop = clonedSidebar.scrollHeight - clonedSidebar.clientHeight;
		}
	};
	lib.arenaReady.push(function () {
		let modeConfigs = {
			//身份任务（阵营划分）
			single: {
				zhu: "击败对手",
				fan: "击败对手",
				undefined: "未选择阵营",
			},
			boss: {
				zhu: "击败盟军",
				cai: "击败神祇",
				undefined: "未选择阵营",
			},
			guozhan: () => {
				let config = {
					undefined: "未选择势力",
					unknown: "保持隐蔽",
					ye: "击败场上所有其他角色",
				};
				for (let i = 0; i < lib.group.length; i++) {
					config[lib.group[i]] = "击败所有非" + get.translation(lib.group[i]) + "势力角色";
				}
				return config;
			},
			versus: () => {
				let versusMode = get.config("versus_mode");
				if (versusMode === "standard") return {};
				if (versusMode === "two") {
					return { undefined: "" + (get.config("replace_character_two") ? "击败所有敌方" : "协同队友击败所有敌人") + "" };
				}
				if (versusMode === "jiange") {
					return {
						wei: "击败所有蜀势力角色",
						shu: "击败所有魏势力角色",
					};
				}
				if (versusMode === "siguo") {
					let config = {};
					for (let i = 0; i < lib.group.length; i++) {
						config[lib.group[i]] = "获得龙船或击败非" + get.translation(lib.group[i]) + "势力角色";
					}
					return config;
				}
				return {};
			},
			doudizhu: {
				zhu: "击败所有农民",
				fan: "击败地主",
				undefined: "未选择阵营",
			},
			identity: {
				rZhu: "击败冷方主公与所有野心家",
				rZhong: "保护暖方主公击败冷方主公与所有野心家",
				rYe: "联合冷方野心家击败其他角色",
				rNei: "协助冷方主公击败暖方主公与所有野心家",
				bZhu: "击败暖方主公与所有野心家",
				bZhong: "保护冷方主公击败暖方主公与所有野心家",
				bYe: "联合暖方野心家击败其他角色",
				bNei: "协助暖方主公击败冷方主公与所有野心家",
				zhu: "击败反贼和内奸",
				zhong: "保护主公，击败反贼内奸",
				fan: "击败主公",
				nei: "击败所有角色，最后击败主公",
				mingzhong: "保护主公，击败反贼内奸",
				undefined: "击败所有敌方",
			},
		};
		// 确定当前游戏模式
		let currentMode;
		if (lib.configOL.doudizhu_mode || lib.config.mode == "doudizhu") {
			currentMode = "doudizhu";
		} else if (lib.configOL.single_mode || lib.config.mode == "single") {
			currentMode = "single";
		} else if (lib.configOL.boss_mode || lib.config.mode == "boss") {
			currentMode = "boss";
		} else if (lib.configOL.guozhan_mode || lib.config.mode == "guozhan") {
			currentMode = "guozhan";
		} else if (lib.configOL.versus_mode || lib.config.mode == "versus") {
			currentMode = "versus";
		} else {
			currentMode = "identity";
		}
		// 设置翻译文本
		if (currentMode) {
			let config = typeof modeConfigs[currentMode] === "function" ? modeConfigs[currentMode]() : modeConfigs[currentMode];
			Object.keys(config).forEach(key => {
				lib.translate[`${key}_win_option`] = config[key];
			});
		}
		game.ui_identityShow_update = function () {
			//左上角整体（身份任务及牌局记录）
			game.countPlayer(current => {
				//添加 确定每个玩家的名字
				var namex = current === game.me ? lib.config.connect_nickname : ["缘之空", "小小恐龙", "自然萌", "海边的ebao", "小云云", "点点", "猫猫虫", "小爱莉", "冰佬", "鹿鹿", "黎佬", "浮牢师", "U佬", "蓝宝", "影宝", "柳下跖", "k9", "扶苏", "皇叔"].randomGet();
				if (!game.hasPlayer(current => {})) if (!current.nickname) current.nickname = namex;
			});
			var identityShow = game.ui_identityShow;
			var str = "";
			if (lib.config.mode == "guozhan" || (lib.config.mode == "versus" && get.config("versus_mode") == "siguo") || (lib.config.mode == "versus" && get.config("versus_mode") == "jiange")) {
				let identities = ["unknown", "wei", "shu", "wu", "qun", "jin", "ye", "key"];
				let identityCounts = {};
				let identityColors = {
					unknown: "#FFFFDE",
					wei: "#0075FF",
					shu: "#FF0000",
					wu: "#00FF00",
					qun: "#FFFF00",
					jin: "#9E00FF",
					ye: "#9E00FF",
					key: "#9E00FF",
				};
				for (let identity of identities) {
					identityCounts[identity] = game.countPlayer(current => {
						return current.identity === identity;
					});
					if (identityCounts[identity] > 0) str += '<font color="' + identityColors[identity] + '">' + get.translation(identity) + identityCounts[identity] + "</font>" + " ";
				}
				str += "<br>";
			} else if ((lib.config.mode == "versus" && get.config("versus_mode") == "two") || lib.config.mode == "doudizhu") {
			} else {
				let identityInfo = {
					zhu: {
						color: "#AE5F35",
						aliases: ["zhu", "rZhu", "bZhu"],
					},
					zhong: {
						color: "#E9D765",
						aliases: ["zhong", "rZhong", "bZhong", "mingzhong"],
					},
					fan: {
						color: "#87A671",
						aliases: ["fan", "rYe", "bYe"],
					},
					nei: {
						color: "#9581C4",
						aliases: ["nei", "rNei", "bNei"],
					},
				};
				for (let [key, info] of Object.entries(identityInfo)) {
					let count = game.countPlayer(current => info.aliases.includes(current.identity));
					if (count > 0) str += `<font color="${info.color}">${get.translation(key)}</font>${count}  `;
				}
				str += "<br>";
			}
			if (game.me) str += '<span style="color: orange;"><center>' + get.translation(game.me.identity + "_win_option") + "</span>";
			identityShow.innerHTML = '<span style="font-family:shousha;font-size:16px;font-weight:500;text-align:right;line-height:20px;color:#C1AD92;text-shadow:none;max-width:20px;word-wrap:break-word;">' + str + "</span>";
			let jiluShow = ui.create.div(".jiluButton", identityShow, ui.click.pause);
		};
		if (game.ui_identityShow == undefined) {
			game.ui_identityShow = ui.create.div(".identityShow", "身份加载中......", ui.window);
		}
		setInterval(function () {
			game.ui_identityShow_update();
		}, 1000);
		//更新身份任务
		var originUpdateRoundNumber = game.updateRoundNumber;
		game.updateRoundNumber = function () {
			originUpdateRoundNumber.apply(this, arguments);
			if (ui.cardRoundTime) ui.cardRoundTime.updateRoundCard();
		};
		var yinying = ui.create.div(".handcardyinying", ui.window); //阴影
		var caidanbutton = ui.create.div(".caidanbutton", ui.window);
		caidanbutton.onclick = function () {
			//菜单按钮
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/click.mp3");
			var popuperContainer = ui.create.div(".popup-container", ui.window);
			popuperContainer.addEventListener("click", event => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/back.mp3");
				event.stopPropagation();
				popuperContainer.delete(200);
			});
			var HOME = ui.create.div(".caidanopen", popuperContainer);
			var caidan2 = ui.create.div(".controls", HOME); //展开后的菜单按钮
			caidan2.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/caidan2.png");
			var SZ = ui.create.div(".controls", HOME); //设置
			SZ.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/shezhi.png");
			SZ.addEventListener("click", event => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				if (!ui.click.configMenu) return;
				game.closePopped();
				game.pause2();
				ui.click.configMenu();
				ui.system1.classList.remove("shown");
				ui.system2.classList.remove("shown");
			});
			var BJ = ui.create.div(".controls", HOME); //背景
			BJ.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/beijing.png");
			BJ.addEventListener("click", event => {
				event.stopPropagation();
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				var popuperContainer = ui.create.div(
					".popup-container",
					{
						background: "rgba(0, 0, 0, 0.8)",
					},
					ui.window
				);
				var guanbi = ui.create.div(".bgback", popuperContainer, function (e) {
					game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3");
					popuperContainer.hide();
					game.resume2();
				});
				var bigdialog = ui.create.div(".bgdialog", popuperContainer);
				var bgbg = ui.create.div(".backgroundsbg", bigdialog);
				let path = "image/background/";
				game.getFileList(path, function (folders, files) {
					for (let tempbackground of files) {
						let fileName = tempbackground.replace(/\.[^/.]+$/, "");
						let fileExtension = tempbackground.split(".").pop();
						if (!fileExtension || fileName.startsWith("oltianhou_")) continue;
						let img = ui.create.div(".backgrounds", bgbg);
						img.setBackgroundImage(path + tempbackground);
						if (fileName == lib.config.image_background) ui.create.div(".bgxuanzhong", img);
						img.addEventListener("click", function () {
							let allSelectedElements = document.querySelectorAll(".bgxuanzhong");
							allSelectedElements.forEach(function (selectedElement) {
								selectedElement.parentNode.removeChild(selectedElement);
							});
							ui.create.div(".bgxuanzhong", img);
							game.saveConfig("image_background", fileName);
							lib.init.background();
							game.updateBackground();
						});
						let backgroundName = lib.configMenu.appearence.config.image_background.item[fileName] ? lib.configMenu.appearence.config.image_background.item[fileName] : fileName;
						ui.create.div(".buttontext", backgroundName, img);
					}
				});
			});
			var TG = ui.create.div(".controls", HOME); //托管
			TG.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/tuoguan.png");
			TG.addEventListener("click", event => {
				ui.click.auto();
			});
			var TC = ui.create.div(".controls", HOME); //离开
			TC.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/likai.png");
			TC.addEventListener("click", event => {
				window.location.reload();
			});
		};
	});
	var plugin = {
		name: "lbtn",
		filter() {
			return !["chess", "tafang"].contains(get.mode());
		},
		content(next) {
			lib.skill._uicardupdate = {
				trigger: {
					player: "phaseJieshuBegin",
				},
				forced: true,
				unique: true,
				popup: false,
				silent: true,
				noLose: true,
				noGain: true,
				noDeprive: true,
				priority: -Infinity,
				filter(event, player) {
					return player == game.me;
				},
				content() {
					if (ui.updateSkillControl) ui.updateSkillControl(game.me, true);
				},
			};
		},
		precontent() {
			Object.assign(game.videoContent, {
				createCardRoundTime() {
					ui.cardRoundTime = plugin.create.cardRoundTime();
				},
				createhandcardNumber() {
					ui.handcardNumber = plugin.create.handcardNumber();
				},
				updateCardRoundTime(opts) {
					if (!ui.cardRoundTime) return;
					ui.cardRoundTime.node.roundNumber.innerHTML = "<span>第" + game.roundNumber + "轮</span>";
					ui.cardRoundTime.setNumberAnimation(opts.cardNumber);
				},
				updateCardnumber(opts) {
					if (!ui.handcardNumber) return;
				},
			});
			app.reWriteFunction(ui.create, {
				me: [
					function () {
						plugin.create.control();
					},
					null,
				],
				arena: [
					null,
					function () {
						if (ui.time3) {
							clearInterval(ui.time3.interval);
							ui.time3.delete();
						}
						if (ui.cardPileNumber) ui.cardPileNumber.delete();
						ui.cardRoundTime = plugin.create.cardRoundTime();
						ui.handcardNumber = plugin.create.handcardNumber();
					},
				],
				cards: [
					null,
					function () {
						if (ui.cardRoundTime) {
							ui.cardRoundTime.updateRoundCard();
						}
					},
				],
			});
			app.reWriteFunction(lib.configMenu.appearence.config, {
				update: [
					null,
					function (res, config, map) {
						map.control_style.hide();
						map.custom_button.hide();
						map.custom_button_system_top.hide();
						map.custom_button_system_bottom.hide();
						map.custom_button_control_top.hide();
						map.custom_button_control_bottom.hide();
						map.radius_size.hide();
					},
				],
			});

			ui.create.confirm = function (str, func) {
				var confirm = ui.confirm;
				if (!confirm) {
					confirm = ui.confirm = plugin.create.confirm();
				}
				confirm.node.ok.classList.add("disabled");
				confirm.node.cancel.classList.add("disabled");
				if (_status.event.endButton) {
					ui.confirm.node.cancel.classList.remove("disabled");
				}
				if (str) {
					if (str.indexOf("o") !== -1) {
						confirm.node.ok.classList.remove("disabled");
					}
					if (str.indexOf("c") !== -1) {
						confirm.node.cancel.classList.remove("disabled");
					}
					confirm.str = str;
				}

				if (func) {
					confirm.custom = func;
				}
				ui.updatec();
				confirm.update();
			};
		},
		create: {
			control() {},
			confirm() {
				var confirm = ui.create.control("<span>确定</span>", "cancel");
				confirm.classList.add("lbtn-confirm");
				confirm.node = {
					ok: confirm.firstChild,
					cancel: confirm.lastChild,
				};
				if (_status.event.endButton) {
					_status.event.endButton.close();
					//	delete event.endButton;
				}
				confirm.node.ok.link = "ok";
				confirm.node.ok.classList.add("primary");
				confirm.node.cancel.classList.add("primary2");
				confirm.custom = plugin.click.confirm;
				app.reWriteFunction(confirm, {
					close: [
						function () {
							this.classList.add("closing");
						},
					],
				});
				for (var k in confirm.node) {
					confirm.node[k].classList.add("disabled");
					confirm.node[k].removeEventListener(lib.config.touchscreen ? "touchend" : "click", ui.click.control);
					confirm.node[k].addEventListener(lib.config.touchscreen ? "touchend" : "click", function (e) {
						e.stopPropagation();
						if (this.classList.contains("disabled")) {
							if (this.link === "cancel" && this.dataset.type === "endButton" && _status.event.endButton) {
								_status.event.endButton.custom();
								ui.confirm.close();
								//  ui.updatec();
							}
							return;
						}

						if (this.parentNode.custom) {
							this.parentNode.custom(this.link, this);
						}
					});
				}

				if (ui.skills2 && ui.skills2.skills.length) {
					var skills = ui.skills2.skills;
					confirm.skills2 = [];
					for (var i = 0; i < skills.length; i++) {
						var item = document.createElement("div");
						item.link = skills[i];
						item.innerHTML = get.translation(skills[i]);
						item.addEventListener(lib.config.touchscreen ? "touchend" : "click", function (e) {
							e.stopPropagation();
							ui.click.skill(this.link);
						});

						item.dataset.type = "skill2";
						if (ui.updateSkillControl) ui.updateSkillControl(game.me, true);
						/*
						           confirm.insertBefore(item, confirm.firstChild);*/
					}
				}

				confirm.update = function () {
					if (confirm.skills2) {
						if (_status.event.skill && _status.event.skill !== confirm.dataset.skill) {
							confirm.dataset.skill = _status.event.skill;
							confirm.skills2.forEach(function (item) {
								item.remove();
							});
							ui.updatec();
						} else if (!_status.event.skill && confirm.dataset.skill) {
							delete confirm.dataset.skill;
							confirm.skills2.forEach(function (item) {
								confirm.insertBefore(item, confirm.firstChild);
							});
							ui.updatec();
						}
					}
					if (ui.updateSkillControl) ui.updateSkillControl(game.me, true);
				};
				return confirm;
			},
			handcardNumber() {
				//左下角配件
				let anniubuttons;
				if (lib.config.extension_十周年UI_XPJ != "on") {
					if (lib.config["extension_十周年UI_rightLayout"] == "on") {
						anniubuttons = ui.create.div(".leftbuttons", ui.window);
					} else {
						anniubuttons = ui.create.div(".rightbuttons", ui.window);
					}
				}
				let buttonConfigs = {
					//小配件
					gift: {
						//送花
						imageBg: "extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/gift.png",
						click: function () {
							let container = ui.create.div(".popup-container", ui.window, function (e) {
								if (e.target === container) container.hide();
							});
							let giftbg = ui.create.div(".giftbg", container);
							ui.create.div(".giftbgtext", "点击道具使用", giftbg);
							let giftes = ui.create.div(".giftes", giftbg);
							let gifttype = {
								hua: {
									name: "鲜花",
									image: "xianhua.png",
									cost: "1",
									show: "flower",
								},
								jiu: {
									name: "青梅煮酒",
									image: "qingjiu.png",
									cost: "5",
									show: "wine",
								},
								dan: {
									name: "鸡蛋",
									image: "jidan.png",
									cost: "1",
									show: "egg",
								},
								xie: {
									name: "草鞋",
									image: "tuoxie.png",
									cost: "5",
									show: "shoe",
								},
							};
							for (let i in gifttype) {
								let gift = ui.create.div(".gift", giftes, function (event) {
									giftbg.hide();
									let container2 = ui.create.div(".popup-container", ui.window, function (e) {
										if (e.target === container2) {
											container2.hide();
											giftbg2.hide();
											giftbg.show();
										}
									});
									let giftbg2 = ui.create.div(".giftbg2", container);
									ui.create.div(".giftbgtext", "点击框外区域可退出", giftbg2);
									let gift2 = ui.create.div(".gift2", giftbg2);
									gift2.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/gift/" + gifttype[i].image);
									game.countPlayer(current => {
										if (current !== game.me) {
											let player = current.node.avatar;
											// 获取 container 元素
											let container = document.querySelector(".popup-container");
											// 创建 giftgive 元素
											let giftgive = ui.create.div(".giftgive", container2, function (event) {
												event.stopPropagation();
												if (game.online) {
													game.send("throwEmotion", current, gifttype[i].show);
												} else game.me.throwEmotion(current, gifttype[i].show);
											});
											// 获取 player 元素的位置和大小信息
											let playerRect = player.getBoundingClientRect();
											let containerRect = container.getBoundingClientRect();
											// 设置 giftgive 元素的样式
											giftgive.style.position = "absolute";
											giftgive.style.top = playerRect.top - containerRect.top + "px";
											giftgive.style.left = playerRect.left - containerRect.left + "px";
											giftgive.style.width = playerRect.width + "px";
											giftgive.style.height = playerRect.height + "px";
										}
									});
								});
								gift.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/gift/" + gifttype[i].image);
								ui.create.div(".giftname", gifttype[i].name, gift);
								ui.create.div(".giftcost", gifttype[i].cost, gift);
							}
						},
					},
					talk: {
						//交流
						imageBg: "extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/talk.png",
						click: function () {
							if (!game.me) return;
							let container = ui.create.div(".popup-container", ui.window, function (e) {
								if (e.target === container) container.hide();
								if (shuru) {
									shuru.value = "";
									shuru.style.display = "none";
								}
							});
							let bg = ui.create.div(".talkbg", container);
							let typechanges = ui.create.div(".typechanges", bg);
							let typechange = {
								quick: {
									name: "快捷",
									click: function () {
										//快捷消息
										let skills = game.me.getSkills(null, false, false).filter(skill => {
											let info = get.info(skill);
											return !info || !info.charlotte;
										});
										let skillsx = skills;
										for (let skill of skills) {
											let info = get.info(skill);
											if (info.derivation) {
												if (Array.isArray(info.derivation)) {
													for (let name of info.derivation) {
														skillsx.push(name);
													}
												} else {
													skillsx.push(info.derivation);
												}
											}
										}
										skillsx = skillsx.filter((item, index) => {
											return skillsx.indexOf(item) === index;
										});
										for (let name of skillsx) {
											if (!get.info(name)) continue;
											let textList = game.parseSkillText(name, game.me.name);
											let audioList = game.parseSkillAudio(name, game.me.name);
											for (let i = 0; i < textList.length; i++) {
												let text = ui.create.div(".talkquick", "[" + get.skillTranslation(name) + "]" + textList[i], rightbg, function () {
													let actualPath;
													if (audioList[i].slice(0, 4) === "ext:") actualPath = "../extension/" + audioList[i].slice(4);
													else actualPath = "../audio/" + audioList[i];
													if (game.online) {
														game.send("chat", game.onlineID, textList[i]);
														game.send("chat", game.onlineID, "/audio" + actualPath);
													} else {
														game.me.chat(textList[i]);
														game.broadcastAll(function (receivedPath) {
															if (lib.config.background_speak) {
																game.playAudio(receivedPath);
															}
														}, actualPath);
													}
												});
											}
										}
										for (let i = 0; i < lib.quickVoice.length; i++) {
											let chat = lib.quickVoice[i];
											ui.create.div(".talkquick", chat, rightbg, function () {
												if (game.online) game.send("chat", game.onlineID, chat);
												else game.me.chat(chat);
											});
										}
									},
								},
								emoje: {
									name: "表情",
									click: function () {
										const gridStyle = {
											display: "grid",
											gridTemplateColumns: "repeat(3, 1fr)",
											gridGap: "5px",
											width: "max-content",
											margin: "0 auto",
										};
										let list1, list2;
										function createDivWithStyle(className, content, style) {
											const div = ui.create.div(className, content);
											Object.assign(div.style, style);
											return div;
										}
										function createEmotionButton(pack, emotionID) {
											const button = ui.create.div(".card.fullskin", `<img src="${lib.assetURL}image/emotion/${pack}/${emotionID}.gif" width="80" height="80">`, () => {
												if (game.online) game.send("emotion", game.onlineID, pack, emotionID);
												else game.me.emotion(pack, emotionID);
											});
											button.emotionID = emotionID;
											button.pack = pack;
											Object.assign(button.style, { width: "80px", height: "80px" });
											return button;
										}
										function createEmotionPack(pack) {
											const packDiv = ui.create.div(".card.fullskin", `<img src="${lib.assetURL}image/emotion/${pack}/1.gif" width="80" height="80">`, () => {
												list2.innerHTML = "";
												const count = lib.emotionList[pack];
												for (let j = 1; j <= count; j++) {
													const emotionButton = createEmotionButton(pack, j);
													list2.appendChild(emotionButton);
												}
												list1.style.display = "none";
												list2.style.display = "grid";
											});
											packDiv.pack = pack;
											Object.assign(packDiv.style, { width: "80px", height: "80px" });
											return packDiv;
										}
										if (!list1) list1 = createDivWithStyle(".emotionbg", rightbg, gridStyle);
										else list1.style.display = "grid";
										if (!list2) list2 = createDivWithStyle(".emotionbg", rightbg, gridStyle);
										list1.innerHTML = "";
										list2.innerHTML = "";
										for (const pack in lib.emotionList) {
											const emotionPack = createEmotionPack(pack);
											list1.appendChild(emotionPack);
										}
									},
								},
								history: {
									name: "消息",
									click: function () {
										const nameColor = "rgb(220, 170, 50)";
										for (let chat of lib.chatHistory) {
											const content = `<span style="color:${nameColor};">${chat[0]}：</span><br>${chat[1]}`;
											ui.create.div(".talkhistory", content, rightbg);
										}
										rightbg.scrollTop = rightbg.scrollHeight;
									},
								},
							};
							let allButtons = [];
							for (let [buttonName, config] of Object.entries(typechange)) {
								let button = ui.create.div(".typechange", config.name, typechanges);
								allButtons.push(button);
								let originalClick = config.click;
								button.onclick = function () {
									allButtons.forEach(btn => {
										btn.classList.remove("typechangelight");
									});
									this.classList.add("typechangelight");
									while (rightbg.firstChild) {
										rightbg.removeChild(rightbg.firstChild);
									}
									if (originalClick) originalClick.call(this);
								};
							}
							let rightbg = ui.create.div(".talkrightbg", bg);
							typechange.quick.click();
							if (allButtons.length > 0) allButtons[0].classList.add("typechangelight");
							let dazi = ui.create.div(".dazi", "打字", bg);
							let shuru = null;
							dazi.addEventListener("click", function () {
								if (!shuru) {
									//输入框的样式
									shuru = document.createElement("input");
									shuru.type = "text";
									shuru.placeholder = "请输入要说的话";
									shuru.style.position = "absolute";
									shuru.style.left = "50%";
									shuru.style.transform = "translateX(-50%)";
									shuru.style.zIndex = "1000";
									shuru.style.top = "5%";
									shuru.style.width = "60%";
									shuru.style.height = "10%";
									shuru.style.fontSize = "30px";
									ui.window.appendChild(shuru);
								}
								shuru.style.display = "block";
								shuru.focus();
							});
							document.addEventListener("keydown", function (event) {
								if (shuru && shuru.style.display === "block" && event.key === "Enter") {
									let inputValue = shuru.value.trim();
									if (inputValue) {
										if (game.online) game.send("chat", game.onlineID, inputValue);
										else game.me.chat(inputValue);
										while (rightbg.firstChild) {
											rightbg.removeChild(rightbg.firstChild);
										}
										typechange.history.click();
									}
									shuru.value = "";
									shuru.style.display = "none";
								}
							});
						},
					},
					sortcard: {
						//牌序
						imageBg: "extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/cardsort.png",
						click: function () {
							if (!game.me || game.me.hasSkillTag("noSortCard")) return;
							let cards = game.me.getCards("hs");
							let sort2 = function (b, a) {
								if (a.name !== b.name) return lib.sort.card(a.name, b.name);
								else if (a.suit !== b.suit) return lib.suit.indexOf(a) - lib.suit.indexOf(b);
								return a.number - b.number;
							};
							if (cards.length > 1) {
								let num = [1, 2].randomGet();
								if (num == 1) cards.sort(sort2);
								else cards.sort();
								cards.forEach((card, index) => {
									game.me.node.handcards1.insertBefore(card, game.me.node.handcards1.firstChild);
								});
								dui.queueNextFrameTick(dui.layoutHand, dui);
							}
						},
					},
				};
				for (let [buttonName, config] of Object.entries(buttonConfigs)) {
					let button = ui.create.div(".anniubutton", anniubuttons);
					button.setBackgroundImage(config.imageBg);
					if (config.click) button.onclick = config.click;
				}
			},
			cardRoundTime() {
				//游戏轮数
				var node = ui.create.div(".cardRoundNumber", ui.window).hide();
				node.node = {
					cardPileNumber: ui.create.div(".cardPileNumber", node),
					roundNumber: ui.create.div(".roundNumber", node),
					time: ui.create.div(".time", node),
				};
				node.updateRoundCard = function () {
					var cardNumber = ui.cardPile.childNodes.length || 0;
					var roundNumber = game.roundNumber || 0;
					this.node.roundNumber.innerHTML = "<span>第" + (game.roundNumber == 2 ? "二" : get.cnNumber(game.roundNumber)) + "轮</span>";
					this.setNumberAnimation(cardNumber);
					this.show();
					game.addVideo("updateCardRoundTime", null, {
						cardNumber: cardNumber,
						roundNumber: roundNumber,
					});
				};
				node.setNumberAnimation = function (num, step) {
					var item = this.node.cardPileNumber;
					clearTimeout(item.interval);
					if (!item._num) {
						item.innerHTML = '<span style="font-size: 16px;">' + num + "张</span>";
						item._num = num;
					} else {
						if (item._num !== num) {
							if (!step) step = 500 / Math.abs(item._num - num);
							if (item._num > num) item._num--;
							else item._num++;
							item.innerHTML = '<span style="font-size: 16px;">' + item._num + "张</span>";
							if (item._num !== num) {
								item.interval = setTimeout(function () {
									node.setNumberAnimation(num, step);
								}, step);
							}
						}
					}
				};
				ui.time4 = node.node.time;
				ui.time4.starttime = get.utc();
				ui.time4.interval = setInterval(function () {
					var num = Math.round((get.utc() - ui.time4.starttime) / 1000);
					if (num >= 3600) {
						var num1 = Math.floor(num / 3600);
						var num2 = Math.floor((num - num1 * 3600) / 60);
						var num3 = num - num1 * 3600 - parseInt(num2) * 60;
						if (num1 < 10) {
							num1 = "0" + num1.toString();
						}
						if (num2 < 10) {
							num2 = "0" + num2.toString();
						}
						if (num3 < 10) {
							num3 = "0" + num3.toString();
						}
						ui.time4.innerHTML = "<span>" + num1 + ":" + num2 + ":" + num3 + "</span>";
					} else {
						var num1 = Math.floor(num / 60);
						var num2 = num - num1 * 60;
						if (num1 < 10) {
							num1 = "0" + num1.toString();
						}
						if (num2 < 10) {
							num2 = "0" + num2.toString();
						}
						ui.time4.innerHTML = "<span>" + num1 + ":" + num2 + "</span>";
					}
				}, 1000);
				game.addVideo("createCardRoundTime");
				return node;
			},
		},
		click: {
			confirm(link, target) {
				if (link === "ok") {
					ui.click.ok(target);
				} else if (link === "cancel") {
					ui.click.cancel(target);
				} else if (target.custom) {
					target.custom(link);
				}
			},
		},
		compare: {
			type(a, b) {
				if (a === b) return 0;
				var types = ["basic", "trick", "delay", "equip"].addArray([a, b]);
				return types.indexOf(a) - types.indexOf(b);
			},
			name(a, b) {
				if (a === b) return 0;
				return a > b ? 1 : -1;
			},
			nature(a, b) {
				if (a === b) return 0;
				var nature = [undefined, "fire", "thunder"].addArray([a, b]);
				return nature.indexOf(a) - nature.indexOf(b);
			},
			suit(a, b) {
				if (a === b) return 0;
				var suit = ["diamond", "heart", "club", "spade"].addArray([a, b]);
				return suit.indexOf(a) - suit.indexOf(b);
			},
			number(a, b) {
				return a - b;
			},
		},
	};
	return plugin;
});
