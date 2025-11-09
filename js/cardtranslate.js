(() => {
	window.dui = window.dui || {};
	dui.dragThreshold = 5;
	dui.cardMargin = 8;
	dui.isDragging = false;
	dui.sourceNode = null;
	dui.movedNode = null;
	dui.originalPointerEvents = null;
	dui.isMobileDevice = navigator.userAgent.match(/(iPhone|iPod|Android|ios|iPad|Mobile)/i);
	dui.evts = dui.isMobileDevice ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];

	dui.init = async () => {
		await dui.initCardDragSwap();
	};

	dui.getTransformValues = async (element) => {
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

	dui.updateHandLayout = async () => {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				if (typeof window.dui?.layout?.updateHand === "function") {
					dui.layout.updateHand();
				}
				resolve();
			});
		});
	};

	dui.getCardElement = (target) => target?.closest(".card") ?? null;

	dui.setCardTransform = async (card, tx, ty, scale) => {
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
	dui.dragCardStart = async (e) => {
		if (e.button === 2) return;
		const cardElement = dui.getCardElement(e.target);
		if (!cardElement) return;
		const touch = e.touches?.[0] ?? e;
		const { clientX: startX, clientY: startY } = touch;
		const transformValues = await dui.getTransformValues(cardElement);
		dui.sourceNode = cardElement;
		Object.assign(cardElement, {
			startX,
			startY,
			initialTranslateX: transformValues.translateX,
			initialTranslateY: transformValues.translateY,
			scale: transformValues.scale,
		});
		dui.isDragging = false;
		dui.originalPointerEvents = getComputedStyle(cardElement).pointerEvents;
		document.addEventListener(dui.evts[1], dui.dragCardMove, { passive: false });
		document.addEventListener(dui.evts[2], dui.dragCardEnd, { passive: false });
	};
	dui.dragCardMove = async (e) => {
		const sourceCard = dui.sourceNode;
		if (!sourceCard) return;
		const touch = e.touches?.[0] ?? e;
		const { clientX: currentX, clientY: currentY } = touch;
		const dx = currentX - sourceCard.startX;
		const dy = currentY - sourceCard.startY;
		if (!dui.isDragging) {
			const distance = Math.sqrt(dx * dx + dy * dy);
			if (distance > dui.dragThreshold) {
				dui.isDragging = true;
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
		if (dui.isDragging) {
			const zoomFactor = window.game?.documentZoom ?? 1;
			const newTranslateX = sourceCard.initialTranslateX + dx / zoomFactor;
			sourceCard.style.transform = `translate(${newTranslateX}px, ${sourceCard.initialTranslateY}px) scale(${sourceCard.scale})`;
			const pointElement = document.elementFromPoint(touch.pageX, touch.pageY);
			const targetCard = dui.getCardElement(pointElement);
			if (targetCard && targetCard !== sourceCard && targetCard.parentNode === ui.handcards1 && dui.movedNode !== targetCard) {
				dui.movedNode = targetCard;
				await dui.swapCardPosition(sourceCard, targetCard);
			}
		}
	};
	dui.swapCardPosition = async (sourceCard, targetCard) => {
		const handContainer = ui.handcards1;
		const children = Array.from(handContainer.childNodes);
		const sourceIndex = children.indexOf(sourceCard);
		const targetIndex = children.indexOf(targetCard);
		if (sourceIndex === -1 || targetIndex === -1) return;
		const cardScale = window.dui?.boundsCaches?.hand?.cardScale ?? 1;
		const isMovingLeft = sourceIndex > targetIndex;
		handContainer.insertBefore(sourceCard, isMovingLeft ? targetCard : targetCard.nextSibling);
		const sourceTx = sourceCard.tx;
		await dui.setCardTransform(sourceCard, targetCard.tx, sourceCard.initialTranslateY, cardScale);
		await dui.setCardTransform(targetCard, sourceTx, targetCard.ty, cardScale);
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
					updatePromises.push(dui.setCardTransform(card, neighborCard.tx, card.ty, cardScale));
				}
			}
		}
		await Promise.all(updatePromises);
		await dui.updateHandLayout();
	};
	dui.dragCardEnd = async (e) => {
		const sourceCard = dui.sourceNode;
		if (!sourceCard) return;
		if (dui.isDragging) {
			e.preventDefault();
			e.stopPropagation();
			if (!dui.movedNode) {
				sourceCard.style.transform = `translate(${sourceCard.initialTranslateX}px, ${sourceCard.initialTranslateY}px) scale(${sourceCard.scale})`;
			}
		}
		Object.assign(sourceCard.style, {
			transition: "",
			pointerEvents: dui.originalPointerEvents ?? "",
			opacity: "1",
			zIndex: "",
		});
		document.removeEventListener(dui.evts[1], dui.dragCardMove);
		document.removeEventListener(dui.evts[2], dui.dragCardEnd);
		dui.sourceNode = null;
		dui.movedNode = null;
		dui.isDragging = false;
		await dui.updateHandLayout();
	};
	dui.ensureCardPositions = async () => {
		if (!ui?.handcards1) return;
		const cards = ui.handcards1.querySelectorAll(".card");
		const positionPromises = Array.from(cards).map(async (card) => {
			if (typeof card.tx === "undefined" || typeof card.ty === "undefined") {
				const { translateX, translateY } = await dui.getTransformValues(card);
				card.tx = translateX;
				card.ty = translateY;
			}
		});
		await Promise.all(positionPromises);
	};

	dui.initCardDragSwap = async () => {
		if (!ui?.handcards1) {
			setTimeout(() => dui.initCardDragSwap(), 1000);
			return;
		}
		const handContainer = ui.handcards1;
		handContainer.removeEventListener(dui.evts[0], dui.dragCardStart);
		handContainer.addEventListener(dui.evts[0], dui.dragCardStart, { passive: false });
		await dui.ensureCardPositions();
	};

	const onReady = async () => {
		setTimeout(async () => {
			await dui.init();
		}, 1000);
	};

	if (document.readyState === "complete") {
		onReady();
	} else {
		window.addEventListener("load", onReady);
	}
})();
