import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import { prefixMarkModule } from "../js/prefixMark.js";
export async function precontent() {
	if (get.mode() === "chess" || get.mode() === "tafang" || get.mode === "hs_hearthstone") return;
	if (lib.config["extension_" + decadeUIName + "_eruda"]) {
		var script = document.createElement("script");
		script.src = decadeUIPath + "js/eruda.js";
		document.body.appendChild(script);
		script.onload = function () {
			eruda.init();
		};
	}
	if (window.require && !window.fs) window.fs = require("fs");
	lib.configMenu.appearence.config.layout.visualMenu = (node, link) => {
		node.className = `button character themebutton ${lib.config.theme}`;
		node.classList.add(link);
		if (node.created) return;
		node.created = true;
		node.style.overflow = "scroll";
		const list = ["re_caocao", "re_liubei", "sp_zhangjiao", "sunquan"];
		while (list.length) {
			ui.create.div(".avatar", ui.create.div(".seat-player.fakeplayer", node)).setBackground(list.randomRemove(), "character");
		}
	};
	window.decadeModule = (function (decadeModule) {
		var version = lib.extensionPack.十周年UI.version;
		function checkVersionCompatibility() {
			const currentVersion = lib.version;
			const requiredVersion = lib.extensionPack.十周年UI.minNonameVersion;
			function compareVersions(v1, v2) {
				const parts1 = v1.split(".").map(Number);
				const parts2 = v2.split(".").map(Number);
				const maxLen = Math.max(parts1.length, parts2.length);
				for (let i = 0; i < maxLen; i++) {
					const p1 = parts1[i] || 0;
					const p2 = parts2[i] || 0;
					if (p1 > p2) return 1;
					if (p1 < p2) return -1;
				}
				return 0;
			}
			const comparison = compareVersions(currentVersion, requiredVersion);
			if (comparison === 0) return; // 版本匹配，直接返回
			// 使用表驱动法处理版本不匹配的情况
			const versionMessages = {
				[-1]: {
					title: "版本不匹配警告！",
					content: `十周年UI要求无名杀版本：${requiredVersion}\n当前无名杀版本：${currentVersion}\n\n请更新无名杀到 ${requiredVersion} 版本以确保十周年UI正常运行。`,
				},
				[1]: {
					title: "版本不匹配警告！",
					content: `当前无名杀版本：${currentVersion}\n十周年UI版本：${requiredVersion}\n\n当前十周年UI版本过低，请更新十周年UI到 ${currentVersion} 版本以确保十周年UI正常运行。`,
				},
			};
			const messageConfig = versionMessages[comparison];
			if (!messageConfig) return;
			const message = `${messageConfig.title}\n\n${messageConfig.content}\n\n点击确定继续游戏，但是所遇到的bug均不受理。`;
			setTimeout(() => {
				if (confirm(message)) {
					game.print("已确认版本不匹配，继续游戏...");
				}
			}, 1000);
		}
		checkVersionCompatibility();
		// 提前返回模式减少嵌套
		if (!ui.css.layout) return;
		if (!ui.css.layout.href || ui.css.layout.href.indexOf("long2") < 0) {
			ui.css.layout.href = lib.assetURL + "layout/long2/layout.css";
		}
		decadeModule.init = function () {
			// 基础CSS加载 - 使用动态导入确保Vite能检测到变化
			const cssFiles = ["css/extension.css", "css/decadeLayout.css", "css/card.css", "css/meihua.css"];
			cssFiles.forEach(path => this.css(decadeUIPath + path));
			const style = lib.config.extension_十周年UI_newDecadeStyle;
			const styleIndex = ["on", "off", "othersOff", "onlineUI", "babysha", "codename"].indexOf(style);
			if (style !== void 0) {
				this.css(decadeUIPath + `css/player${styleIndex + 1}.css`);
			} else {
				this.css(decadeUIPath + "css/player2.css");
			}
			const layoutCss = "css/layout.css";
			this.css(decadeUIPath + "css/equip.css");
			document.body.setAttribute("data-style", style || "on");
			this.css(decadeUIPath + layoutCss);
			// 其他条件CSS
			if (lib.config.extension_十周年UI_meanPrettify) {
				this.css(decadeUIPath + "css/menu.css");
			}
			if (lib.config["extension_十周年UI_choosecharboder"]) {
				this.css(decadeUIPath + "css/style.css");
			}
			// JS异步加载
			["js/spine.js", "js/component.js", "js/skill.js", "js/effect.js", "js/meihua.js", "js/animation.js", "js/dynamicSkin.js"].forEach(path => this.jsAsync(decadeUIPath + path));
			// 原手杀UI内容加载
			if (!lib.config.asset_version) game.saveConfig("asset_version", "无");
			const layoutPath = decadeUIPath + "shoushaUI/";
			const listmap =
				{
					on: 2,
					off: 1,
					othersOff: 3,
					onlineUI: 4,
					babysha: 5,
					codename: 6,
				}[style] || 2;
			if (!(get.mode() == "chess" || get.mode() == "tafang" || get.mode == "hs_hearthstone")) {
				["character", "lbtn", "skill"].forEach(pack => {
					// css加载
					const cssPath = pack === "character" ? `${layoutPath}${pack}/main${listmap}.css` : `${layoutPath}${pack}/main${listmap}${lib.config.phonelayout ? "" : "_window"}.css`;
					this.css(cssPath);
					this.jsAsync(`${layoutPath}${pack}/main${listmap}.js`);
				});
			}
			return this;
		};
		decadeModule.js = function (path) {
			if (!path) return console.error("path");
			// 检查是否已经加载过相同的JS，避免重复加载
			const existingScript = document.querySelector(`script[src*="${path}"]`);
			if (existingScript) {
				return existingScript;
			}
			const script = document.createElement("script");
			script.src = `${path}?v=${version}&t=${Date.now()}`; // 添加时间戳确保Vite能检测到变化
			script.onload = function () {
				console.log(`JS loaded: ${path}`);
				this.remove();
			};
			script.onerror = function () {
				console.error(`Failed to load JS: ${path}`);
				this.remove();
			};
			document.head.appendChild(script);
			return script;
		};
		decadeModule.jsAsync = function (path) {
			if (!path) return console.error("path");
			// 检查是否已经加载过相同的JS，避免重复加载
			const existingScript = document.querySelector(`script[src*="${path}"]`);
			if (existingScript) {
				return existingScript;
			}
			const script = document.createElement("script");
			script.async = true;
			script.defer = true;
			script.src = `${path}?v=${version}&t=${Date.now()}`; // 添加时间戳确保Vite能检测到变化
			script.onload = function () {
				console.log(`JS (async) loaded: ${path}`);
				this.remove();
			};
			script.onerror = function () {
				console.error(`Failed to load JS (async): ${path}`);
				this.remove();
			};
			document.head.appendChild(script);
			return script;
		};
		decadeModule.css = function (path) {
			if (!path) return console.error("path");
			// 检查是否已经加载过相同的CSS，避免重复加载
			const existingLink = document.querySelector(`link[href*="${path}"]`);
			if (existingLink) {
				return existingLink;
			}
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = `${path}?v=${version}&t=${Date.now()}`; // 添加时间戳确保Vite能检测到变化
			// 添加错误处理，确保加载失败时不会阻塞
			link.onerror = function () {
				console.warn(`Failed to load CSS: ${path}`);
			};
			document.head.appendChild(link);
			return link;
		};
		decadeModule.import = function (module) {
			if (!this.modules) this.modules = [];
			if (typeof module != "function") return console.error("import failed");
			this.modules.push(module);
		};
		// 添加角标模块
		decadeModule.prefixMark = prefixMarkModule;
		// 添加CSS热重载支持
		decadeModule.hotReloadCSS = function (path) {
			const existingLink = document.querySelector(`link[href*="${path}"]`);
			if (existingLink) {
				// 更新现有链接的时间戳，强制重新加载
				existingLink.href = `${path}?v=${version}&t=${Date.now()}`;
				return existingLink;
			}
			return this.css(path);
		};
		// 添加JS热重载支持
		decadeModule.hotReloadJS = function (path, isAsync = false) {
			const existingScript = document.querySelector(`script[src*="${path}"]`);
			if (existingScript) {
				// 移除现有脚本，然后重新加载
				existingScript.remove();
			}
			// 使用对应的加载方法重新加载
			return isAsync ? this.jsAsync(path) : this.js(path);
		};
		return decadeModule.init();
	})({});
	Object.defineProperties(_status, {
		connectMode: {
			configurable: true,
			get() {
				return this._connectMode;
			},
			set(value) {
				this._connectMode = value;
				if (!value || !lib.extensions) return;
				const decadeExtension = lib.extensions.find(value => value[0] == decadeUIName);
				if (!decadeExtension) return;
				const startBeforeFunction = lib.init.startBefore;
				lib.init.startBefore = function () {
					try {
						_status.extension = decadeExtension[0];
						_status.evaluatingExtension = decadeExtension[3];
						decadeExtension[1](decadeExtension[2], decadeExtension[4]);
						delete _status.extension;
						delete _status.evaluatingExtension;
						console.log(`%c${decadeUIName}: 联机成功`, "color:blue");
					} catch (e) {
						console.log(e);
					}
					if (startBeforeFunction) startBeforeFunction.apply(this, arguments);
				};
			},
		},
		_connectMode: {
			value: false,
			writable: true,
		},
	});
	//手杀UI
	window.app = {
		each(obj, fn, node) {
			if (!obj) return node;
			if (typeof obj.length === "number") {
				for (let i = 0; i < obj.length; i++) {
					if (fn.call(node, obj[i], i) === false) {
						break;
					}
				}
				return node;
			}
			for (const i in obj) {
				if (fn.call(node, obj[i], i) === false) {
					break;
				}
			}
			return node;
		},
		isFunction(fn) {
			return typeof fn === "function";
		},
		event: {
			listens: {},
			on(name, listen, remove) {
				if (!this.listens[name]) {
					this.listens[name] = [];
				}
				this.listens[name].push({
					listen: listen,
					remove: remove,
				});
				return this;
			},
			off(name, listen) {
				return app.each(
					this.listens[name],
					function (item, index) {
						if (listen === item || listen === item.listen) {
							this.listens[name].splice(index, 1);
						}
					},
					this
				);
			},
			emit(name, ...args) {
				return app.each(
					this.listens[name],
					function (item) {
						item.listen.apply(null, args);
						if (item.remove) this.off(name, item);
					},
					this
				);
			},
			once(name, listen) {
				return this.on(name, listen, true);
			},
		},
		create: {},
		listens: {},
		plugins: [],
		pluginsMap: {},
		path: {
			ext(path, ext) {
				ext = ext || app.name;
				return lib.assetURL + "extension/" + ext + "/" + path;
			},
		},
		on(event, listen) {
			if (!app.listens[event]) {
				app.listens[event] = [];
			}
			app.listens[event].push(listen);
		},
		once(event, listen) {
			if (!app.listens[event]) {
				app.listens[event] = [];
			}
			app.listens[event].push({
				listen: listen,
				remove: true,
			});
		},
		off(event, listen) {
			const listens = app.listens[event] || [];
			const filters = listen ? listens.filter(item => item === listen || item.listen === listen) : listens.slice(0);
			filters.forEach(item => {
				const idx = listens.indexOf(item);
				if (idx > -1) listens.splice(idx, 1);
			});
		},
		emit(event, ...args) {
			const listens = app.listens[event] || [];
			listens.forEach(item => {
				if (typeof item === "function") {
					item.apply(null, args);
				} else if (typeof item.listen === "function") {
					item.listen.apply(null, args);
					if (item.remove) {
						const idx = listens.indexOf(item);
						if (idx > -1) listens.splice(idx, 1);
					}
				}
			});
		},
		import(fn) {
			const obj = fn(lib, game, ui, get, ai, _status, app);
			if (obj) {
				if (obj.name) app.pluginsMap[obj.name] = obj;
				if (obj.precontent && (!obj.filter || obj.filter())) obj.precontent();
			}
			app.plugins.push(obj);
		},
		importPlugin(data, setText) {
			if (!window.JSZip) {
				const args = arguments;
				lib.init.js(lib.assetURL + "game", "jszip", function () {
					app.importPlugin.apply(app, args);
				});
				return;
			}
			setText = typeof setText === "function" ? setText : () => { };
			const zip = new JSZip(data);
			const dirList = [],
				fileList = [];
			for (const i in zip.files) {
				if (/\/$/.test(i)) {
					dirList.push("extension/" + app.name + "/" + i);
				} else if (!/^extension\.(js|css)$/.test(i)) {
					fileList.push({
						id: i,
						path: "extension/" + app.name + "/" + i.split("/").reverse().slice(1).reverse().join("/"),
						name: i.split("/").pop(),
						target: zip.files[i],
					});
				}
			}
			const total = dirList.length + fileList.length;
			let finish = 0;
			const isNode = lib.node && lib.node.fs;
			const writeFile = () => {
				const file = fileList.shift();
				if (file) {
					setText(`正在导入(${++finish}/${total})...`);
					game.writeFile(isNode ? file.target.asNodeBuffer() : file.target.asArrayBuffer(), file.path, file.name, writeFile);
				} else {
					alert("导入完成");
					setText("导入插件");
				}
			};
			const ensureDir = () => {
				if (dirList.length) {
					setText(`正在导入(${++finish}/${total})...`);
					game.ensureDirectory(dirList.shift(), ensureDir);
				} else {
					writeFile();
				}
			};
			ensureDir();
		},
		loadPlugins(callback) {
			game.getFileList("extension/" + app.name, floders => {
				const total = floders.length;
				let current = 0;
				if (total === current) {
					callback();
					return;
				}
				const loaded = () => {
					if (++current === total) callback();
				};
				const readAndEval = (dir, file) => {
					game.readFile(
						`extension/${app.name}/${dir}/${file}`,
						data => {
							const binarry = new Uint8Array(data);
							const blob = new Blob([binarry]);
							const reader = new FileReader();
							reader.readAsText(blob);
							reader.onload = () => {
								eval(reader.result);
								loaded();
							};
						},
						e => {
							console.info(e);
							loaded();
						}
					);
				};
				// 使用表驱动法优化switch语句
				const styleFileMap = {
					on: "main1.js",
					othersOff: "main3.js",
				};
				const fileName = styleFileMap[lib.config.extension_十周年UI_newDecadeStyle] || "main2.js";
				floders.forEach(dir => {
					readAndEval(dir, fileName);
				});
			});
		},
		reWriteFunction(target, name, replace, str) {
			if (name && typeof name === "object") {
				return app.each(name, (item, index) => app.reWriteFunction(target, index, item[0], item[1]), target);
			}
			if ((typeof replace === "string" || replace instanceof RegExp) && (typeof str === "string" || str instanceof RegExp)) {
				const funcStr = target[name].toString().replace(replace, str);
				eval(`target.${name} = ${funcStr}`);
			} else {
				const func = target[name];
				target[name] = function (...args) {
					let result, cancel;
					if (typeof replace === "function") cancel = replace.apply(this, [args].concat(args));
					if (typeof func === "function" && !cancel) result = func.apply(this, args);
					if (typeof str === "function") str.apply(this, [result].concat(args));
					return cancel || result;
				};
			}
			return target[name];
		},
		reWriteFunctionX(target, name, replace, str) {
			if (name && typeof name === "object") {
				return app.each(name, (item, index) => app.reWriteFunction(target, index, item), target);
			}
			if (Array.isArray(replace)) {
				let [item1, item2, item3] = replace;
				if (item3 === "append") {
					item2 = item1 + item2;
				} else if (item3 === "insert") {
					item2 = item2 + item1;
				}
				if (typeof item1 === "string") {
					item1 = RegExp(item1);
				}
				if (item1 instanceof RegExp && typeof item2 === "string") {
					const funcStr = target[name].toString().replace(item1, item2);
					eval(`target.${name} = ${funcStr}`);
				} else {
					const func = target[name];
					target[name] = function (...args) {
						let result;
						if (app.isFunction(item1)) result = item1.apply(this, [args].concat(args));
						if (app.isFunction(func) && !result) result = func.apply(this, args);
						if (app.isFunction(item2)) item2.apply(this, [result].concat(args));
						return result;
					};
				}
			} else {
				console.info(arguments);
			}
			return target[name];
		},
		waitAllFunction(fnList, callback) {
			const list = fnList.slice();
			const runNext = () => {
				const item = list.shift();
				if (typeof item === "function") {
					item(runNext);
				} else if (list.length === 0) {
					callback();
				} else {
					runNext();
				}
			};
			runNext();
		},
		element: {
			runNext: {
				setTip(tip) {
					console.info(tip);
				},
			},
		},
		get: {
			skillInfo(skill, node) {
				const obj = { id: skill };
				if (lib.translate[skill + "_ab"]) {
					obj.name = lib.translate[skill + "_ab"];
					obj.nameSimple = lib.translate[skill + "_ab"];
				} else if (lib.translate[skill]) {
					obj.name = lib.translate[skill];
					obj.nameSimple = lib.translate[skill].slice(0, 2);
				}
				obj.info = lib.skill[skill];
				if (node) {
					if (node.forbiddenSkills[skill]) obj.forbidden = true;
					if (node.disabledSkills[skill]) obj.disabled = true;
					if (obj.info.temp || !node.skills.includes(skill)) obj.temp = true;
					if (obj.info.frequent || obj.info.subfrequent) obj.frequent = true;
					if (obj.info.clickable && node.isIn() && node.isUnderControl(true)) obj.clickable = true;
					if (obj.info.nobracket) obj.nobracket = true;
				}
				obj.translation = get.skillInfoTranslation(skill, undefined, false);
				obj.translationSource = lib.translate[skill + "_info"];
				obj.translationAppend = lib.translate[skill + "_append"];
				obj.type = obj.info && obj.info.enable ? "enable" : "trigger";
				return obj;
			},
		},
		listen(node, func) {
			node.addEventListener(lib.config.touchscreen ? "touchend" : "click", func);
			return () => {
				node.removeEventListener(lib.config.touchscreen ? "touchend" : "click", func);
			};
		},
		mockTouch(node) {
			const event = new Event(lib.config.touchscreen ? "touchend" : "click");
			node.dispatchEvent(event);
			return node;
		},
		nextTick(func, time) {
			const funcs = Array.isArray(func) ? func.slice() : [func];
			const next = () => {
				const item = funcs.shift();
				if (item) {
					setTimeout(() => {
						item();
						next();
					}, time || 0);
				}
			};
			next();
		},
	};
	//避免提示是否下载图片和字体素材
	if (!lib.config.asset_version) game.saveConfig("asset_version", "无");
	// 注释掉重复的加载逻辑，避免重复加载main文件
	// 函数加载逻辑已移至 decadeModule.init() 中，避免重复加载
	//函数框架
	/*进度条框架*/
	game.Jindutiaoplayer = function () {
		// 清理之前的定时器和元素
		_clearPreviousTimers();
		_removePreviousElement();
		// 创建进度条容器
		var boxContent = _createProgressContainer();
		// 根据配置选择样式
		var styleConfig = _getStyleConfig();
		_applyStyle(boxContent, styleConfig);
		// 创建进度条元素
		var progressElements = _createProgressElements(styleConfig);
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
			var existingElement = document.getElementById("jindutiaopl");
			if (existingElement) {
				existingElement.remove();
			}
		}
		function _createProgressContainer() {
			var container = document.createElement("div");
			container.setAttribute("id", "jindutiaopl");
			return container;
		}
		function _getStyleConfig() {
			var styleType = lib.config.extension_十周年UI_jindutiaoYangshi;
			var configs = {
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
			return configs[styleType] || configs["1"];
		}
		function _applyStyle(container, config) {
			if (config.clearSpecial && window.jindutiaoTeshu) {
				delete window.jindutiaoTeshu;
			}
			if (config.setSpecial && !window.jindutiaoTeshu) {
				window.jindutiaoTeshu = true;
			}
			Object.keys(config.container).forEach(function (key) {
				container.style[key] = config.container[key];
			});
		}
		function _createProgressElements(config) {
			var elements = {};
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
				elements.backgroundImages = config.backgroundImages.map(function (imgConfig, index) {
					var img = _createImageElement(imgConfig);
					if (index === 0) elements.imgBg3 = img; // 为特殊定时器保存引用
					return img;
				});
			}
			return elements;
		}
		function _createImageElement(imgConfig) {
			var img = document.createElement("img");
			img.src = lib.assetURL + imgConfig.src;
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
				elements.backgroundImages.forEach(function (img) {
					container.appendChild(img);
				});
			}
		}
		function _startMainTimer(progressBar, container) {
			window.timer = setInterval(function () {
				progressBar.style.width = progressBar.data + "px";
				// 剩余三分之一变红色
				if (progressBar.data <= 395 / 3) {
					progressBar.style.backgroundColor = "rgba(230, 56, 65, 0.88)";
				} else {
					progressBar.style.backgroundColor = "rgb(230, 151, 91)";
				}
				progressBar.data--;
				if (progressBar.data == 0) {
					clearInterval(window.timer);
					delete window.timer;
					container.remove();
					if (lib.config.extension_十周年UI_jindutiaotuoguan == true && _status.auto == false) {
						ui.click.auto();
					}
				}
			}, parseFloat(lib.config["extension_十周年UI_jindutiaoST"]));
		}
		function _startSpecialTimer(secondaryBar, backgroundImg) {
			window.timer2 = setInterval(function () {
				secondaryBar.data--;
				secondaryBar.style.width = secondaryBar.data + "px";
				if (secondaryBar.data == 0) {
					clearInterval(window.timer2);
					delete window.timer2;
					delete window.jindutiaoTeshu;
					secondaryBar.remove();
					backgroundImg.remove();
				}
			}, parseFloat(lib.config["extension_十周年UI_jindutiaoST"]) / 2);
		}
	};
	//-----AI进度条框架----//
	game.JindutiaoAIplayer = function () {
		// 清理已有定时器和进度条
		if (window.timerai) {
			clearInterval(window.timerai);
			delete window.timerai;
		}
		var oldBar = document.getElementById("jindutiaoAI");
		if (oldBar) oldBar.remove();
		// 创建进度条容器和时间条
		window.boxContentAI = document.createElement("div");
		var boxTimeAI = document.createElement("div");
		boxContentAI.id = "jindutiaoAI";
		let isShousha = lib.config.extension_十周年UI_newDecadeStyle != "on" && lib.config.extension_十周年UI_newDecadeStyle != "othersOff";
		// 样式与图片路径
		if (isShousha) {
			boxContentAI.style.cssText = "display:block;position:absolute;z-index:90;--w:122px;--h:calc(var(--w)*4/145);width:var(--w);height:var(--h);left:3.5px;bottom:-12px;";
			boxTimeAI.data = 125;
			boxTimeAI.style.cssText = "z-index:92;--w:33px;--h:calc(var(--w)*4/120);width:var(--w);height:var(--h);margin:1px;background-color:#dd9900;position:absolute;top:0px;";
		} else {
			boxContentAI.style.cssText = "display:block;position:absolute;z-index:90;--w:122px;--h:calc(var(--w)*8/162);width:var(--w);height:var(--h);left:1.5px;bottom:-14px;";
			boxTimeAI.data = 120;
			boxTimeAI.style.cssText = "z-index:91;width:115px;height:3.3px;margin:1px;background-color:#f2c84b;position:absolute;top:0px;border-radius:3px;";
		}
		boxContentAI.appendChild(boxTimeAI);
		// 背景图片
		var imgBg = document.createElement("img");
		imgBg.src = lib.assetURL + (isShousha ? "extension/十周年UI/shoushaUI/lbtn/images/uibutton/time.png" : "extension/十周年UI/shoushaUI/lbtn/images/uibutton/timeX.png");
		imgBg.style.cssText = isShousha ? "position:absolute;z-index:91;--w:122px;--h:calc(var(--w)*4/145);width:var(--w);height:var(--h);top:0;" : "position:absolute;z-index:90;--w:122px;--h:calc(var(--w)*8/162);width:var(--w);height:var(--h);top:0;";
		boxContentAI.appendChild(imgBg);
		// 添加到页面
		document.body.appendChild(boxContentAI);
		// 进度条动画
		window.timerai = setInterval(function () {
			boxTimeAI.data--;
			boxTimeAI.style.width = boxTimeAI.data + "px";
			if (boxTimeAI.data === 0) {
				clearInterval(window.timerai);
				delete window.timerai;
				boxContentAI.remove();
			}
		}, 150);
	};
	// 聊天模块 --凌梦改 
	// 别问荷花，烟花，灯笼，雪球投掷物为什么对应不上不了，因为本体没有，需要自己添加
	if (!window.chatRecord) window.chatRecord = [];
	game.addChatWord = function (strx) {
		if (window.chatRecord.length > 50) {
			//设置一下上限50条，不设也行，把这个if删除即可
			window.chatRecord.remove(window.chatRecord[0]);
		}
		if (strx) {
			window.chatRecord.push(strx);
		}
		var str = (window.chatRecord[0] || "") + "<br>";
		if (window.chatRecord.length > 1) {
			for (var i = 1; i < window.chatRecord.length; i++) {
				str += "<br>" + window.chatRecord[i] + "<br>";
			}
		}
		if (window.chatBackground2 != undefined) game.updateChatWord(str);
	};
	game.showChatWordBackgroundX = function () {
		// 控制面板显示/隐藏逻辑
		if (window.chatBg != undefined && window.chatBg.show) {
			window.chatBg.hide();
			// 关闭所有投掷物品
			const throwItems = ["jidan", "tuoxie", "xianhua", "meijiu", "cailan", "qicai", "xiaojiu", "xueqiu", "xuwu"];
			throwItems.forEach(item => {
				if (window[item] && window[item].thrownn) window[item].thrownn = false;
			});
			window.chatBg.show = false;
			// 隐藏所有对话框
			const dialogs = [
				{ name: "dialog_lifesay", style: "left", value: "-" + window.dialog_lifesay?.style.width },
				{ name: "dialog_emoji", style: "top", value: "100%" },
				{ name: "chatBackground", style: "left", value: "100%" },
				{ name: "dialog_emotion", style: "bottom", value: "100%" }
			];
			dialogs.forEach(dialog => {
				if (window[dialog.name]) {
					if (window[dialog.name].show) {
						window[dialog.name].style[dialog.style] = dialog.value;
					}
					setTimeout(() => {
						window[dialog.name].hide();
						window[dialog.name].show = false;
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
		const clickFK = function (div) {
			div.style.transition = "opacity 0.5s";
			const eventType = lib.config.touchscreen ? "touchstart" : "mousedown";
			const endEventType = lib.config.touchscreen ? "touchend" : "mouseup";

			div.addEventListener(eventType, function () {
				this.style.transform = "scale(0.95)";
			});

			div.addEventListener(endEventType, function () {
				this.style.transform = "";
			});

			div.onmouseout = function () {
				this.style.transform = "";
			};
		};
		// 常用语功能
		game.open_lifesay = function () {
			// 隐藏其他对话框
			["dialog_emoji", "chatBackground", "dialog_emotion"].forEach(dialog => {
				if (window[dialog]) {
					if (window[dialog].show) window[dialog].style[dialog === "dialog_emotion" ? "bottom" : dialog === "dialog_emoji" ? "top" : "left"] = dialog === "dialog_emoji" ? "100%" : dialog === "dialog_emotion" ? "100%" : "100%";
					setTimeout(() => {
						window[dialog].hide();
						window[dialog].show = false;
					}, 1000);
				}
			});
			if (window.dialog_lifesay != undefined && window.dialog_lifesay.show) {
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
					let info = get.info(skill);
					return !info || !info.charlotte;
				});
			}
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
			};
			skillsx = skillsx.filter((item, index) => {
				return skillsx.indexOf(item) === index;
			});
			let skillIndex = 0;
			for (let name of skillsx) {
				if (!get.info(name)) continue;
				let skillAudioData = get.Audio.skill({ skill: name, player: game.me.name });
				let textList = skillAudioData.textList;
				let audioList = skillAudioData.fileList;
				for (let i = 0; i < textList.length; i++) {
					let content = '「' + get.skillTranslation(name) + '」' + textList[i];
					content = content.replace(/~/g, ' ');
					window["dialog_lifesayContent_" + skillIndex] = ui.create.div("hidden", "", function () {
						var player = game.me;
						if (!player) {
							if (game.connectPlayers) {
								if (game.online) {
									for (var i = 0; i < game.connectPlayers.length; i++) {
										if (game.connectPlayers[i].playerid == game.onlineID) {
											player = game.connectPlayers[i];
											break;
										}
									}
								} else {
									player = game.connectPlayers[0];
								}
							}
						}
						if (!player) return;
						let path = this.audioPath;
						let target = "ext:";
						let isMatch = path.slice(0, target.length) === target;
						let actualPath = isMatch ? '../extension/' + path.slice(target.length) : path;
						let pathParts = actualPath.split('/');
						let directory = pathParts[pathParts.length - 2];
						let filename = pathParts[pathParts.length - 1].split('.')[0];
						let combinedMessage = `/playAudio ${directory} ${filename} ${this.content}`;
						if (game.online) {
							game.send("chat", game.onlineID, combinedMessage);
						} else {
							player.chat(combinedMessage);
						}
						window.dialog_lifesay.delete();
						delete window.dialog_lifesay;
						window.dialog_lifesay = undefined;
					});
					window["dialog_lifesayContent_" + skillIndex].style.cssText = "height: 10%; width: 100%; left: 0%; top: 0%; position: relative;";
					window["dialog_lifesayContent_" + skillIndex].pos = skillIndex;
					window["dialog_lifesayContent_" + skillIndex].content = content;
					window["dialog_lifesayContent_" + skillIndex].audioPath = audioList[i];
					window["dialog_lifesayContent_" + skillIndex].innerHTML = "<font color=white>" + content + "</font>";
					window.dialog_lifesayBgColor.appendChild(window["dialog_lifesayContent_" + skillIndex]);
					clickFK(window["dialog_lifesayContent_" + skillIndex]);
					skillIndex++;
				}
			}
			// 处理阵亡语音
			if (game.me?.name) {
				let dieAudioData = get.Audio.die({ player: game.me.name });
				let dieTextList = dieAudioData.textList;
				let dieAudioList = dieAudioData.fileList;
				for (let i = 0; i < dieTextList.length; i++) {
					let content = '「阵亡」' + dieTextList[i];
					content = content.replace(/~/g, ' ');
					window["dialog_lifesayContent_" + skillIndex] = ui.create.div("hidden", "", function () {
						var player = game.me;
						if (!player) {
							if (game.connectPlayers) {
								if (game.online) {
									for (var i = 0; i < game.connectPlayers.length; i++) {
										if (game.connectPlayers[i].playerid == game.onlineID) {
											player = game.connectPlayers[i];
											break;
										}
									}
								} else {
									player = connectPlayers[0];
								}
							}
						}
						if (!player) return;
						let path = this.audioPath;
						let target = "ext:";
						let isMatch = path.slice(0, target.length) === target;
						let actualPath = isMatch ? '../extension/' + path.slice(target.length) : path;
						let pathParts = actualPath.split('/');
						let directory = pathParts[pathParts.length - 2];
						let filename = pathParts[pathParts.length - 1].split('.')[0];
						let combinedMessage = `/playAudio ${directory} ${filename} ${this.content}`;
						if (game.online) {
							game.send("chat", game.onlineID, combinedMessage);
						} else {
							player.chat(combinedMessage);
						}
						window.dialog_lifesay.delete();
						delete window.dialog_lifesay;
						window.dialog_lifesay = undefined;
					});
					window["dialog_lifesayContent_" + skillIndex].style.cssText = "height: 10%; width: 100%; left: 0%; top: 0%; position: relative;";
					window["dialog_lifesayContent_" + skillIndex].pos = skillIndex;
					window["dialog_lifesayContent_" + skillIndex].content = content;
					window["dialog_lifesayContent_" + skillIndex].audioPath = dieAudioList[i];
					window["dialog_lifesayContent_" + skillIndex].innerHTML = "<font color=white>" + content + "</font>";
					window.dialog_lifesayBgColor.appendChild(window["dialog_lifesayContent_" + skillIndex]);
					clickFK(window["dialog_lifesayContent_" + skillIndex]);
					skillIndex++;
				}
			}

			// 快捷语音 
			for (var i = 0; i < lib.quickVoice.length; i++) {
				window["dialog_lifesayContent_" + (skillIndex + i)] = ui.create.div("hidden", "", function () {
					var player = game.me;
					var str = this.content;
					if (!player) {
						if (game.connectPlayers) {
							if (game.online) {
								for (var i = 0; i < game.connectPlayers.length; i++) {
									if (game.connectPlayers[i].playerid == game.onlineID) {
										player = game.connectPlayers[i];
										break;
									}
								}
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
					window.dialog_lifesay.delete();
					delete window.dialog_lifesay;
					window.dialog_lifesay = undefined;
				});
				window["dialog_lifesayContent_" + (skillIndex + i)].style.cssText = "height: 10%; width: 100%; left: 0%; top: 0%; position: relative;";
				window["dialog_lifesayContent_" + (skillIndex + i)].pos = skillIndex + i;
				window["dialog_lifesayContent_" + (skillIndex + i)].content = lib.quickVoice[i];
				window["dialog_lifesayContent_" + (skillIndex + i)].innerHTML = "<font color=white>" + lib.quickVoice[i] + "</font>";

				window.dialog_lifesayBgColor.appendChild(window["dialog_lifesayContent_" + (skillIndex + i)]);
				clickFK(window["dialog_lifesayContent_" + (skillIndex + i)]);
			}
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
				var list = game.players;
				for (let i = 0; i < game.players.length; i++) {
					list[i].onclick = function () {
						if (window[name].thrownn == true) {
							if (game.online) {
								game.send("throwEmotion", this, emotionType);
							} else {
								game.me.throwEmotion(this, emotionType);
							}
							window.shuliang.innerText = window.shuliang.innerText - 1;
						}
					};
				}
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
			var list = game.players;
			var num = 10;
			for (let i = 0; i < game.players.length; i++) {
				list[i].onclick = function () {
					var target = this;
					if (window.xuwu.thrownn == true) {
						for (let i = 0; i < num; i++) {
							setTimeout(() => {
								if (i <= 8) {
									if (game.online) {
										game.send("throwEmotion", this, "egg");
									} else {
										game.me.throwEmotion(this, "egg");
									}
									window.shuliang.innerText = window.shuliang.innerText - 1;
								} else {
									if (game.online) {
										game.send("throwEmotion", this, "shoe");
									} else {
										game.me.throwEmotion(this, "shoe");
									}
									window.shuliang.innerText = window.shuliang.innerText - 1;
								}
							}, 100 * i);
						}
					}
				};
			}
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
					if (window[dialog].show) window[dialog].style[dialog === "dialog_emotion" ? "bottom" : dialog === "dialog_lifesay" ? "left" : "left"] = dialog === "dialog_emotion" ? "100%" : dialog === "dialog_lifesay" ? "-" + window.dialog_lifesay?.style.width : "100%";
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
			var emotionIndex = 0;
			// 创建第一级菜单 - 表情包选择
			for (const pack in lib.emotionList) {
				window["dialog_emojiPack_" + pack] = ui.create.div("hidden", "", function () {
					for (const p in lib.emotionList) {
						window["dialog_emojiPack_" + p].style.display = "none";
					}
					for (var i = 0; i < emotionIndex; i++) {
						var content = window["dialog_emojiContent_" + i];
						if (content.packName === this.packName) {
							content.style.display = "";
						} else {
							content.style.display = "none";
						}
					}
				});

				window["dialog_emojiPack_" + pack].style.cssText = "height: 70px; width: 70px; margin: 0 5px 5px 0; display: inline-block; left: 15px; top: 0px; position: relative; background-size: 100% 100%;";
				window["dialog_emojiPack_" + pack].packName = pack;
				window["dialog_emojiPack_" + pack].setBackgroundImage("image/emotion/" + pack + "/1.gif");
				window.dialog_emojiBgColor.appendChild(window["dialog_emojiPack_" + pack]);
				clickFK(window["dialog_emojiPack_" + pack]);
			}
			// 创建第二级菜单 - 具体表情 
			for (const pack in lib.emotionList) {
				const count = lib.emotionList[pack];
				for (var i = 1; i <= count; i++) {
					window["dialog_emojiContent_" + emotionIndex] = ui.create.div("hidden", "", function () {
						for (const p in lib.emotionList) {
							window["dialog_emojiPack_" + p].style.display = "";
						}
						for (var i = 0; i < emotionIndex; i++) {
							window["dialog_emojiContent_" + i].style.display = "none";
						}
						var player = game.me;
						var emotionsize = lib.config.extension_星之梦_emotionsize || 50;
						var str = '<img src="' + lib.assetURL + "image/emotion/" + this.packName + "/" + this.emotionNum + '.gif" width="' + parseInt(emotionsize) + '" height="' + parseInt(emotionsize) + '">';
						if (!player) {
							if (game.connectPlayers) {
								if (game.online) {
									for (var i = 0; i < game.connectPlayers.length; i++) {
										if (game.connectPlayers[i].playerid == game.onlineID) {
											player = game.connectPlayers[i];
											break;
										}
									}
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
					window["dialog_emojiContent_" + emotionIndex].style.cssText = "height: 70px; width: 70px; margin: 0 5px 5px 0; display: inline-block; left: 15px; top: 0px; position: relative; background-size: 100% 100%; display: none;";
					window["dialog_emojiContent_" + emotionIndex].packName = pack;
					window["dialog_emojiContent_" + emotionIndex].emotionNum = i;
					window["dialog_emojiContent_" + emotionIndex].setBackgroundImage("image/emotion/" + pack + "/" + i + ".gif");

					window.dialog_emojiBgColor.appendChild(window["dialog_emojiContent_" + emotionIndex]);
					clickFK(window["dialog_emojiContent_" + emotionIndex]);
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
			var player = game.me;
			var str = content;
			if (!player) {
				if (game.connectPlayers) {
					if (game.online) {
						for (var i = 0; i < game.connectPlayers.length; i++) {
							if (game.connectPlayers[i].playerid == game.onlineID) {
								player = game.connectPlayers[i];
								break;
							}
						}
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
			window.input.value = "";
		};
		// 输入框背景
		window.chatInputOut = ui.create.div("hidden");
		window.chatInputOut.style.cssText = "display: block;--w: 275px;--h: calc(var(--w) * 50/320);width: var(--w);height: var(--h);left:8%;top:14%;transition:none;background-size:100% 100%;pointer-events:none;z-index:6;";
		window.chatInputOut.style.backgroundImage = "url('" + lib.assetURL + "extension/十周年UI/shoushaUI/sayplay/sayX.png')";
		window.chatBg.appendChild(window.chatInputOut);
		// 输入框
		window.chatInput = ui.create.dialog("hidden");
		window.chatInput.style.cssText = "height: 24px; width: 44%; left: 24.2%; top: 31px; transition: none;";
		window.chatBg.appendChild(window.chatInput);
		window.ipt = ui.create.div();
		window.ipt.style.cssText = "height: 24px; width: 100%; top: 0px; left: 0px; margin: 0px; border-radius: 0px; background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4));";
		if (window.input && window.input.value) window.input_value = window.input.value;
		window.ipt.innerHTML = '<input type="text" value=' + (window.input_value || "请输入文字") + ' style="color:white;font-family:shousha;width:calc(100% - 10px);text-align:left;"></input>';
		window.input = window.ipt.querySelector("input");
		window.input.style.backgroundImage = "url('" + lib.assetURL + "extension/十周年UI/shoushaUI/sayplay/say.png')";
		window.input.style.backgroundSize = "120% 120%";
		window.input.style.boxShadow = "none";
		window.input.onclick = function (e) {
			e.stopPropagation();
		};
		window.input.onfocus = function () {
			if (this.value == "请输入文字") this.value = "";
		};
		window.input.onkeydown = function (e) {
			e.stopPropagation();
			if (e.keyCode == 13) {
				var value = this.value;
				if (!value) return;
				if (typeof value != "string") value = "" + value;
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
				if (window[dialog].show) window[dialog].style[dialog === "dialog_emotion" ? "bottom" : dialog === "dialog_emoji" ? "top" : "left"] = dialog === "dialog_emotion" ? "100%" : dialog === "dialog_emoji" ? "100%" : "-" + window.dialog_lifesay?.style.width;
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
		window.chatBackground.style.cssText = "transition: all 1s; height: 330px; width: 600px; top: calc(20% - 100px); left: 100%; bottom: calc(" + (window.chatBg ? window.chatBg.style.height : "0") + " + 5px); opacity: 1; border-radius: 10px; background-size: 100% 100%;";
		window.chatBackground.setBackgroundImage("extension/十周年UI/shoushaUI/sayplay/nobg.png");
		window.chatBackground.style.zIndex = 999999999;
		window.chatBackground.style.boxShadow = "none";
		setTimeout(() => {
			window.chatBackground.style.left = "calc(50% - 300px)";
		}, 100);
		// 鼠标悬停效果
		game.mouseChatDiv = function (div) {
			if (lib.device == undefined) {
				div.onmouseover = function () {
					this.style.opacity = 1.0;
				};
				div.onmouseout = function () {
					this.style.opacity = 0.25;
				};
			} else {
				div.onclick = function () {
					if (div.style.opacity == 0.25) this.style.opacity = 0.75;
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
								var str = (window.chatRecord[0] || "") + "<br>";
								if (window.chatRecord.length > 1) {
									for (var i = 1; i < window.chatRecord.length; i++) {
										str += "<br>" + window.chatRecord[i] + "<br>";
									}
								}
								if (window.chatBackground2 != undefined) game.updateChatWord(str);
							};
						}
						str = str.replace(/##assetURL##/g, lib.assetURL);
						// 判断是否存在nickname，如果不存在则只显示name
						if (player.nickname) {
							//对应上面函数，把其他player的发言记录到框里
							game.addChatWord("<font color=green>" + get.translation("" + player.name) + "[" + player.nickname + "]" + "</font><font color=white>：" + str + "</font>");
						} else {
							game.addChatWord("<font color=green>" + get.translation("" + player.name) + "</font><font color=white>：" + str + "</font>");
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
		if (str[0] == "/") {
			var chat = str.slice(1);
			if (chat.indexOf(" ") != -1) {
				chat = chat.split(" ");
				var func = chat.shift();
				if (func == "playAudio" && chat.length) {
					var directory = chat.shift();
					if ((directory == "die" || directory == "skill") && chat.length) {
						var filename = chat.shift();
						game.broadcastAll(
							function (directory, filename) {
								game.playAudio(directory, filename);
							},
							directory,
							filename
						);
						if (chat.length) {
							str = chat.join(" ");
						} else {
							var translation = filename;
							while (translation == get.translation(translation) && translation.length) {
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
			function (id, str) {
				if (lib.playerOL[id]) {
					lib.playerOL[id].say(str);
				} else if (game.connectPlayers) {
					for (var i = 0; i < game.connectPlayers.length; i++) {
						if (game.connectPlayers[i].playerid == id) {
							game.connectPlayers[i].say(str);
							return;
						}
					}
				}
			},
			this.playerid,
			str
		);
	};
	// 聊天模块结束
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
		if (!pos || !Array.isArray(pos)) {
			pos = [0, 0, 100, 100];
		}
		if (!time || (isNaN(time) && time !== true)) time = 3;
		if (!font) font = "shousha";
		if (!size) size = 16;
		if (!color) color = "#ffffff";
		if (_status.as_showText) {
			_status.as_showText.remove();
			delete _status.as_showText;
		}
		var div = ui.create.div("", str, ui.window);
		div.style.cssText = "z-index:-3; pointer-events:none; font-family:" + font + "; font-size:" + size + "px; color:" + color + "; line-height:" + size * 1.2 + "px; text-align:center; left:" + (pos[0] + pos[2] / 2) + "%; top:" + pos[1] + "%; width:0%; height:" + pos[3] + "%; position:absolute; transition-property:all; transition-duration:1s";
		_status.as_showText = div;
		if (_status.as_showImage) {
			_status.as_showImage.hide();
		}
		setTimeout(function () {
			div.style.left = pos[0] + "%";
			div.style.width = pos[2] + "%";
		}, 1);
		if (time === true) return true;
		setTimeout(function () {
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
			var outdiv = _status.as_showImage;
			_status.as_showImage.style.animation = "left-to-right-out 1s";
			delete _status.as_showImage;
			setTimeout(function () {
				outdiv.remove();
			}, 1000);
		}
	};
	game.as_showImage = function (url, pos, time) {
		if (!url) return false;
		if (!pos || !Array.isArray(pos)) {
			pos = [0, 0, 100, 100];
		}
		if (!time || (isNaN(time) && time !== true)) time = 3;
		if (_status.as_showImage) {
			var outdiv = _status.as_showImage;
			_status.as_showImage.style.animation = "left-to-right-out 1s";
			delete _status.as_showImage;
			setTimeout(function () {
				outdiv.remove();
			}, 1000);
		}
		var div = ui.create.div("", "", ui.window);
		div.style.cssText = "z-index:-1; pointer-events:none; left:" + pos[0] + "%; top:" + pos[1] + "%; width:8%; height:" + pos[3] + "%; position:absolute; background-size:100% 100%; background-position:center center; background-image:url(" + lib.assetURL + url + "); transition-property:all; transition-duration:1s";
		_status.as_showImage = div;
		if (_status.as_showText) {
			_status.as_showImage.hide();
		}
		if (time === true) return true;
		setTimeout(function () {
			if (_status.as_showImage) {
				_status.as_showImage.remove();
				delete _status.as_showImage;
			}
		}, time * 1000);
		return true;
	};
	if (lib.config.dev) {
		window.app = app;
	}
}
