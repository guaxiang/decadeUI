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
	const handlers = {
		CREATE(d) {
			if (dynamics.length >= 4) return;
			const newDynamic = new duilib.AnimationPlayer(d.pathPrefix, "offscreen", d.canvas);
			newDynamic.id = d.id;
			dynamics.push(newDynamic);
		},
		PLAY(d) {
			const dynamic = dynamics.getById(d.id);
			if (!dynamic) return;
			update(dynamic, d);
			const sprite = typeof d.sprite === "string" ? { name: d.sprite } : d.sprite;
			sprite.loop = true;
			const run = () => {
				const t = dynamic.playSpine(sprite);
				t.opacity = 0;
				t.fadeTo(1, 600);
			};
			if (dynamic.hasSpine(sprite.name)) dynamic.playSpine ? run() : dynamic.loadSpine(sprite.name, "skel", run);
			else dynamic.loadSpine(sprite.name, "skel", run);
		},
		STOP(d) {
			const dynamic = dynamics.getById(d.id);
			if (!dynamic) return;
			dynamic.stopSpine(d.sprite);
		},
		STOPALL(d) {
			const dynamic = dynamics.getById(d.id);
			if (!dynamic) return;
			dynamic.stopSpineAll();
		},
		UPDATE(d) {
			const dynamic = dynamics.getById(d.id);
			if (!dynamic) return;
			update(dynamic, d);
		},
	};
	handlers[data.message]?.(data);
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
