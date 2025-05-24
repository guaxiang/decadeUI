app.import(function (lib, game, ui, get, ai, _status, app) {
	//第一页
	//第一页
	var plugin = {
		name: "character",
		filter() {
			return !["chess", "tafang", "stone"].includes(get.mode());
		},
		content(next) {},
		precontent() {
			app.reWriteFunction(lib, {
				setIntro: [
					function (args, node) {
						if (get.itemtype(node) === "player") {
							if (lib.config.touchscreen) lib.setLongPress(node, plugin.click.playerIntro);
							else if (lib.config.right_info) node.oncontextmenu = plugin.click.playerIntro;
							return node;
						}
					},
				],
			});
		},
		click: {
			identity(e) {
				e.stopPropagation();
				var player = this.parentNode;
				if (!game.getIdentityList) return;
				if (player.node.guessDialog) player.node.guessDialog.classList.toggle("hidden");
				else {
					var list = game.getIdentityList(player);
					if (!list) return;
					var guessDialog = ui.create.div(".guessDialog", player);
					var container = ui.create.div(guessDialog);

					lib.setScroll(guessDialog);
					player.node.guessDialog = guessDialog;
				}
			},
			playerIntro(e) {
				e.stopPropagation();

				if (plugin.playerDialog) {
					return plugin.playerDialog.show(this);
				}

				var container = ui.create.div(".popup-container.hidden", ui.window, function (e) {
					if (e.target === container) {
						container.hide();
						game.resume2();
					}
				});
				//底图
				container.style.backgroundColor = "RGBA(0, 0, 0, 0.85)";
				var dialog = ui.create.div(".character-dialog.popped", container);
				var blackBg1 = ui.create.div(".blackBg.one", dialog);
				var blackBg2 = ui.create.div(".blackBg.two", dialog);
				var basicInfo = ui.create.div(".basicInfo", blackBg1);

				var rightPane = ui.create.div(".right", blackBg2);

				var createButton = function (name, parent) {
					if (!name) return;
					if (!lib.character[name]) return;
					var button = ui.create.button(name, "character", parent, true);
				};

				container.show = function (player) {
					var name = player.name1 || player.name;
					var name2 = player.name2;
					if (player.classList.contains("unseen") && player !== game.me) {
						name = "unknown";
					}
					if (player.classList.contains("unseen2") && player !== game.me) {
						name2 = "unknown";
					}

					//武将
					if (lib.config.extension_十周年UI_ZLLT == true) {
						var biankuang = ui.create.div(".biankuang", blackBg1);
					} else {
						var biankuang = ui.create.div(".biankuang2", blackBg1);
					}

					//biankuang.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/baby/name5_${player.group}.png`);

					if (lib.config.extension_十周年UI_ZLLT == true) {
						var leftPane = ui.create.div(".left", biankuang);
					} else {
						var leftPane = ui.create.div(".left2", biankuang);
					}
					leftPane.style.backgroundImage = player.node.avatar.style.backgroundImage;
					createButton(name, leftPane.firstChild);
					createButton(name2, leftPane.firstChild);

					//边框
					var biankuang3 = ui.create.div(".biankuang3", blackBg1);
					biankuang3.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/baby/baby_${player.group}.png`);

					//势力
					var biankuang4 = ui.create.div(".biankuang4", blackBg1);
					biankuang4.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/baby/babys_${player.group}.png`);

					//通过势力判断技能框的背景颜色
					var extensionPath = lib.assetURL + "extension/十周年UI/shoushaUI/";
					var group = player.group;
					if (group != "wei" && group != "shu" && group != "wu" && group != "qun" && group != "ye" && group != "jin" && group != "daqin" && group != "western" && group != "shen" && group != "key" && group != "Han" && group != "qin") group = "default";

					//武将名
					var nametext = "";
					if (name && name2) {
						if (name == "unknown") nametext += "未知";
						else if (lib.translate[name + "_ab"]) nametext += lib.translate[name + "_ab"];
						else nametext += get.translation(name);
						nametext += " / ";
						if (name2 == "unknown") nametext += "未知";
						else if (lib.translate[name2 + "_ab"]) nametext += lib.translate[name2 + "_ab"];
						else nametext += get.translation(name2);
					} else {
						if (name == "unknown") nametext += "未知";
						else if (lib.translate[name + "_ab"]) nametext += lib.translate[name + "_ab"];
						else nametext += get.translation(name);
					}
					var namestyle = ui.create.div(".name", nametext, dialog);
					namestyle.dataset.camp = group;
					if (name && name2) {
						namestyle.style.fontSize = "20px";
						namestyle.style.letterSpacing = "1px";
					}

					//等阶。适配最新版千幻
					var rarity = game.getRarity(name);
					if (!rarity) rarity = "junk";
					var pe = ui.create.div(".pe1", dialog);
					var url;
					if (lib.config["extension_千幻聆音_enable"]) {
						var temp;
						switch (game.qhly_getSkinLevel(name, game.qhly_getSkin(name), true, false)) {
							case "xiyou":
								temp = "rare";
								break;
							case "shishi":
								temp = "epic";
								break;
							case "chuanshuo":
								temp = "legend";
								break;
							case "putong":
								temp = "common";
								break;
							case "dongtai":
								temp = "legend";
								break;
							case "jueban":
								temp = "unique";
								break;
							case "xianding":
								temp = "restrictive";
								break;
							default:
								temp = "junk";
						}
						url = extensionPath + "character/images/pe_" + temp + ".png";
					} else url = extensionPath + "character/images/pe_" + rarity + ".png";
					pe.style.backgroundImage = 'url("' + url + '")';

					//星星
					var xingxing = ui.create.div(".xingxing", biankuang4);
					xingxing.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/baby/" + rarity + ".png");

					//吊坠配件
					var diaozhui = ui.create.div(".diaozhui", biankuang4);
					diaozhui.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/baby/basebtn.png");
					diaozhui.addEventListener("click", event => {
						game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3"); // 可选：播放关闭时的音频
						container.hide();
						game.resume2();
					});
					//玩家信息框
					var wjxin = ui.create.div(".wjxin", biankuang4);
					wjxin.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/baby/geren.png");

					// 玩家官阶
					if (!player.guanjiejibie) player.guanjiejibie = Math.floor(Math.random() * 9 + 1);
					const guanjieTranslation = {
						1: ["骁卒", ["步卒", "伍长", "什长", "队率", "屯长", "部曲"]],
						2: ["校尉", ["县尉", "都尉", "步兵校尉", "典军校尉"]],
						3: ["郎将", ["骑郎将", "车郎将", "羽林中郎将", "虎贲中郎将"]],
						4: ["偏将军", ["折冲将军", "虎威将军", "征虏将军", "荡寇将军"]],
						5: ["将军", ["监军将军", "抚军将军", "典军将军", "领军将军"]],
						6: ["上将军", ["后将军", "左将军", "右将军", "前将军"]],
						7: ["国护军", ["护军", "左护军", "右护军", "中护军"]],
						8: ["国都护", ["都护", "左都护", "右都护", "中都护"]],
						9: ["大将军", ["大将军"]],
					};

					let guanjie = ui.create.div(".guanjie", biankuang4);
					guanjie.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/baby/vip_icon_" + player.guanjiejibie + ".png");

					// 固定显示副官阶名称（取数组第一个元素）
					let guanjieName = ui.create.div(".guanjiewenzi", "<center>" + guanjieTranslation[player.guanjiejibie][0], biankuang4);
					let guanjieNameX = ui.create.div(".guanjiewenziX", "<center>" + guanjieTranslation[player.guanjiejibie][1][0], biankuang4); // 修改这里

					//三国秀及名称
					// 等级固定
					if (!player.dengji) {
						// 新增初始化逻辑
						const tempDengji = [Math.floor(Math.random() * (200 - 180 + 1)) + 180, 200, 200].randomGet();
						player.dengji = tempDengji; // 保存到player对象
					}

					// 三国秀显示固定
					var minixingxiang = ui.create.div(".minixingxiang", wjxin);

					// 玩家头像vip框显示固定
					if (!player.xvipjibie) player.xvipjibie = Math.floor(Math.random() * 8 + 1); // 新增初始化逻辑
					let xvip = ui.create.div(".minikuang", minixingxiang);
					xvip.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/baby/vip" + player.xvipjibie + ".png"); // 改用存储值

					let xvipName = ui.create.div(".viptp", xvip);
					xvipName.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/baby/level" + player.xvipjibie + ".png"); // 改用存储值

					var nameX = ui.create.div(".nameX", player.nickname, minixingxiang);

					// 等级显示固定
					//var dengjiX=ui.create.div(".dengjiX",player.dengji+'级',minixingxiang);
					var dengjiX = ui.create.div(".dengjiX", String(player.dengji), minixingxiang);

					// 头像框固定
					if (!player.xingxiangIndex) player.xingxiangIndex = Math.floor(Math.random() * 6); // 新增初始化
					minixingxiang.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/baby/xingxiang" + player.xingxiangIndex + ".png");
					// 性别
					let sex = lib.character[player.name].sex;
					var xingbie = ui.create.div(".xingbie", biankuang4);
					// 检测性别图片
					xingbie.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/baby/" + sex + ".png");

					//官阶气泡框
					var duihuak = ui.create.div(".duihuak", biankuang4);
					duihuak.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/baby/seatinfo.png`);

					//技能文本
					dialog.classList.add("single");

					rightPane.innerHTML = "<div></div>";
					lib.setScroll(rightPane.firstChild);
					var oSkills = player.getSkills(null, false, false).slice(0);
					oSkills = oSkills.filter(function (skill) {
						if (!lib.skill[skill] || skill == "jiu") return false;
						if (lib.skill[skill].nopop || lib.skill[skill].equipSkill) return false;
						return lib.translate[skill + "_info"] && lib.translate[skill + "_info"] != "";
					});
					if (player == game.me && player.hiddenSkills.length) oSkills.addArray(player.hiddenSkills);

					var allShown = player.isUnderControl() || (!game.observe && game.me && game.me.hasSkillTag("viewHandcard", null, player, true));
					var shownHs = player.getShownCards();
					if (shownHs.length) {
						ui.create.div(".xcaption", player.getCards("h").some(card => !shownHs.includes(card)) ? "明置的手牌" : "手牌区域", rightPane.firstChild);
						shownHs.forEach(function (item) {
							var card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
							card.style.zoom = "0.6";
							rightPane.firstChild.appendChild(card);
						});
						if (allShown) {
							var hs = player.getCards("h");
							hs.removeArray(shownHs);
							if (hs.length) {
								ui.create.div(".xcaption", "其他手牌", rightPane.firstChild);
								hs.forEach(function (item) {
									var card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
									card.style.zoom = "0.6";
									rightPane.firstChild.appendChild(card);
								});
							}
						}
					} else if (allShown) {
						var hs = player.getCards("h");
						if (hs.length) {
							ui.create.div(".xcaption", "手牌区域", rightPane.firstChild);
							hs.forEach(function (item) {
								var card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
								card.style.zoom = "0.6";
								rightPane.firstChild.appendChild(card);
							});
						}
					}
					//技能
					if (oSkills.length) {
						ui.create.div(".xcaption", "武将技能", rightPane.firstChild);
						oSkills.forEach(function (name) {
							if (player.forbiddenSkills[name]) {
								if (player.forbiddenSkills[name].length) ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:1">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:1">' + "（与" + get.translation(player.forbiddenSkills[name]) + "冲突）" + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
								else ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:1">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:1">' + "（双将禁用）" + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
							} else if (player.hiddenSkills.includes(name)) {
								if (lib.skill[name].preHidden && get.mode() == "guozhan") {
									var id = name + "_idx";
									id = ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:1">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:1">' + get.skillInfoTranslation(name, player) + "</span>" + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">预亮技能</div>' + "</div>", rightPane.firstChild);
									var underlinenode = id.querySelector(".underlinenode");
									if (_status.prehidden_skills.includes(name)) underlinenode.classList.remove("on");
									underlinenode.link = name;
									underlinenode.listen(ui.click.hiddenskill);
								} else ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:1">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:1">' + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
							} else if (!player.getSkills().includes(name) || player.awakenedSkills.includes(name)) ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:1">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:1">' + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
							else if (lib.skill[name].frequent || lib.skill[name].subfrequent) {
								var id = name + "_id";
								id = ui.create.div(".xskill", "<div data-color>" + lib.translate[name] + "</div>" + "<div>" + get.skillInfoTranslation(name, player) + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">自动发动</div>' + "</div>", rightPane.firstChild);
								var underlinenode = id.querySelector(".underlinenode");
								if (lib.skill[name].frequent) {
									if (lib.config.autoskilllist.includes(name)) {
										underlinenode.classList.remove("on");
									}
								}
								if (lib.skill[name].subfrequent) {
									for (var j = 0; j < lib.skill[name].subfrequent.length; j++) {
										if (lib.config.autoskilllist.includes(name + "_" + lib.skill[name].subfrequent[j])) {
											underlinenode.classList.remove("on");
										}
									}
								}
								if (lib.config.autoskilllist.includes(name)) underlinenode.classList.remove("on");
								underlinenode.link = name;
								underlinenode.listen(ui.click.autoskill2);
							} else if (lib.skill[name].clickable && player.isIn() && player.isUnderControl(true)) {
								var id = name + "_idy";
								id = ui.create.div(".xskill", "<div data-color>" + lib.translate[name] + "</div>" + "<div>" + get.skillInfoTranslation(name, player) + '<br><div class="menubutton skillbutton" style="position:relative;margin-top:5px">点击发动</div>' + "</div>", rightPane.firstChild);
								var intronode = id.querySelector(".skillbutton");
								if (!_status.gameStarted || (lib.skill[name].clickableFilter && !lib.skill[name].clickableFilter(player))) {
									intronode.classList.add("disabled");
									intronode.style.opacity = 0.5;
								} else {
									intronode.link = player;
									intronode.func = lib.skill[name].clickable;
									intronode.classList.add("pointerdiv");
									intronode.listen(ui.click.skillbutton);
								}
							} else ui.create.div(".xskill", "<div data-color>" + lib.translate[name] + "</div>" + "<div>" + get.skillInfoTranslation(name, player) + "</div>", rightPane.firstChild);
						});
					}
					//装备区域

					var eSkills = player.getVCards("e");
					if (eSkills.length) {
						ui.create.div(".xcaption", "装备区域", rightPane.firstChild);

						eSkills.forEach(function (card) {
							// 修改此行：添加 equip-skill 类名
							let str = [get.translation(card), get.translation(card.name + "_info")];
							const cards = card.cards;
							if (cards?.length && (cards?.length !== 1 || cards[0].name !== card.name)) str[0] += "（" + get.translation(card.cards) + "）";
							const special = card.cards?.find(item => item.name == card.name && lib.card[item.name]?.cardPrompt);
							if (special) str[1] = lib.card[special.name].cardPrompt(special, player);
							// 关键修改：添加 .equip-skill 类
							ui.create.div(".xskill.equip-skill", "<div data-color>" + str[0] + "</div><div>" + str[1] + "</div>", rightPane.firstChild);
						});
					}

					//判定牌

					var judges = player.getVCards("j");
					if (judges.length) {
						ui.create.div(".xcaption", "判定区域", rightPane.firstChild);
						judges.forEach(function (card) {
							const cards = card.cards;
							let str = get.translation(card);
							if (cards?.length && (cards?.length !== 1 || cards[0].name !== card.name)) {
								if (!lib.card[card]?.blankCard || player.isUnderControl(true)) str += "（" + get.translation(cards) + "）";
							}
							ui.create.div(".xskill", "<div data-color>" + str + "</div><div>" + get.translation(card.name + "_info") + "</div>", rightPane.firstChild);
						});
					}

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
