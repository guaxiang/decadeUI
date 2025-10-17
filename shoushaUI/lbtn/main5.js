app.import(function (lib, game, ui, get, ai, _status, app) {
	lib.arenaReady.push(function () {
		initializePlayerNames();
		overrideUpdateRoundNumber();
		createUIElements();
	});
	// 玩家昵称列表
	const PLAYER_NICKNAMES = ["缘之空", "小小恐龙", "自然萌", "海边的ebao", "小云云", "点点", "猫猫虫", "小爱莉", "冰佬", "鹿鹿", "黎佬", "浮牢师", "U佬", "蓝宝", "影宝", "柳下跖", "无语", "小曦", "墨渊", "k9", "扶苏", "皇叔"];
	// 初始化玩家昵称
	function initializePlayerNames() {
		setInterval(function () {
			game.countPlayer(current => {
				// 添加确定每个玩家的名字
				if (!current.nickname) {
					const namex = current === game.me ? lib.config.connect_nickname : PLAYER_NICKNAMES.randomGet();
					current.nickname = namex;
				}
			});
		}, 1000);
	}
	// 重写轮次更新函数
	function overrideUpdateRoundNumber() {
		const originUpdateRoundNumber = game.updateRoundNumber;
		game.updateRoundNumber = function () {
			originUpdateRoundNumber.apply(this, arguments);
			if (ui.cardRoundTime) {
				ui.cardRoundTime.updateRoundCard();
			}
		};
	}
	// 创建UI元素
	function createUIElements() {
		createConfigButton();
		createSortButton();
		createTopRightMenu();
	}
	// 创建配置按钮
	function createConfigButton() {
		const configButton = ui.create.node("div");
		configButton.style.cssText = `
			display: block;
			--w: 56px;
			--h: calc(var(--w) * 74/71);
			width: var(--w);
			height: var(--h);
			position: absolute;
			bottom: 13%;
			left: 53px;
			right: auto;
			background-color: transparent;
			z-index: 1;
		`;
		configButton.onclick = function () {
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
			if (!ui.click.configMenu) return;
			game.closePopped();
			game.pause2();
			ui.click.configMenu();
			ui.system1.classList.remove("shown");
			ui.system2.classList.remove("shown");
		};
		document.body.appendChild(configButton);
	}
	// 创建整理手牌按钮
	function createSortButton() {
		const isRightLayout = lib.config["extension_十周年UI_rightLayout"] === "on";
		const sortImg = "hs_zhengli.png";
		const sortButton = ui.create.node("img");
		sortButton.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/uibutton/" + sortImg;
		let styleText = "display:block;position:absolute;background-color:transparent;";
		styleText += "width:85px;height:50px;bottom: 18%;left: 22px;z-index:4;right: auto;";
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
		const topOffset = "10px";
		// 菜单按钮
		const menuBtn = ui.create.node("img");
		menuBtn.src = lib.assetURL + "extension/十周年UI/shoushaUI/lbtn/images/CD/hs_caidan.png";
		menuBtn.style.cssText = `display:block;--w:56px;--h:calc(var(--w) * 74/71);width:var(--w);height:var(--h);position:absolute;top:${topOffset};left:40px;background-color:transparent;z-index:3;`;
		document.body.appendChild(menuBtn);
		let menuPopup = null;
		function openMenu() {
			if (menuPopup) return;
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/click.mp3");
			menuPopup = ui.create.div(".popup-container", { background: "rgb(0,0,0,0)" }, ui.window);
			menuPopup.addEventListener("click", event => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/back.mp3");
				event.stopPropagation();
				closeMenu();
			});
			// 创建菜单项
			const home = ui.create.div(".HOME", menuPopup);
			const settingsBtn = ui.create.div(".SZ", menuPopup);
			settingsBtn.addEventListener("click", event => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
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
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				window.location.reload();
			});
			const bgBtn = ui.create.div(".BJ", menuPopup);
			bgBtn.addEventListener("click", event => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				openBackgroundSelector();
			});
			const surrenderBtn = ui.create.div(".TX", menuPopup);
			surrenderBtn.addEventListener("click", event => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				game.over();
			});
			const autoBtn = ui.create.div(".TG", menuPopup);
			autoBtn.addEventListener("click", event => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
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
			let path = "image/background/";
			game.getFileList(path, function (folders, files) {
				let systemFiles = [];
				let customFiles = [];
				// 获取隐藏的系统背景列表
				let hiddenBgs = lib.config.extension_十周年UI_hiddenSystemBackgrounds || [];
				for (let tempbackground of files) {
					let fileName = tempbackground.replace(/\.[^/.]+$/, "");
					let fileExtension = tempbackground.split(".").pop();
					if (!fileExtension || fileName.startsWith("oltianhou_")) continue;
					// 检查系统背景是否被隐藏
					if (fileName.startsWith("cdv_bg_") || fileName.startsWith("custom_bg_")) {
						customFiles.push(tempbackground);
					} else {
						// 系统背景：检查是否在隐藏列表中
						if (!hiddenBgs.includes(fileName)) {
							systemFiles.push(tempbackground);
						}
					}
				}
				let orderedFiles = systemFiles.concat(customFiles);
				for (let tempbackground of orderedFiles) {
					let fileName = tempbackground.replace(/\.[^/.]+$/, "");
					let img = ui.create.div(".backgrounds", container);
					img.dataset.name = fileName;
					img.setBackgroundImage(path + tempbackground);
					if (fileName == lib.config.image_background) ui.create.div(".bgxuanzhong", img);
					img.addEventListener("click", function () {
						// 检查是否在编辑模式
						var editItem = container.querySelector(".backgrounds:last-child");
						var isEditMode = editItem && editItem.querySelector(".buttontext").innerHTML === "完成编辑";
						if (isEditMode) {
							// 编辑模式：执行删除或隐藏操作
							game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
							// 检查是否为系统背景
							if (!(fileName.startsWith("cdv_bg_") || fileName.startsWith("custom_bg_"))) {
								// 系统背景：隐藏而不是删除
								// 获取隐藏背景列表
								var hiddenBgs = lib.config.extension_十周年UI_hiddenSystemBackgrounds || [];
								if (!hiddenBgs.includes(fileName)) {
									hiddenBgs.push(fileName);
									lib.config.extension_十周年UI_hiddenSystemBackgrounds = hiddenBgs;
									game.saveConfig("extension_十周年UI_hiddenSystemBackgrounds", hiddenBgs);
								}
								// 如果当前背景被隐藏，切换到默认背景
								if (lib.config.image_background == fileName) {
									game.saveConfig("image_background", "default");
									lib.init.background();
									game.updateBackground();
								}
								// 重新加载背景列表但保持编辑模式
								while (container.firstChild) {
									container.removeChild(container.firstChild);
								}
								loadBackgroundImages(container);
								// 重新进入编辑模式
								setTimeout(function () {
									var editItem = container.querySelector(".backgrounds:last-child");
									if (editItem) {
										editItem.click();
									}
								}, 100);
								return;
							}
							// 自定义背景：删除
							if (confirm("是否删除此背景？（此操作不可撤销）")) {
								var nameMap2 = lib.config.extension_十周年UI_customBackgroundNames || {};
								if (nameMap2[fileName]) {
									delete nameMap2[fileName];
									lib.config.extension_十周年UI_customBackgroundNames = nameMap2;
									game.saveConfig("extension_十周年UI_customBackgroundNames", nameMap2);
								}
								if (fileName.startsWith("cdv_bg_")) {
									game.removeFile("image/background/" + fileName + ".jpg");
								} else {
									game.deleteDB("image", fileName);
								}
								if (lib.config.image_background == fileName) {
									game.saveConfig("image_background", "default");
									lib.init.background();
									game.updateBackground();
								}
								// 重新加载背景列表但保持编辑模式
								while (container.firstChild) {
									container.removeChild(container.firstChild);
								}
								loadBackgroundImages(container);
								// 重新进入编辑模式
								setTimeout(function () {
									var editItem = container.querySelector(".backgrounds:last-child");
									if (editItem) {
										editItem.click();
									}
								}, 100);
							}
						} else {
							// 正常模式：选择背景
							let allSelectedElements = document.querySelectorAll(".bgxuanzhong");
							allSelectedElements.forEach(function (selectedElement) {
								selectedElement.parentNode.removeChild(selectedElement);
							});
							ui.create.div(".bgxuanzhong", img);
							game.saveConfig("image_background", fileName);
							lib.init.background();
							game.updateBackground();
						}
					});
					let customNameMap = lib.config.extension_十周年UI_customBackgroundNames || {};
					let backgroundName = lib.configMenu.appearence.config.image_background.item[fileName] ? lib.configMenu.appearence.config.image_background.item[fileName] : customNameMap[fileName] || fileName;
					ui.create.div(".buttontext", backgroundName, img);
				}
				// 添加 "添加背景" 项（放在末尾）
				(function (container) {
					var addItem = ui.create.div(".backgrounds", container);
					ui.create.div(".buttontext", "添加背景", addItem);
					var input = document.createElement("input");
					input.type = "file";
					input.accept = "image/*";
					input.multiple = true; // 支持多选
					input.style.display = "none";
					document.body.appendChild(input);
					var write = (data, dir, name) => (game.promises && game.promises.writeFile ? game.promises.writeFile(data, dir, name) : new Promise(resolve => game.writeFile(data, dir, name, resolve)));
					addItem.addEventListener("click", function () {
						game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
						input.click();
					});
					input.onchange = function (e) {
						var files = e.target.files;
						if (!files || files.length === 0) return;
						var processFiles = async function () {
							var nameMap = lib.config.extension_十周年UI_customBackgroundNames || {};
							for (var i = 0; i < files.length; i++) {
								var file = files[i];
								if (!file) continue;
								var base = (game.writeFile ? "cdv_" : "custom_") + "bg_" + Date.now() + "_" + i;
								var targetName = base + ".jpg";
								var originName = (file.name || "").replace(/\.[^/.]+$/, "");
								nameMap[base] = originName || base;
								try {
									await write(file, "image/background", targetName);
									if (i === 0) {
										game.saveConfig("image_background", base);
										lib.init.background();
										game.updateBackground();
									}
								} catch (err) {
									console && console.error && console.error("导入背景失败:", err);
								}
							}
							lib.config.extension_十周年UI_customBackgroundNames = nameMap;
							game.saveConfig("extension_十周年UI_customBackgroundNames", nameMap);
							while (container.firstChild) {
								container.removeChild(container.firstChild);
							}
							loadBackgroundImages(container);
						};
						processFiles();
					};
					// 编辑背景按钮（使用本体逻辑）
					var editItem = ui.create.div(".backgrounds", container);
					ui.create.div(".buttontext", "编辑背景", editItem);
					var isEditMode = false;
					editItem.addEventListener("click", function () {
						game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
						isEditMode = !isEditMode;
						// 切换所有背景项的显示模式
						var items = Array.from(container.querySelectorAll(".backgrounds"));
						items.slice(0, Math.max(0, items.length - 3)).forEach(function (item) {
							var fname = item.dataset.name;
							if (!fname) return;
							var textDiv = item.querySelector(".buttontext");
							if (!textDiv) return;

							if (isEditMode) {
								// 编辑模式：显示删除或隐藏
								if (fname.startsWith("cdv_bg_") || fname.startsWith("custom_bg_")) {
									textDiv.innerHTML = "删除";
								} else {
									textDiv.innerHTML = "隐藏";
								}
							} else {
								// 正常模式：显示背景名称
								var customNameMap = lib.config.extension_十周年UI_customBackgroundNames || {};
								var backgroundName = lib.configMenu.appearence.config.image_background.item[fname] ? lib.configMenu.appearence.config.image_background.item[fname] : customNameMap[fname] || fname;
								textDiv.innerHTML = backgroundName;
							}
						});
						// 更新编辑按钮文字
						var editText = editItem.querySelector(".buttontext");
						editText.innerHTML = isEditMode ? "完成编辑" : "编辑背景";
					});
				})(container);
			});
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
	// 插件主体
	const plugin = {
		name: "lbtn",
		// 过滤器
		filter() {
			return !["chess", "tafang"].includes(get.mode());
		},
		// 内容初始化
		content(next) {
			// 创建UI卡牌更新技能
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
					if (ui.updateSkillControl) {
						ui.updateSkillControl(game.me, true);
					}
				},
			};
		},
		// 预内容初始化
		precontent() {
			initializeVideoContent();
			overrideCreateFunctions();
			overrideConfigMenu();
			overrideConfirmFunction();
		},
		// 创建器
		create: {
			// 控制创建
			control() {},
			// 确认对话框创建
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
				// 重写关闭函数
				app.reWriteFunction(confirm, {
					close: [
						function () {
							this.classList.add("closing");
						},
					],
				});
				// 绑定事件监听器
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
				// 更新函数
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
			// 手牌数量显示创建
			handcardNumber() {
				const isRightLayout = lib.config["extension_十周年UI_rightLayout"] === "on";
				// 创建设置按钮
				ui.create.div(".settingButton", ui.arena, plugin.click.setting);
				// 加载功能按钮（取消XPJ配置项分支，所有布局均加载小部件）
				if (isRightLayout) {
					ui.create.div(".jiluButton_new", ui.arena, ui.click.pause);
					ui.create.div(".meiguiButton_new", ui.arena);
				} else {
					ui.create.div(".jiluButton_new1", ui.arena, ui.click.pause);
					ui.create.div(".meiguiButton_new1", ui.arena, plugin.click.meigui);
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
			// 卡牌轮次时间创建
			cardRoundTime() {
				const node = ui.create.div(".cardRoundNumber", ui.arena, ui.click.pause).hide();
				node.node = {
					cardPileNumber: ui.create.div(".cardPileNumber", node),
					roundNumber: ui.create.div(".roundNumber", node),
					time: ui.create.div(".time", node),
				};
				// 更新轮次卡牌函数
				node.updateRoundCard = function () {
					const cardNumber = ui.cardPile.childNodes.length || 0;
					const roundNumber = Math.max(1, game.roundNumber || 1);
					this.node.roundNumber.innerHTML = `<span>${roundNumber}轮</span>`;
					this.setNumberAnimation(cardNumber);
					this.show();
					game.addVideo("updateCardRoundTime", null, {
						cardNumber: cardNumber,
						roundNumber: roundNumber,
					});
				};
				// 数字动画函数
				node.setNumberAnimation = function (num, step) {
					const item = this.node.cardPileNumber;
					clearTimeout(item.interval);
					if (!item._num) {
						item.innerHTML = `<span>${num}</span>`;
						item._num = num;
					} else {
						if (item._num !== num) {
							if (!step) {
								step = 500 / Math.abs(item._num - num);
							}
							if (item._num > num) {
								item._num--;
							} else {
								item._num++;
							}
							item.innerHTML = `<span>${item._num}</span>`;
							if (item._num !== num) {
								item.interval = setTimeout(function () {
									node.setNumberAnimation(num, step);
								}, step);
							}
						}
					}
				};
				// 时间显示
				ui.time4 = node.node.time;
				ui.time4.starttime = get.utc();
				ui.time4.interval = setInterval(function () {
					const totalSeconds = Math.round((get.utc() - ui.time4.starttime) / 1000);
					if (totalSeconds >= 3600) {
						// 显示小时:分钟:秒
						const hours = Math.floor(totalSeconds / 3600);
						const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
						const seconds = totalSeconds - hours * 3600 - minutes * 60;
						const formattedHours = hours < 10 ? "0" + hours : hours.toString();
						const formattedMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
						const formattedSeconds = seconds < 10 ? "0" + seconds : seconds.toString();
						ui.time4.innerHTML = `<span>${formattedHours}:${formattedMinutes}:${formattedSeconds}</span>`;
					} else {
						// 显示分钟:秒
						const minutes = Math.floor(totalSeconds / 60);
						const seconds = totalSeconds - minutes * 60;
						const formattedMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
						const formattedSeconds = seconds < 10 ? "0" + seconds : seconds.toString();
						ui.time4.innerHTML = `<span>${formattedMinutes}:${formattedSeconds}</span>`;
					}
				}, 1000);
				game.addVideo("createCardRoundTime");
				return node;
			},
		},
		// 点击事件处理
		click: {
			// 换肤按钮
			huanfu() {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/huanfu.mp3");
				if (window.zyile_charactercard) {
					window.zyile_charactercard(player, false);
				} else {
					ui.click.charactercard(game.me.name, game.zhu, lib.config.mode == "mode_guozhan" ? "guozhan" : true);
				}
			},
			// 确认按钮
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
		// 比较函数
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
	// 初始化视频内容
	function initializeVideoContent() {
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
				// ui.handcardNumber.setNumberAnimation(opts.cardNumber);
			},
		});
	}
	// 重写创建函数
	function overrideCreateFunctions() {
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
					if (ui.cardPileNumber) {
						ui.cardPileNumber.delete();
					}
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
	}
	// 重写配置菜单
	function overrideConfigMenu() {
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
	}
	// 重写确认函数
	function overrideConfirmFunction() {
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
	}
	return plugin;
});
