// 十周年UI扩展功能 - 卡牌拖拽交换位置
// 本文件添加了卡牌左右交换移动位置的功能

(function () {
	// 创建命名空间
	window.TenYearUI = window.TenYearUI || {};

	// 添加拖拽阈值
	TenYearUI.dragThreshold = 5; // 像素

	// 初始化公共功能
	TenYearUI.init = function () {
		// 确保decadeUI存在
		if (typeof decadeUI === "undefined") {
			console.error("十周年UI (decadeUI) 未加载，卡牌拖拽功能无法使用");
			return false;
		}

		// 初始化卡牌拖拽功能
		TenYearUI.initCardDragSwap();
		return true;
	};

	// 卡牌拖拽交换位置功能

	// 检测是否为移动设备
	TenYearUI.isMobile = function () {
		return navigator.userAgent.match(/(iPhone|iPod|Android|ios|iPad|Mobile)/i);
	};

	// 根据设备类型设置事件类型
	TenYearUI.evts = TenYearUI.isMobile() ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];

	// 设置卡牌间距
	TenYearUI.cardMargin = 8;

	// 获取元素的transform值
	TenYearUI.getTransformValues = function (element) {
		try {
			const style = window.getComputedStyle(element);
			const matrix = new DOMMatrixReadOnly(style.transform);
			return {
				translateX: matrix.m41,
				translateY: matrix.m42,
				scale: matrix.m11,
			};
		} catch (e) {
			console.error("获取transform值失败:", e);
			return { translateX: 0, translateY: 0, scale: 1 };
		}
	};

	// 判断是否为相邻索引
	TenYearUI.isSimple = function (sourceIndex, targetIndex) {
		return Math.abs(sourceIndex - targetIndex) === 1;
	};

	// 更新手牌布局，确保在拖拽时也能触发展开效果
	TenYearUI.updateHandLayout = function () {
		if (typeof dui !== "undefined" && dui.layout && typeof dui.layout.updateHand === "function") {
			dui.layout.updateHand();
		}
	};

	// 检查元素是否为有效的卡牌
	TenYearUI.isValidCard = function (element) {
		// 检查元素是否存在且为卡牌元素
		return element && element.classList && (element.classList.contains("card") || (element.parentNode && element.parentNode.classList && element.parentNode.classList.contains("card")));
	};

	// 获取卡牌元素（如果点击的是卡牌内部元素，获取其父卡牌）
	TenYearUI.getCardElement = function (element) {
		if (!element) return null;

		if (element.classList && element.classList.contains("card")) {
			return element;
		} else if (element.parentNode && element.parentNode.classList && element.parentNode.classList.contains("card")) {
			return element.parentNode;
		}

		return null;
	};

	// 卡牌拖拽开始
	TenYearUI.dragCardStart = function (e) {
		if (e.button === 2) return; // 右键不触发拖拽

		const target = e.target || e.srcElement;
		if (!target) return;

		// 获取卡牌元素（可能是点击了卡牌内部元素）
		const cardElement = TenYearUI.getCardElement(target);
		if (!cardElement) return;

		// 获取起始位置
		const startX = e.clientX ? e.clientX : e.touches && e.touches[0] ? e.touches[0].clientX : 0;
		const startY = e.clientY ? e.clientY : e.touches && e.touches[0] ? e.touches[0].clientY : 0;

		// 保存初始状态和位置
		TenYearUI.sourceNode = cardElement;
		TenYearUI.sourceNode.startX = startX;
		TenYearUI.sourceNode.startY = startY;
		TenYearUI.isDragging = false;

		// 获取transform值
		const transformValues = TenYearUI.getTransformValues(cardElement);
		TenYearUI.sourceNode.initialTranslateX = transformValues.translateX;
		TenYearUI.sourceNode.initialTranslateY = transformValues.translateY;
		TenYearUI.sourceNode.scale = transformValues.scale;

		// 存储原始pointer-events值
		TenYearUI.originalPointerEvents = getComputedStyle(cardElement).pointerEvents;

		// 添加鼠标移动和松开事件
		document.addEventListener(TenYearUI.evts[1], TenYearUI.dragCardMove, { passive: false });
		document.addEventListener(TenYearUI.evts[2], TenYearUI.dragCardEnd, { passive: false });
	};

	// 卡牌拖动过程
	TenYearUI.dragCardMove = function (e) {
		if (!TenYearUI.sourceNode) return;

		const currentX = e.clientX ? e.clientX : e.touches && e.touches[0] ? e.touches[0].clientX : 0;
		const currentY = e.clientY ? e.clientY : e.touches && e.touches[0] ? e.touches[0].clientY : 0;
		const dx = currentX - TenYearUI.sourceNode.startX;
		const dy = currentY - TenYearUI.sourceNode.startY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// 如果移动距离超过阈值，则认为是拖拽
		if (!TenYearUI.isDragging && distance > TenYearUI.dragThreshold) {
			TenYearUI.isDragging = true;
			e.preventDefault(); // 只在确认为拖拽时阻止默认行为
			e.stopPropagation(); // 阻止事件冒泡

			TenYearUI.sourceNode.style.pointerEvents = "none";
			TenYearUI.sourceNode.style.transition = "none";
			TenYearUI.sourceNode.style.opacity = 0.5;
			TenYearUI.sourceNode.style.zIndex = 99; // 确保拖拽的卡牌在最上层
		}

		if (TenYearUI.isDragging) {
			// 应用缩放系数
			let zoomFactor = typeof game !== "undefined" && game.documentZoom ? game.documentZoom : 1;
			let newTranslateX = TenYearUI.sourceNode.initialTranslateX + dx / zoomFactor;
			// 保持初始Y值不变，只允许水平移动
			let newTranslateY = TenYearUI.sourceNode.initialTranslateY;

			TenYearUI.sourceNode.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px) scale(${TenYearUI.sourceNode.scale})`;

			// 获取当前指向的元素
			const x = e.pageX ? e.pageX : e.touches && e.touches[0] ? e.touches[0].pageX : 0;
			const y = e.pageY ? e.pageY : e.touches && e.touches[0] ? e.touches[0].pageY : 0;
			const pointElement = document.elementFromPoint(x, y);

			// 获取可能的卡牌元素
			const currentElement = TenYearUI.getCardElement(pointElement);

			// 检查是否正在拖动到另一张卡牌上
			if (currentElement && currentElement !== TenYearUI.sourceNode && currentElement.parentNode === ui.handcards1) {
				// 如果鼠标下的卡牌变了，则更新要交换的卡牌
				if (TenYearUI.movedNode !== currentElement) {
					TenYearUI.movedNode = currentElement;

					// 获取两张卡牌的索引
					const children = Array.from(ui.handcards1.childNodes);
					const sourceIndex = children.indexOf(TenYearUI.sourceNode);
					const targetIndex = children.indexOf(currentElement);

					// 获取卡牌缩放比例
					let cardScale = 1;
					if (typeof dui !== "undefined" && dui.boundsCaches && dui.boundsCaches.hand) {
						cardScale = dui.boundsCaches.hand.cardScale;
					}

					if (sourceIndex > targetIndex) {
						// 向左移动
						ui.handcards1.insertBefore(TenYearUI.sourceNode, currentElement);
						if (TenYearUI.isSimple(sourceIndex, targetIndex)) {
							// 简单交换位置（相邻卡牌）
							let currentElementX = currentElement.tx;
							currentElement.tx = TenYearUI.sourceNode.tx;
							currentElement.style.transform = "translate(" + currentElement.tx + "px," + currentElement.ty + "px) scale(" + cardScale + ")";
							currentElement._transform = currentElement.style.transform;
							TenYearUI.sourceNode.tx = currentElementX;
							TenYearUI.sourceNode._transform = "translate(" + TenYearUI.sourceNode.tx + "px," + TenYearUI.sourceNode.ty + "px) scale(" + cardScale + ")";
						} else {
							// 多张卡牌位置调整
							let startIndex = targetIndex;
							let endIndex = sourceIndex - 1;
							let targetX = currentElement.tx;
							for (let i = startIndex; i <= endIndex; i++) {
								let card = children[i];
								if (!card || typeof card.tx === "undefined") continue;
								card.tx += TenYearUI.cardMargin;
								card.style.transform = "translate(" + card.tx + "px," + card.ty + "px) scale(" + cardScale + ")";
								card._transform = card.style.transform;
							}
							TenYearUI.sourceNode.tx = targetX;
							TenYearUI.sourceNode._transform = "translate(" + TenYearUI.sourceNode.tx + "px," + TenYearUI.sourceNode.ty + "px) scale(" + cardScale + ")";
						}
					} else {
						// 向右移动
						ui.handcards1.insertBefore(TenYearUI.sourceNode, currentElement.nextSibling);
						if (TenYearUI.isSimple(sourceIndex, targetIndex)) {
							// 简单交换位置（相邻卡牌）
							let tx = currentElement.tx;
							currentElement.tx = TenYearUI.sourceNode.tx;
							currentElement.style.transform = "translate(" + currentElement.tx + "px," + currentElement.ty + "px) scale(" + cardScale + ")";
							currentElement._transform = currentElement.style.transform;
							TenYearUI.sourceNode.tx = tx;
							TenYearUI.sourceNode._transform = "translate(" + TenYearUI.sourceNode.tx + "px," + TenYearUI.sourceNode.ty + "px) scale(" + cardScale + ")";
						} else {
							// 多张卡牌位置调整
							let startIndex = sourceIndex + 1;
							let endIndex = targetIndex;
							let targetX = currentElement.tx;
							for (let i = startIndex; i <= endIndex; i++) {
								let card = children[i];
								if (!card || card === TenYearUI.sourceNode || typeof card.tx === "undefined") continue;
								card.tx -= TenYearUI.cardMargin;
								card.style.transform = "translate(" + card.tx + "px," + card.ty + "px) scale(" + cardScale + ")";
								card._transform = card.style.transform;
							}
							TenYearUI.sourceNode.tx = targetX;
							TenYearUI.sourceNode._transform = "translate(" + TenYearUI.sourceNode.tx + "px," + TenYearUI.sourceNode.ty + "px) scale(" + cardScale + ")";
						}
					}

					console.log("交换位置:", sourceIndex, "=>", targetIndex);

					// 更新手牌布局，确保展开效果正确
					TenYearUI.updateHandLayout();
				}
			}
		}
	};

	// 卡牌拖动结束
	TenYearUI.dragCardEnd = function (e) {
		if (!TenYearUI.sourceNode) return;

		if (TenYearUI.isDragging) {
			e.preventDefault();
			e.stopPropagation();

			if (TenYearUI.movedNode) {
				// 获取卡牌缩放比例
				let cardScale = 1;
				if (typeof dui !== "undefined" && dui.boundsCaches && dui.boundsCaches.hand) {
					cardScale = dui.boundsCaches.hand.cardScale;
				}

				TenYearUI.sourceNode.style.transform = "translate(" + TenYearUI.sourceNode.tx + "px," + TenYearUI.sourceNode.initialTranslateY + "px) scale(" + cardScale + ")";
				TenYearUI.movedNode = null;
			} else {
				// 恢复到原始位置
				TenYearUI.sourceNode.style.transform = "translate(" + TenYearUI.sourceNode.initialTranslateX + "px," + TenYearUI.sourceNode.initialTranslateY + "px) scale(" + TenYearUI.sourceNode.scale + ")";
			}
		}

		// 清理状态
		if (TenYearUI.sourceNode) {
			TenYearUI.sourceNode.style.transition = null;
			TenYearUI.sourceNode.style.pointerEvents = TenYearUI.originalPointerEvents;
			TenYearUI.sourceNode.style.opacity = 1;
			TenYearUI.sourceNode.style.zIndex = null;
		}

		document.removeEventListener(TenYearUI.evts[1], TenYearUI.dragCardMove);
		document.removeEventListener(TenYearUI.evts[2], TenYearUI.dragCardEnd);

		TenYearUI.sourceNode = null;
		TenYearUI.isDragging = false;

		// 拖拽结束后更新手牌布局
		TenYearUI.updateHandLayout();
	};

	// 确保卡牌元素有tx和ty属性
	TenYearUI.ensureCardPositions = function () {
		if (!ui || !ui.handcards1) return;

		const cards = ui.handcards1.querySelectorAll(".card");
		cards.forEach((card, index) => {
			if (typeof card.tx === "undefined" || typeof card.ty === "undefined") {
				let transformValues = TenYearUI.getTransformValues(card);
				card.tx = transformValues.translateX;
				card.ty = transformValues.translateY;
			}
		});
	};

	// 初始化卡牌拖拽功能
	TenYearUI.initCardDragSwap = function () {
		// 重置状态变量
		TenYearUI.sourceNode = null;
		TenYearUI.movedNode = null;
		TenYearUI.originalPointerEvents = null;
		TenYearUI.isDragging = false;

		// 确保ui.handcards1存在
		if (!ui || !ui.handcards1) {
			console.error("ui.handcards1不存在，延迟初始化");
			setTimeout(TenYearUI.initCardDragSwap, 1000);
			return;
		}

		// 移除可能已存在的事件监听器，防止重复绑定
		ui.handcards1.removeEventListener(TenYearUI.evts[0], TenYearUI.dragCardStart);

		// 确保卡牌有正确的位置属性
		TenYearUI.ensureCardPositions();

		// 为手牌区添加事件监听器
		ui.handcards1.addEventListener(TenYearUI.evts[0], TenYearUI.dragCardStart, {
			passive: false,
		});

		console.log("卡牌拖拽交换位置功能已初始化（仅限水平移动）");
	};

	// 游戏加载完成后初始化功能
	if (document.readyState === "complete") {
		// 延迟执行，确保游戏UI已加载
		setTimeout(TenYearUI.init, 1000);
	} else {
		window.addEventListener("load", function () {
			// 延迟执行，确保游戏UI已加载
			setTimeout(TenYearUI.init, 1000);
		});
	}

	// 如果十周年UI加载了，我们需要集成到它的生命周期中
	if (typeof decadeUI !== "undefined") {
		const originalInit = decadeUI.init;
		decadeUI.init = function () {
			const result = originalInit.apply(this, arguments);
			// 初始化卡牌拖拽功能
			setTimeout(TenYearUI.init, 1000);
			return result;
		};
	}

	// 提供接口便于其他模块调用
	window.initCardDragSwap = TenYearUI.initCardDragSwap;

	console.log("十周年UI卡牌拖拽交换位置功能模块已加载");
})();
