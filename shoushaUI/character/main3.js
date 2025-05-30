app.import(function (lib, game, ui, get, ai, _status, app) {
	var plugin = {
		name: "character",
		filter: function () {
			return !["chess", "tafang", "stone", "connect"].includes(get.mode());
		},
		content: function (next) {
			app.waitAllFunction(
				[
					function (next) {
						next();
					},

					function (next) {
						lib.init.css(lib.assetURL + "extension/" + app.name + "/" + plugin.name, "main2", next);
					},
				],
				next
			);
		},
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
				var container = ui.create.div(".popup-container.hidden", ui.window, function (e) {
					if (e.target === container) {
						container.hide();
						game.resume2();
					}
				});

				//container.style.backgroundColor='RGBA(0, 0, 0, 0.65)';

				//玩家名字
				var player = this;
				let playname = player === game.me ? lib.config.connect_nickname : get.translation((innerText = num = ["缘之空", "小小恐龙", "自然萌", "海边的ebao", "小云云", "无语", "点点", "猫猫虫", "小爱莉", "冰佬", "鹿鹿", "黎佬", "小曦", "墨渊", "浮牢师", "U佬", "蓝宝", "影宝", "柳下跖", "k9", "扶苏", "皇叔"].randomGet(1)));

				var dialog = ui.create.div(".character-dialog.popped", container);
				var leftPane = ui.create.div(".left", dialog);
				var rightPane = ui.create.div(".right", dialog);
				var xing = ui.create.div(".xing", dialog);
				var biankuangname = ui.create.div(".biankuangname", dialog);
				var mingcheng = ui.create.div(".mingcheng", dialog);
				var dengji = ui.create.div(".dengji", dialog);
				var skill = ui.create.div(".skillx", dialog);
				skill.addEventListener("click", function (event) {
					game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3");
					if (rightPane.firstChild) {
						while (rightPane.firstChild.firstChild) {
							rightPane.firstChild.removeChild(rightPane.firstChild.firstChild);
						}
					}
					container.show(player, true);
					if (equip) equip.classList.remove("active");
					if (skill) skill.classList.add("active");
				});

				var equip = ui.create.div(".equip", dialog);
				equip.addEventListener("click", function (event) {
					game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3");
					if (rightPane.firstChild) {
						while (rightPane.firstChild.firstChild) {
							rightPane.firstChild.removeChild(rightPane.firstChild.firstChild);
						}
					}
					if (skill) skill.classList.remove("active");
					if (equip) equip.classList.add("active");
					container.show(player);
				});
				container.show = function (player, bool, under) {
					//新加
					if (under) {
						var zbdialog = ui.create.div(".zbdialog", dialog);

						var caizhu = ui.create.div(".caizhu", dialog);
						var shanchang = get.config("recentCharacter");
						if (lib.config.extension_十周年UI_ZLLT == true) {
							var leftPane = ui.create.div(".left", dialog);
						} else {
							var leftPane = ui.create.div(".left2", dialog);
						}

						leftPane.style.backgroundImage = player.node.avatar.style.backgroundImage;

						(zbdialog.onclick = function () {
							var popuperContainer = ui.create.div(
								".popup-container",
								{
									background: "rgb(0,0,0,0)",
								},
								ui.window
							);
							game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/label.mp3");
							var zbbigdialog = ui.create.div(".zbbigdialog", popuperContainer);

							var guanbi = ui.create.div(".guanbi", popuperContainer, get.translation((innerText = "   ")));
							// 为haoyou3元素添加点击事件监听器，点击时关闭页面
							guanbi.addEventListener("click", function (event) {
								game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3"); // 可选：播放关闭时的音频
								popuperContainer.delete(200); // 关闭页面或删除对话框容器
								event.stopPropagation(); // 阻止事件冒泡到父元素
							});
						}),
							(caizhu.onclick = function () {
								var popuperContainer = ui.create.div(
									".popup-container",
									{
										background: "rgb(0,0,0,0)",
									},
									ui.window
								);
								game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/label.mp3");

								/* setTimeout(function(){
							     game.playAudio('../extension/十周年UI/shoushaUI/character/SS_ZNQ_wenyang.mp3');
							 },2000)*/

								var bigdialog = ui.create.div(".bigdialog", popuperContainer);

								var useless = ui.create.div(".useless", bigdialog);
								var nameshutiao = ui.create.div(".nameshutiao", bigdialog);
								nameshutiao.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/xinsha/" + rarity + ".png");

								var useless2 = ui.create.div(".useless2", bigdialog);
								useless2.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/xinsha/InfoBg2.png");
								//皮肤框
								var pifuk = ui.create.div(".pifuk", bigdialog);
								pifuk.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/xinsha/pifuk.png");

								//皮肤名
								var pos1 = player.node.avatar.style.backgroundImage.lastIndexOf("/");
								var pos2 = player.node.avatar.style.backgroundImage.lastIndexOf("\\");
								var pos = Math.max(pos1, pos2);
								if (pos < 0) {
									var skinname = player.node.avatar.style.backgroundImage;
								} else {
									var tempPath = player.node.avatar.style.backgroundImage.substring(pos + 1);
									var skinname = tempPath.substring(0, tempPath.lastIndexOf("."));
								}
								if (skinname == player["name"] || skinname == player["name"] + "_shadow" || skinname == player["name"] + "2" || skinname == player["name"] + "3" || skinname == "default_silhouette_male" || skinname == "default_silhouette_female" || skinname == "default_silhouette_double") var pfzwm = "经典形象";
								else var pfzwm = skinname;
								var pifuming = ui.create.div(".pifuming", bigdialog, get.translation((innerText = pfzwm)));

								//资料页玩家信息

								var wujiangming = ui.create.div(".wujiangming", bigdialog, get.translation(player["name"]));

								// 修改VIP固定
								var wanjiaming = ui.create.div(".wanjiaming", bigdialog, playname);

								var vipimg = document.createElement("div");
								vipimg.id = "vip-img";
								vipimg.style.cssText = `
    width:60px;
    top:2px;
    height:20px;
    left:3px;
    position:relative;
    background-size: 100% 100%;
`;

								// 使用玩家对象缓存VIP图片路径
								var viptuji = ["vip0", "vip1", "vip2", "vip3", "vip4", "vip5", "vip6", "vip7"];
								var vipPath = player._vipCache || (player._vipCache = viptuji.randomGet()); // 关键修改点

								vipimg.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/xinsha/" + vipPath + ".png");
								wanjiaming.appendChild(vipimg);

								/*修改*/
								// 公会名称部分
								var gonghui = ui.create.div(
									".gonghui",
									bigdialog,
									get.translation(
										"公会：" +
											(
												player._guildInfo ||
												(player._guildInfo = {
													name: ["武将美化群", "活动武将群", "😋精致小杀", "萌新花园", "😋精致小酒", "小爱莉の动物园", "Ciallo～(∠・ω< )⌒★", "美图交流群", "无名杀主题样式", "💎备用💎", "无名杀琉璃版", "圣杯战争"].randomGet(1),
													icon: ["c1", "c2", "c3"].randomGet(),
												})
											).name
									)
								);

								// 公会图标部分
								var gonghuiimg = document.createElement("div");
								gonghuiimg.id = "gonghui-img";
								gonghuiimg.style.cssText = `
    width:40px;
    top:2px;
    height:15px;
    left:20px;
    position:relative;
    background-size: 100% 100%;
`;
								gonghuiimg.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/xinsha/" + player._guildInfo.icon + ".png");
								gonghui.appendChild(gonghuiimg);

								// 信息固定信誉魅力守护武将皮肤将灵
								if (!player.profileData) {
									player.profileData = {
										xinyu: Math.floor(Math.random() * (999 - 99 + 1)) + 99,
										meili: Math.floor(Math.random() * (999 - 99 + 1)) + 99,
										shouhu: Math.floor(Math.random() * (999 - 999 + 1)) + 999, // 999-1998
										wujiang1: Math.floor(Math.random() * (999 - 1 + 1)) + 1000,
										pifu1: Math.floor(Math.random() * (999 - 1 + 1)) + 3000,
										jiangling: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
									};
								}
								// 创建带缓存值的组件
								var xinyu = ui.create.div(".xinyu", bigdialog, get.translation((innerText = player.profileData.xinyu + "<br>" + "信誉")));
								var meili = ui.create.div(".meili", bigdialog, get.translation((innerText = player.profileData.meili + "<br>" + "魅力")));
								var shouhu = ui.create.div(".shouhu", bigdialog, get.translation((innerText = player.profileData.shouhu + "<br>" + "守护")));
								var wujiang1 = ui.create.div(".wujiang1", bigdialog, get.translation((innerText = player.profileData.wujiang1 + "<br>" + "武将")));
								var pifu1 = ui.create.div(".pifu1", bigdialog, get.translation((innerText = player.profileData.pifu1 + "<br>" + "皮肤")));
								var jiangling = ui.create.div(".jiangling", bigdialog, get.translation((innerText = player.profileData.jiangling + "<br>" + "将灵")));

								var changyongwujiang = ui.create.div(".changyongwujiang", bigdialog, get.translation((innerText = "武将展示")));

								/* 称号 */
								var minichenghao = ui.create.div(".minichenghao", bigdialog);
								var chenghaotu = ["ch0", "ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7", "ch8", "ch9", "ch10", "ch11", "ch12", "ch13", "ch14", "ch15", "ch16", "ch17", "ch18", "ch19", "ch20", "ch21", "ch22", "ch23", "ch24", "ch25", "ch26"];

								// 初始化玩家称号数据
								if (!player.chenghaoData) {
									player.chenghaoData = {
										img: chenghaotu.randomGet(), // 随机选择并永久存储
									};
								}

								// 使用模板字符串设置背景图路径
								minichenghao.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/xinsha/${player.chenghaoData.img}.png`);

								/* 拜师 */
								var baishi = ui.create.div(".baishi", bigdialog);
								var baishitu = ["b1", "b2", "b3"];

								// 初始化拜师数据（每个玩家独立）
								if (!player.baishiData) {
									player.baishiData = {
										img: baishitu.randomGet(), // 随机选择并存储
									};
								}
								baishi.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/xinsha/${player.baishiData.img}.png`);

								/* 历史最高 */
								var wngs = ui.create.div(".wngs", bigdialog);
								var wngstu = ["s1", "s2", "s3", "s4", "s5", "s6"];

								// 初始化历史数据
								if (!player.historyData) {
									player.historyData = {
										img: wngstu.randomGet(),
									};
								}
								wngs.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/xinsha/${player.historyData.img}.png`);

								/* 将灯 */
								var deng = ui.create.div(".deng", bigdialog);
								var dengto = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"];

								// 初始化将灯数据
								if (!player.lampData) {
									player.lampData = {
										img: dengto.randomGet(),
									};
								}
								deng.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/xinsha/${player.lampData.img}.png`);

								/*关闭*/
								var haoyou3 = ui.create.div(".haoyou3", bigdialog, get.translation((innerText = "   ")));
								// 为haoyou3元素添加点击事件监听器，点击时关闭页面
								haoyou3.addEventListener("click", function (event) {
									game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3"); // 可选：播放关闭时的音频
									popuperContainer.delete(200); // 关闭页面或删除对话框容器
									event.stopPropagation(); // 阻止事件冒泡到父元素
								});

								var shanchang4 = ui.create.div(".shanchang4", bigdialog);
								shanchang4.style.backgroundImage = player.node.avatar.style.backgroundImage;

								//迷你头像
								var minixingxiang = ui.create.div(".minixingxiang", bigdialog);
								var xingxiangtu = ["xingxiang0", "xingxiang1", "xingxiang2", "xingxiang3", "xingxiang4", "xingxiang5"];

								// 初始化玩家迷你形象数据
								if (!player.miniXingxiangData) {
									player.miniXingxiangData = {
										img: xingxiangtu.randomGet(), // 随机选择并永久存储
									};
								}

								// 使用模板字符串设置背景图路径
								minixingxiang.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/xinsha/${player.miniXingxiangData.img}.png`);
							});

						//通过势力判断技能框的背景颜色
						var extensionPath = lib.assetURL + "extension/十周年UI/shoushaUI/";
						var group = player.group;
						if (group != "wei" && group != "shu" && group != "wu" && group != "qun" && group != "ye" && group != "jin" && group != "daqin" && group != "western" && group != "shen" && group != "key" && group != "Han" && group != "qin") group = "default";
						var url = extensionPath + "character/images/xinsha/yemian.png";
						dialog.style.backgroundImage = 'url("' + url + '")';
						var skin1 = ui.create.div(".skin1", dialog);
						var skin2 = ui.create.div(".skin2", dialog);

						//判断是否隐藏，以及获取主副将的姓名
						var name = player.name1 || player.name;
						var name2 = player.name2;
						if (player.classList.contains("unseen") && player !== game.me) {
							name = "unknown";
						}
						if (player.classList.contains("unseen2") && player !== game.me) {
							name2 = "unknown";
						}
						//点点大佬修改版(读取立绘，无立绘读取原画)
						//主将立绘
						var playerSkin;
						if (name != "unknown") {
							playerSkin = player.style.backgroundImage;
							if (!playerSkin) playerSkin = player.childNodes[0].style.backgroundImage;

							// 提取原始图片路径
							let originalPath = "";
							if (playerSkin.indexOf('url("') == 0) {
								originalPath = playerSkin.slice(5, playerSkin.indexOf('")'));
							} else if (playerSkin.indexOf("url('") == 0) {
								originalPath = playerSkin.slice(5, playerSkin.indexOf("')"));
							}

							// 创建新图片测试lihui路径
							let testImg = new Image();
							testImg.onerror = function () {
								// lihui路径不存在，使用原始路径
								skin1.style.backgroundImage = playerSkin;
							};
							testImg.onload = function () {
								// lihui路径存在，使用lihui路径
								skin1.style.backgroundImage = 'url("' + this.src + '")';
							};
							// 尝试lihui路径
							testImg.src = originalPath.replace(/image\/character/, "image/lihui");
						} else {
							var url = extensionPath + "character/images/unknown.png";
							skin1.style.backgroundImage = 'url("' + url + '")';
						}

						//副将立绘
						if (name2) {
							var playerSkin2;
							if (name2 != "unknown") {
								playerSkin2 = player.childNodes[1].style.backgroundImage;

								// 提取原始图片路径
								let originalPath = "";
								if (playerSkin2.indexOf('url("') == 0) {
									originalPath = playerSkin2.slice(5, playerSkin2.indexOf('")'));
								} else if (playerSkin2.indexOf("url('") == 0) {
									originalPath = playerSkin2.slice(5, playerSkin2.indexOf("')"));
								}

								// 创建新图片测试lihui路径
								let testImg = new Image();
								testImg.onerror = function () {
									// lihui路径不存在，使用原始路径
									skin2.style.backgroundImage = playerSkin2;
								};
								testImg.onload = function () {
									// lihui路径存在，使用lihui路径
									skin2.style.backgroundImage = 'url("' + this.src + '")';
								};
								// 尝试lihui路径
								testImg.src = originalPath.replace(/image\/character/, "image/lihui");
							} else {
								var url = extensionPath + "character/images/unknown.png";
								skin2.style.backgroundImage = 'url("' + url + '")';
							}
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
							url = extensionPath + "character/images/xinsha/pe_" + temp + ".png";
						} else url = extensionPath + "character/images/xinsha/pe_" + rarity + ".png";
						pe.style.backgroundImage = 'url("' + url + '")';
						let value = "";
						let value2, value3;
						if (lib.config["extension_千幻聆音_enable"]) {
							value2 = game.qhly_getSkinInfo(name, game.qhly_getSkin(name), null).translation || "经典形象";
						} else value2 = "经典形象";
						value += value2 + "*" + get.translation(name);
						if (name2) {
							value += "<br>";
							if (lib.config["extension_千幻聆音_enable"]) {
								value3 = game.qhly_getSkinInfo(name2, game.qhly_getSkin(name2), null).translation || "经典形象";
							} else value3 = "经典形象";
							value += value3 + "*" + get.translation(name2);
						}
						var pn = ui.create.div(".pn1");
						/* var pn= ui.create.div('.pn1',value);*/
						pe.appendChild(pn);
						//吊坠配件
						var diaozhui = ui.create.div(".diaozhui", dialog);
						diaozhui.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/xinsha/guanbi.png");
						diaozhui.addEventListener("click", event => {
							game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3"); // 可选：播放关闭时的音频
							container.hide();
							game.resume2();
						});

						/*新增龙框*/
						var longkuang = ui.create.div(".longkuang", dialog);

						longkuang.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/xinsha/" + group + ".png");

						/*level等级第一页*/
						var level = ui.create.div(".level", dialog);
						var leveltu = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

						// 初始化等级标识数据（每个玩家独立存储）
						if (!player.levelData) {
							player.levelData = {
								img: leveltu.randomGet(), // 随机选择等级标识
							};
						}

						// 使用模板字符串设置背景图路径
						level.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/xinsha/${player.levelData.img}.png`);

						//新增技能框
						var wjkuang = ui.create.div(".wjkuang", dialog);

						wjkuang.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/xinsha/jineng.png");
						//武将技能展示
						var jineng = ui.create.div(".jineng", dialog, get.translation((innerText = "武将技能")));
						//修改第一页武将姓名
						var wjname = ui.create.div(".wjname", dialog, get.translation(player["name"]));
						//新加

						//复用第二页面得随机名字
						//复用第二页面得随机名字
						var wanjiaming2 = ui.create.div(".wanjiaming2", dialog, playname);

						leftPane.innerHTML = "<div></div>";
						rightPane.innerHTML = "<div></div>";
						lib.setScroll(rightPane.firstChild);
					}

					var oSkills = player.getSkills(null, false, false).slice(0);
					oSkills = oSkills.filter(function (skill) {
						if (!lib.skill[skill] || skill == "jiu") return false;
						if (lib.skill[skill].nopop || lib.skill[skill].equipSkill) return false;
						return lib.translate[skill + "_info"] && lib.translate[skill + "_info"] != "";
					});
					if (player == game.me && player.hiddenSkills.length) oSkills.addArray(player.hiddenSkills);

					var allShown = player.isUnderControl() || (!game.observe && game.me && game.me.hasSkillTag("viewHandcard", null, player, true));
					var shownHs = player.getShownCards();
					if (bool) {
						if (skill) skill.classList.add("active");
						//武将技能
						if (oSkills.length) {
							//ui.create.div(".xcaption", rightPane.firstChild);
							oSkills.forEach(function (name) {
								if (player.forbiddenSkills[name]) {
									if (player.forbiddenSkills[name].length) ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + "（与" + get.translation(player.forbiddenSkills[name]) + "冲突）" + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
									else ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + "（双将禁用）" + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
								} else if (player.hiddenSkills.includes(name)) {
									if (lib.skill[name].preHidden && get.mode() == "guozhan") {
										var id = name + "_idx";
										id = ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + "</span>" + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">预亮技能</div>' + "</div>", rightPane.firstChild);
										var underlinenode = id.querySelector(".underlinenode");
										if (_status.prehidden_skills.includes(name)) underlinenode.classList.remove("on");
										underlinenode.link = name;
										underlinenode.listen(ui.click.hiddenskill);
									} else ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
								} else if (!player.getSkills().includes(name) || player.awakenedSkills.includes(name)) ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + lib.translate[name] + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
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
					} else {
						//装备
						var eSkills = player.getVCards("e");
						if (eSkills.length) {
							ui.create.div(".xcaption", "装备区域", rightPane.firstChild);
							eSkills.forEach(function (card) {
								var cardx = game.createCard(get.name(card, false), get.suit(card, false), get.number(card, false), get.nature(card, false));
								cardx.style.zoom = "0.7";
								rightPane.firstChild.appendChild(cardx);
							});
							eSkills.forEach(function (card) {
								let str = [get.translation(card), get.translation(card.name + "_info")];
								const cards = card.cards;
								if (cards?.length && (cards?.length !== 1 || cards[0].name !== card.name)) str[0] += "（" + get.translation(card.cards) + "）";
								const special = card.cards?.find(item => item.name == card.name && lib.card[item.name]?.cardPrompt);
								if (special) str[1] = lib.card[special.name].cardPrompt(special);
								ui.create.div(".xskillx", "<div data-color>" + str[0] + "</div><div>" + str[1] + "</div>", rightPane.firstChild);
							});
						}
						if (shownHs.length) {
							ui.create.div(".xcaption", player.hasCard(card => !shownHs.includes(card), "h") ? "明置的手牌" : "手牌区域", rightPane.firstChild);
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

						var judges = player.getVCards("j");
						if (judges.length) {
							ui.create.div(".xcaption", "判定区域", rightPane.firstChild);
							judges.forEach(function (card) {
								var cardx = game.createCard(get.name(card, false), get.suit(card, false), get.number(card, false), get.nature(card, false));
								cardx.style.zoom = "0.8";
								rightPane.firstChild.appendChild(cardx);
							});
						}
						if (!shownHs.length && !allShown && !judges.length && !eSkills.length) ui.create.div(".noxcaption", rightPane.firstChild);
					}
					container.classList.remove("hidden");
					game.pause2();
				};
				plugin.characterDialog = container;
				container.show(player, true, true);
			},
		},
	};
	return plugin;
});
