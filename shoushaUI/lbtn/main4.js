app.import(function(lib, game, ui, get, ai, _status, app) {
	lib.arenaReady.push(function() {
        const modeConfigs={//身份任务（阵营划分）
            single:{
                zhu:'击败对手',
                fan:'击败对手',
                undefined:'未选择阵营'
            },
            boss:{
                zhu:'击败盟军',
                cai:'击败神祇',
                undefined:'未选择阵营'
            },
            guozhan:()=>{
                const config={
                    undefined:'未选择势力',
                    unknown:'保持隐蔽',
                    ye:'击败场上所有其他角色'
                };
                for(let i=0;i<lib.group.length;i++){
                    config[lib.group[i]]='击败所有非'+get.translation(lib.group[i])+'势力角色';
                };
                return config;
            },
            versus:()=>{
                const versusMode=get.config('versus_mode');
                if(versusMode==='standard')return{};
                if(versusMode==='two'){
                    return {undefined:''+(get.config('replace_character_two')?'击败所有敌方':'协同队友击败所有敌人')+''};
                };
                if(versusMode==='jiange'){
                    return{
                        wei:'击败所有蜀势力角色',
                        shu:'击败所有魏势力角色'
                    };
                };
                if(versusMode==='siguo'){
                    const config={};
                    for(let i=0;i<lib.group.length;i++){
                        config[lib.group[i]]='获得龙船或击败非'+get.translation(lib.group[i])+'势力角色';
                    };
                    return config;
                };
                return {};
            },
            doudizhu:{
                zhu:'击败所有农民',
                fan:'击败地主',
                undefined:'未选择阵营'
            },
            identity:{
                rZhu:'击败冷方主公与所有野心家',
                rZhong:'保护暖方主公击败冷方主公与所有野心家',
                rYe:'联合冷方野心家击败其他角色',
                rNei:'协助冷方主公击败暖方主公与所有野心家',
                bZhu:'击败暖方主公与所有野心家',
                bZhong:'保护冷方主公击败暖方主公与所有野心家',
                bYe:'联合暖方野心家击败其他角色',
                bNei:'协助暖方主公击败冷方主公与所有野心家',
                zhu:'击败反贼和内奸',
                zhong:'保护主公，击败反贼内奸',
                fan:'击败主公',
                nei:'击败所有角色，最后击败主公',
                mingzhong:'保护主公，击败反贼内奸',
                undefined:'击败所有敌方'
            }
        };
        const currentMode=lib.config.mode;
        let translate=modeConfigs[currentMode];
        if(typeof translate==='function')translate=translate();
        if(translate){
            for(const key in translate){
                lib.translate[key+"_win_option"]=translate[key];
            };
        };
		game.ui_identityShow_update=function(){//左上角整体（身份任务及牌局记录）
			var identityShow=game.ui_identityShow;
			var str='';
			if (lib.config.mode=='guozhan'||(lib.config.mode=='versus'&&get.config('versus_mode')=='siguo')||(lib.config.mode=='versus'&&get.config('versus_mode')=='jiange')){
			    const identities=['unknown','wei','shu','wu','qun','jin','ye','key'];
			    const identityCounts={};
			    const identityColors={
			        unknown:'#FFFFDE',
			        wei:'#0075FF',
			        shu:'#FF0000',
			        wu:'#00FF00',
			        qun:'#FFFF00',
			        jin:'#9E00FF',
			        ye:'#9E00FF',
			        key:'#9E00FF',
			    };
			    for (const identity of identities) {
                    identityCounts[identity]=game.countPlayer(current=>{
                        return current.identity === identity;
                    });
                    if(identityCounts[identity]>0)str+='<font color="'+identityColors[identity]+'">'+get.translation(identity)+identityCounts[identity]+'</font>'+' ';
                };
				str+='<br>';
			} else if (lib.config.mode == "versus" && get.config("versus_mode") == "two" || lib.config.mode == 'doudizhu') {} else {
                const identityInfo={
                    zhu:{
                        color:'#AE5F35',
                        aliases:['zhu','rZhu','bZhu']
                    },
                    zhong:{
                        color:'#E9D765',
                        aliases:['zhong','rZhong','bZhong','mingzhong']
                    },
                    fan:{
                        color:'#87A671',
                        aliases:['fan','rYe','bYe']
                    },
                    nei:{
                        color:'#9581C4',
                        aliases:['nei','rNei','bNei']
                    },
                };
                for(const [key,info] of Object.entries(identityInfo)){
                    const count=game.countPlayer(current=>info.aliases.includes(current.identity));
                    if(count>0)str+=`<font color="${info.color}">${get.translation(key)}</font>${count}  `;
                };
                str+='<br>';
			};
			if(game.me)str+='<span style="color: orange;"><center>'+get.translation(game.me.identity+"_win_option")+'</span>';
			identityShow.innerHTML='<span style="font-family:shousha;font-size:16px;font-weight:500;text-align:right;line-height:20px;color:#C1AD92;text-shadow:none;max-width:20px;word-wrap:break-word;">'+str+"</span>";
			let jiluShow=ui.create.div('.jiluButton',identityShow,ui.click.pause);
		};
		if(game.ui_identityShow==undefined){
			game.ui_identityShow=ui.create.div(".identityShow","身份加载中......",ui.window);
		};
		setInterval(function() {
			game.ui_identityShow_update();
		}, 1000);
		//更新身份任务
	    var originUpdateRoundNumber=game.updateRoundNumber;
		game.updateRoundNumber=function(){
			originUpdateRoundNumber.apply(this,arguments);
			if(ui.cardRoundTime)ui.cardRoundTime.updateRoundCard();
		};
		var yinying=ui.create.div('.handcardyinying',ui.window);//阴影
		var caidanbutton=ui.create.div('.caidanbutton',ui.window);
		caidanbutton.onclick = function() {//菜单按钮
			game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/click.mp3");
			var popuperContainer = ui.create.div(".popup-container",ui.window);
			popuperContainer.addEventListener("click", event => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/back.mp3");
				event.stopPropagation();
				popuperContainer.delete(200);
			});
			var HOME = ui.create.div(".caidanopen", popuperContainer);
			var caidan2=ui.create.div(".controls", HOME);//展开后的菜单按钮
			caidan2.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/caidan2.png");
			var SZ = ui.create.div(".controls", HOME);//设置
			SZ.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/shezhi.png");
			SZ.addEventListener("click", event => {
				game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
				if (!ui.click.configMenu) return;
				game.closePopped();
				game.pause2();
				ui.click.configMenu();
				ui.system1.classList.remove("shown");
				ui.system2.classList.remove("shown");
			});
            var BJ = ui.create.div(".controls", HOME);//背景
            BJ.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/beijing.png");
            BJ.addEventListener("click", event => {
                event.stopPropagation();
                game.playAudio("../extension/十周年UI/shoushaUI/lbtn/images/CD/button.mp3");
                var popuperContainer = ui.create.div(".popup-container", {
                    background: "rgba(0, 0, 0, 0.8)"
                }, ui.window);
                var guanbi = ui.create.div('.bgback', popuperContainer, function (e) {
                    game.playAudio('../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3');
                    popuperContainer.hide();
                    game.resume2();
                });
                var bigdialog = ui.create.div(".bgdialog", popuperContainer);
                var bgbg=ui.create.div('.backgroundsbg',bigdialog);
                var Backgrounds = ["人间安乐", "兵临城下", "兵荒马乱", "三国开黑节", "华灯初上", "天书乱斗", "朝堂之上", "校园行", "桃园风格", "汉室当兴", "游卡桌游", "十周年"];
                const path='image/background/';
                game.getFileList(path,function(folders,files){
                    for(let tempbackground of files){
                        let fileName=tempbackground.replace(/\.[^/.]+$/, '');
                        let fileExtension=tempbackground.split('.').pop();
                        if(!fileExtension||fileName.startsWith('oltianhou_'))continue;
                        let img=ui.create.div('.backgrounds',bgbg);
                        img.setBackgroundImage(path+tempbackground);
                        img.addEventListener('click',function(){
                            game.saveConfig('image_background',fileName);
                            lib.init.background();
						    game.updateBackground();
                        });
                        let backgroundName=lib.configMenu.appearence.config.image_background.item[fileName]?lib.configMenu.appearence.config.image_background.item[fileName]:fileName;
                        ui.create.div('.buttontext',backgroundName,img);
                    };
                });
            });
			var TG = ui.create.div(".controls", HOME);//托管
			TG.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/tuoguan.png");
			TG.addEventListener("click", event => {
				ui.click.auto();
			});
			var TC = ui.create.div(".controls", HOME);//离开
			TC.setBackgroundImage("extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/likai.png");
			TC.addEventListener("click", event => {
				window.location.reload();
			});
		};
	});
	var plugin = {
		name: "lbtn",
		filter() {
			return !["chess", "tafang"].contains(get.mode());
		},
		content(next) {
			lib.skill._uicardupdate = {
				trigger: {
					player: "phaseJieshuBegin"
				},
				forced: true,
				unique: true,
				popup: false,
				silent: true,
				noLose: true,
				noGain: true,
				noDeprive: true,
				priority: -Infinity,
				filter(event, player) {
					return player == game.me;
				},
				content() {
					if (ui.updateSkillControl) ui.updateSkillControl(game.me, true);
				},
			};
		},
		precontent() {
			Object.assign(game.videoContent, {
				createCardRoundTime() {
					ui.cardRoundTime = plugin.create.cardRoundTime();
				},
				createhandcardNumber() {
					ui.handcardNumber = plugin.create.handcardNumber();
				},
				updateCardRoundTime(opts) {
					if (!ui.cardRoundTime) return;
					ui.cardRoundTime.node.roundNumber.innerHTML = "<span>第" + game.roundNumber +
						"轮</span>";
					ui.cardRoundTime.setNumberAnimation(opts.cardNumber);
				},
				updateCardnumber(opts) {
					if (!ui.handcardNumber) return;
				},
			});
			app.reWriteFunction(ui.create, {
				me: [
					function() {
						plugin.create.control();
					},
					null,
				],
				arena: [
					null,
					function() {
						if (ui.time3) {
							clearInterval(ui.time3.interval);
							ui.time3.delete();
						}
						if (ui.cardPileNumber) ui.cardPileNumber.delete();
						ui.cardRoundTime = plugin.create.cardRoundTime();
						ui.handcardNumber = plugin.create.handcardNumber();
					},
				],
				cards: [
					null,
					function() {
						if (ui.cardRoundTime) {
							ui.cardRoundTime.updateRoundCard();
						}
					},
				],
			});
			app.reWriteFunction(lib.configMenu.appearence.config, {
				update: [
					null,
					function(res, config, map) {
						map.control_style.hide();
						map.custom_button.hide();
						map.custom_button_system_top.hide();
						map.custom_button_system_bottom.hide();
						map.custom_button_control_top.hide();
						map.custom_button_control_bottom.hide();
						map.radius_size.hide();
					},
				],
			});

			ui.create.confirm = function(str, func) {
				var confirm = ui.confirm;
				if (!confirm) {
					confirm = ui.confirm = plugin.create.confirm();
				}
				confirm.node.ok.classList.add("disabled");
				confirm.node.cancel.classList.add("disabled");
				if (_status.event.endButton) {
					ui.confirm.node.cancel.classList.remove("disabled");
				}
				if (str) {
					if (str.indexOf("o") !== -1) {
						confirm.node.ok.classList.remove("disabled");
					}
					if (str.indexOf("c") !== -1) {
						confirm.node.cancel.classList.remove("disabled");
					}
					confirm.str = str;
				}

				if (func) {
					confirm.custom = func;
				}
				ui.updatec();
				confirm.update();
			};
		},
		create: {
			control() {},
			confirm() {
				var confirm = ui.create.control("<span>确定</span>", "cancel");
				confirm.classList.add("lbtn-confirm");
				confirm.node = {
					ok: confirm.firstChild,
					cancel: confirm.lastChild,
				};
				if (_status.event.endButton) {
					_status.event.endButton.close();
					//	delete event.endButton;
				}
				confirm.node.ok.link = "ok";
				confirm.node.ok.classList.add("primary");
				confirm.node.cancel.classList.add("primary2");
				confirm.custom = plugin.click.confirm;
				app.reWriteFunction(confirm, {
					close: [
						function() {
							this.classList.add("closing");
						},
					],
				});
				for (var k in confirm.node) {
					confirm.node[k].classList.add("disabled");
					confirm.node[k].removeEventListener(lib.config.touchscreen ? "touchend" : "click", ui
						.click.control);
					confirm.node[k].addEventListener(lib.config.touchscreen ? "touchend" : "click",
						function(e) {
							e.stopPropagation();
							if (this.classList.contains("disabled")) {
								if (this.link === "cancel" && this.dataset.type === "endButton" &&
									_status.event.endButton) {
									_status.event.endButton.custom();
									ui.confirm.close();
									//  ui.updatec();
								}
								return;
							}

							if (this.parentNode.custom) {
								this.parentNode.custom(this.link, this);
							}
						});
				}

				if (ui.skills2 && ui.skills2.skills.length) {
					var skills = ui.skills2.skills;
					confirm.skills2 = [];
					for (var i = 0; i < skills.length; i++) {
						var item = document.createElement("div");
						item.link = skills[i];
						item.innerHTML = get.translation(skills[i]);
						item.addEventListener(lib.config.touchscreen ? "touchend" : "click", function(e) {
							e.stopPropagation();
							ui.click.skill(this.link);
						});

						item.dataset.type = "skill2";
						if (ui.updateSkillControl) ui.updateSkillControl(game.me, true);
						/*
						           confirm.insertBefore(item, confirm.firstChild);*/
					}
				}

				confirm.update = function() {
					if (confirm.skills2) {
						if (_status.event.skill && _status.event.skill !== confirm.dataset.skill) {
							confirm.dataset.skill = _status.event.skill;
							confirm.skills2.forEach(function(item) {
								item.remove();
							});
							ui.updatec();
						} else if (!_status.event.skill && confirm.dataset.skill) {
							delete confirm.dataset.skill;
							confirm.skills2.forEach(function(item) {
								confirm.insertBefore(item, confirm.firstChild);
							});
							ui.updatec();
						}
					}
					if (ui.updateSkillControl) ui.updateSkillControl(game.me, true);
				};
				return confirm;
			},
			handcardNumber() {//左下角配件
			    let anniubuttons;
				if (lib.config.extension_十周年UI_XPJ != "on") {
    			    if (lib.config["extension_十周年UI_rightLayout"] == "on") {
    			        anniubuttons=ui.create.div('.leftbuttons',ui.window);
    			    }else{
    			        anniubuttons=ui.create.div('.rightbuttons',ui.window);
    			    };
    			};
                const buttonConfigs = {//小配件
                    gift: {//送花
                        imageBg: "extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/gift.png",
                        click: function(){
                        },
                    },
                    talk: {//交流
                        imageBg: "extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/talk.png",
                        click: function(){
                        },
                    },
                    sortcard: {//牌序
                        imageBg: "extension/十周年UI/shoushaUI/lbtn/images/OL_line/uibutton/cardsort.png",
                        click: function(){
                            if (!game.me || game.me.hasSkillTag("noSortCard")) return;
                            const cards = game.me.getCards("hs");
                            const sort2 = function (b, a) {
                                if (a.name !== b.name)return lib.sort.card(a.name, b.name);
                                else if (a.suit !== b.suit)return lib.suit.indexOf(a) - lib.suit.indexOf(b);
                                return a.number - b.number;
                            };
                            if (cards.length > 1) {
                                cards.sort(sort2);
                                cards.forEach((card, index) => {
                                    game.me.node.handcards1.insertBefore(card, game.me.node.handcards1.firstChild);
                                });
                                dui.queueNextFrameTick(dui.layoutHand, dui);
                            }
                        }
                    }
                };
                for (const [buttonName, config] of Object.entries(buttonConfigs)) {
                    const button = ui.create.div('.anniubutton', anniubuttons);
                    button.setBackgroundImage(config.imageBg);
                    if (config.click)button.onclick = config.click;
                }
			},
			cardRoundTime() {//游戏轮数
				var node = ui.create.div(".cardRoundNumber", ui.arena).hide();
				node.node = {
					cardPileNumber: ui.create.div(".cardPileNumber", node),
					roundNumber: ui.create.div(".roundNumber", node),
					time: ui.create.div(".time", node),
				};

				node.updateRoundCard = function() {
					var cardNumber = ui.cardPile.childNodes.length || 0;
					var roundNumber = game.roundNumber || 0;
					this.node.roundNumber.innerHTML = "<span>第" + get.cnNumber(game.roundNumber) +
						"轮</span>";
					this.setNumberAnimation(cardNumber);
					this.show();
					game.addVideo("updateCardRoundTime", null, {
						cardNumber: cardNumber,
						roundNumber: roundNumber,
					});
				};

				node.setNumberAnimation = function(num, step) {
					var item = this.node.cardPileNumber;
					clearTimeout(item.interval);
					if (!item._num) {
						item.innerHTML = '<span style="font-size: 13px;">' + num + "张</span>"; // 减小字体大小
						item._num = num;
					} else {
						if (item._num !== num) {
							if (!step) step = 500 / Math.abs(item._num - num);
							if (item._num > num) item._num--;
							else item._num++;
							item.innerHTML = '<span style="font-size: 13px;">' + item._num +
							"张</span>"; // 减小字体大小
							if (item._num !== num) {
								item.interval = setTimeout(function() {
									node.setNumberAnimation(num, step);
								}, step);
							}
						}
					}
				};
				ui.time4 = node.node.time;
				ui.time4.starttime = get.utc();
				ui.time4.interval = setInterval(function() {
					var num = Math.round((get.utc() - ui.time4.starttime) / 1000);
					if (num >= 3600) {
						var num1 = Math.floor(num / 3600);
						var num2 = Math.floor((num - num1 * 3600) / 60);
						var num3 = num - num1 * 3600 - parseInt(num2) * 60;
						if (num1 < 10) {
							num1 = "0" + num1.toString();
						}
						if (num2 < 10) {
							num2 = "0" + num2.toString();
						}
						if (num3 < 10) {
							num3 = "0" + num3.toString();
						}
						ui.time4.innerHTML = "<span>" + num1 + ":" + num2 + ":" + num3 + "</span>";
					} else {
						var num1 = Math.floor(num / 60);
						var num2 = num - num1 * 60;
						if (num1 < 10) {
							num1 = "0" + num1.toString();
						}
						if (num2 < 10) {
							num2 = "0" + num2.toString();
						}
						ui.time4.innerHTML = "<span>" + num1 + ":" + num2 + "</span>";
					}
				}, 1000);
				game.addVideo("createCardRoundTime");
				return node;
			},
		},
		click: {
			confirm(link, target) {
				if (link === "ok") {
					ui.click.ok(target);
				} else if (link === "cancel") {
					ui.click.cancel(target);
				} else if (target.custom) {
					target.custom(link);
				}
			},
		},
		compare: {
			type(a, b) {
				if (a === b) return 0;
				var types = ["basic", "trick", "delay", "equip"].addArray([a, b]);
				return types.indexOf(a) - types.indexOf(b);
			},
			name(a, b) {
				if (a === b) return 0;
				return a > b ? 1 : -1;
			},
			nature(a, b) {
				if (a === b) return 0;
				var nature = [undefined, "fire", "thunder"].addArray([a, b]);
				return nature.indexOf(a) - nature.indexOf(b);
			},
			suit(a, b) {
				if (a === b) return 0;
				var suit = ["diamond", "heart", "club", "spade"].addArray([a, b]);
				return suit.indexOf(a) - suit.indexOf(b);
			},
			number(a, b) {
				return a - b;
			},
		},
	};
	return plugin;
});