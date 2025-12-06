"use strict";
decadeModule.import((lib, game, ui, get, ai, _status) => {
	// 使用技能的时候发言对应台词
	game.trySkillAudio = function (skill, player, directaudio, nobroadcast, skillInfo, args) {
		if (!nobroadcast) {
			game.broadcast(game.trySkillAudio, skill, player, directaudio, nobroadcast, skillInfo, args);
		}
		if (!lib.config.background_speak || !lib.config.extension_十周年UI_skillDieAudio) return;

		const info = skillInfo || lib.skill[skill];
		if (!info) return;
		if (info.direct && !directaudio) return;
		if (lib.skill.global.includes(skill) && !info.forceaudio) return;

		const audioObj = get.Audio.skill({ skill, player, info: skillInfo, args });
		const pick = audioObj.audioList.slice().randomRemove();
		if (!pick) return;
		if (pick.text && player?.say) player.say(pick.text);
		return game.tryAudio({ audioList: [pick.file], random: false });
	};

	// 死亡的时候发言对应台词
	game.tryDieAudio = function (player, dieInfo) {
		game.broadcast(game.tryDieAudio, player, dieInfo);
		if (!lib.config.background_speak || !lib.config.extension_十周年UI_skillDieAudio) return;
		if (!player) return;
		const audioObj = get.Audio.die({ player, info: dieInfo });
		const pick = audioObj.audioList.slice().randomRemove();
		if (!pick) return;
		if (pick.text && player.say) player.say(pick.text);
		return game.tryAudio({ audioList: [pick.file], random: false });
	};

	// 武将使用卡牌彩蛋
	const originalUseCard = lib.element.Player.prototype.useCard;
	lib.element.Player.prototype.useCard = function (...args) {
		const event = originalUseCard.apply(this, args);
		if (event) {
			const { card, player, targets } = event;
			if (card && player) {
				if (get.name(card, player) === "jiu") {
					const isZhugeLiang = get.nameList(player).some(name => name && name.includes("zhugeliang"));
					if (isZhugeLiang) {
						player.say?.("北伐，启动！");
						game.playAudio("..", "extension", "十周年UI", "audio/caidan/zhugeliang1.mp3");
					}
					const isCaoCao = get.nameList(player).some(name => name && name.includes("caocao"));
					if (isCaoCao && game.players && game.players.length > 0) {
						const hasGuanYu = game.players.some(p => get.nameList(p).some(name => name && name.includes("guanyu")));
						if (hasGuanYu) {
							player.say?.("云长公，请饮此热酒！");
							game.playAudio("..", "extension", "十周年UI", "audio/caidan/caocao3.mp3");
						}
					}
				}
				if (get.name(card, player) === "tao" || get.name(card, player) === "taoyuan") {
					const isDianWei = get.nameList(player).some(name => name && name.includes("dianwei"));
					if (isDianWei && targets && targets.length > 0) {
						const hasCaoCao = targets.some(target => get.nameList(target).some(name => name && name.includes("caocao")));
						if (hasCaoCao) {
							player.say?.("主公勿忧！典韦来也！");
							game.playAudio("..", "extension", "十周年UI", "audio/caidan/dianwei1.mp3");
						}
					}
					const isZhugeLiang = get.nameList(player).some(name => name && name.includes("zhugeliang"));
					if (isZhugeLiang && targets && targets.length > 0) {
						const feiYiTarget = targets.find(target => get.nameList(target).some(name => name && name.includes("feiyi")));
						if (feiYiTarget) {
							feiYiTarget.say?.("丞相所托，我等必不辜负！");
							game.playAudio("..", "extension", "十周年UI", "audio/caidan/feiyi1.mp3");
						}
					}
				}
				if (get.name(card, player) === "sha" || get.name(card, player) === "juedou") {
					const isZhangFei = get.nameList(player).some(name => name && name.includes("zhangfei"));
					if (isZhangFei && targets && targets.length > 0) {
						const hasLvBu = targets.some(target => get.nameList(target).some(name => name && name.includes("lvbu")));
						if (hasLvBu) {
							player.say?.("三姓家奴休走！");
							game.playAudio("..", "extension", "十周年UI", "audio/caidan/zhangfei1.mp3");
						}
					}
					const isXuZhu = get.nameList(player).some(name => name && name.includes("xuzhu"));
					if (isXuZhu && targets && targets.length > 0) {
						const hasXuYou = targets.some(target => get.nameList(target).some(name => name && name.includes("xuyou")));
						if (hasXuYou) {
							player.say?.("许攸如此无礼，某杀之矣！");
							game.playAudio("..", "extension", "十周年UI", "audio/caidan/xuchu1.mp3");
						}
					}
					const isyuanshao = get.nameList(player).some(name => name && name.includes("yuanshao"));
					if (isyuanshao && targets && targets.length > 0) {
						const hasdongzhuo = targets.some(target => get.nameList(target).some(name => name && name.includes("dongzhuo")));
						if (hasdongzhuo) {
							player.say?.("汝剑利！吾剑未尝不利！");
							game.playAudio("..", "extension", "十周年UI", "audio/caidan/yuanshao1.mp3");
						}
					}
					const isSimayi = get.nameList(player).some(name => name && name.includes("simayi"));
					if (isSimayi && targets && targets.length > 0) {
						const caoCaoTarget = targets.find(target => get.nameList(target).some(name => name && name.includes("caocao")));
						if (caoCaoTarget) {
							caoCaoTarget.say?.("仲达啊，孤终究还是看错了你");
							game.playAudio("..", "extension", "十周年UI", "audio/caidan/caocao4.mp3");
						}
					}
					const isGuanSuo = get.nameList(player).some(name => name && name.includes("guansuo"));
					if (isGuanSuo && game.players && game.players.length > 0) {
						const hasBaoSanNiang = game.players.some(p => get.nameList(p).some(name => name && name.includes("baosanniang")));
						if (hasBaoSanNiang) {
							player.say?.("伤病已无碍。三娘，此次南征，我定要为你拿下首功！");
							game.playAudio("..", "extension", "十周年UI", "audio/caidan/guansuo1.mp3");
						}
					}
				}
			}
		}
		return event;
	};

	// 貂蝉受伤特殊语音（真不是乃杀
	const originalDamage = lib.element.Player.prototype.damage;
	lib.element.Player.prototype.damage = function (...args) {
		const event = originalDamage.apply(this, args);
		event?.then(() => {
			const damaged = event?.player || this;
			if (!damaged) return;
			const isDiaochan = get.nameList(damaged).some(name => name && name.includes("diaochan"));
			if (!isDiaochan) return;
			damaged.say?.("嗯啊~");
			game.playAudio("..", "extension", "十周年UI", "audio/caidan/diaochan1.mp3");
		});
		return event;
	};

	// 真是一对苦命鸳鸯啊
	lib.announce.subscribe("gameStart", () => {
		if (!game.players || game.players.length === 0) return;
		const lvBu = game.players.find(player => get.nameList(player).some(name => name && name.includes("lvbu")));
		const dongZhuo = game.players.find(player => get.nameList(player).some(name => name && name.includes("dongzhuo")));
		if (lvBu && dongZhuo) {
			setTimeout(() => {
				lvBu.say?.("你，你可有何话说？");
				setTimeout(() => {
					dongZhuo.say?.("再无话说，请速速动手！");
				}, 1000);
			}, 500);
		}
		const caoCao = game.players.find(player => get.nameList(player).some(name => name && name.includes("caocao")));
		const chenGong = game.players.find(player => get.nameList(player).some(name => name && name.includes("chengong")));
		if (caoCao && chenGong) {
			setTimeout(() => {
				caoCao.say?.("公台，别来无恙");
				game.playAudio("..", "extension", "十周年UI", "audio/caidan/caocao1.mp3");
				setTimeout(() => {
					chenGong.say?.("汝心术不正！吾不栖汝！");
					game.playAudio("..", "extension", "十周年UI", "audio/caidan/chengong1.mp3");
				}, 1000);
			}, 500);
		}
		const guanYu = game.players.find(player => get.nameList(player).some(name => name && name.includes("guanyu")));
		if (caoCao && guanYu) {
			setTimeout(() => {
				caoCao.say?.("云长，别来无恙否？");
				game.playAudio("..", "extension", "十周年UI", "audio/caidan/caocao2.mp3");
			}, 500);
		}
		const miHeng = game.players.find(player => get.nameList(player).some(name => name && name.includes("miheng")));
		if (caoCao && miHeng) {
			setTimeout(() => {
				caoCao.say?.("你以为辱骂几句，便能彰显才学？");
				game.playAudio("..", "extension", "十周年UI", "audio/caidan/caocao5.mp3");
			}, 500);
		}
	});
});
