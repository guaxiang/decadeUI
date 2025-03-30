app.import(function(lib, game, ui, get, ai, _status, app) {
    //第一页
    var plugin = {
        name: "character",
        filter() {
            return !['chess', 'tafang', 'stone', 'connect'].includes(get.mode());
        },
        content(next){},
        precontent(){
            app.reWriteFunction(lib,{
                setIntro:[
                    function(args,node){
                        if (get.itemtype(node) === "player") {
                            if (lib.config.touchscreen)lib.setLongPress(node, plugin.click.playerIntro);
                            else if (lib.config.right_info)node.oncontextmenu=plugin.click.playerIntro;
                            return node;
                        }
                    },
                ],
            });
        },
        click:{
            identity(e) {
                e.stopPropagation();
                var player = this.parentNode;
                if (!game.getIdentityList) return;
                if (player.node.guessDialog)player.node.guessDialog.classList.toggle("hidden");
                else {
                    var list = game.getIdentityList(player);
                    if (!list) return;
                    var guessDialog = ui.create.div(".guessDialog", player);
                    var container = ui.create.div(guessDialog);

                    lib.setScroll(guessDialog);
                    player.node.guessDialog = guessDialog;
                };
            },
            playerIntro(e) {
                e.stopPropagation();
                if (plugin.playerDialog) {
                    return plugin.playerDialog.show(this);
                }
                var container = ui.create.div(".popup-container.hidden", ui.window, function(e) {
                    if (e.target === container) {
                        game.playAudio('../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3');
                        container.hide();
                        game.resume2();
                    }
                });
                container.style.backgroundColor = 'RGBA(0, 0, 0, 0.5)';
                var dialog = ui.create.div(".character-dialog.popped", container);
                var blackBg1 = ui.create.div(".blackBg.one", dialog);
                var blackBg2 = ui.create.div(".blackBg.two", dialog);
                var basicInfo = ui.create.div(".basicInfo", blackBg1);
                var rightPane = ui.create.div(".right", blackBg2);
                var createButton = function(name, parent) {
                    if (!name) return;
                    if (!lib.character[name]) return;
                    var button = ui.create.button(name, "character", parent, true);
                };
                container.show = function(player) {
                    game.playAudio('../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3');
                    var name = player.name1 || player.name;
                    var name2 = player.name2;
                    if (player.classList.contains("unseen") && player !== game.me) {
                        name = "unknown";
                    }
                    if (player.classList.contains("unseen2") && player !== game.me) {
                        name2 = "unknown";
                    }
                    //武将图
                    var biankuang = ui.create.div(".biankuang2", blackBg1);
                    var leftPane = ui.create.div(".left2", biankuang);
                    leftPane.style.backgroundImage = player.node.avatar.style.backgroundImage;
                    var leftPane = ui.create.div(".left2", biankuang);
                    leftPane.style.backgroundImage = player.node.avatar.style.backgroundImage;
                    let popuperContainer = null;
                    let popuperContainerBool = true;
                    //先确定名字，方便后面调用
                    var namex=player === game.me ? lib.config.connect_nickname:[
                        "缘之空", "小小恐龙", "自然萌", "海边的ebao", "小云云", "点点", "猫猫虫", "爱莉爱莉", "冰佬", "鹿鹿", "黎佬", "浮牢师", "U佬", "蓝宝", "影宝", "柳下跖", "k9", "扶苏", "皇叔"
                    ].randomGet();
                    //胜率同理
                    const intPart = get.SL?get.SL(player):(Math.floor(Math.random()*(95-50+1))+50)+"%";
                    //官阶同理
                    const guanjiejibie=Math.floor(Math.random()*13+1);
                    //人气值
                    const renqi=Math.floor(Math.random() * 10000 + 1);
                    //逃跑率
                    const taopaolv = Math.floor(Math.random() * (10 - 0 + 1) + 0);
                    //段位
                    const duanweinum=Math.floor(Math.random()*6+1);
                    //等级
                    const dengji=([(Math.floor(Math.random()*(200-180+1))+180),200,200].randomGet());
                    //会员等级(基于官阶，并保证一定范围内随机)
                    const VipLv=Math.min(guanjiejibie+1,10);
                    //mvp次数
                    const mvpnum=(Math.floor(Math.random()*(60-20+1))+20);
                    //资料页============================================================================
                    leftPane.onclick = function() {
                        game.playAudio('../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3');
                        if (!popuperContainerBool) {
                            if (popuperContainer) {
                                popuperContainer.style.display = 'block';
                            };
                            popuperContainerBool = true;
                        } else {
                            if (!popuperContainer) {
                                popuperContainer = ui.create.div(".popup-container", {
                                    background: "rgb(0,0,0,0.8)"
                                }, ui.window);
                                popuperContainer.style.display = 'none';
                                var guanbi = ui.create.div('.guanbi', popuperContainer);
                                guanbi.addEventListener("click", function() {
                                    popuperContainer.style.display = 'none';
                                    popuperContainerBool = false;
                                    game.playAudio('../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3');
                                });
                                var bigdialog = ui.create.div(".bigdialog", popuperContainer);
                                //三国秀及名称
                                var minixingxiang = ui.create.div(".minixingxiang", bigdialog);
                                var nameX=ui.create.div(".nameX",namex,minixingxiang);
                                var dengjiX=ui.create.div(".dengjiX",dengji+'级',minixingxiang);
                                var huiyuanX=ui.create.div(".huiyuanX",'会员'+VipLv,minixingxiang);
                                minixingxiang.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/xinsha/xingxiang"+Math.floor(Math.random()*6)+".png");
                                //官阶
                                const guanjieTranslation={
                                    1:['骁卒',['步卒','伍长','什长','队率','屯长','部曲']],
                                    2:['校尉',['县尉','都尉','步兵校尉','典军校尉']],
                                    3:['郎将',['骑郎将','车郎将','羽林中郎将','虎贲中郎将']],
                                    4:['偏将军',['折冲将军','虎威将军','征虏将军','荡寇将军']],
                                    5:['将军',['监军将军','抚军将军','典军将军','领军将军']],
                                    6:['上将军',['后将军','左将军','右将军','前将军']],
                                    7:['国护军',['护军','左护军','右护军','中护军']],
                                    8:['国都护',['都护','左都护','右都护','中都护']],
                                    9:['统帅',['卫将军']],
                                    10:['统帅',['车骑将军']],
                                    11:['统帅',['骠骑将军']],
                                    12:['大将军',['大将军']],
                                    13:['大司马',['大司马']],
                                };
                                let guanjie=ui.create.div(".guanjie", bigdialog);
                                guanjie.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/OL_line/sactx_"+guanjiejibie+".png");
                                let guanjieName=ui.create.div(".guanjiewenzi",'<center>'+guanjieTranslation[guanjiejibie][0]+'<br><center>'+(guanjieTranslation[guanjiejibie][1].randomGet()),guanjie);
                                let xinyufen=ui.create.div(".xinyufen",'100',bigdialog);
                                let renqishuzi=ui.create.div(".renqizhi",''+renqi,bigdialog);
                                //将灯
                                let jddialog=ui.create.div(".jddialog",bigdialog);
                                //所有将灯
                                const jiangdengClasses = ['biao', 'cui', 'guo', 'jiang', 'jiangjie','jie','mou','qi','shan','shen','sp','wenwu','xian','zu']; 
                                //随机获取将灯亮灭
                                let jiangdengsuiji=jiangdengClasses.randomGets(guanjiejibie>8?guanjiejibie+1:([guanjiejibie-1,guanjiejibie].randomGet()));
                                let jiangdengLiang=[];
                                let jiangdengLiangguanjie=guanjiejibie>4?['biao','sp','guo','jiang','jie']:['biao','guo','jiang'];
                                if(guanjiejibie>6)jiangdengLiangguanjie.push('jiangjie');
                                for(let i of jiangdengClasses){
                                    if(jiangdengLiangguanjie.includes(i)||jiangdengsuiji.includes(i))jiangdengLiang.push(i);
                                };
                                for (let i = 0; i < jiangdengClasses.length; i++) {
                                    let name = jiangdengClasses[i];
                                    let jdditu=ui.create.div(".jdditu",jddialog);
                                    let jdtubiao=ui.create.div(jiangdengLiang.includes(jiangdengClasses[i])?'.jdtubiao':'.jdtubiaoan',jdditu);
                                    jdtubiao.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/OL_line/"+name+".png");
                                    if(jiangdengLiang.includes(jiangdengClasses[i])){
                                        let donghua=ui.create.div('.jd'+name+'donghua',jdtubiao);
                                    }
                                };
                                //段位
                                const duanweiTranslation={
                                    1:['新兵一','新兵二','新兵三'],
                                    2:['骁骑一','骁骑二','骁骑三'],
                                    3:['先锋一','先锋二','先锋三','先锋四'],
                                    4:['大将一','大将二','大将三','大将四'],
                                    5:['主帅一','主帅二','主帅三','主帅四','主帅五'],
                                    6:['枭雄','至尊枭雄','绝世枭雄'],
                                };
                                let paiwei=ui.create.div(".paiweiditu", bigdialog);
                                let duanwei=ui.create.div(".duanwei",paiwei);
                                let duanweishuzi=ui.create.div(".duanweishuzi",'<center>'+(duanweiTranslation[duanweinum].randomGet()),paiwei);
                                duanwei.setBackgroundImage("extension/十周年UI/shoushaUI/character/images/OL_line/pwtx_"+duanweinum+".png");
                                let shenglv=ui.create.div(".shenglvx","百场胜率 "+intPart+"<br>MVP        "+mvpnum+"次",paiwei);
                                //排位类型
                                let paiweiType=ui.create.div(".paiweiType",'排位赛',paiwei);
                                let typeleft=ui.create.div(".typeleft",paiwei);
                                let typeright=ui.create.div(".typeright",paiwei);
                                //擅长武将
                                let shanchangdialog=ui.create.div(".shanchangdialog", bigdialog);
                                let shanchang = Object.keys(lib.character).filter(key => !lib.filter.characterDisabled(key)).randomGets(5);
                                for (let i = 0; i < 5; i++) {
                                    let charName = shanchang[i];
                                    let group = lib.character[charName][1];
                                    // 武将图片
                                    let charPic = ui.create.div(`.shanchang`, shanchangdialog);
                                    charPic.setBackground(charName, 'character');
                                    let huanfu=ui.create.div(`.huanfu`, charPic);
                                    huanfu.onclick = function() {
                                        window.zyile_charactercard ? window.zyile_charactercard(charName, charPic, false) : ui.click.charactercard(charName, charPic, lib.config.mode == "guozhan" ? "guozhan" : true);
                                    };
                                    let groupname=['wei','shu','wu','qun','jin','shen'].includes(group)?group:'shen';
                                    // 边框
                                    let kuang = ui.create.div(`.kuang`, charPic);
                                    kuang.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/OL_line/ol_${groupname}.png`);
                                    //武将名
                                    let name=ui.create.div('.charName',get.translation(charName),kuang);
                                    // 势力图标
                                    let shili = ui.create.div(`.shili`, kuang);
                                    shili.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/OL_line/ols_${groupname}.png`);
                                };
                            };
                            popuperContainer.style.display = 'block';
                            popuperContainerBool = false;
                        }
                    };
                    createButton(name, leftPane.firstChild);
                    createButton(name2, leftPane.firstChild);
                    let groupname=['wei','shu','wu','qun','jin','shen'].includes(player.group)?player.group:'shen';
                    //武将边框
                    var biankuang3 = ui.create.div(".biankuang3", blackBg1);
                    biankuang3.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/OL_line/olst_${groupname}.png`);
                    //势力图标
                    var biankuang4=ui.create.div(".biankuang4", blackBg1);
                    biankuang4.setBackgroundImage(`extension/十周年UI/shoushaUI/character/images/OL_line/ols_${groupname}.png`)
                    //武将名	
                    var nametext = '';
                    if (name && name2) {
                        if (name == 'unknown') nametext += '未知';
                        else if (lib.translate[name + '_ab']) nametext += lib.translate[name + '_ab'];
                        else nametext += get.translation(name);
                        nametext += ' / ';
                        if (name2 == 'unknown') nametext += '未知';
                        else if (lib.translate[name2 + '_ab']) nametext += lib.translate[name2 + '_ab'];
                        else nametext += get.translation(name2);
                    } else {
                        if (name == 'unknown') nametext += '未知';
                        else if (lib.translate[name + '_ab']) nametext += lib.translate[name + '_ab'];
                        else nametext += get.translation(name);
                    };
                    var namestyle = ui.create.div('.name', nametext, dialog);
                    namestyle.dataset.camp = player.group;
                    if (name && name2) {
                        namestyle.style.fontSize = '20px';
                        namestyle.style.letterSpacing = '1px';
                    };
                    //配件
                    var peijian = ui.create.div('.peijian', biankuang4);
                    var peijianto = ['p1', 'p2', ];
                    peijian.setBackgroundImage('extension/十周年UI/shoushaUI/character/images/OL_line/' + peijianto.randomGet() + '.png');
                    // 玩家名放置
                    var wanjia = ui.create.div('.wanjia', biankuang, namex+'Lv.'+dengji);
                    //胜率 逃跑率 人气值
                    var shenglv = ui.create.div(".shenglv", biankuang);
                    shenglv.innerHTML = `${intPart}`;
                    var taolv = ui.create.div(".taolv", biankuang);
                    taolv.innerHTML = taopaolv + "%";
                    var renqizz= ui.create.div(".renqi", biankuang);
                    renqizz.innerHTML =renqi;
                    //关闭按钮
                    var diaozhui = ui.create.div('.diaozhui', biankuang4);
                    diaozhui.setBackgroundImage('extension/十周年UI/shoushaUI/character/images/OL_line/diaozhui.png');
                    diaozhui.addEventListener("click", event => {
                        game.playAudio('../extension/十周年UI/shoushaUI/lbtn/images/SSCD/caidan.mp3');
                        container.hide();
                        game.resume2();
                    });
                    //以下是右侧文本栏==================================================================================
                    dialog.classList.add("single");
                    rightPane.innerHTML = "<div></div>";
                    lib.setScroll(rightPane.firstChild);
                    var oSkills=player.getSkills(null, false, false).slice(0).filter(function(skill) {
                        if (!lib.skill[skill] || skill == "jiu") return false;
                        if (lib.skill[skill].nopop || lib.skill[skill].equipSkill) return false;
                        return lib.translate[skill + "_info"] && lib.translate[skill + "_info"] != "";
                    });
                    if (player==game.me && player.hiddenSkills.length) oSkills.addArray(player.hiddenSkills);
                    var allShown = player.isUnderControl() || (!game.observe && game.me && game.me.hasSkillTag("viewHandcard", null, player, true));
                    var shownHs = player.getShownCards();
                    var eSkills = player.getVCards("e");
                    var judges = player.getVCards("j");
                    //明置牌区===================================================================================
                    if (shownHs.length) {
                        ui.create.div(".xcaption", player.getCards("h").some(card => !shownHs.includes(card)) ? "明置的手牌" : "手牌区域", rightPane.firstChild);
                        shownHs.forEach(function(item) {
                            var card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
                            card.style.zoom = "0.6";
                            rightPane.firstChild.appendChild(card);
                        });
                        if (allShown) {
                            var hs = player.getCards("h");
                            hs.removeArray(shownHs);
                            if (hs.length) {
                                ui.create.div(".xcaption", "其他手牌", rightPane.firstChild);
                                hs.forEach(function(item) {
                                    var card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
                                    card.style.zoom = "0.6";
                                    rightPane.firstChild.appendChild(card);
                                });
                            }
                        }
                    } else if (allShown) {
                        var hs = player.getCards("h");
                        if (hs.length) {
                            const title = ui.create.div(".xcaption", "手牌区域", rightPane.firstChild);
                            // 直接添加背景样式(需确保图片路径正确)
                            title.style.cssText = `
                            /* 背景设置 */
                            background: url('extension/十周年UI/shoushaUI/character/images/OL_line/quyu4.png') center/contain no-repeat;background-size: 260px 30px;background-origin: content-box;
                            /* 文本设置 */
                            text-align: content;line-height: 1.8;
                            /* 基础样式 */
                            color: #bb9870;display: inline-block;position: relative;min-width: 250px;`;
                            hs.forEach(function(item) {
                                var card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
                                card.style.zoom = "0.6";
                                rightPane.firstChild.appendChild(card);
                            });
                        }
                    }
                    //技能区===================================================================================
                    if (oSkills.length) {
                        // 创建技能标题
                        const title = ui.create.div(".xcaption", "武将技能", rightPane.firstChild);
                        // 提取标题样式，便于修改和查看
                        title.style.cssText = `
                            background: url('extension/十周年UI/shoushaUI/character/images/OL_line/quyu4.png') center/contain no-repeat;
                            background-size: 260px 30px;
                            background-origin: content-box;
                            text-align: center;
                            line-height: 1.8;
                            color: #bb9870;
                            display: inline-block;
                            position: relative;
                            min-width: 250px;
                        `;
                        for(let name of oSkills){
                            let info = get.info(name);
                            let typeText;
                            // 判断技能类型
                            if (info.juexingji || info.limited) {
                                typeText = player.awakenedSkills.includes(name) ? '已发动' : '未发动';
                            } else {
                                typeText = info.trigger?'被动':'主动';
                            };
                            const skillTypeHTML =`<span class="skill-type-tag">（${typeText}）</span>`;
                            const generateSkillHTML = (nameContent, descContent) => {
                                return `<div data-color>${nameContent}</div>${skillTypeHTML}<div>${descContent}</div>`;
                            };
                            if (player.forbiddenSkills[name]) {
                                if (player.forbiddenSkills[name].length) {
                                    ui.create.div(".xskill",generateSkillHTML('<span style="opacity:0.5">' + lib.translate[name] + '</span>','<span style="opacity:0.5">(与' + get.translation(player.forbiddenSkills[name]) + '冲突)' + get.skillInfoTranslation(name, player)),rightPane.firstChild);
                                } else {
                                    ui.create.div(".xskill",generateSkillHTML('<span style="opacity:0.5">' + lib.translate[name] + '</span>','<span style="opacity:0.5">(双将禁用)' + get.skillInfoTranslation(name, player)),rightPane.firstChild);
                                }
                            } else if (player.hiddenSkills.includes(name)) {
                                if (lib.skill[name].preHidden && get.mode() == "guozhan") {
                                    var id = name + "_idx";
                                    id = ui.create.div(".xskill",generateSkillHTML('<span style="opacity:0.5">' + lib.translate[name] + '</span>','<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + '</span>' +'<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">预亮技能</div>'),rightPane.firstChild);
                                    var underlinenode = id.querySelector(".underlinenode");
                                    if (_status.prehidden_skills.includes(name)) underlinenode.classList.remove("on");
                                    underlinenode.link = name;
                                    underlinenode.listen(ui.click.hiddenskill);
                                } else {
                                    ui.create.div(".xskill",generateSkillHTML('<span style="opacity:0.5">' + lib.translate[name] + '</span>','<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + '</span>'),rightPane.firstChild);
                                }
                            } else if (!player.getSkills().includes(name) || player.awakenedSkills.includes(name)) {
                                ui.create.div(".xskill",generateSkillHTML('<span style="opacity:0.5">' + lib.translate[name] + '</span>','<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + '</span>'),rightPane.firstChild);
                            } else if (lib.skill[name].frequent || lib.skill[name].subfrequent) {
                                var id = name + "_id";
                                id = ui.create.div(".xskill",generateSkillHTML(lib.translate[name],get.skillInfoTranslation(name, player) +'<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">自动发动</div>'),rightPane.firstChild);
                                var underlinenode = id.querySelector(".underlinenode");
                                if (lib.skill[name].frequent) {
									if (lib.config.autoskilllist.includes(name)) {
										underlinenode.classList.remove("on");
									}
								}
								if (lib.skill[name].subfrequent) {
									for (var j = 0; j < lib.skill[name].subfrequent.length; j++) {
										if (lib.config.autoskilllist.includes(name + "_" + lib.skill[name].subfrequent[j])) {
											underlinenode.classList.remove("on");
										}
									}
								}
								if (lib.config.autoskilllist.includes(name)) underlinenode.classList.remove("on");
								underlinenode.link = name;
								underlinenode.listen(ui.click.autoskill2);
                            } else if (lib.skill[name].clickable && player.isIn() && player.isUnderControl(true)) {
                                var id = name + "_idy";
                                id = ui.create.div(".xskill",generateSkillHTML(lib.translate[name],get.skillInfoTranslation(name, player) +'<br><div class="menubutton skillbutton" style="position:relative;margin-top:5px">点击发动</div>'),rightPane.firstChild);
                            } else {
                                ui.create.div(".xskill",generateSkillHTML(lib.translate[name],get.skillInfoTranslation(name, player)),rightPane.firstChild);
                            }
                            function createYanshengSkill(skill){//衍生技处理
                                const ysskillname = get.skillTranslation(skill);
                                const has=player.hasSkill(skill) ? '已生效' : '未生效';
                                const ysskillmiaoshu = get.translation(skill + '_info');
                                const ysSkillNameTypeHTML = player.hasSkill(skill)? `<span class="yanshengji">${ysskillname}(${has})</span>`:`<span style="color: #978a81;" class="yanshengji">${ysskillname}(${has})</span>`;
                                const ysSkillDescHTML = `<span class="yanshengjiinfo">${ysskillmiaoshu}</span>`;
                                const ysSkillHTML = ysSkillNameTypeHTML+ysSkillDescHTML;
                                ui.create.div(".xskill", ysSkillHTML, rightPane.firstChild);
                            };
                            if (info.derivation) {// 衍生技
                                if (Array.isArray(info.derivation)) {
                                    for (let skill of info.derivation) {
                                        createYanshengSkill(skill);
                                    }
                                } else {
                                    createYanshengSkill(info.derivation);
                                }
                            }
                        };
                    }

                    //装备区===================================================================================
                    if (eSkills.length) {
                        // 创建标题元素(保持原样)
                        const title = ui.create.div(".xcaption", "装备区域", rightPane.firstChild);
                        title.style.cssText = `
                        background: url('extension/十周年UI/shoushaUI/character/images/OL_line/quyu4.png') center/contain no-repeat;background-size: 260px 30px;background-origin: content-box;text-align: content;line-height: 1.8;color: #bb9870;display: inline-block;position: relative;  min-width: 250px;`;
                        eSkills.forEach(function(card) {
                            // 花色配置
                            const suitConfig = {
                                'spade':{symbol: '♠',color: '#2e2e2e'},
                                'heart': {symbol: '♥',color: '#e03c3c'},
                                'club': {symbol: '♣',color: '#2e2e2e'},
                                'diamond': {symbol: '♦',color: '#e03c3c'}
                            } [card.suit] || {
                                symbol: '',
                                color: '#FFFFFF'
                            };
                            // 获取装备类型图标
                            const equipType = lib.card[card.name]?.equipType;
                            const typeIcon = {
                                'equip1': 'equip1.png',
                                'equip2': 'equip2.png',
                                'equip3': 'equip3.png',
                                'equip4': 'equip4.png',
                                'equip5': 'equip5.png',
                            } [get.subtype(card)] || 'default.png';
                            const dianshu={
                                1:'A',
                                11:'J',
                                12:'Q',
                                13:'K',
                            }[card.number]||card.number;
                            // 第一行布局结构
                            const firstLine = `<div style="display: flex;align-items: center;gap: 8px;position: relative;">
                            <!-- 装备名称 -->
                            <span style="color: #f7d229;font-weight: bold;">${get.translation(card.name).replace(/[【】]/g, '')}</span>
                            <!-- 类别图标 -->
                            <img src="extension/十周年UI/shoushaUI/character/images/OL_line/${typeIcon}" style="width:14px; height:20px; vertical-align:middle">
                            <!-- 花色数字组 -->
                            <div style="margin-left: 0;display: flex;align-items: center;gap: 2px;">
                            <!-- 花色符号 -->
                            <span style="color: ${suitConfig.color};text-shadow: 0 0 1px white,0 0 1px white;position: relative;">${suitConfig.symbol}</span>                             
                            <!-- 点数 -->
<span style="margin-left:8px;margin-top:5px;font-size:18px;color: ${suitConfig.symbol === '♠' || suitConfig.symbol === '♣' ? '#ffffff' : suitConfig.color};font-family: shousha;">${dianshu||''}</span>
</div>
</div>`;
                            // 保持原有描述处理
                            let desc = '';
                            if (get.subtype(card) == "equip1") {
                                var num = 1;
                                var info = get.info(card);
                                if (info && info.distance && typeof info.distance.attackFrom == "number") {
                                    num = 1 - info.distance.attackFrom;
                                }
                                if (num < 1) {
                                    num = 1;
                                }
                                desc += '攻击范围:' + num + '<br>';
                            };
                            desc += get.translation(card.name + "_info").replace(/[【】]/g, '');
                            const special = card.cards?.find(item => item.name == card.name && lib.card[item.name]?.cardPrompt);
                            if (special) desc = lib.card[special.name].cardPrompt(special, player);

                            // 创建装备项容器
                            ui.create.div(".xskillx",
                                firstLine + `<div style="margin-top:4px">${desc}</div>`,
                                rightPane.firstChild
                            );
                        });
                    }
                    //判定区===================================================================================
                    if (judges.length) {
                        const title = ui.create.div(".xcaption", "判定区域", rightPane.firstChild);
                        // 直接添加背景样式(需确保图片路径正确)
                        title.style.cssText = `
                        /* 背景设置 */
                        background: url('extension/十周年UI/shoushaUI/character/images/OL_line/quyu4.png') center/contain no-repeat;background-size: 260px 30px;background-origin: content-box;
                        /* 文本设置 */
                        text-align: content;line-height: 1.8;
                        /* 基础样式 */
                        color: #bb9870;display: inline-block;position: relative;min-width: 250px;`;
                        judges.forEach(function(card) {
                            const cards = card.cards;
                            let str = get.translation(card);
                            if (cards?.length && (cards?.length !== 1 || cards[0].name !== card.name)) {
                                if (!lib.card[card]?.blankCard || player.isUnderControl(true)) str += "(" + get.translation(cards) + ")";
                            }
                            ui.create.div(".xskill", "<div data-color>" + str + "</div><div>" + get.translation(card.name + "_info") + "</div>", rightPane.firstChild);
                        });
                    }
                    container.classList.remove("hidden");
                    game.pause2();
                };
                plugin.characterDialog = container;
                container.show(this);
            },
        },
    };
    return plugin;
});