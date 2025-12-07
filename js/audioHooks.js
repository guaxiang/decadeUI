"use strict";
decadeModule.import((lib, game, ui, get, ai, _status) => {
	const hasName = (player, name) => get.nameList(player).some(n => n && n.includes(name));
	const findPlayer = name => game.players?.find(p => hasName(p, name));
	const playAudio = file => game.playAudio("..", "extension", "十周年UI", `audio/caidan/${file}`);

	game.trySkillAudio = function (skill, player, directaudio, nobroadcast, skillInfo, args) {
		if (!nobroadcast) {
			game.broadcast(game.trySkillAudio, skill, player, directaudio, nobroadcast, skillInfo, args);
		}
		if (!lib.config.background_speak) return;
		const info = skillInfo || lib.skill[skill];
		if (!info) return;
		if (info.direct && !directaudio) return;
		if (lib.skill.global.includes(skill) && !info.forceaudio) return;
		const audioObj = get.Audio.skill({ skill, player, info: skillInfo, args });
		const pick = audioObj.audioList.slice().randomRemove();
		if (!pick) return;
		if (pick.text && player?.say && lib.config.extension_十周年UI_skillDieAudio) player.say(pick.text);
		return game.tryAudio({ audioList: [pick.file], random: false });
	};

	game.tryDieAudio = function (player, dieInfo) {
		game.broadcast(game.tryDieAudio, player, dieInfo);
		if (!lib.config.background_speak) return;
		if (!player) return;
		const audioObj = get.Audio.die({ player, info: dieInfo });
		const pick = audioObj.audioList.slice().randomRemove();
		if (!pick) return;
		if (pick.text && player.say && lib.config.extension_十周年UI_skillDieAudio) player.say(pick.text);
		return game.tryAudio({ audioList: [pick.file], random: false });
	};

	// 使用卡牌彩蛋
	const cardEasterEggs = [
		{ cards: ["jiu"], player: "zhugeliang", text: "北伐，启动！", audio: "zhugeliang1.mp3" },
		{ cards: ["jiu"], player: "weiyan", text: "北伐中原？延视为己任久矣！", audio: "weiyan1.mp3" },
		{ cards: ["jiu"], player: "caocao", condition: () => game.players?.some(p => hasName(p, "guanyu")), text: "云长公，请饮此热酒！", audio: "caocao3.mp3" },
		{ cards: ["tao", "taoyuan"], player: "dianwei", condition: ctx => ctx.targets?.some(t => hasName(t, "caocao")), text: "主公勿忧！典韦来也！", audio: "dianwei1.mp3" },
		{ cards: ["tao", "taoyuan"], player: "zhugeliang", condition: ctx => ctx.targets?.find(t => hasName(t, "feiyi")), target: "feiyi", text: "丞相所托，我等必不辜负！", audio: "feiyi1.mp3" },
		{ cards: ["tao", "taoyuan"], player: "zhaoyun", condition: ctx => ctx.targets?.find(t => hasName(t, "liushan")), text: "阿斗，跟云叔走！", audio: "zhaoyun1.mp3" },
		{ cards: ["sha", "juedou"], player: "zhangfei", condition: ctx => ctx.targets?.some(t => hasName(t, "lvbu")), text: "三姓家奴休走！", audio: "zhangfei1.mp3" },
		{ cards: ["sha", "juedou"], player: "zhangxiu", condition: ctx => ctx.targets?.some(t => hasName(t, "caocao")), text: "无耻曹贼！", audio: "zhangxiu1.mp3" },
		{ cards: ["sha", "juedou"], player: "xuzhu", condition: ctx => ctx.targets?.some(t => hasName(t, "xuyou")), text: "许攸如此无礼，某杀之矣！", audio: "xuchu1.mp3" },
		{ cards: ["sha", "juedou"], player: "yuanshao", condition: ctx => ctx.targets?.some(t => hasName(t, "dongzhuo")), text: "汝剑利！吾剑未尝不利！", audio: "yuanshao1.mp3" },
		{ cards: ["sha", "juedou"], player: "simayi", condition: ctx => ctx.targets?.find(t => hasName(t, "caocao")), target: "caocao", text: "仲达啊，孤终究还是看错了你", audio: "caocao4.mp3" },
		{ cards: ["sha", "juedou"], player: "guansuo", condition: () => game.players?.some(p => hasName(p, "baosanniang")), text: "伤病已无碍。三娘，此次南征，我定要为你拿下首功！", audio: "guansuo1.mp3" },
		{ cards: ["sha", "juedou"], player: "zhangliao", condition: ctx => ctx.targets?.some(t => t.group === "wu"), text: "雁门张文远在此！", audio: "zhangliao1.mp3" },
		{ cards: ["sha", "juedou"], player: "diaochan", text: "哈哈，嗯~", audio: "diaochan2.mp3" },
		{ cards: ["baiyin"], player: "zhangfei", condition: () => game.players?.some(p => hasName(p, "machao")), text: "马超！汝的头在此！敢来取否！", audio: "zhangfei3.mp3" },
	];

	const originalUseCard = lib.element.Player.prototype.useCard;
	lib.element.Player.prototype.useCard = function (...args) {
		const event = originalUseCard.apply(this, args);
		if (!event || !event.card || !event.player) return event;
		const cardName = get.name(event.card, event.player);
		const ctx = { card: event.card, player: event.player, targets: event.targets, cardName };
		for (const rule of cardEasterEggs) {
			if (!rule.cards.includes(cardName)) continue;
			if (!hasName(event.player, rule.player)) continue;
			if (rule.condition && !rule.condition(ctx)) continue;
			const speaker = rule.target ? ctx.targets?.find(t => hasName(t, rule.target)) : event.player;
			if (speaker) {
				speaker.say?.(rule.text);
				playAudio(rule.audio);
				break;
			}
		}
		return event;
	};

	//受伤特殊语音
	const damageEasterEggs = [{ player: "diaochan", text: "嗯啊~", audio: "diaochan1.mp3" }];

	const originalDamage = lib.element.Player.prototype.damage;
	lib.element.Player.prototype.damage = function (...args) {
		const event = originalDamage.apply(this, args);
		event?.then(() => {
			const damaged = event?.player || this;
			if (!damaged) return;
			for (const rule of damageEasterEggs) {
				if (hasName(damaged, rule.player)) {
					damaged.say?.(rule.text);
					playAudio(rule.audio);
					break;
				}
			}
		});
		return event;
	};

	//真是一对苦命鸳鸯啊
	const gameStartDialogues = [
		{
			players: ["lvbu", "dongzhuo"],
			dialogues: [
				{ player: "lvbu", text: "你，你可有何话说？", delay: 500 },
				{ player: "dongzhuo", text: "再无话说，请速速动手！", delay: 1500 },
			],
		},
		{
			players: ["caocao", "chengong"],
			dialogues: [
				{ player: "caocao", text: "公台，别来无恙", audio: "caocao1.mp3", delay: 500 },
				{ player: "chengong", text: "汝心术不正！吾不栖汝！", audio: "chengong1.mp3", delay: 1500 },
			],
		},
		{ players: ["zhugeliang", "luji"], dialogues: [{ player: "zhugeliang", text: "此真，旧病复发也。哈哈哈哈", audio: "zhugeliang4.mp3", delay: 500 }] },
		{ players: ["zhugeliang", "simayi"], dialogues: [{ player: "zhugeliang", text: "仲达，想要我的四轮车吗？", audio: "zhugeliang3.mp3", delay: 500 }] },
		{ players: ["simahui", "zhugeliang"], dialogues: [{ player: "simahui", text: "孔明虽得其主，不得其时。", audio: "simahui1.mp3", delay: 500 }] },
		{ players: ["zhangfei", "zhugeliang"], dialogues: [{ player: "zhangfei", text: "诸葛亮！俺今天就算绑，也要把你绑回去！", audio: "zhangfei2.mp3", delay: 500 }] },
		{ players: ["caocao", "guanyu"], dialogues: [{ player: "caocao", text: "云长，别来无恙否？", audio: "caocao2.mp3", delay: 500 }] },
		{ players: ["caocao", "miheng"], dialogues: [{ player: "caocao", text: "你以为辱骂几句，便能彰显才学？", audio: "caocao5.mp3", delay: 500 }] },
		{ players: ["zhugeliang", "wanglang"], dialogues: [{ player: "zhugeliang", text: "我从未见过！有如此厚颜无耻之人！", audio: "zhugeliang2.mp3", delay: 500 }] },
		{ players: ["wanglang", "zhugeliang"], dialogues: [{ player: "wanglang", text: "诸葛村夫，怎敢与管仲乐毅自恃？", audio: "wanglang1.mp3", delay: 500 }] },
	];

	lib.announce.subscribe("gameStart", () => {
		if (!game.players?.length) return;
		for (const dialogue of gameStartDialogues) {
			const foundPlayers = dialogue.players.map(name => findPlayer(name)).filter(Boolean);
			if (foundPlayers.length !== dialogue.players.length) continue;
			dialogue.dialogues.forEach(({ player, text, audio, delay }) => {
				const targetPlayer = foundPlayers[dialogue.players.indexOf(player)];
				setTimeout(() => {
					targetPlayer.say?.(text);
					if (audio) playAudio(audio);
				}, delay);
			});
		}
	});
});
