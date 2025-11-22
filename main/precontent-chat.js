import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export function initPrecontentChat() {
	// 聊天模块 --凌梦改 
	// 别问荷花，烟花，灯笼，雪球投掷物为什么对应不上不了，因为本体没有，需要自己添加
	if (!window.chatRecord) window.chatRecord = [];

	// 获取当前玩家的辅助函数
	const getCurrentPlayer = () => {
		if (game.me) return game.me;
		if (game.connectPlayers) {
			if (game.online) {
				return game.connectPlayers.find(p => p.playerid === game.onlineID);
			}
			return game.connectPlayers[0];
		}
		return null;
	};

	game.addChatWord = function (strx) {
		const MAX_RECORDS = 50;
		if (window.chatRecord.length > MAX_RECORDS) {
			//设置一下上限50条，不设也行，把这个if删除即可
			window.chatRecord.shift();
		}
		if (strx) {
			window.chatRecord.push(strx);
		}
		const str = window.chatRecord.map(record => `<br>${record}<br>`).join("");
		if (window.chatBackground2 !== undefined) game.updateChatWord(str);
	};
	game.showChatWordBackgroundX = function () {
		// 控制面板显示/隐藏逻辑
		if (window.chatBg?.show) {
			window.chatBg.hide();
			// 关闭所有投掷物品
			const throwItems = ["jidan", "tuoxie", "xianhua", "meijiu", "cailan", "qicai", "xiaojiu", "xueqiu", "xuwu"];
			throwItems.forEach(item => {
				if (window[item]?.thrownn) window[item].thrownn = false;
			});
			window.chatBg.show = false;
			// 隐藏所有对话框
			const dialogs = [
				{ name: "dialog_lifesay", style: "left", value: `-${window.dialog_lifesay?.style.width}` },
				{ name: "dialog_emoji", style: "top", value: "100%" },
				{ name: "chatBackground", style: "left", value: "100%" },
				{ name: "dialog_emotion", style: "bottom", value: "100%" }
			];
			dialogs.forEach(dialog => {
				const dialogElement = window[dialog.name];
				if (dialogElement) {
					if (dialogElement.show) {
						dialogElement.style[dialog.style] = dialog.value;
					}
					setTimeout(() => {
						dialogElement.hide();
						dialogElement.show = false;
					}, dialog.name === "dialog_lifesay" ? 100 : 1000);
				}
			});
			return;
		}
		// 创建聊天背景
		window.chatBg = ui.create.div("hidden");
		window.chatBg.classList.add("popped", "static");
		window.chatBg.show = true;
		window.chatBg.style.cssText = "display: block;--w: 450px;--h: calc(var(--w) * 300/900);width: var(--w);height: var(--h);position: fixed;left:30%;bottom:10%;opacity: 1;background-size: 100% 100%;background-color: transparent;z-index:99;";
		window.chatBg.style.transition = "all 0.5s";
		window.chatBg.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/chat.png");
		ui.window.appendChild(window.chatBg);
		// 互动框
		game.open_hudong = function () {
			if (window.dialog_hudong != undefined && window.dialog_hudong.show) {
				window.dialog_hudong.hide();
				window.dialog_hudong.show = false;
				return;
			}
		};
		// 创建互动框
		window.hudongkuang = ui.create.div("hidden", "", game.open_hudong);
		window.hudongkuang.style.cssText = "display: block;--w: 315px;--h: calc(var(--w) * 135/142);width: var(--w);height: var(--h);left:-280px;bottom:-55px;transition:none;background-size:100% 100%;pointer-events:none;";
		window.hudongkuang.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/hudong.png");
		window.chatBg.appendChild(window.hudongkuang);
		// 点击效果函数
		const clickFK = (div) => {
			div.style.transition = "opacity 0.5s";
			const eventType = lib.config.touchscreen ? "touchstart" : "mousedown";
			const endEventType = lib.config.touchscreen ? "touchend" : "mouseup";

			div.addEventListener(eventType, () => {
				div.style.transform = "scale(0.95)";
			});

			div.addEventListener(endEventType, () => {
				div.style.transform = "";
			});

			div.onmouseout = () => {
				div.style.transform = "";
			};
		};
		// 常用语功能
		game.open_lifesay = function () {
			// 隐藏其他对话框
			const dialogStyleMap = {
				dialog_emoji: { prop: "top", value: "100%" },
				chatBackground: { prop: "left", value: "100%" },
				dialog_emotion: { prop: "bottom", value: "100%" }
			};
			Object.keys(dialogStyleMap).forEach(dialogName => {
				const dialog = window[dialogName];
				if (dialog) {
					const style = dialogStyleMap[dialogName];
					if (dialog.show) dialog.style[style.prop] = style.value;
					setTimeout(() => {
						dialog.hide();
						dialog.show = false;
					}, 1000);
				}
			});
			if (window.dialog_lifesay?.show) {
				window.dialog_lifesay.hide();
				window.dialog_lifesay.show = false;
				return;
			}
			// 创建常用语对话框
			window.dialog_lifesay = ui.create.div("hidden");
			window.dialog_lifesay.classList.add("popped", "static");
			window.dialog_lifesay.show = true;
			window.dialog_lifesay.style.cssText = "height: 300px; width: 600px; left: -600px; top: calc(20% - 100px); transition: all 1s; opacity: 1; border-radius: 8px; background-size: 100% 100%;";
			window.dialog_lifesay.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/nobg.png");
			window.dialog_lifesay.style.zIndex = 999999999;
			window.dialog_lifesay.style.boxShadow = "none";
			setTimeout(() => {
				window.dialog_lifesay.style.left = "calc(50% - 300px)";
			}, 100);
			ui.window.appendChild(window.dialog_lifesay);
			// 创建背景
			window.dialog_lifesayBgPict = ui.create.div("hidden");
			window.dialog_lifesayBgPict.style.cssText = "height: 100%; width: 100%; left: 0%; top: 0%; border-radius: 8px; background-size: 100% 100%;";
			window.dialog_lifesayBgPict.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/saydiv.png");
			window.dialog_lifesayBgPict.style.boxShadow = "none";
			window.dialog_lifesay.appendChild(window.dialog_lifesayBgPict);
			window.dialog_lifesayBgColor = ui.create.div("hidden");
			window.dialog_lifesayBgColor.style.cssText = "height: 70%; width: 80%; left: 10%; top: 10%; border-radius: 8px; overflow-y: scroll;";
			window.dialog_lifesayBgColor.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/nobg.png");
			window.dialog_lifesay.appendChild(window.dialog_lifesayBgColor);
			lib.setScroll(window.dialog_lifesayBgColor);
			// 技能语音 
			let skills = [];
			if (game?.me?.getSkills) {
				skills = game.me.getSkills(null, false, false).filter(skill => {
					const info = get.info(skill);
					return !info || !info.charlotte;
				});
			}
			let skillsx = [...skills];
			for (const skill of skills) {
				const info = get.info(skill);
				if (info?.derivation) {
					if (Array.isArray(info.derivation)) {
						skillsx.push(...info.derivation);
					} else {
						skillsx.push(info.derivation);
					}
				}
			}
			skillsx = [...new Set(skillsx)];
			// 处理音频路径的辅助函数
			const processAudioPath = (path) => {
				const target = "ext:";
				const isMatch = path.startsWith(target);
				const actualPath = isMatch ? `../extension/${path.slice(target.length)}` : path;
				const pathParts = actualPath.split('/');
				const directory = pathParts[pathParts.length - 2];
				const filename = pathParts[pathParts.length - 1].split('.')[0];
				return { directory, filename };
			};

			let skillIndex = 0;
			for (const name of skillsx) {
				if (!get.info(name)) continue;
				const skillAudioData = get.Audio.skill({ skill: name, player: game.me.name });
				const { textList, fileList: audioList } = skillAudioData;
				for (let i = 0; i < textList.length; i++) {
					let content = `「${get.skillTranslation(name)}」${textList[i]}`;
					content = content.replace(/~/g, ' ');
					window[`dialog_lifesayContent_${skillIndex}`] = ui.create.div("hidden", "", function () {
						const player = getCurrentPlayer();
						if (!player) return;
						const { directory, filename } = processAudioPath(this.audioPath);
						const combinedMessage = `/playAudio ${directory} ${filename} ${this.content}`;
						if (game.online) {
							game.send("chat", game.onlineID, combinedMessage);
						} else {
							player.chat(combinedMessage);
						}
						window.dialog_lifesay.delete();
						delete window.dialog_lifesay;
						window.dialog_lifesay = undefined;
					});
					const contentDiv = window[`dialog_lifesayContent_${skillIndex}`];
					contentDiv.style.cssText = "height: 10%; width: 100%; left: 0%; top: 0%; position: relative;";
					contentDiv.pos = skillIndex;
					contentDiv.content = content;
					contentDiv.audioPath = audioList[i];
					contentDiv.innerHTML = `<font color=white>${content}</font>`;
					window.dialog_lifesayBgColor.appendChild(contentDiv);
					clickFK(contentDiv);
					skillIndex++;
				}
			}
			// 处理阵亡语音
			if (game.me?.name) {
				const dieAudioData = get.Audio.die({ player: game.me.name });
				const { textList: dieTextList, fileList: dieAudioList } = dieAudioData;
				for (let i = 0; i < dieTextList.length; i++) {
					let content = `「阵亡」${dieTextList[i]}`;
					content = content.replace(/~/g, ' ');
					window[`dialog_lifesayContent_${skillIndex}`] = ui.create.div("hidden", "", function () {
						const player = getCurrentPlayer();
						if (!player) return;
						const { directory, filename } = processAudioPath(this.audioPath);
						const combinedMessage = `/playAudio ${directory} ${filename} ${this.content}`;
						if (game.online) {
							game.send("chat", game.onlineID, combinedMessage);
						} else {
							player.chat(combinedMessage);
						}
						window.dialog_lifesay.delete();
						delete window.dialog_lifesay;
						window.dialog_lifesay = undefined;
					});
					const contentDiv = window[`dialog_lifesayContent_${skillIndex}`];
					contentDiv.style.cssText = "height: 10%; width: 100%; left: 0%; top: 0%; position: relative;";
					contentDiv.pos = skillIndex;
					contentDiv.content = content;
					contentDiv.audioPath = dieAudioList[i];
					contentDiv.innerHTML = `<font color=white>${content}</font>`;
					window.dialog_lifesayBgColor.appendChild(contentDiv);
					clickFK(contentDiv);
					skillIndex++;
				}
			}

			// 快捷语音 
			lib.quickVoice.forEach((voice, i) => {
				window[`dialog_lifesayContent_${skillIndex + i}`] = ui.create.div("hidden", "", function () {
					const player = getCurrentPlayer();
					if (!player) return;
					const str = this.content;
					if (game.online) {
						game.send("chat", game.onlineID, str);
					} else {
						player.chat(str);
					}
					window.dialog_lifesay.delete();
					delete window.dialog_lifesay;
					window.dialog_lifesay = undefined;
				});
				const contentDiv = window[`dialog_lifesayContent_${skillIndex + i}`];
				contentDiv.style.cssText = "height: 10%; width: 100%; left: 0%; top: 0%; position: relative;";
				contentDiv.pos = skillIndex + i;
				contentDiv.content = voice;
				contentDiv.innerHTML = `<font color=white>${voice}</font>`;
				window.dialog_lifesayBgColor.appendChild(contentDiv);
				clickFK(contentDiv);
			});
		};
		// 常用语按钮
		window.chatButton1 = ui.create.div("hidden", "", game.open_lifesay);
		window.chatButton1.style.cssText = "display: block;--w: 75px;--h: calc(var(--w) * 82/98);width: var(--w);height: var(--h);left:30px;bottom:15px;transition:none;background-size:100% 100%";
		window.chatButton1.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/lifesay.png");
		lib.setScroll(window.chatButton1);
		window.chatBg.appendChild(window.chatButton1);
		clickFK(window.chatButton1);
		// 互动道具创建函数
		const createThrowItem = (name, config) => {
			const { left, bottom, image, label, emotionType } = config;
			game[`open_${name}`] = function () {
				game.players.forEach(player => {
					player.onclick = function () {
						if (window[name].thrownn === true) {
							if (game.online) {
								game.send("throwEmotion", this, emotionType);
							} else {
								game.me.throwEmotion(this, emotionType);
							}
							window.shuliang.innerText = parseInt(window.shuliang.innerText) - 1;
						}
					};
				});
			};
			window[name] = ui.create.div("hidden", "", game[`open_${name}`]);
			window[name].style.cssText = `display: block;--w: 63px;--h: calc(var(--w) * 50/50);width: var(--w);height: var(--h);left:${left};bottom:${bottom};transition:none;background-size:100% 100%`;
			window[name].setBackgroundImage(`extension/十周年UI/shoushaUI/sayplay/${image}.png`);
			const labelDiv = document.createElement("div");
			labelDiv.textContent = label;
			labelDiv.style.cssText = `position: absolute;bottom: 1px; left: 0;right: 0;text-align: center; color:rgba(255, 220, 0, 0.7); font-size: 12px; font-family: "shousha";`;
			window[name].appendChild(labelDiv);
			window[name].onclick = function () {
				window[name].thrownn = true;
			};
			window.chatBg.appendChild(window[name]);
			lib.setScroll(window[name]);
			clickFK(window[name]);
		};
		// 创建所有互动道具
		const throwItems = [
			{ name: "meijiu", left: "-155px", bottom: "150px", image: "meijiu", label: "酒杯", emotionType: "wine" },
			{ name: "xianhua", left: "-230px", bottom: "150px", image: "xianhua", label: "鲜花", emotionType: "flower" },
			{ name: "tuoxie", left: "-155px", bottom: "82px", image: "tuoxie", label: "拖鞋", emotionType: "shoe" },
			{ name: "jidan", left: "-230px", bottom: "82px", image: "jidan", label: "鸡蛋", emotionType: "egg" },
			{ name: "cailan", left: "-80px", bottom: "150px", image: "cailan", label: "荷花", emotionType: "flower" },//"hehua"
			{ name: "qicai", left: "-155px", bottom: "13px", image: "qicai", label: "烟花", emotionType: "flower" },//"yanhua"
			{ name: "xiaojiu", left: "-230px", bottom: "13px", image: "xiaojiu", label: "灯笼", emotionType: "wine" },//"denglong"
			{ name: "xueqiu", left: "-80px", bottom: "82px", image: "xueqiu", label: "雪球", emotionType: "wine" }//"snow"
		];
		throwItems.forEach(item => createThrowItem(item.name, item));
		// 特殊处理
		game.open_xuwu = function () {
			const num = 10;
			game.players.forEach(player => {
				player.onclick = function () {
					if (window.xuwu.thrownn === true) {
						for (let i = 0; i < num; i++) {
							setTimeout(() => {
								const emotionType = i <= 8 ? "egg" : "shoe";
								if (game.online) {
									game.send("throwEmotion", this, emotionType);
								} else {
									game.me.throwEmotion(this, emotionType);
								}
								window.shuliang.innerText = parseInt(window.shuliang.innerText) - 1;
							}, 100 * i);
						}
					}
				};
			});
		};
		window.xuwu = ui.create.div("hidden", "", game.open_xuwu);
		window.xuwu.style.cssText = "display: block;--w: 63px;--h: calc(var(--w) * 50/50);width: var(--w);height: var(--h);left:-80px;bottom:13px;transition:none;background-size:100% 100%";
		window.xuwu.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/xuwu.png");
		const xuwuLabel = document.createElement("div");
		xuwuLabel.textContent = "鸡蛋风暴";
		xuwuLabel.style.cssText = "position: absolute;bottom: 1px; left: 0;right: 0;text-align: center; color:rgba(255, 220, 0, 0.7); font-size: 12px; font-family: 'shousha';";
		window.xuwu.appendChild(xuwuLabel);
		window.xuwu.onclick = function () {
			window.xuwu.thrownn = true;
		};
		window.chatBg.appendChild(window.xuwu);
		lib.setScroll(window.xuwu);
		clickFK(window.xuwu);
		// 菜篮子
		window.cailanzi = ui.create.div("hidden", "");
		window.cailanzi.style.cssText = "display: block;--w: 100px;--h: calc(var(--w) * 59/150);width: var(--w);height: var(--h);left:-230px;bottom:225px;transition:none;background-size:100% 100%";
		window.cailanzi.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/cailanzi.png");
		window.chatBg.appendChild(window.cailanzi);
		window.shuliang = ui.create.node("div");
		window.shuliang.innerText = Math.floor(Math.random() * (999 - 100 + 1) + 100);
		window.shuliang.style.cssText = "display: block;left:-180px;bottom:235px;font-family:'shousha';color:#97856a;font-weight: 900; text-shadow:none;transition:none;background-size:100% 100%";
		window.chatBg.appendChild(window.shuliang);
		// 表情功能 
		game.open_emoji = function () {
			// 隐藏其他对话框
			["dialog_lifesay", "chatBackground", "dialog_emotion"].forEach(dialog => {
				if (window[dialog]) {
					if (window[dialog].show) {
						const styleProp = dialog === "dialog_emotion" ? "bottom" : "left";
						const styleValue = dialog === "dialog_emotion" ? "100%" : dialog === "dialog_lifesay" ? `-${window.dialog_lifesay?.style.width}` : "100%";
						window[dialog].style[styleProp] = styleValue;
					}
					setTimeout(() => {
						window[dialog].hide();
						window[dialog].show = false;
					}, 1000);
				}
			});
			if (window.dialog_emoji != undefined && window.dialog_emoji.show) {
				window.dialog_emoji.hide();
				window.dialog_emoji.show = false;
				return;
			}
			// 创建表情对话框
			window.dialog_emoji = ui.create.div("hidden");
			window.dialog_emoji.classList.add("popped", "static");
			window.dialog_emoji.show = true;
			window.dialog_emoji.style.cssText = "height: 330px; width: 600px; left: calc(50% - 300px); top: 100%; transition: all 1s; opacity: 1; border-radius: 8px; background-size: 100% 100%;";
			window.dialog_emoji.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/nobg.png");
			window.dialog_emoji.style.zIndex = 999999999;
			window.dialog_emoji.style.boxShadow = "none";
			setTimeout(() => {
				window.dialog_emoji.style.top = "calc(25% - 125px)";
			}, 100);
			ui.window.appendChild(window.dialog_emoji);
			// 创建背景
			window.dialog_emojiBgPict = ui.create.div("hidden");
			window.dialog_emojiBgPict.style.cssText = "height: 100%; width: 100%; left: 0%; top: 0%; border-radius: 8px; background-size: 100% 100%;";
			window.dialog_emojiBgPict.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/saydiv.png");
			window.dialog_emojiBgPict.style.boxShadow = "none";
			window.dialog_emoji.appendChild(window.dialog_emojiBgPict);
			window.dialog_emojiBgColor = ui.create.div("hidden");
			window.dialog_emojiBgColor.style.cssText = "height: 70%; width: 80%; left: 10%; top: 10%; border-radius: 8px; overflow-y: scroll;";
			window.dialog_emojiBgColor.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/nobg.png");
			window.dialog_emoji.appendChild(window.dialog_emojiBgColor);
			lib.setScroll(window.dialog_emojiBgColor);
			let emotionIndex = 0;
			// 创建第一级菜单 - 表情包选择
			for (const pack in lib.emotionList) {
				window[`dialog_emojiPack_${pack}`] = ui.create.div("hidden", "", function () {
					for (const p in lib.emotionList) {
						window[`dialog_emojiPack_${p}`].style.display = "none";
					}
					for (let i = 0; i < emotionIndex; i++) {
						const content = window[`dialog_emojiContent_${i}`];
						if (content.packName === this.packName) {
							content.style.display = "";
						} else {
							content.style.display = "none";
						}
					}
				});

				window[`dialog_emojiPack_${pack}`].style.cssText = "height: 70px; width: 70px; margin: 0 5px 5px 0; display: inline-block; left: 15px; top: 0px; position: relative; background-size: 100% 100%;";
				window[`dialog_emojiPack_${pack}`].packName = pack;
				window[`dialog_emojiPack_${pack}`].setBackgroundImage(`image/emotion/${pack}/1.gif`);
				window.dialog_emojiBgColor.appendChild(window[`dialog_emojiPack_${pack}`]);
				clickFK(window[`dialog_emojiPack_${pack}`]);
			}
			// 创建第二级菜单 - 具体表情 
			for (const pack in lib.emotionList) {
				const count = lib.emotionList[pack];
				for (let i = 1; i <= count; i++) {
					window[`dialog_emojiContent_${emotionIndex}`] = ui.create.div("hidden", "", function () {
						for (const p in lib.emotionList) {
							window[`dialog_emojiPack_${p}`].style.display = "";
						}
						for (let j = 0; j < emotionIndex; j++) {
							window[`dialog_emojiContent_${j}`].style.display = "none";
						}
						let player = game.me;
						const emotionsize = lib.config.extension_星之梦_emotionsize || 50;
						const str = `<img src="${lib.assetURL}image/emotion/${this.packName}/${this.emotionNum}.gif" width="${parseInt(emotionsize)}" height="${parseInt(emotionsize)}">`;
						if (!player) {
							if (game.connectPlayers) {
								if (game.online) {
									player = game.connectPlayers.find(p => p.playerid === game.onlineID);
								} else {
									player = game.connectPlayers[0];
								}
							}
						}
						if (!player) return;
						if (game.online) {
							game.send("chat", game.onlineID, str);
						} else {
							player.chat(str);
						}
						window.dialog_emoji.delete();
						delete window.dialog_emoji;
						window.dialog_emoji = undefined;
					});
					window[`dialog_emojiContent_${emotionIndex}`].style.cssText = "height: 70px; width: 70px; margin: 0 5px 5px 0; display: inline-block; left: 15px; top: 0px; position: relative; background-size: 100% 100%; display: none;";
					window[`dialog_emojiContent_${emotionIndex}`].packName = pack;
					window[`dialog_emojiContent_${emotionIndex}`].emotionNum = i;
					window[`dialog_emojiContent_${emotionIndex}`].setBackgroundImage(`image/emotion/${pack}/${i}.gif`);

					window.dialog_emojiBgColor.appendChild(window[`dialog_emojiContent_${emotionIndex}`]);
					clickFK(window[`dialog_emojiContent_${emotionIndex}`]);
					emotionIndex++;
				}
			}
		};
		// 表情按钮
		window.chatButton2 = ui.create.div("hidden", "", game.open_emoji);
		window.chatButton2.style.cssText = "display: block;--w: 75px;--h: calc(var(--w) * 82/98);width: var(--w);height: var(--h);left:120px;bottom:15px;transition:none;background-size:100% 100%";
		window.chatButton2.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/emoji.png");
		lib.setScroll(window.chatButton2);
		window.chatBg.appendChild(window.chatButton2);
		clickFK(window.chatButton2);
		// 记录按钮
		game.open_jilu = function () {
			game.showChatWord();
		};
		window.chatButton3 = ui.create.div("hidden", "", game.open_jilu);
		window.chatButton3.style.cssText = "display: block;--w: 75px;--h: calc(var(--w) * 82/98);width: var(--w);height: var(--h);left:210px;bottom:15px;transition:none;background-size:100% 100%";
		window.chatButton3.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/jilu.png");
		lib.setScroll(window.chatButton3);
		window.chatBg.appendChild(window.chatButton3);
		clickFK(window.chatButton3);
		// 发送按钮 
		window.chatSendBottom = ui.create.div("", "", function () {
			if (!window.input) return;
			if (window.input.value == undefined) return;
			window.sendInfo(window.input.value);
		});
		window.chatSendBottom.style.cssText = "display: block;--w: 100px;--h: calc(var(--w) * 62/160);width: var(--w);height: var(--h);left:72%;top:16%;transition:none;background-size:100% 100%;text-align:center;border-randius:8px;";
		window.chatSendBottom.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/buttonsend.png");
		window.chatSendBottom.innerHTML = '<span style="color:#e6e6e6;font-size:23px;line-height:38px;font-weight:400;font-family:shousha">发送</span>';
		window.chatBg.appendChild(window.chatSendBottom);
		clickFK(window.chatSendBottom);
		// 更新聊天文字
		game.updateChatWord = function (str) {
			window.chatBackground2.innerHTML = str;
		};
		game.addChatWord();
		// 发送信息函数 
		window.sendInfo = function (content) {
			const player = getCurrentPlayer();
			if (!player) return;
			const str = content;
			if (game.online) {
				game.send("chat", game.onlineID, str);
			} else {
				player.chat(str);
			}
			window.input.value = "";
		};
		// 输入框背景
		window.chatInputOut = ui.create.div("hidden");
		window.chatInputOut.style.cssText = "display: block;--w: 275px;--h: calc(var(--w) * 50/320);width: var(--w);height: var(--h);left:8%;top:14%;transition:none;background-size:100% 100%;pointer-events:none;z-index:6;";
		window.chatInputOut.style.backgroundImage = `url('${lib.assetURL}extension/十周年UI/shoushaUI/sayplay/sayX.png')`;
		window.chatBg.appendChild(window.chatInputOut);
		// 输入框
		window.chatInput = ui.create.dialog("hidden");
		window.chatInput.style.cssText = "height: 24px; width: 44%; left: 24.2%; top: 31px; transition: none;";
		window.chatBg.appendChild(window.chatInput);
		window.ipt = ui.create.div();
		window.ipt.style.cssText = "height: 24px; width: 100%; top: 0px; left: 0px; margin: 0px; border-radius: 0px; background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4));";
		if (window.input && window.input.value) window.input_value = window.input.value;
		window.ipt.innerHTML = `<input type="text" value="${window.input_value || "请输入文字"}" style="color:white;font-family:shousha;width:calc(100% - 10px);text-align:left;"></input>`;
		window.input = window.ipt.querySelector("input");
		window.input.style.backgroundImage = `url('${lib.assetURL}extension/十周年UI/shoushaUI/sayplay/say.png')`;
		window.input.style.backgroundSize = "120% 120%";
		window.input.style.boxShadow = "none";
		window.input.onclick = (e) => {
			e.stopPropagation();
		};
		window.input.onfocus = function () {
			if (this.value === "请输入文字") this.value = "";
		};
		window.input.onkeydown = (e) => {
			e.stopPropagation();
			if (e.keyCode === 13 || e.key === "Enter") {
				const value = String(e.target.value ?? "");
				if (!value) return;
				window.sendInfo(value);
			}
		};
		window.chatInput.add(window.ipt);
	};
	// 聊天记录功能
	game.showChatWord = function () {
		// 隐藏其他对话框
		["dialog_lifesay", "dialog_emoji", "dialog_emotion"].forEach(dialog => {
			if (window[dialog]) {
				if (window[dialog].show) {
					const styleProp = dialog === "dialog_emotion" ? "bottom" : dialog === "dialog_emoji" ? "top" : "left";
					const styleValue = dialog === "dialog_emotion" ? "100%" : dialog === "dialog_emoji" ? "100%" : `-${window.dialog_lifesay?.style.width}`;
					window[dialog].style[styleProp] = styleValue;
				}
				setTimeout(() => {
					window[dialog].hide();
					window[dialog].show = false;
				}, 1000);
			}
		});
		if (window.chatBackground != undefined && window.chatBackground.show) {
			window.chatBackground.hide();
			window.chatBackground.show = false;
			return;
		}
		// 创建聊天记录背景
		window.chatBackground = ui.create.div("hidden");
		window.chatBackground.classList.add("static");
		window.chatBackground.show = true;
		window.chatBackground.style.cssText = `transition: all 1s; height: 330px; width: 600px; top: calc(20% - 100px); left: 100%; bottom: calc(${window.chatBg ? window.chatBg.style.height : "0"} + 5px); opacity: 1; border-radius: 10px; background-size: 100% 100%;`;
		window.chatBackground.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/nobg.png");
		window.chatBackground.style.zIndex = 999999999;
		window.chatBackground.style.boxShadow = "none";
		setTimeout(() => {
			window.chatBackground.style.left = "calc(50% - 300px)";
		}, 100);
		// 鼠标悬停效果
		game.mouseChatDiv = function (div) {
			if (lib.device === undefined) {
				div.onmouseover = function () {
					this.style.opacity = 1.0;
				};
				div.onmouseout = function () {
					this.style.opacity = 0.25;
				};
			} else {
				div.onclick = function () {
					if (div.style.opacity === "0.25") this.style.opacity = 0.75;
					else this.style.opacity = 0.25;
				};
			}
		};
		game.mouseChatDiv(window.chatBackground);
		ui.window.appendChild(window.chatBackground);
		// 创建背景
		window.chatBackgroundPict = ui.create.div("hidden");
		window.chatBackgroundPict.style.cssText = "height: 100%; width: 100%; left: 0%; bottom: 0%; transition: none; border-radius: 8px; background-size: 100% 100%;";
		window.chatBackgroundPict.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/saydiv.png");
		window.chatBackgroundPict.style.boxShadow = "none";
		window.chatBackground.appendChild(window.chatBackgroundPict);
		window.chatBackgroundColor = ui.create.div("hidden");
		window.chatBackgroundColor.style.cssText = "height: 70%; width: 80%; left: 10%; top: 10%; transition: none; border-radius: 8px; background-size: 100% 100%;";
		window.chatBackgroundColor.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/nobg.png");
		window.chatBackground.appendChild(window.chatBackgroundColor);
		window.chatBackground2 = ui.create.div("hidden");
		window.chatBackground2.style.cssText = "height: 100%; width: 100%; left: 0%; bottom: 0%; transition: none; text-align: left; overflow-y: scroll;";
		window.chatBackground2.innerHTML = "";
		lib.setScroll(window.chatBackground2);
		window.chatBackgroundColor.appendChild(window.chatBackground2);
		game.addChatWord();
	};
	lib.skill._wmkzSayChange = {
		trigger: {
			global: ["gameStart", "phaseBegin", "phaseAfter", "useCardAfter"],
		},
		forced: true,
		silent: true,
		filter(event, player) {
			return player.change_sayFunction != true;
		},
		content() {
			player.change_sayFunction = true;
			player.sayTextWord = player.say;
			player.say = function (str) {
				game.broadcastAll(
					function (player, str) {
						/*联机兼容，与上方代码相同*/
						if (typeof game.addChatWord !== "function") {
							if (!window.chatRecord) window.chatRecord = [];
							game.addChatWord = function (strx) {
								if (window.chatRecord.length > 50) {
									//设置一下上限50条，不设也行，把这个if删除即可
									window.chatRecord.remove(window.chatRecord[0]);
								}
								if (strx) {
									window.chatRecord.push(strx);
								}
								let str = (window.chatRecord[0] || "") + "<br>";
								if (window.chatRecord.length > 1) {
									for (let i = 1; i < window.chatRecord.length; i++) {
										str += `<br>${window.chatRecord[i]}<br>`;
									}
								}
								if (window.chatBackground2 !== undefined) game.updateChatWord(str);
							};
						}
						str = str.replace(/##assetURL##/g, lib.assetURL);
						// 判断是否存在nickname，如果不存在则只显示name
						if (player.nickname) {
							//对应上面函数，把其他player的发言记录到框里
							game.addChatWord(`<font color=green>${get.translation(String(player.name))}[${player.nickname}]</font><font color=white>：${str}</font>`);
						} else {
							game.addChatWord(`<font color=green>${get.translation(String(player.name))}</font><font color=white>：${str}</font>`);
						}
					},
					player,
					str
				);
				player.sayTextWord(str);
			};
		},
	};
	// 修改本体chat函数
	lib.element.player.chat = function (str) {
		if (get.is.banWords(str)) return;
		//URC addition
		if (str[0] === "/") {
			const chat = str.slice(1);
			if (chat.includes(" ")) {
				const parts = chat.split(" ");
				const func = parts.shift();
				if (func === "playAudio" && parts.length) {
					const directory = parts.shift();
					if ((directory === "die" || directory === "skill") && parts.length) {
						const filename = parts.shift();
						game.broadcastAll(
							(dir, file) => {
								game.playAudio(dir, file);
							},
							directory,
							filename
						);
						if (parts.length) {
							str = parts.join(" ");
						} else {
							let translation = filename;
							while (translation === get.translation(translation) && translation.length) {
								translation = translation.slice(0, -1);
							}
							str = translation.length ? get.translation(translation) : filename;
						}
					}
				}
			}
		}
		//URC addition end
		this.say(str);
		game.broadcast(
			(id, message) => {
				if (lib.playerOL[id]) {
					lib.playerOL[id].say(message);
				} else if (game.connectPlayers) {
					const player = game.connectPlayers.find(p => p.playerid === id);
					if (player) {
						player.say(message);
					}
				}
			},
			this.playerid,
			str
		);
	};
}

