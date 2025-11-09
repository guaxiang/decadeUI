"use strict";
Array.prototype.remove = function (item) {
	const index = this.indexOf(item);
	if (index >= 0) return this.splice(index, 1);
	return item;
};
const window = self;
const devicePixelRatio = 1;
const documentZoom = 1;
const HTMLCanvasElement = () => "HTMLCanvasElement";
const HTMLElement = () => "HTMLElement";
importScripts("spine.js", "animation.js");
const dynamics = [];
dynamics.getById = function (id) {
	return this.find(item => item.id === id) ?? null;
};
onmessage = (e) => {
	const { data } = e;
	switch (data.message) {
		case "CREATE":
			if (dynamics.length >= 4) return;
			const newDynamic = new duilib.AnimationPlayer(data.pathPrefix, "offscreen", data.canvas);
			newDynamic.id = data.id;
			dynamics.push(newDynamic);
			break;
		case "PLAY": {
			const dynamic = dynamics.getById(data.id);
			if (!dynamic) return;
			update(dynamic, data);
			const sprite = typeof data.sprite === "string" ? { name: data.sprite } : data.sprite;
			sprite.loop = true;
			const run = () => {
				const t = dynamic.playSpine(sprite);
				t.opacity = 0;
				t.fadeTo(1, 600);
			};
			if (dynamic.hasSpine(sprite.name)) {
				run();
			} else {
				dynamic.loadSpine(sprite.name, "skel", run);
			}
			break;
		}
		case "STOP": {
			const dynamic = dynamics.getById(data.id);
			if (!dynamic) return;
			dynamic.stopSpine(data.sprite);
			break;
		}
		case "STOPALL": {
			const dynamic = dynamics.getById(data.id);
			if (!dynamic) return;
			dynamic.stopSpineAll();
			break;
		}
		case "UPDATE": {
			const dynamic = dynamics.getById(data.id);
			if (!dynamic) return;
			update(dynamic, data);
			break;
		}
	}
};
const update = (dynamic, data) => {
	dynamic.resized = false;
	const properties = ["dpr", "dprAdaptive", "outcropMask", "useMipMaps", "width", "height"];
	for (const prop of properties) {
		if (data[prop] != null) {
			dynamic[prop] = data[prop];
		}
	}
};
