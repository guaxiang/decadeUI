(function () {
	window.TenYearUI = window.TenYearUI || {};
	TenYearUI.dragThreshold = 5;
	TenYearUI.cardMargin = 8;
	TenYearUI.isDragging = false;
	TenYearUI.sourceNode = null;
	TenYearUI.movedNode = null;
	TenYearUI.originalPointerEvents = null;
	TenYearUI.isMobileDevice = navigator.userAgent.match(/(iPhone|iPod|Android|ios|iPad|Mobile)/i);
	TenYearUI.evts = TenYearUI.isMobileDevice ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];
	TenYearUI.init = async function () {
		await TenYearUI.initCardDragSwap();
	};
	TenYearUI.getTransformValues = async function (element) {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				try {
					const style = window.getComputedStyle(element);
					const matrix = new DOMMatrixReadOnly(style.transform);
					resolve({ translateX: matrix.m41, translateY: matrix.m42, scale: matrix.m11 });
				} catch (e) {
					resolve({ translateX: 0, translateY: 0, scale: 1 });
				}
			});
		});
	};
	TenYearUI.updateHandLayout = async function () {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				if (window.dui && dui.layout && typeof dui.layout.updateHand === "function") {
					dui.layout.updateHand();
				}
				resolve();
			});
		});
	};
	TenYearUI.getCardElement = function (target) {
		return target ? target.closest(".card") : null;
	};
	TenYearUI.setCardTransform = async function (card, tx, ty, scale) {
		if (!card || typeof tx !== "number" || typeof ty !== "number") return;
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				card.tx = tx;
				card.ty = ty;
				const transformValue = `translate(${tx}px, ${ty}px) scale(${scale})`;
				card.style.transform = transformValue;
				card._transform = transformValue;
				resolve();
			});
		});
	};
	TenYearUI.dragCardStart = async function (e) {
		if (e.button === 2) return;
		const cardElement = TenYearUI.getCardElement(e.target);
		if (!cardElement) return;
		const touch = e.touches ? e.touches[0] : e;
		const startX = touch.clientX;
		const startY = touch.clientY;
		const transformValues = await TenYearUI.getTransformValues(cardElement);
		TenYearUI.sourceNode = cardElement;
		Object.assign(cardElement, {
			startX: startX,
			startY: startY,
			initialTranslateX: transformValues.translateX,
			initialTranslateY: transformValues.translateY,
			scale: transformValues.scale,
		});
		TenYearUI.isDragging = false;
		TenYearUI.originalPointerEvents = getComputedStyle(cardElement).pointerEvents;
		document.addEventListener(TenYearUI.evts[1], TenYearUI.dragCardMove, { passive: false });
		document.addEventListener(TenYearUI.evts[2], TenYearUI.dragCardEnd, { passive: false });
	};
	TenYearUI.dragCardMove = async function (e) {
		const sourceCard = TenYearUI.sourceNode;
		if (!sourceCard) return;
		const touch = e.touches ? e.touches[0] : e;
		const currentX = touch.clientX;
		const currentY = touch.clientY;
		const dx = currentX - sourceCard.startX;
		const dy = currentY - sourceCard.startY;
		if (!TenYearUI.isDragging) {
			const distance = Math.sqrt(dx * dx + dy * dy);
			if (distance > TenYearUI.dragThreshold) {
				TenYearUI.isDragging = true;
				e.preventDefault();
				e.stopPropagation();
				Object.assign(sourceCard.style, {
					pointerEvents: "none",
					transition: "none",
					opacity: "0.5",
					zIndex: "99",
				});
			}
		}
		if (TenYearUI.isDragging) {
			const zoomFactor = (window.game && game.documentZoom) || 1;
			const newTranslateX = sourceCard.initialTranslateX + dx / zoomFactor;
			sourceCard.style.transform = `translate(${newTranslateX}px, ${sourceCard.initialTranslateY}px) scale(${sourceCard.scale})`;
			const pointElement = document.elementFromPoint(touch.pageX, touch.pageY);
			const targetCard = TenYearUI.getCardElement(pointElement);
			if (targetCard && targetCard !== sourceCard && targetCard.parentNode === ui.handcards1 && TenYearUI.movedNode !== targetCard) {
				TenYearUI.movedNode = targetCard;
				await TenYearUI.swapCardPosition(sourceCard, targetCard);
			}
		}
	};
	TenYearUI.swapCardPosition = async function (sourceCard, targetCard) {
		const handContainer = ui.handcards1;
		const children = Array.from(handContainer.childNodes);
		const sourceIndex = children.indexOf(sourceCard);
		const targetIndex = children.indexOf(targetCard);
		if (sourceIndex === -1 || targetIndex === -1) return;
		const cardScale = (window.dui && dui.boundsCaches && dui.boundsCaches.hand && dui.boundsCaches.hand.cardScale) || 1;
		const isMovingLeft = sourceIndex > targetIndex;
		handContainer.insertBefore(sourceCard, isMovingLeft ? targetCard : targetCard.nextSibling);
		const sourceTx = sourceCard.tx;
		await TenYearUI.setCardTransform(sourceCard, targetCard.tx, sourceCard.initialTranslateY, cardScale);
		await TenYearUI.setCardTransform(targetCard, sourceTx, targetCard.ty, cardScale);
		const start = isMovingLeft ? targetIndex + 1 : sourceIndex;
		const end = isMovingLeft ? sourceIndex : targetIndex - 1;
		const updatedChildren = Array.from(handContainer.childNodes);
		const updatePromises = [];
		for (let i = start; i <= end; i++) {
			const card = updatedChildren[i];
			if (card && card !== sourceCard && typeof card.tx !== "undefined") {
				const originalIdx = children.indexOf(card);
				const neighborIdx = isMovingLeft ? originalIdx - 1 : originalIdx + 1;
				const neighborCard = children[neighborIdx];
				if (neighborCard) {
					updatePromises.push(TenYearUI.setCardTransform(card, neighborCard.tx, card.ty, cardScale));
				}
			}
		}
		await Promise.all(updatePromises);
		await TenYearUI.updateHandLayout();
	};
	TenYearUI.dragCardEnd = async function (e) {
		const sourceCard = TenYearUI.sourceNode;
		if (!sourceCard) return;
		if (TenYearUI.isDragging) {
			e.preventDefault();
			e.stopPropagation();
			if (!TenYearUI.movedNode) {
				sourceCard.style.transform = `translate(${sourceCard.initialTranslateX}px, ${sourceCard.initialTranslateY}px) scale(${sourceCard.scale})`;
			}
		}
		Object.assign(sourceCard.style, {
			transition: "",
			pointerEvents: TenYearUI.originalPointerEvents || "",
			opacity: "1",
			zIndex: "",
		});
		document.removeEventListener(TenYearUI.evts[1], TenYearUI.dragCardMove);
		document.removeEventListener(TenYearUI.evts[2], TenYearUI.dragCardEnd);
		TenYearUI.sourceNode = null;
		TenYearUI.movedNode = null;
		TenYearUI.isDragging = false;
		await TenYearUI.updateHandLayout();
	};
	TenYearUI.ensureCardPositions = async function () {
		if (!ui || !ui.handcards1) return;
		const cards = ui.handcards1.querySelectorAll(".card");
		const positionPromises = Array.from(cards).map(async card => {
			if (typeof card.tx === "undefined" || typeof card.ty === "undefined") {
				const { translateX, translateY } = await TenYearUI.getTransformValues(card);
				card.tx = translateX;
				card.ty = translateY;
			}
		});
		await Promise.all(positionPromises);
	};
	TenYearUI.initCardDragSwap = async function () {
		if (!ui || !ui.handcards1) {
			setTimeout(() => TenYearUI.initCardDragSwap(), 1000);
			return;
		}
		const handContainer = ui.handcards1;
		handContainer.removeEventListener(TenYearUI.evts[0], TenYearUI.dragCardStart);
		handContainer.addEventListener(TenYearUI.evts[0], TenYearUI.dragCardStart, { passive: false });
		await TenYearUI.ensureCardPositions();
	};
	async function onReady() {
		setTimeout(async () => {
			await TenYearUI.init();
		}, 1000);
	}
	if (document.readyState === "complete") {
		onReady();
	} else {
		window.addEventListener("load", onReady);
	}
})();
