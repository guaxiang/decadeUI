(function () {
	window.TenYearUI = window.TenYearUI || {};
	TenYearUI.init = function () {
		if (typeof decadeUI === "undefined") {
			console.error("十周年UI (decadeUI) 未加载，卡牌拖拽功能无法使用");
			return false;
		}
		TenYearUI.initCardDragSwap();
		return true;
	};
	TenYearUI.isMobile = function () {
		return navigator.userAgent.match(/(iPhone|iPod|Android|ios|iPad|Mobile)/i);
	};
	TenYearUI.evts = TenYearUI.isMobile() ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];
	TenYearUI.cardMargin = 8;
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
	TenYearUI.isSimple = function (sourceIndex, targetIndex) {
		return Math.abs(sourceIndex - targetIndex) === 1;
	};
	TenYearUI.preserveOriginalCardAnimation = function () {
		if (typeof ui !== "undefined" && ui.handcards1) {
			if (ui.handcards1.$cardadd && typeof ui.handcards1.$cardadd === "function") {
				const originalCardAdd = ui.handcards1.$cardadd;
				ui.handcards1.$cardadd = function (cards) {
					const result = originalCardAdd.apply(this, arguments);
					setTimeout(function () {
						TenYearUI.ensureCardPositions();
					}, 500);
					return result;
				};
			}
			if (typeof game !== "undefined" && game.addCard && typeof game.addCard === "function") {
				const originalAddCard = game.addCard;
				game.addCard = function () {
					const result = originalAddCard.apply(this, arguments);
					setTimeout(function () {
						TenYearUI.ensureCardPositions();
					}, 600);
					return result;
				};
			}
		}
	};
	TenYearUI.fixCardOverlap = function () {
		if (!ui || !ui.handcards1) return;
		const cards = Array.from(ui.handcards1.querySelectorAll(".card"));
		if (cards.length <= 1) return;
		let cardScale = 1;
		if (typeof dui !== "undefined" && dui.boundsCaches && dui.boundsCaches.hand) {
			cardScale = dui.boundsCaches.hand.cardScale;
		}
		let lastPos = -9999;
		let needFix = false;
		cards.forEach((card, index) => {
			if (!card || typeof card.tx === "undefined") return;
			if (card.tx - lastPos < TenYearUI.cardMargin * 0.5 && index > 0) {
				needFix = true;
			}
			lastPos = card.tx;
		});
		if (needFix) {
			let startX = cards[0].tx;
			cards.forEach((card, index) => {
				if (index === 0) return;

				const newX = startX + index * (90 * cardScale + TenYearUI.cardMargin);
				card.tx = newX;
				card.style.transform = `translate(${newX}px, ${card.ty}px) scale(${cardScale})`;
				card._transform = card.style.transform;
			});
			console.log("修复卡牌重叠");
		}
	};
	TenYearUI.dragCardStart = function (e) {
		if (typeof lib !== "undefined" && lib && lib.config && lib.config.enable_drag) return;
		if (TenYearUI.sourceNode) return;
		let target = e.target;
		while (target && !target.classList.contains("card")) {
			target = target.parentNode;
			if (!target || target === document.body) return;
		}
		if (target && target.classList.contains("card")) {
			e.preventDefault();
			TenYearUI.sourceNode = target;
			let transformValues = TenYearUI.getTransformValues(TenYearUI.sourceNode);
			TenYearUI.sourceNode.initialTranslateX = transformValues.translateX;
			TenYearUI.sourceNode.initialTranslateY = transformValues.translateY;
			TenYearUI.sourceNode.scale = transformValues.scale;
			TenYearUI.sourceNode.startX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
			TenYearUI.sourceNode.startY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
			TenYearUI.sourceNode.originalTransform = TenYearUI.sourceNode.style.transform;
			TenYearUI.originalPointerEvents = TenYearUI.sourceNode.style.pointerEvents;
			TenYearUI.sourceNode.style.zIndex = 2;
			if (typeof TenYearUI.sourceNode.tx === "undefined") {
				TenYearUI.sourceNode.tx = TenYearUI.sourceNode.initialTranslateX;
			}
			if (typeof TenYearUI.sourceNode.ty === "undefined") {
				TenYearUI.sourceNode.ty = TenYearUI.sourceNode.initialTranslateY;
			}
			document.addEventListener(TenYearUI.evts[1], TenYearUI.dragCardMove, { passive: false });
			document.addEventListener(TenYearUI.evts[2], TenYearUI.dragCardEnd);
			console.log("开始拖拽卡牌", TenYearUI.sourceNode);
		}
	};
	TenYearUI.dragCardMove = function (e) {
		if (TenYearUI.sourceNode) {
			e.preventDefault();
			TenYearUI.sourceNode.style.pointerEvents = "none";
			TenYearUI.sourceNode.style.transition = "none";
			TenYearUI.sourceNode.style.opacity = 0.5;
			let dx = (e.clientX ? e.clientX : e.touches && e.touches[0] ? e.touches[0].clientX : 0) - TenYearUI.sourceNode.startX;
			let zoomFactor = typeof game !== "undefined" && game.documentZoom ? game.documentZoom : 1;
			let newTranslateX = TenYearUI.sourceNode.initialTranslateX + dx / zoomFactor;
			let newTranslateY = TenYearUI.sourceNode.initialTranslateY;
			TenYearUI.sourceNode.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px) scale(${TenYearUI.sourceNode.scale})`;
			const x = e.pageX ? e.pageX : e.touches && e.touches[0] ? e.touches[0].pageX : 0;
			const y = e.pageY ? e.pageY : e.touches && e.touches[0] ? e.touches[0].pageY : 0;
			const currentElement = document.elementFromPoint(x, y);
			if (!ui || !ui.handcards1) {
				console.error("ui.handcards1不存在");
				return;
			}
			if (currentElement && currentElement !== ui.handcards1 && ui.handcards1.contains(currentElement)) {
				let targetCard = currentElement;
				while (targetCard && !targetCard.classList.contains("card")) {
					targetCard = targetCard.parentNode;
					if (!targetCard || targetCard === document.body || targetCard === ui.handcards1) return;
				}
				if (!targetCard || targetCard === TenYearUI.sourceNode) return;
				if (TenYearUI.movedNode && TenYearUI.movedNode === targetCard) return;
				TenYearUI.movedNode = targetCard;
				const children = [...ui.handcards1.children];
				const sourceIndex = children.indexOf(TenYearUI.sourceNode);
				const targetIndex = children.indexOf(targetCard);
				let cardScale = 1;
				if (typeof dui !== "undefined" && dui.boundsCaches && dui.boundsCaches.hand) {
					cardScale = dui.boundsCaches.hand.cardScale;
				}
				TenYearUI.ensureCardPositions();
				if (sourceIndex > targetIndex) {
					ui.handcards1.insertBefore(TenYearUI.sourceNode, targetCard);
					if (TenYearUI.isSimple(sourceIndex, targetIndex)) {
						let currentElementX = targetCard.tx;
						targetCard.tx = TenYearUI.sourceNode.tx;
						targetCard.style.transform = "translate(" + targetCard.tx + "px," + targetCard.ty + "px) scale(" + cardScale + ")";
						targetCard._transform = targetCard.style.transform;
						TenYearUI.sourceNode.tx = currentElementX;
						TenYearUI.sourceNode._transform = "translate(" + TenYearUI.sourceNode.tx + "px," + TenYearUI.sourceNode.ty + "px) scale(" + cardScale + ")";
					} else {
						let startIndex = targetIndex;
						let endIndex = sourceIndex - 1;
						let targetX = targetCard.tx;
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
				} else if (sourceIndex < targetIndex) {
					ui.handcards1.insertBefore(TenYearUI.sourceNode, targetCard.nextSibling);
					if (TenYearUI.isSimple(sourceIndex, targetIndex)) {
						let tx = targetCard.tx;
						targetCard.tx = TenYearUI.sourceNode.tx;
						targetCard.style.transform = "translate(" + targetCard.tx + "px," + targetCard.ty + "px) scale(" + cardScale + ")";
						targetCard._transform = targetCard.style.transform;
						TenYearUI.sourceNode.tx = tx;
						TenYearUI.sourceNode._transform = "translate(" + TenYearUI.sourceNode.tx + "px," + TenYearUI.sourceNode.ty + "px) scale(" + cardScale + ")";
					} else {
						let startIndex = sourceIndex + 1;
						let endIndex = targetIndex;
						let targetX = targetCard.tx;
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
				requestAnimationFrame(function () {
					TenYearUI.fixCardOverlap();
				});
				console.log("交换位置:", sourceIndex, "=>", targetIndex);
			}
		}
	};
	TenYearUI.dragCardEnd = function (e) {
		if (!TenYearUI.sourceNode) return;
		function clear() {
			if (!TenYearUI.sourceNode) return;
			TenYearUI.sourceNode.style.transition = null;
			TenYearUI.sourceNode.style.pointerEvents = TenYearUI.originalPointerEvents;
			TenYearUI.sourceNode.style.opacity = 1;
			TenYearUI.sourceNode.style.zIndex = null;
		}
		if (TenYearUI.movedNode) {
			let cardScale = 1;
			if (typeof dui !== "undefined" && dui.boundsCaches && dui.boundsCaches.hand) {
				cardScale = dui.boundsCaches.hand.cardScale;
			}

			TenYearUI.sourceNode.style.transform = "translate(" + TenYearUI.sourceNode.tx + "px," + TenYearUI.sourceNode.initialTranslateY + "px) scale(" + cardScale + ")";
			clear();
			TenYearUI.movedNode = null;
			setTimeout(function () {
				TenYearUI.fixCardOverlap();
			}, 50);
		} else if (TenYearUI.sourceNode) {
			let cardScale = 1;
			if (typeof dui !== "undefined" && dui.boundsCaches && dui.boundsCaches.hand) {
				cardScale = dui.boundsCaches.hand.cardScale;
			}
			if (typeof TenYearUI.sourceNode.tx !== "undefined") {
				TenYearUI.sourceNode.style.transform = "translate(" + TenYearUI.sourceNode.tx + "px," + TenYearUI.sourceNode.initialTranslateY + "px) scale(" + cardScale + ")";
			}
			clear();
		}
		document.removeEventListener(TenYearUI.evts[1], TenYearUI.dragCardMove);
		document.removeEventListener(TenYearUI.evts[2], TenYearUI.dragCardEnd);
		TenYearUI.sourceNode = null;
		console.log("拖拽结束");
	};
	TenYearUI.ensureCardPositions = function () {
		if (!ui || !ui.handcards1) return;
		const cards = ui.handcards1.querySelectorAll(".card");
		let hasPositionIssue = false;
		cards.forEach((card, index) => {
			if (typeof card.tx === "undefined" || typeof card.ty === "undefined") {
				let transformValues = TenYearUI.getTransformValues(card);
				card.tx = transformValues.translateX;
				card.ty = transformValues.translateY;
				hasPositionIssue = true;
			}
		});
		if (hasPositionIssue) {
			TenYearUI.fixCardOverlap();
		}
	};
	TenYearUI.initCardDragSwap = function () {
		TenYearUI.sourceNode = null;
		TenYearUI.movedNode = null;
		TenYearUI.originalPointerEvents = null;
		if (!ui || !ui.handcards1) {
			console.error("ui.handcards1不存在，延迟初始化");
			setTimeout(TenYearUI.initCardDragSwap, 1000);
			return;
		}
		ui.handcards1.removeEventListener(TenYearUI.evts[0], TenYearUI.dragCardStart);
		TenYearUI.ensureCardPositions();
		TenYearUI.preserveOriginalCardAnimation();
		ui.handcards1.addEventListener(TenYearUI.evts[0], TenYearUI.dragCardStart, { passive: false });
		if (TenYearUI.positionInterval) {
			clearInterval(TenYearUI.positionInterval);
		}
		TenYearUI.positionInterval = setInterval(TenYearUI.ensureCardPositions, 2000);
		if (TenYearUI.handObserver) {
			TenYearUI.handObserver.disconnect();
		}
		TenYearUI.handObserver = new MutationObserver(function (mutations) {
			setTimeout(function () {
				TenYearUI.ensureCardPositions();
				TenYearUI.fixCardOverlap();
			}, 300);
		});
		TenYearUI.handObserver.observe(ui.handcards1, {
			childList: true,
		});
		console.log("卡牌拖拽交换位置功能已初始化（仅限水平移动）");
	};
	if (document.readyState === "complete") {
		setTimeout(TenYearUI.init, 1000);
	} else {
		window.addEventListener("load", function () {
			setTimeout(TenYearUI.init, 1000);
		});
	}
	if (typeof decadeUI !== "undefined") {
		const originalInit = decadeUI.init;
		decadeUI.init = function () {
			const result = originalInit.apply(this, arguments);
			setTimeout(TenYearUI.init, 1000);
			return result;
		};
		if (decadeUI.animate && decadeUI.animate.card) {
			const originalDraw = decadeUI.animate.card.draw;
			decadeUI.animate.card.draw = function () {
				const result = originalDraw.apply(this, arguments);
				setTimeout(function () {
					TenYearUI.ensureCardPositions();
					TenYearUI.fixCardOverlap();
				}, 500);
				return result;
			};
		}
	}
	window.initCardDragSwap = TenYearUI.initCardDragSwap;
	window.fixCardOverlap = TenYearUI.fixCardOverlap;
	console.log("十周年UI卡牌拖拽交换位置功能模块已加载");
})();
