app.import((lib, game, ui, get, ai, _status, app) => {
	// 初始化
	lib.arenaReady.push(() => {
		// 更新轮次
		const originUpdateRoundNumber = game.updateRoundNumber;
		game.updateRoundNumber = function () {
			originUpdateRoundNumber.apply(this, arguments);
			if (ui.cardRoundTime) {
				ui.cardRoundTime.updateRoundCard();
			}
		};
		// 创建问号按钮（仅限特定模式）
		if (["identity", "doudizhu", "guozhan", "versus", "single", "martial"].includes(lib.config.mode)) {
			const wenhao = ui.create.node("img");
			wenhao.src = `${lib.assetURL}extension/十周年UI/shoushaUI/lbtn/images/CD/new_wenhao.png`;
			const isTouch = lib.config.phonelayout;
			const bottomOffset = isTouch ? "calc(100% - 55px)" : "calc(100% - 105px)";
			wenhao.style.cssText = `display: block;width: 40px;height: 29px;position: absolute;bottom: ${bottomOffset};left: calc(100% - 160px);background-color: transparent;z-index:3`;
			if (["identity", "doudizhu", "versus", "guozhan"].includes(lib.config.mode)) {
				wenhao.onclick = () => {
					const popuperContainer = ui.create.div(".popup-container", ui.window);
					game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/label.mp3");
					// 根据模式显示不同提示
					if (lib.config.mode === "identity") {
						showIdentityTip(popuperContainer);
					} else if (lib.config.mode === "doudizhu") {
						showDoudizhuTip(popuperContainer);
					} else if (lib.config.mode === "versus") {
						ui.create.div(".Tiphu", popuperContainer);
					} else if (lib.config.mode === "guozhan") {
						showGuozhanTip(popuperContainer);
					}
					// 添加关闭事件
					popuperContainer.addEventListener("click", event => {
						game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3");
						popuperContainer.delete(200);
					});
				};
			}
			document.body.appendChild(wenhao);
		}
		// 创建阴影背景
		const shadowBg = ui.create.node("img");
		shadowBg.src = `${lib.assetURL}extension/十周年UI/shoushaUI/lbtn/images/uibutton/yinying.png`;
		shadowBg.style.cssText = "display: block;width: 100%;height: 20%;position: absolute;bottom: 0px;background-color: transparent;z-index:-1";
		document.body.appendChild(shadowBg);
		// 创建主按钮背景
		const mainButtonBg = ui.create.node("img");
		mainButtonBg.src = `${lib.assetURL}extension/十周年UI/shoushaUI/lbtn/images/CD/new_button3.png`;
		const isTouchBg = lib.config.phonelayout;
		const bottomOffsetBg = isTouchBg ? "calc(100% - 69px)" : "calc(100% - 129px)";
		mainButtonBg.style.cssText = `display: block;--w: 56px;--h: calc(var(--w) * 74/71);width: var(--w);height: var(--h);position: absolute;bottom: ${bottomOffsetBg};left: calc(100% - 110px);background-color: transparent;z-index:1`;
		mainButtonBg.onclick = () => {
			mainButtonBg.style.transform = "scale(0.95)";
		};
		document.body.appendChild(mainButtonBg);
		// 创建主按钮点击区域
		const mainButton = ui.create.node("div");
		const isTouchBtn = lib.config.phonelayout;
		const bottomOffsetBtn = isTouchBtn ? "calc(100% - 69px)" : "calc(100% - 129px)";
		mainButton.style.cssText = `display: block;--w: 56px;--h: calc(var(--w) * 74/71);width: var(--w);height: var(--h);position: absolute;bottom: ${bottomOffsetBtn};left: calc(100% - 110px);background-color: transparent;z-index:1`;
		mainButton.onclick = () => {
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/click.mp3");
			createMainMenu();
		};
		document.body.appendChild(mainButton);
		// 创建整理手牌按钮
		const sortButton = ui.create.node("img");
		sortButton.src = `${lib.assetURL}extension/十周年UI/shoushaUI/lbtn/images/uibutton/new_zhengli.png`;
		// 根据布局设置按钮位置
		if (lib.config["extension_十周年UI_rightLayout"] === "on") {
			sortButton.style.cssText = "display: block;--w: 88px;--h: calc(var(--w) * 81/247);width: var(--w);height: var(--h);position: absolute;top: calc(100% - 46px);left: calc(100% - 335px);background-color: transparent;z-index:3";
		} else {
			sortButton.style.cssText = "display: block;--w: 88px;--h: calc(var(--w) * 81/247);width: var(--w);height: var(--h);position: absolute;top: calc(100% - 33px);right: calc(100% - 335px);background-color: transparent;z-index:3;";
		}
		sortButton.onclick = () => {
			if (!game.me || game.me.hasSkillTag("noSortCard")) return;
			game.playAudio("../extension/十周年UI/audio/card_click.mp3");
			const cards = game.me.getCards("hs");
			const sort2 = (b, a) => {
				if (a.name !== b.name) return lib.sort.card(a.name, b.name);
				else if (a.suit !== b.suit) return lib.suit.indexOf(a) - lib.suit.indexOf(b);
				else return a.number - b.number;
			};
			if (cards.length > 1) {
				cards.sort(sort2);
				cards.forEach((i, j) => {
					game.me.node.handcards1.insertBefore(cards[j], game.me.node.handcards1.firstChild);
				});
				dui.queueNextFrameTick(dui.layoutHand, dui);
			}
		};
		// 定时检测手牌数，动态显示/隐藏整理按钮
		sortButton._interval = setInterval(() => {
			if (!game.me) return;
			const num = game.me.getCards("hs").length;
			sortButton.style.display = num >= 4 ? "block" : "none";
		}, 1000);
		document.body.appendChild(sortButton);
		// 创建全选/反选手牌按钮
		const selectAllButton = ui.create.node("img");
		const updateSelectAllButtonImage = () => {
			if (ui.selected.cards.length > 0) {
				selectAllButton.src = `${lib.assetURL}extension/十周年UI/shoushaUI/lbtn/images/uibutton/fanxuan.png`;
			} else {
				selectAllButton.src = `${lib.assetURL}extension/十周年UI/shoushaUI/lbtn/images/uibutton/quanxuan.png`;
			}
		};
		updateSelectAllButtonImage();
		if (lib.config["extension_十周年UI_rightLayout"] === "on") {
			selectAllButton.style.cssText = "display: block;--w: 88px;--h: calc(var(--w) * 81/247);width: var(--w);height: var(--h);position: absolute;top: calc(100% - 46px);left: calc(100% - 430px);background-color: transparent;z-index:3";
		} else {
			selectAllButton.style.cssText = "display: block;--w: 88px;--h: calc(var(--w) * 81/247);width: var(--w);height: var(--h);position: absolute;top: calc(100% - 33px);right: calc(100% - 430px);background-color: transparent;z-index:3;";
		}
		selectAllButton.onclick = () => {
			const event = _status.event;
			if (!event || !event.isMine || !event.isMine() || !event.allowChooseAll || event.complexCard || event.complexSelect) {
				return;
			}
			const selectCard = event.selectCard;
			if (!selectCard) return;
			const range = get.select(selectCard);
			if (range[1] <= 1) return;
			game.playAudio("../extension/十周年UI/audio/card_click.mp3");
			const selecteds = [...ui.selected.cards];
			ui.selected.cards.length = 0;
			game.check();
			const selectables = get.selectableCards();
			const cards = selecteds.length ? [...new Set(selectables).difference(selecteds)] : selectables;
			if (cards.length <= range[1]) {
				ui.selected.cards.push(...cards);
			} else {
				ui.selected.cards.push(...cards.randomGets(range[1]));
			}
			for (let i = 0; i < ui.selected.cards.length; i++) {
				const card = ui.selected.cards[i];
				card.classList.add("selected");
				if (card.updateTransform) card.updateTransform(true, 0);
			}
			for (let i = 0; i < selecteds.length; i++) {
				const card = selecteds[i];
				card.classList.remove("selected");
				if (card.updateTransform) card.updateTransform(false, 0);
			}
			game.check();
			updateSelectAllButtonImage();
			if (typeof event.custom?.add?.card === "function") {
				event.custom.add.card();
			}
		};
		// 定时检测是否有选择事件，动态显示/隐藏全选按钮
		selectAllButton._interval = setInterval(() => {
			const event = _status.event;
			if (!event || !event.isMine || !event.isMine() || !event.allowChooseAll || event.complexCard || event.complexSelect) {
				selectAllButton.style.display = "none";
				return;
			}
			const selectCard = event.selectCard;
			if (!selectCard) {
				selectAllButton.style.display = "none";
				return;
			}
			const range = get.select(selectCard);
			if (range[1] <= 1) {
				selectAllButton.style.display = "none";
				return;
			}
			selectAllButton.style.display = "block";
			updateSelectAllButtonImage();
		}, 100);
		document.body.appendChild(selectAllButton);
	});
	// 辅助函数：显示身份提示
	function showIdentityTip(container) {
		const map = { zhu: ".Tipzhugong", zhong: ".Tipzhongchen", fan: ".Tipfanzei", nei: ".Tipneijian" };
		const cls = map[game.me.identity];
		if (cls) ui.create.div(cls, container);
	}
	// 辅助函数：显示斗地主提示
	function showDoudizhuTip(container) {
		const map = { zhu: ".Tipdizhu", fan: ".Tipnongmin" };
		const cls = map[game.me.identity];
		if (cls) ui.create.div(cls, container);
	}
	// 辅助函数：显示国战提示
	function showGuozhanTip(container) {
		const groupMap = {
			unknown: ".Tipundefined",
			undefined: ".Tipundefined",
			wei: ".Tipweiguo",
			shu: ".Tipshuguo",
			wu: ".Tipwuguo",
			qun: ".Tipqunxiong",
			jin: ".Tipjinguo",
			ye: ".Tipyexinjia",
		};
		ui.create.div(groupMap[game.me.group] || ".Tipweizhi", container);
	}
	// 辅助函数：创建主菜单
	function createMainMenu() {
		const popuperContainer = ui.create.div(
			".popup-container",
			{
				background: "rgb(0,0,0,0)",
			},
			ui.window
		);
		popuperContainer.addEventListener("click", event => {
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/back.mp3");
			event.stopPropagation();
			popuperContainer.delete(200);
		});
		const HOME = ui.create.div(".buttonyjcm", popuperContainer);
		// 创建设置按钮
		const SZ = ui.create.div(".controls", HOME);
		SZ.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/button/button_sz.png");
		SZ.addEventListener("click", event => {
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
			if (!ui.click.configMenu) return;
			game.closePopped();
			game.pause2();
			ui.click.configMenu();
			ui.system1.classList.remove("shown");
			ui.system2.classList.remove("shown");
		});
		// 创建背景按钮
		const BJ = ui.create.div(".controls", HOME);
		BJ.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/button/button_bj.png");
		BJ.addEventListener("click", event => {
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
			openBackgroundSelector();
		});
		// 创建托管按钮
		const TG = ui.create.div(".controls", HOME);
		TG.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/button/button_tg.png");
		TG.addEventListener("click", event => {
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
			ui.click.auto();
		});
		// 创建退出按钮
		const TC = ui.create.div(".controls", HOME);
		TC.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/button/button_tc.png");
		TC.addEventListener("click", event => {
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
			window.location.reload();
		});
	}
	// 辅助函数：打开背景选择器
	function openBackgroundSelector() {
		const popuperContainer = ui.create.div(
			".popup-container",
			{
				background: "rgba(0, 0, 0, 0.8)",
			},
			ui.window
		);
		const guanbi = ui.create.div(".bgback", popuperContainer, (e) => {
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3");
			popuperContainer.hide();
			game.resume2();
		});
		const bigdialog = ui.create.div(".bgdialog", popuperContainer);
		const bgbg = ui.create.div(".backgroundsbg", bigdialog);
		loadBackgroundImages(bgbg);
	}
	// 辅助函数：加载背景图片
	function loadBackgroundImages(container) {
		let backgroundItems = lib.configMenu.appearence.config.image_background.item;
		let hiddenBgs = lib.config.hiddenBackgroundPack || [];

		for (let fileName in backgroundItems) {
			if (fileName === "default" || hiddenBgs.includes(fileName)) continue;

			let img = ui.create.div(".backgrounds", container);
			img.dataset.name = fileName;

			if (fileName.startsWith("custom_")) {
				game.getDB("image", fileName, (fileToLoad) => {
					if (fileToLoad) {
						const fileReader = new FileReader();
						fileReader.onload = (fileLoadedEvent) => {
							const data = fileLoadedEvent.target.result;
							img.style.backgroundImage = `url(${data})`;
							img.style.backgroundSize = "cover";
						};
						fileReader.readAsDataURL(fileToLoad, "UTF-8");
					}
				});
			} else {
				img.setBackgroundImage(`image/background/${fileName}.jpg`);
			}

			if (fileName === lib.config.image_background) ui.create.div(".bgxuanzhong", img);

			img.addEventListener("click", function () {
				const editItem = container.querySelector(".backgrounds:last-child");
				const isEditMode = editItem && editItem.classList.contains("active");
				if (isEditMode) {
					game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
					const textDiv = this.querySelector(".buttontext");
					if (textDiv && textDiv.innerHTML === "隐藏") {
						container.parentNode.noclose = true;
						this.remove();
						if (!lib.config.prompt_hidebg) {
							alert("隐藏的背景可通过选项-其它-重置隐藏内容恢复");
							game.saveConfig("prompt_hidebg", true);
						}
						lib.config.hiddenBackgroundPack.add(fileName);
						game.saveConfig("hiddenBackgroundPack", lib.config.hiddenBackgroundPack);
						delete lib.configMenu.appearence.config.image_background.item[fileName];
						if (lib.config.image_background === fileName) {
							game.saveConfig("image_background", "default");
							lib.init.background();
							game.updateBackground();
						}
						while (container.firstChild) {
							container.removeChild(container.firstChild);
						}
						loadBackgroundImages(container);
						return;
					} else if (textDiv && textDiv.innerHTML === "删除") {
						container.parentNode.noclose = true;
						if (confirm("是否删除此背景？（此操作不可撤销）")) {
							this.remove();
							lib.config.customBackgroundPack.remove(fileName);
							game.saveConfig("customBackgroundPack", lib.config.customBackgroundPack);
							if (fileName.startsWith("cdv_")) {
								game.removeFile(`image/background/${fileName}.jpg`);
							} else {
								game.deleteDB("image", fileName);
							}
							delete lib.configMenu.appearence.config.image_background.item[fileName];
							if (lib.config.image_background === fileName) {
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
				allSelectedElements.forEach((selectedElement) => {
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
		((container) => {
			const addItem = ui.create.div(".backgrounds", container);
			ui.create.div(".buttontext", "添加背景", addItem);
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "image/*";
			input.multiple = true;
			input.style.display = "none";
			document.body.appendChild(input);
			addItem.addEventListener("click", () => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				input.click();
			});
			input.onchange = (e) => {
				const files = e.target.files;
				if (!files || files.length === 0) return;
				const fileList = Array.from(files);
				const totalFiles = fileList.length;
				let processedFiles = 0;
				fileList.forEach((file2, index) => {
					if (file2) {
						let name2 = file2.name;
						if (name2.includes(".")) {
							name2 = name2.slice(0, name2.indexOf("."));
						}
						let link = `${game.writeFile ? "cdv_" : "custom_"}${name2}`;
						if (lib.configMenu.appearence.config.image_background.item[link]) {
							for (let i = 1; i < 1e3; i++) {
								if (!lib.configMenu.appearence.config.image_background.item[`${link}_${i}`]) {
									link = `${link}_${i}`;
									break;
								}
							}
						}
						lib.configMenu.appearence.config.image_background.item[link] = name2;
						const callback = () => {
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
							game.writeFile(file2, "image/background", `${link}.jpg`, callback);
						} else {
							game.putDB("image", link, file2, callback);
						}
					}
				});
			};
			const editItem = ui.create.div(".backgrounds", container);
			ui.create.div(".buttontext", "编辑背景", editItem);
			const editbg = function () {
				this.classList.toggle("active");
				const items = Array.from(container.querySelectorAll(".backgrounds"));
				const self = this;
				items.slice(0, Math.max(0, items.length - 2)).forEach((item) => {
					const fname = item.dataset.name;
					if (!fname) return;
					const textDiv = item.querySelector(".buttontext");
					if (!textDiv) return;
					let str;
					if (self.classList.contains("active")) {
						if (fname.startsWith("custom_") || fname.startsWith("cdv_")) {
							str = "删除";
						} else {
							str = "隐藏";
						}
					} else {
						str = lib.configMenu.appearence.config.image_background.item[fname] || fname;
					}
					textDiv.innerHTML = str;
				});
			};
			editItem.addEventListener("click", function () {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				editbg.call(this);
			});
		})(container);
	}
	// 插件定义
	const plugin = {
		name: "lbtn",
		filter() {
			return !["chess", "tafang"].includes(get.mode());
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
			// 扩展游戏视频内容
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
					() => {
						plugin.create.control();
					},
					null,
				],
				arena: [
					null,
					() => {
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
					() => {
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
					(res, config, map) => {
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
			// 重写确认对话框
			ui.create.confirm = (str, func) => {
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
			const originalCardChooseAll = ui.create.cardChooseAll;
			ui.create.cardChooseAll = () => null;
			function removeCardChooseAll(event) {
				if (!event || !event.cardChooseAll) return;
				const el = event.cardChooseAll;
				if (el instanceof HTMLDivElement) {
					if (el.parentNode) el.remove();
					if (ui.updatec) ui.updatec();
				}
				delete event.cardChooseAll;
			}
			const initObserver = () => {
				if (!ui.control) return;
				const observer = new MutationObserver((mutations) => {
					for (let i = 0; i < mutations.length; i++) {
						const added = mutations[i].addedNodes;
						for (let j = 0; j < added.length; j++) {
							const node = added[j];
							if (node.nodeType === 1 && node.classList && node.classList.contains("control")) {
								const first = node.firstElementChild;
								if (first && /^[全反]选$/.test(first.innerHTML) && node.childElementCount === 1) {
									node.remove();
									if (_status.event && _status.event.cardChooseAll === node) delete _status.event.cardChooseAll;
									if (ui.updatec) ui.updatec();
								}
							}
						}
					}
				});
				observer.observe(ui.control, { childList: true });
			};
			if (ui.control) initObserver();
			else if (lib.arenaReady) lib.arenaReady.push(initObserver);

			if (lib.hooks && lib.hooks.checkEnd) {
				lib.hooks.checkEnd.add(removeCardChooseAll);
			}
			const originalCheck = game.check;
			game.check = function (event) {
				const result = originalCheck.apply(this, arguments);
				removeCardChooseAll(event);
				return result;
			};
			// 拦截出牌阶段的取消：有选中时仅恢复选择而不结束回合
			(() => {
				const originalCancel = ui.click.cancel;
				ui.click.cancel = function (node) {
					const event = _status.event;
					if (event && _status.event.type === "phase" && ui.confirm && !event.skill && (ui.selected.cards.length !== 0 || ui.selected.targets.length !== 0)) {
						ui.confirm.classList.add("removing");
						event.restore();
						const cards = event.player.getCards("hej");
						for (let i = 0; i < cards.length; i++) {
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
			control() { },
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
				// 为按钮添加事件监听
				for (const k in confirm.node) {
					confirm.node[k].classList.add("disabled");
					confirm.node[k].removeEventListener(lib.config.touchscreen ? "touchend" : "click", ui.click.control);
					confirm.node[k].addEventListener(lib.config.touchscreen ? "touchend" : "click", (e) => {
						e.stopPropagation();
						const target = e.currentTarget;
						if (target.classList.contains("disabled")) {
							if (target.link === "cancel" && target.dataset.type === "endButton" && _status.event.endButton) {
								_status.event.endButton.custom();
								ui.confirm.close();
							}
							return;
						}
						if (target.parentNode.custom) {
							target.parentNode.custom(target.link, target);
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
						item.addEventListener(lib.config.touchscreen ? "touchend" : "click", (e) => {
							e.stopPropagation();
							ui.click.skill(item.link);
						});
						item.dataset.type = "skill2";
						if (ui.updateSkillControl) ui.updateSkillControl(game.me, true);
					}
				}
				confirm.update = () => {
					if (confirm.skills2) {
						if (_status.event.skill && _status.event.skill !== confirm.dataset.skill) {
							confirm.dataset.skill = _status.event.skill;
							confirm.skills2.forEach((item) => {
								item.remove();
							});
							ui.updatec();
						} else if (!_status.event.skill && confirm.dataset.skill) {
							delete confirm.dataset.skill;
							confirm.skills2.forEach((item) => {
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
				const node3 = ui.create.div(".settingButton", ui.arena, plugin.click.setting);
				// 仅触屏布局下加载功能按钮
				const isTouch = lib.config.phonelayout;
				if (isTouch) {
					// 根据布局模式创建不同的按钮
					if (lib.config["extension_十周年UI_rightLayout"] === "on") {
						const node6 = ui.create.div(".huanfuButton_new", ui.arena, plugin.click.huanfu);
						const node7 = ui.create.div(".jiluButton_new", ui.arena, ui.click.pause);
						const node8 = ui.create.div(".meiguiButton_new", ui.arena);
						const node9 = ui.create.div(".xiaolianButton_new", ui.arena);
					} else {
						const node6 = ui.create.div(".huanfuButton_new1", ui.arena, plugin.click.huanfu);
						const node7 = ui.create.div(".jiluButton_new1", ui.arena, ui.click.pause);
						const node8 = ui.create.div(".meiguiButton_new1", ui.arena, plugin.click.meigui);
						const node9 = ui.create.div(".xiaolianButton_new1", ui.arena, plugin.click.xiaolian);
					}
				}
				const node4 = ui.create.div(".tuoguanButton", ui.arena, ui.click.auto);
				// 创建手牌数显示
				let node;
				if (lib.config["extension_十周年UI_rightLayout"] === "on") {
					node = ui.create.div(".handcardNumber", ui.arena).hide();
					node.node = {
						cardPicture: ui.create.div(".cardPicture", node),
						cardNumber: ui.create.div(".cardNumber", node),
					};
				} else {
					node = ui.create.div(".handcardNumber1", ui.arena).hide();
					node.node = {
						cardPicture: ui.create.div(".cardPicture1", node),
						cardNumber: ui.create.div(".cardNumber1", node),
					};
				}
				node.updateCardnumber = function () {
					if (!game.me) return;
					const cardNumber2 = game.me.countCards("h") || 0;
					let cardNumber = game.me.getHandcardLimit() || 0;
					let numbercolor = "white";
					if (cardNumber2 > cardNumber) numbercolor = "red";
					if (cardNumber === Infinity) cardNumber = "∞";
					this.node.cardNumber.innerHTML = `<span><font color=${numbercolor} > ${cardNumber2}</font><sp style="font-size:18px; font-family:yuanli; color:#FFFCF5;">/</sp>${cardNumber}</span>`;
					this.show();
					game.addVideo("updateCardnumber", null, {
						cardNumber: cardNumber,
					});
				};
				node.node.cardNumber.interval = setInterval(() => {
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
					} else {
						if (item._num !== num) {
							if (!step) step = 500 / Math.abs(item._num - num);
							if (item._num > num) item._num--;
							else item._num++;
							item.innerHTML = `<span>${item._num}</span>`;
							if (item._num !== num) {
								const self = this;
								item.interval = setTimeout(() => {
									self.setNumberAnimation(num, step);
								}, step);
							}
						}
					}
				};
				ui.time4 = node.node.time;
				ui.time4.starttime = get.utc();
				ui.time4.interval = setInterval(() => {
					const num = Math.round((get.utc() - ui.time4.starttime) / 1000);
					let timeStr = "";
					if (num >= 3600) {
						let num1 = Math.floor(num / 3600);
						let num2 = Math.floor((num - num1 * 3600) / 60);
						let num3 = num - num1 * 3600 - parseInt(num2) * 60;
						num1 = num1 < 10 ? `0${num1.toString()}` : num1.toString();
						num2 = num2 < 10 ? `0${num2.toString()}` : num2.toString();
						num3 = num3 < 10 ? `0${num3.toString()}` : num3.toString();
						timeStr = `${num1}:${num2}:${num3}`;
					} else {
						let num1 = Math.floor(num / 60);
						let num2 = num - num1 * 60;
						num1 = num1 < 10 ? `0${num1.toString()}` : num1.toString();
						num2 = num2 < 10 ? `0${num2.toString()}` : num2.toString();
						timeStr = `${num1}:${num2}`;
					}
					ui.time4.innerHTML = `<span>${timeStr}</span>`;
				}, 1000);
				game.addVideo("createCardRoundTime");
				return node;
			},
		},
		click: {
			huanfu() {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/huanfu.mp3");
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
