app.import(function (lib, game, ui, get, ai, _status, app) {
	// 常量定义
	const MODES = {
		IDENTITY: "identity",
		DOUDIZHU: "doudizhu",
		GUOZHAN: "guozhan",
		VERSUS: "versus",
		SINGLE: "single",
		MARTIAL: "martial",
	};
	const IDENTITIES = {
		ZHU: "zhu",
		ZHONG: "zhong",
		FAN: "fan",
		NEI: "nei",
	};
	const GROUPS = {
		UNKNOWN: "unknown",
		UNDEFINED: "undefined",
		WEI: "wei",
		SHU: "shu",
		WU: "wu",
		QUN: "qun",
		JIN: "jin",
		YE: "ye",
	};
	const BACKGROUNDS = ["人间安乐", "兵临城下", "兵荒马乱", "三国开黑节", "华灯初上", "天书乱斗", "朝堂之上", "校园行", "桃园风格", "汉室当兴", "游卡桌游", "十周年"];
	// 工具函数
	const utils = {
		playAudio(path) {
			game.playAudio(path);
		},
		createImage(src, style) {
			const img = ui.create.node("img");
			img.src = lib.assetURL + src;
			img.style.cssText = style;
			return img;
		},
		createDiv(className, container, clickHandler) {
			const div = ui.create.div(className, container);
			if (clickHandler) {
				div.addEventListener("click", clickHandler);
			}
			return div;
		},
		getButtonStyle(width, height, top, left, zIndex = 1) {
			return `display: block;--w: ${width}px;--h: calc(var(--w) * ${height});width: var(--w);height: var(--h);position: absolute;top: ${top};left: ${left};background-color: transparent;z-index:${zIndex}`;
		},
	};
	// 身份提示映射
	const identityTips = {
		[IDENTITIES.ZHU]: ".Tipzhugong",
		[IDENTITIES.ZHONG]: ".Tipzhongchen",
		[IDENTITIES.FAN]: ".Tipfanzei",
		[IDENTITIES.NEI]: ".Tipneijian",
	};
	// 斗地主身份提示映射
	const doudizhuTips = {
		[IDENTITIES.ZHU]: ".Tipdizhu",
		[IDENTITIES.FAN]: ".Tipnongmin",
	};
	// 国战势力提示映射
	const groupTips = {
		[GROUPS.UNKNOWN]: ".Tipundefined",
		[GROUPS.UNDEFINED]: ".Tipundefined",
		[GROUPS.WEI]: ".Tipweiguo",
		[GROUPS.SHU]: ".Tipshuguo",
		[GROUPS.WU]: ".Tipwuguo",
		[GROUPS.QUN]: ".Tipqunxiong",
		[GROUPS.JIN]: ".Tipjinguo",
		[GROUPS.YE]: ".Tipyexinjia",
	};
	// 创建问号按钮
	function createQuestionButton() {
		const isTouch = lib.config.phonelayout;
		const bottomOffset = isTouch ? "calc(100% - 55px)" : "calc(100% - 105px)"; // 非触屏布局往下移动20px
		const questionBtn = utils.createImage("extension/十周年UI/shoushaUI/lbtn/images/CD/wenhao.png", `display: block;width: 40px;height: 29px;position: absolute;bottom: ${bottomOffset};left: calc(100% - 159.5px);background-color: transparent;z-index:3`);
		questionBtn.onclick = function () {
			const popupContainer = ui.create.div(".popup-container", ui.window);
			utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/label.mp3");
			// 根据游戏模式显示不同提示
			if (lib.config.mode === MODES.IDENTITY) {
				const tipClass = identityTips[game.me.identity];
				if (tipClass) {
					ui.create.div(tipClass, popupContainer);
				}
			} else if (lib.config.mode === MODES.DOUDIZHU) {
				const tipClass = doudizhuTips[game.me.identity];
				if (tipClass) {
					ui.create.div(tipClass, popupContainer);
				}
			} else if (lib.config.mode === MODES.VERSUS) {
				ui.create.div(".Tiphu", popupContainer);
			} else if (lib.config.mode === MODES.GUOZHAN) {
				const tipClass = groupTips[game.me.group] || ".Tipweizhi";
				ui.create.div(tipClass, popupContainer);
			}
			popupContainer.addEventListener("click", event => {
				utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3");
				popupContainer.delete(200);
			});
		};
		document.body.appendChild(questionBtn);
	}
	// 创建整理手牌按钮
	function createSortButton() {
		const isRightLayout = lib.config["extension_十周年UI_rightLayout"] === "on";
		const sortImg = "code_zhengli.png";
		const sortButton = ui.create.node("img");
		sortButton.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/uibutton/" + sortImg;
		let styleText = "display:block;position:absolute;background-color:transparent;";
		styleText += "width:55px;height:50px;bottom: 18%;left: 40px;z-index:4;right: auto;";
		styleText += isRightLayout ? "right: calc(100% - 380px);z-index:3;" : "right: calc(100% - 1260px);z-index:3;";
		sortButton.style.cssText = styleText;
		sortButton.onclick = function () {
			if (!game.me || game.me.hasSkillTag("noSortCard")) return;
			const cards = game.me.getCards("hs");
			const sortFunction = function (b, a) {
				if (a.name !== b.name) return lib.sort.card(a.name, b.name);
				if (a.suit !== b.suit) return lib.suit.indexOf(a) - lib.suit.indexOf(b);
				return a.number - b.number;
			};
			if (cards.length > 1) {
				cards.sort(sortFunction);
				cards.forEach(function (card, index) {
					game.me.node.handcards1.insertBefore(cards[index], game.me.node.handcards1.firstChild);
				});
				dui.queueNextFrameTick(dui.layoutHand, dui);
			}
		};
		document.body.appendChild(sortButton);
	}
	// 创建右上角菜单
	function createTopRightMenu() {
		const isTouch = lib.config.phonelayout;
		const topOffset = isTouch ? "10px" : "60px"; // 非触屏布局往下移动50px
		// 菜单按钮
		const menuBtn = utils.createImage("extension/十周年UI/shoushaUI/lbtn/images/CD/button3.png", `display: block;--w: 56px;--h: calc(var(--w) * 74/71);width: var(--w);height: var(--h);position: absolute;top: ${topOffset};right: 55px;background-color: transparent;z-index:5`);
		document.body.appendChild(menuBtn);
		let menuPopup = null;
		function openMenu() {
			if (menuPopup) return;
			utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/click.mp3");
			menuPopup = ui.create.div(".popup-container", { background: "rgb(0,0,0,0)" }, ui.window);
			menuPopup.addEventListener("click", event => {
				utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/back.mp3");
				event.stopPropagation();
				closeMenu();
			});
			// 创建菜单项
			const home = ui.create.div(".HOME", menuPopup);
			const settingsBtn = ui.create.div(".SZ", menuPopup);
			settingsBtn.addEventListener("click", event => {
				utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				if (!ui.click.configMenu) return;
				game.closePopped();
				game.pause2();
				ui.click.configMenu();
				ui.system1.classList.remove("shown");
				ui.system2.classList.remove("shown");
				closeMenu();
			});
			const leaveBtn = ui.create.div(".LK", menuPopup);
			leaveBtn.addEventListener("click", event => {
				utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				window.location.reload();
			});
			const bgBtn = ui.create.div(".BJ", menuPopup);
			bgBtn.addEventListener("click", event => {
				utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				openBackgroundSelector();
			});
			const surrenderBtn = ui.create.div(".TX", menuPopup);
			surrenderBtn.addEventListener("click", event => {
				utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				game.over();
			});
			const autoBtn = ui.create.div(".TG", menuPopup);
			autoBtn.addEventListener("click", event => {
				utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				ui.click.auto();
			});
		}
		function openBackgroundSelector() {
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
			loadBackgroundImages(bgbg);
		}
		function loadBackgroundImages(container) {
			let backgroundItems = lib.configMenu.appearence.config.image_background.item;
			let hiddenBgs = lib.config.hiddenBackgroundPack || [];
			
			for (let fileName in backgroundItems) {
				if (fileName === "default" || hiddenBgs.includes(fileName)) continue;
				
				let img = ui.create.div(".backgrounds", container);
				img.dataset.name = fileName;
				
				if (fileName.startsWith("custom_")) {
					game.getDB("image", fileName, function(fileToLoad) {
						if (fileToLoad) {
							var fileReader = new FileReader();
							fileReader.onload = function(fileLoadedEvent) {
								var data = fileLoadedEvent.target.result;
								img.style.backgroundImage = "url(" + data + ")";
								img.style.backgroundSize = "cover";
							};
							fileReader.readAsDataURL(fileToLoad, "UTF-8");
						}
					});
				} else {
					img.setBackgroundImage("image/background/" + fileName + ".jpg");
				}
				
				if (fileName == lib.config.image_background) ui.create.div(".bgxuanzhong", img);
				
				img.addEventListener("click", function () {
					var editItem = container.querySelector(".backgrounds:last-child");
					var isEditMode = editItem && editItem.classList.contains("active");
					if (isEditMode) {
						game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
						var textDiv = this.querySelector(".buttontext");
						if (textDiv && textDiv.innerHTML == "隐藏") {
							container.parentNode.noclose = true;
							this.remove();
							if (!lib.config.prompt_hidebg) {
								alert("隐藏的背景可通过选项-其它-重置隐藏内容恢复");
								game.saveConfig("prompt_hidebg", true);
							}
							lib.config.hiddenBackgroundPack.add(fileName);
							game.saveConfig("hiddenBackgroundPack", lib.config.hiddenBackgroundPack);
							delete lib.configMenu.appearence.config.image_background.item[fileName];
							if (lib.config.image_background == fileName) {
								game.saveConfig("image_background", "default");
								lib.init.background();
								game.updateBackground();
							}
							while (container.firstChild) {
								container.removeChild(container.firstChild);
							}
							loadBackgroundImages(container);
							return;
						} else if (textDiv && textDiv.innerHTML == "删除") {
							container.parentNode.noclose = true;
							if (confirm("是否删除此背景？（此操作不可撤销）")) {
								this.remove();
								lib.config.customBackgroundPack.remove(fileName);
								game.saveConfig("customBackgroundPack", lib.config.customBackgroundPack);
								if (fileName.startsWith("cdv_")) {
									game.removeFile("image/background/" + fileName + ".jpg");
								} else {
									game.deleteDB("image", fileName);
								}
								delete lib.configMenu.appearence.config.image_background.item[fileName];
								if (lib.config.image_background == fileName) {
									game.saveConfig("image_background", "default");
									lib.init.background();
									game.updateBackground();
								}
								while (container.firstChild) {
									container.removeChild(container.firstChild);
								}
								loadBackgroundImages(container);
							}
							return;
						}
					}
					let allSelectedElements = document.querySelectorAll(".bgxuanzhong");
					allSelectedElements.forEach(function (selectedElement) {
						selectedElement.parentNode.removeChild(selectedElement);
					});
					ui.create.div(".bgxuanzhong", img);
					game.saveConfig("image_background", fileName);
					lib.init.background();
					game.updateBackground();
				});
				
				let backgroundName = backgroundItems[fileName];
				ui.create.div(".buttontext", backgroundName, img);
			}
			(function (container) {
					var addItem = ui.create.div(".backgrounds", container);
					ui.create.div(".buttontext", "添加背景", addItem);
					var input = document.createElement("input");
					input.type = "file";
					input.accept = "image/*";
					input.multiple = true;
					input.style.display = "none";
					document.body.appendChild(input);
					addItem.addEventListener("click", function () {
						game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
						input.click();
					});
					input.onchange = function (e) {
						var files = e.target.files;
						if (!files || files.length === 0) return;
						var fileList = Array.from(files);
						var totalFiles = fileList.length;
						var processedFiles = 0;
						fileList.forEach(function(file2, index) {
							if (file2) {
								var name2 = file2.name;
								if (name2.includes(".")) {
									name2 = name2.slice(0, name2.indexOf("."));
								}
								var link = (game.writeFile ? "cdv_" : "custom_") + name2;
								if (lib.configMenu.appearence.config.image_background.item[link]) {
									for (var i = 1; i < 1e3; i++) {
										if (!lib.configMenu.appearence.config.image_background.item[link + "_" + i]) {
											link = link + "_" + i;
											break;
										}
									}
								}
								lib.configMenu.appearence.config.image_background.item[link] = name2;
								var callback = function() {
									lib.config.customBackgroundPack.add(link);
									game.saveConfig("customBackgroundPack", lib.config.customBackgroundPack);
									processedFiles++;
									if (processedFiles === totalFiles && editItem.classList.contains("active")) {
										editbg.call(editItem);
									}
									while (container.firstChild) {
										container.removeChild(container.firstChild);
									}
									loadBackgroundImages(container);
								};
								if (game.writeFile) {
									game.writeFile(file2, "image/background", link + ".jpg", callback);
								} else {
									game.putDB("image", link, file2, callback);
								}
							}
						});
					};
					var editItem = ui.create.div(".backgrounds", container);
					ui.create.div(".buttontext", "编辑背景", editItem);
					var editbg = function() {
						this.classList.toggle("active");
						var items = Array.from(container.querySelectorAll(".backgrounds"));
						items.slice(0, Math.max(0, items.length - 2)).forEach(function (item) {
							var fname = item.dataset.name;
							if (!fname) return;
							var textDiv = item.querySelector(".buttontext");
							if (!textDiv) return;
							var str;
							if (this.classList.contains("active")) {
								if (fname.startsWith("custom_") || fname.startsWith("cdv_")) {
									str = "删除";
								} else {
									str = "隐藏";
								}
							} else {
								str = lib.configMenu.appearence.config.image_background.item[fname] || fname;
							}
							textDiv.innerHTML = str;
						}.bind(this));
					};
					editItem.addEventListener("click", function () {
						game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
						editbg.call(this);
					});
				})(container);
		}
		function closeMenu() {
			if (menuPopup) {
				menuPopup.delete(200);
				menuPopup = null;
			}
		}
		menuBtn.onclick = function () {
			if (menuPopup) {
				closeMenu();
			} else {
				openMenu();
			}
		};
	}
	// 初始化
	lib.arenaReady.push(function () {
		// 更新轮次
		const originUpdateRoundNumber = game.updateRoundNumber;
		game.updateRoundNumber = function () {
			originUpdateRoundNumber.apply(this, arguments);
			if (ui.cardRoundTime) {
				ui.cardRoundTime.updateRoundCard();
			}
		};
		// 创建UI元素
		const supportedModes = [MODES.IDENTITY, MODES.DOUDIZHU, MODES.GUOZHAN, MODES.VERSUS, MODES.SINGLE, MODES.MARTIAL];
		if (supportedModes.includes(lib.config.mode)) {
			createQuestionButton();
		}
		createSortButton();
		createTopRightMenu();
	});
	// 插件定义
	const plugin = {
		name: "lbtn",
		filter() {
			return !["chess", "tafang"].includes(get.mode());
		},
		content(next) {
			lib.skill._uicardupdate = {
				trigger: { player: "phaseJieshuBegin" },
				forced: true,
				unique: true,
				popup: false,
				silent: true,
				noLose: true,
				noGain: true,
				noDeprive: true,
				priority: -Infinity,
				filter(event, player) {
					return player === game.me;
				},
				content() {
					if (ui.updateSkillControl) {
						ui.updateSkillControl(game.me, true);
					}
				},
			};
		},
		precontent() {
			// 扩展视频内容
			Object.assign(game.videoContent, {
				createCardRoundTime() {
					ui.cardRoundTime = plugin.create.cardRoundTime();
				},
				createhandcardNumber() {
					ui.handcardNumber = plugin.create.handcardNumber();
				},
				updateCardRoundTime(opts) {
					if (!ui.cardRoundTime) return;
					const roundNumber = Math.max(1, game.roundNumber || 1);
					ui.cardRoundTime.node.roundNumber.innerHTML = `<span>第${roundNumber}轮</span>`;
					ui.cardRoundTime.setNumberAnimation(opts.cardNumber);
				},
				updateCardnumber(opts) {
					if (!ui.handcardNumber) return;
				},
			});
			// 重写UI创建函数
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
			// 重写配置菜单
			app.reWriteFunction(lib.configMenu.appearence.config, {
				update: [
					null,
					function (res, config, map) {
						const hiddenItems = ["control_style", "custom_button", "custom_button_system_top", "custom_button_system_bottom", "custom_button_control_top", "custom_button_control_bottom", "radius_size"];
						hiddenItems.forEach(item => map[item].hide());
					},
				],
			});
			// 重写确认对话框
			ui.create.confirm = function (str, func) {
				let confirm = ui.confirm;
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
			// 拦截出牌阶段的取消：有选中时仅恢复选择而不结束回合
			(function () {
				var originalCancel = ui.click.cancel;
				ui.click.cancel = function (node) {
					var event = _status.event;
					if (event && _status.event.type == "phase" && ui.confirm && !event.skill && (ui.selected.cards.length != 0 || ui.selected.targets.length != 0)) {
						ui.confirm.classList.add("removing");
						event.restore();
						var cards = event.player.getCards("hej");
						for (var i = 0; i < cards.length; i++) {
							cards[i].recheck("useSkill");
						}
						game.uncheck();
						game.check();
						return;
					}
					return originalCancel.call(this, node);
				};
			})();
		},
		create: {
			control() {},
			confirm() {
				const confirm = ui.create.control("<span>确定</span>", "cancel");
				confirm.classList.add("lbtn-confirm");
				confirm.node = {
					ok: confirm.firstChild,
					cancel: confirm.lastChild,
				};
				if (_status.event.endButton) {
					_status.event.endButton.close();
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
				// 绑定事件
				for (const key in confirm.node) {
					const node = confirm.node[key];
					node.classList.add("disabled");
					node.removeEventListener(lib.config.touchscreen ? "touchend" : "click", ui.click.control);
					node.addEventListener(lib.config.touchscreen ? "touchend" : "click", function (e) {
						e.stopPropagation();
						if (this.classList.contains("disabled")) {
							if (this.link === "cancel" && this.dataset.type === "endButton" && _status.event.endButton) {
								_status.event.endButton.custom();
								ui.confirm.close();
							}
							return;
						}
						if (this.parentNode.custom) {
							this.parentNode.custom(this.link, this);
						}
					});
				}
				// 处理技能按钮
				if (ui.skills2 && ui.skills2.skills.length) {
					const skills = ui.skills2.skills;
					confirm.skills2 = [];
					for (let i = 0; i < skills.length; i++) {
						const item = document.createElement("div");
						item.link = skills[i];
						item.innerHTML = get.translation(skills[i]);
						item.addEventListener(lib.config.touchscreen ? "touchend" : "click", function (e) {
							e.stopPropagation();
							ui.click.skill(this.link);
						});
						item.dataset.type = "skill2";
						if (ui.updateSkillControl) {
							ui.updateSkillControl(game.me, true);
						}
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
					if (ui.updateSkillControl) {
						ui.updateSkillControl(game.me, true);
					}
				};
				return confirm;
			},
			handcardNumber() {
				const isRightLayout = lib.config["extension_十周年UI_rightLayout"] === "on";
				const isXPJ = lib.config.extension_十周年UI_XPJ === "on";
				const isTouch = lib.config.phonelayout;
				// 创建设置按钮
				ui.create.div(".settingButton", ui.arena, plugin.click.setting);
				// 仅触屏布局下加载功能按钮
				if (isTouch) {
					if (isRightLayout) {
						if (isXPJ) {
							ui.create.div(".huanfuButton", ui.arena, plugin.click.huanfu);
							ui.create.div(".jiluButton", ui.arena, ui.click.pause);
						} else {
							ui.create.div(".huanfuButton_new", ui.arena, plugin.click.huanfu);
							ui.create.div(".jiluButton_new", ui.arena, ui.click.pause);
							ui.create.div(".meiguiButton_new", ui.arena);
							ui.create.div(".xiaolianButton_new", ui.arena);
						}
					} else {
						if (isXPJ) {
							ui.create.div(".huanfuButton1", ui.arena, plugin.click.huanfu);
							ui.create.div(".jiluButton1", ui.arena, ui.click.pause);
						} else {
							ui.create.div(".huanfuButton_new1", ui.arena, plugin.click.huanfu);
							ui.create.div(".jiluButton_new1", ui.arena, ui.click.pause);
							ui.create.div(".meiguiButton_new1", ui.arena, plugin.click.meigui);
							ui.create.div(".xiaolianButton_new1", ui.arena, plugin.click.xiaolian);
						}
					}
				}
				// 创建托管按钮
				ui.create.div(".tuoguanButton", ui.arena, ui.click.auto);
				// 创建手牌数量显示
				const className = isRightLayout ? ".handcardNumber" : ".handcardNumber1";
				const node = ui.create.div(className, ui.arena).hide();
				node.node = {
					cardPicture: ui.create.div(".cardPicture", node),
					cardNumber: ui.create.div(".cardNumber", node),
				};
				node.updateCardnumber = function () {
					if (!game.me) return;
					const currentCards = game.me.countCards("h") || 0;
					const cardLimit = game.me.getHandcardLimit() || 0;
					const numberColor = currentCards > cardLimit ? "red" : "white";
					const displayLimit = cardLimit === Infinity ? "∞" : cardLimit;
					this.node.cardNumber.innerHTML = `<span><font color="${numberColor}">${currentCards}</font>` + `<sp style="font-size:15px; font-family:yuanli; color:#FFFCF5;">/</sp>${displayLimit}</span>`;
					this.show();
					game.addVideo("updateCardnumber", null, {
						cardNumber: cardLimit,
					});
				};
				node.node.cardNumber.interval = setInterval(function () {
					ui.handcardNumber.updateCardnumber();
				}, 1000);
				game.addVideo("createhandcardNumber");
				return node;
			},
			cardRoundTime() {
				const node = ui.create.div(".cardRoundNumber", ui.arena).hide();
				node.node = {
					cardPileNumber: ui.create.div(".cardPileNumber", node),
					roundNumber: ui.create.div(".roundNumber", node),
					time: ui.create.div(".time", node),
				};
				node.updateRoundCard = function () {
					const cardNumber = ui.cardPile.childNodes.length || 0;
					const roundNumber = Math.max(1, game.roundNumber || 1);
					this.node.roundNumber.innerHTML = `<span>第${roundNumber}轮</span>`;
					this.setNumberAnimation(cardNumber);
					this.show();
					game.addVideo("updateCardRoundTime", null, {
						cardNumber: cardNumber,
						roundNumber: roundNumber,
					});
				};
				node.setNumberAnimation = function (num, step) {
					const item = this.node.cardPileNumber;
					clearTimeout(item.interval);
					if (!item._num) {
						item.innerHTML = `<span>${num}</span>`;
						item._num = num;
					} else if (item._num !== num) {
						if (!step) step = 500 / Math.abs(item._num - num);
						if (item._num > num) item._num--;
						else item._num++;
						item.innerHTML = `<span>${item._num}</span>`;
						if (item._num !== num) {
							item.interval = setTimeout(() => {
								node.setNumberAnimation(num, step);
							}, step);
						}
					}
				};
				// 时间显示
				ui.time4 = node.node.time;
				ui.time4.starttime = get.utc();
				ui.time4.interval = setInterval(function () {
					const totalSeconds = Math.round((get.utc() - ui.time4.starttime) / 1000);
					if (totalSeconds >= 3600) {
						const hours = Math.floor(totalSeconds / 3600);
						const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
						const seconds = totalSeconds - hours * 3600 - minutes * 60;
						const formatTime = num => (num < 10 ? `0${num}` : num.toString());
						ui.time4.innerHTML = `<span>${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}</span>`;
					} else {
						const minutes = Math.floor(totalSeconds / 60);
						const seconds = totalSeconds - minutes * 60;
						const formatTime = num => (num < 10 ? `0${num}` : num.toString());
						ui.time4.innerHTML = `<span>${formatTime(minutes)}:${formatTime(seconds)}</span>`;
					}
				}, 1000);
				game.addVideo("createCardRoundTime");
				return node;
			},
		},
		click: {
			huanfu() {
				utils.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/huanfu.mp3");
				window.zyile_charactercard ? window.zyile_charactercard(player, false) : ui.click.charactercard(game.me.name, game.zhu, lib.config.mode === "mode_guozhan" ? "guozhan" : true);
			},
			confirm(link, target) {
				if (link === "ok") {
					ui.click.ok(target);
				} else if (link === "cancel") {
					ui.click.cancel(target);
				} else if (target.custom) {
					target.custom(link);
				}
			},
			meigui() {
				// 玫瑰按钮点击处理
			},
			xiaolian() {
				// 笑脸按钮点击处理
			},
			setting() {
				// 设置按钮点击处理
			},
		},
		compare: {
			type(a, b) {
				if (a === b) return 0;
				const types = ["basic", "trick", "delay", "equip"].addArray([a, b]);
				return types.indexOf(a) - types.indexOf(b);
			},
			name(a, b) {
				if (a === b) return 0;
				return a > b ? 1 : -1;
			},
			nature(a, b) {
				if (a === b) return 0;
				const nature = [undefined, "fire", "thunder"].addArray([a, b]);
				return nature.indexOf(a) - nature.indexOf(b);
			},
			suit(a, b) {
				if (a === b) return 0;
				const suit = ["diamond", "heart", "club", "spade"].addArray([a, b]);
				return suit.indexOf(a) - suit.indexOf(b);
			},
			number(a, b) {
				return a - b;
			},
		},
	};
	return plugin;
});
