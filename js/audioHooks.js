"use strict";
decadeModule.import((lib, game, ui, get, ai, _status) => {
	// 使用技能的时候播放对应台词
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
		if (pick.text && player?.say) player.say(pick.text);
		return game.tryAudio({ audioList: [pick.file], random: false });
	};

	// 死亡的时候播放对应台词
	game.tryDieAudio = function (player, dieInfo) {
		game.broadcast(game.tryDieAudio, player, dieInfo);
		if (!lib.config.background_speak) return;
		if (!player) return;
		const audioObj = get.Audio.die({ player, info: dieInfo });
		const pick = audioObj.audioList.slice().randomRemove();
		if (!pick) return;
		if (pick.text && player.say) player.say(pick.text);
		return game.tryAudio({ audioList: [pick.file], random: false });
	};

	// 诸葛亮彩蛋-北伐，启动!
	const originalUseCard = lib.element.Player.prototype.useCard;
	lib.element.Player.prototype.useCard = function (...args) {
		const event = originalUseCard.apply(this, args);
		event?.then(() => {
			const { card, player } = event;
			if (!card || !player) return;
			if (get.name(card, player) !== "jiu") return;
			const isZhugeLiang = get.nameList(player).some(name => name && name.includes("zhugeliang"));
			if (!isZhugeLiang) return;
			player.say?.("北伐，启动！");
			game.playAudio("..", "extension", "十周年UI", "audio/caidan/zhugeliang1.mp3");
		});
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
});
