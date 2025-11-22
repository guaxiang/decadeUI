import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export function initPrecontentUI() {
	//函数框架
	/*进度条框架*/
	game.Jindutiaoplayer = function () {
		// 清理之前的定时器和元素
		_clearPreviousTimers();
		_removePreviousElement();
		// 创建进度条容器
		const boxContent = _createProgressContainer();
		// 根据配置选择样式
		const styleConfig = _getStyleConfig();
		_applyStyle(boxContent, styleConfig);
		// 创建进度条元素
		const progressElements = _createProgressElements(styleConfig);
		_appendProgressElements(boxContent, progressElements);
		// 添加到页面
		document.body.appendChild(boxContent);
		// 启动主定时器
		_startMainTimer(progressElements.boxTime, boxContent);
		// 启动特殊定时器（如果需要）
		if (window.jindutiaoTeshu === true) {
			_startSpecialTimer(progressElements.boxTime2, progressElements.imgBg3);
		}
		// 辅助函数
		function _clearPreviousTimers() {
			if (window.timer) {
				clearInterval(window.timer);
				delete window.timer;
			}
			if (window.timer2) {
				clearInterval(window.timer2);
				delete window.timer2;
			}
		}
		function _removePreviousElement() {
			const existingElement = document.getElementById("jindutiaopl");
			existingElement?.remove();
		}
		function _createProgressContainer() {
			const container = document.createElement("div");
			container.id = "jindutiaopl";
			return container;
		}
		function _getStyleConfig() {
			const styleType = lib.config.extension_十周年UI_jindutiaoYangshi;
			const configs = {
				1: {
					name: "手杀进度条样式",
					container: {
						backgroundColor: "rgba(0,0,0,0.4)",
						width: "620px",
						height: "12.3px",
						borderRadius: "1000px",
						boxShadow: "0px 0px 9px #2e2b27 inset,0px 0px 2.1px #FFFFD5",
						overflow: "hidden",
						border: "1.2px solid #000000",
						position: "fixed",
						left: "calc(50% - 300px)",
						bottom: parseFloat(lib.config["extension_十周年UI_jindutiaoSet"]) + "%",
					},
					progressBar: {
						data: 620,
						style: "background-image: linear-gradient(#fccc54 15%, #d01424 30%, #cc6953 90%);height:12.8px;",
					},
					clearSpecial: true,
				},
				2: {
					name: "十周年PC端进度条样式",
					container: {
						width: "400px",
						height: "24px",
						display: "block",
						left: "calc(50% - 197px)",
						position: "fixed",
						bottom: parseFloat(lib.config["extension_十周年UI_jindutiaoSet"]) + "%",
					},
					progressBar: {
						data: 300,
						style: "width:280px;height:4.3px;margin:14px 0 0 85px;background-color: #E2E20A;border-right:5px solid #FFF;position: absolute;top: -3.5px;",
					},
					backgroundImage: {
						src: "extension/十周年UI/shoushaUI/lbtn/images/uibutton/jindutiao.png",
						style: "--w:400px;--h:calc(var(--w)*44/759);width: var(--w);height:var(--h);position: absolute;top: 0;",
					},
					clearSpecial: true,
				},
				3: {
					name: "十周年客户端进度条样式",
					container: {
						width: "400px",
						height: "13px",
						display: "block",
						boxShadow: "0 0 4px #000000",
						margin: "0 0 !important",
						position: "fixed",
						left: "calc(50% - 197px)",
						bottom: parseFloat(lib.config["extension_十周年UI_jindutiaoSet"]) + "%",
					},
					progressBar: {
						data: 395,
						style: "z-index:1;width:399px;height:8px;margin:0 0 0 1px;background-color: #F4C336;border-top:3px solid #EBE1A7;border-bottom:2px solid #73640D;border-left:1px solid #73640D;position: absolute;top: 0px;border-radius:3px;",
					},
					secondaryBar: {
						data: 395,
						style: "width:399px;height:0.1px;margin:0 0 0 0.5px;background-color: #fff; opacity:0.8 ;border-top:1px solid #FFF;border-bottom:1px solid #FFF;border-left:1px solid #FFF;position: absolute;top: 17px;border-radius: 2px;",
					},
					backgroundImages: [
						{
							src: "extension/十周年UI/shoushaUI/lbtn/images/uibutton/jindutiao2.1.png",
							style: "width: 400px;height:4px;position: absolute;top: 16px;z-index: -1;",
						},
						{
							src: "extension/十周年UI/shoushaUI/lbtn/images/uibutton/jindutiao2.png",
							style: "width: 400px;height:13px;position: absolute;top: 0;opacity:0;",
						},
						{
							src: "extension/十周年UI/shoushaUI/lbtn/images/uibutton/jindutiao2.1.png",
							style: "width: 400px;height:14px;position: absolute;top: 0;z-index: -1;",
						},
					],
					setSpecial: true,
				},
				4: {
					name: "新样式",
					container: {
						width: "450px",
						height: "13px",
						display: "block",
						margin: "0 0 !important",
						position: "fixed",
						left: "calc(50% - 220px)",
						bottom: parseFloat(lib.config["extension_十周年UI_jindutiaoSet"]) + "%",
						backgroundColor: "#4B3621",
						borderRadius: "6px",
					},
					progressBar: {
						data: 449,
						style: "z-index:1;width:449px;height:12px;margin:0 0 0 0px;background-color:rgb(230, 151, 91);position: absolute;top: 1px;border-radius:6px;",
					},
					clearSpecial: true,
				},
			};
			return configs[styleType] ?? configs[1];
		}
		function _applyStyle(container, config) {
			if (config.clearSpecial && window.jindutiaoTeshu) {
				delete window.jindutiaoTeshu;
			}
			if (config.setSpecial && !window.jindutiaoTeshu) {
				window.jindutiaoTeshu = true;
			}
			Object.keys(config.container).forEach(key => {
				container.style[key] = config.container[key];
			});
		}
		function _createProgressElements(config) {
			const elements = {};
			elements.boxTime = document.createElement("div");
			elements.boxTime.data = config.progressBar.data;
			elements.boxTime.style.cssText = config.progressBar.style;
			if (config.secondaryBar) {
				elements.boxTime2 = document.createElement("div");
				elements.boxTime2.data = config.secondaryBar.data;
				elements.boxTime2.style.cssText = config.secondaryBar.style;
			}
			if (config.backgroundImage) {
				elements.imgBg = _createImageElement(config.backgroundImage);
			}
			if (config.backgroundImages) {
				elements.backgroundImages = config.backgroundImages.map((imgConfig, index) => {
					const img = _createImageElement(imgConfig);
					if (index === 0) elements.imgBg3 = img; // 为特殊定时器保存引用
					return img;
				});
			}
			return elements;
		}
		function _createImageElement(imgConfig) {
			const img = document.createElement("img");
			img.src = `${lib.assetURL}${imgConfig.src}`;
			img.style.cssText = imgConfig.style;
			return img;
		}
		function _appendProgressElements(container, elements) {
			// 添加主进度条
			container.appendChild(elements.boxTime);
			// 添加次要进度条
			if (elements.boxTime2) {
				container.appendChild(elements.boxTime2);
			}
			// 添加单个背景图片
			if (elements.imgBg) {
				container.appendChild(elements.imgBg);
			}
			// 添加多个背景图片
			if (elements.backgroundImages) {
				elements.backgroundImages.forEach(img => {
					container.appendChild(img);
				});
			}
		}
		function _startMainTimer(progressBar, container) {
			window.timer = setInterval(() => {
				progressBar.style.width = `${progressBar.data}px`;
				// 剩余三分之一变红色
				if (progressBar.data <= 395 / 3) {
					progressBar.style.backgroundColor = "rgba(230, 56, 65, 0.88)";
				} else {
					progressBar.style.backgroundColor = "rgb(230, 151, 91)";
				}
				progressBar.data--;
				if (progressBar.data === 0) {
					clearInterval(window.timer);
					delete window.timer;
					container.remove();
					if (lib.config.extension_十周年UI_jindutiaotuoguan === true && _status.auto === false) {
						ui.click.auto();
					}
				}
			}, parseFloat(lib.config.extension_十周年UI_jindutiaoST));
		}
		function _startSpecialTimer(secondaryBar, backgroundImg) {
			window.timer2 = setInterval(() => {
				secondaryBar.data--;
				secondaryBar.style.width = `${secondaryBar.data}px`;
				if (secondaryBar.data === 0) {
					clearInterval(window.timer2);
					delete window.timer2;
					delete window.jindutiaoTeshu;
					secondaryBar.remove();
					backgroundImg.remove();
				}
			}, parseFloat(lib.config.extension_十周年UI_jindutiaoST) / 2);
		}
	};
	//-----AI进度条框架----//
	game.JindutiaoAIplayer = function () {
		// 清理已有定时器和进度条
		if (window.timerai) {
			clearInterval(window.timerai);
			delete window.timerai;
		}
		const oldBar = document.getElementById("jindutiaoAI");
		oldBar?.remove();
		// 创建进度条容器和时间条
		window.boxContentAI = document.createElement("div");
		const boxTimeAI = document.createElement("div");
		boxContentAI.id = "jindutiaoAI";
		const style = lib.config.extension_十周年UI_newDecadeStyle;
		const isShousha = style !== "on" && style !== "othersOff";
		// 样式与图片路径
		if (isShousha) {
			boxContentAI.style.cssText = "display:block;position:absolute;z-index:90;--w:122px;--h:calc(var(--w)*4/145);width:var(--w);height:var(--h);left:3.5px;bottom:-6.2px;";
			boxTimeAI.data = 125;
			boxTimeAI.style.cssText = "z-index:92;--w:33px;--h:calc(var(--w)*4/120);width:var(--w);height:var(--h);margin:1px;background-color:#dd9900;position:absolute;top:0px;";
		} else {
			boxContentAI.style.cssText = "display:block;position:absolute;z-index:90;--w:122px;--h:calc(var(--w)*8/162);width:var(--w);height:var(--h);left:1.5px;bottom:-14px;";
			boxTimeAI.data = 120;
			boxTimeAI.style.cssText = "z-index:91;width:115px;height:3.3px;margin:1px;background-color:#f2c84b;position:absolute;top:0px;border-radius:3px;";
		}
		boxContentAI.appendChild(boxTimeAI);
		// 背景图片
		const imgBg = document.createElement("img");
		const timeImagePath = isShousha
			? "extension/十周年UI/shoushaUI/lbtn/images/uibutton/time.png"
			: "extension/十周年UI/shoushaUI/lbtn/images/uibutton/timeX.png";
		imgBg.src = `${lib.assetURL}${timeImagePath}`;
		imgBg.style.cssText = isShousha
			? "position:absolute;z-index:91;--w:122px;--h:calc(var(--w)*4/145);width:var(--w);height:var(--h);top:0;"
			: "position:absolute;z-index:90;--w:122px;--h:calc(var(--w)*8/162);width:var(--w);height:var(--h);top:0;";
		boxContentAI.appendChild(imgBg);
		// 添加到页面
		document.body.appendChild(boxContentAI);
		// 进度条动画
		window.timerai = setInterval(() => {
			boxTimeAI.data--;
			boxTimeAI.style.width = `${boxTimeAI.data}px`;
			if (boxTimeAI.data === 0) {
				clearInterval(window.timerai);
				delete window.timerai;
				boxContentAI.remove();
			}
		}, 150);
	};
	//阶段提示框架（俺杀）
	//自定义播放图片
	game.as_removeText = function () {
		if (_status.as_showText) {
			_status.as_showText.remove();
			delete _status.as_showText;
		}
		if (_status.as_showImage) {
			_status.as_showImage.show();
		}
	};
	game.as_showText = function (str, pos, time, font, size, color) {
		if (!str) return false;
		const defaultPos = [0, 0, 100, 100];
		pos = Array.isArray(pos) ? pos : defaultPos;
		time = (time === true || (typeof time === "number" && !isNaN(time))) ? time : 3;
		font = font ?? "shousha";
		size = size ?? 16;
		color = color ?? "#ffffff";
		if (_status.as_showText) {
			_status.as_showText.remove();
			delete _status.as_showText;
		}
		const div = ui.create.div("", str, ui.window);
		div.style.cssText = `z-index:-3; pointer-events:none; font-family:${font}; font-size:${size}px; color:${color}; line-height:${size * 1.2}px; text-align:center; left:${pos[0] + pos[2] / 2}%; top:${pos[1]}%; width:0%; height:${pos[3]}%; position:absolute; transition-property:all; transition-duration:1s`;
		_status.as_showText = div;
		if (_status.as_showImage) {
			_status.as_showImage.hide();
		}
		setTimeout(() => {
			div.style.left = `${pos[0]}%`;
			div.style.width = `${pos[2]}%`;
		}, 1);
		if (time === true) return true;
		setTimeout(() => {
			if (_status.as_showText) {
				_status.as_showText.remove();
				delete _status.as_showText;
			}
			if (_status.as_showImage) {
				_status.as_showImage.show();
			}
		}, time * 1000);
		return true;
	};
	game.as_removeImage = function () {
		if (_status.as_showImage) {
			const outdiv = _status.as_showImage;
			_status.as_showImage.style.animation = "left-to-right-out 1s";
			delete _status.as_showImage;
			setTimeout(() => {
				outdiv.remove();
			}, 1000);
		}
	};
	game.as_showImage = function (url, pos, time) {
		if (!url) return false;
		const defaultPos = [0, 0, 100, 100];
		pos = Array.isArray(pos) ? pos : defaultPos;
		time = (time === true || (typeof time === "number" && !isNaN(time))) ? time : 3;
		if (_status.as_showImage) {
			const outdiv = _status.as_showImage;
			_status.as_showImage.style.animation = "left-to-right-out 1s";
			delete _status.as_showImage;
			setTimeout(() => {
				outdiv.remove();
			}, 1000);
		}
		const div = ui.create.div("", "", ui.window);
		div.style.cssText = `z-index:-1; pointer-events:none; left:${pos[0]}%; top:${pos[1]}%; width:8%; height:${pos[3]}%; position:absolute; background-size:100% 100%; background-position:center center; background-image:url(${lib.assetURL}${url}); transition-property:all; transition-duration:1s`;
		_status.as_showImage = div;
		if (_status.as_showText) {
			_status.as_showImage.hide();
		}
		if (time === true) return true;
		setTimeout(() => {
			if (_status.as_showImage) {
				_status.as_showImage.remove();
				delete _status.as_showImage;
			}
		}, time * 1000);
		return true;
	};
}

