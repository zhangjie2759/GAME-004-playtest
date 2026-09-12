// Authored fiction. Content proposes effects; only engine.mjs commits them.
export const COMPANY = '澄屿科技';
export const PRODUCT = '拾光一号';
export const DAYS = ['发布倒计时', '预算的另一面', '供应链来电', '那张截图', '风向变了', '最后的筹码', '聚光灯下'];
export const ROUTES = [
  {id:'chairman',label:'董事长',tag:'公司掌舵',role:'董事长',company:COMPANY,project:PRODUCT,description:'在新品发布前的七天里，处理产品、团队、渠道和投资人的压力。',days:DAYS},
  {id:'worker',label:'牛马逆袭',tag:'证据链翻盘',role:'项目运营',company:'飞桥互联',project:'宏远建材数字化项目',description:'被领导推向背锅位后，用聊天、流水、客户记录和同事证言在七天内翻盘。',days:['飞来的锅','口径变了','功劳与责任','故障之夜','PIP前夕','证据归档','会议室里']},
];
export const PERSONAS = [
  {id:'handsome',routeId:'chairman',label:'超级大帅哥',tag:'镜头焦点',defaultTitle:'陆董',openingBalanceCents:1888888888,bio:'外形出众、舆论关注度高；被看见也意味着更容易被放大。',starts:{ready:40,reputation:52,team:62,hype:40}},
  {id:'tycoon',routeId:'chairman',label:'富豪',tag:'资本老手',defaultTitle:'林董',openingBalanceCents:8888888888,bio:'资金从容、谈判强势；钱能解决付款，却买不到团队信任。',starts:{ready:40,reputation:55,team:65,hype:30}},
  {id:'richwoman',routeId:'chairman',label:'富婆',tag:'冷静掌舵',defaultTitle:'沈董',openingBalanceCents:8888888888,bio:'口碑基础更好、决断克制；合作方对每次承诺都格外认真。',starts:{ready:40,reputation:62,team:64,hype:32}},
  {id:'selfmade',routeId:'chairman',label:'白手起家',tag:'一线出身',defaultTitle:'周董',openingBalanceCents:888888888,bio:'从一线走到董事长，团队更亲近你，投资人却在等你证明自己。',starts:{ready:38,reputation:50,team:75,hype:28}},
  {id:'worker-handsome',routeId:'worker',label:'超级大帅哥',tag:'高颜值社畜',defaultTitle:'阿沈',openingBalanceCents:888888,bio:'在公司很容易被记住，但被关注不等于被信任。',starts:{evidence:22,reputation:53,allies:46,pressure:42}},
  {id:'worker',routeId:'worker',label:'普通牛马',tag:'靠记录说话',defaultTitle:'小林',openingBalanceCents:888888,bio:'没有背景，也不想永远忍。你手里最值钱的是每一份原始记录。',starts:{evidence:26,reputation:50,allies:48,pressure:45}},
  {id:'hidden-tycoon',routeId:'worker',label:'隐形富豪',tag:'上班只为体验',defaultTitle:'陆哥',openingBalanceCents:8888888888,bio:'钱不是你留下的理由，你更想看清这套职场规则怎么运转。',starts:{evidence:23,reputation:48,allies:43,pressure:28}},
  {id:'hidden-richwoman',routeId:'worker',label:'隐形富婆',tag:'低调入职',defaultTitle:'小沈',openingBalanceCents:8888888888,bio:'你不需要这份工资，但需要一个让事实被听见的公平结局。',starts:{evidence:25,reputation:55,allies:44,pressure:28}},
];
export const personasForRoute = routeId => PERSONAS.filter(p=>p.routeId===routeId);
const chairmanRoles = [
  ['gm','许总｜总经办','许砚舟','总经理',42,'核心','把结果看得很重，也记得谁替团队扛过压力。','formal'],
  ['finance','财务-沈总监','沈以宁','财务负责人',38,'核心','讲话克制，习惯先问凭证，再讨论信任。','formal'],
  ['product','顾产品','顾清禾','产品负责人',34,'核心','有一点倔，愿意为一项体验反复争取时间。','business'],
  ['supply','老方·供应链','方允诚','供应链负责人',41,'核心','不爱说漂亮话，坏消息通常由他先带来。','business'],
  ['market','陆知夏','陆知夏','市场负责人',32,'核心','嗅觉敏锐，知道公众记得故事，也记得失约。','business'],
  ['hr','HR苏姐','苏若岚','人力负责人',36,'核心','先听人说完，最在意承诺有没有兑现。','formal'],
  ['investor','远岑资本 程总','程子衡','投资方代表',47,'核心','谈利益很直接，尊重能说清底线的人。','formal'],
  ['partner','森渡渠道徐总','徐明舒','渠道合作方',40,'核心','关系可以讲，合同里每一个日期也得算数。','business'],
  ['assistant','小叶｜董事长办','叶予安','董事长助理',28,'环境','把细节放在心上，替你记住每一件未完的事。','social'],
  ['engineer','林工','林知远','测试工程师',27,'环境','话不多，对测试结果认真得近乎固执。','social'],
  ['service','客服小陈','陈景和','客服主管',31,'环境','每天接触用户，知道一句公告后面有多少来电。','social'],
  ['designer','周周不熬夜','周书衡','设计师',29,'环境','爱观察，忙到很晚也会拍一张窗外的天。','social'],
];
const workerRoles = [
  ['manager','王总（直属）','王立衡','业务一部经理',39,'核心','会把模糊的口头要求变成别人的硬责任。','formal'],
  ['boss','赵总｜飞桥互联','赵启铭','公司总经理',46,'核心','平时离项目很远，出问题时只看证据和结果。','formal'],
  ['hr','HR-Mia','何明雅','人力经理',35,'核心','熟悉流程也懂话外音，书面材料比情绪更能说服她。','formal'],
  ['finance','财务孙姐','孙静','财务专员',38,'核心','记得每张凭证的时间，只帮愿意把事说清的人。','formal'],
  ['project','项目老周','周启航','交付负责人',41,'核心','看起来随和，关键时刻只认版本号和时间戳。','business'],
  ['backend','阿哲｜后端','陈哲','后端工程师',29,'核心','对事不对人，愿意为真实的技术时间线作证。','social'],
  ['coworker','小鱼不加班','林晓瑜','项目运营',27,'核心','嘴上总说要跑，真到需要留证时比谁都细。','social'],
  ['client','AAA宏远建材李总','李建国','客户项目负责人',44,'核心','催进度很直接，但谁真的解决了问题，他会记得。','business'],
  ['success','客户成功-橙子','唐橙','客户成功顾问',30,'环境','往返两家公司，手里有不少没进周报的原话。','social'],
  ['legal','法务顾老师','顾闻远','公司法务',37,'环境','不提供爽文答案，只帮你区分事实、推测和可用材料。','formal'],
  ['former','前同事·风过无痕','许川','前产品经理',33,'环境','吃过相似的亏，愿意提醒你，但不会替你冲在前面。','social'],
  ['admin','行政小唐','唐佳','行政专员',26,'环境','看起来只管会议室，实际记得谁几点进过门。','social'],
];
const palette = ['#6c8296','#8b7465','#4f7370','#637b53','#a57762','#988083','#747f96','#8a774f','#739084','#687888','#a08277','#879977'];
const chairmanCompanies={investor:'远岑资本（虚构）',partner:'森渡渠道（虚构）'};
const workerCompanies={client:'宏远建材（虚构）',former:'新状态工作室（虚构）'};
const workerAvatarMap={manager:'gm',boss:'investor',hr:'hr',finance:'finance',project:'product',backend:'engineer',coworker:'designer',client:'partner',success:'service',legal:'supply',former:'market',admin:'assistant'};
export function createContacts(seed = 4107,routeId='chairman') {
  const source=routeId==='worker'?workerRoles:chairmanRoles,shift=Math.abs(seed|0)%source.length;
  return source.map(([id,displayName,legalName,role,age,tier,personality,moneyPolicy],i)=>({
    id,displayName,legalName,name:displayName,role,age,tier,personality,moneyPolicy,identityTags:[role,tier,moneyPolicy],
    color:palette[(i+shift)%palette.length],avatar:(i+shift)%4,image:`./assets/avatars/${routeId==='worker'?workerAvatarMap[id]:id}.png`,
    company:(routeId==='worker'?workerCompanies[id]:'')||(routeId==='chairman'?chairmanCompanies[id]:'')||(routeId==='worker'?'飞桥互联':COMPANY),
  }));
}
const choice = (id, text, reply, company = {}, relation = {}, extra = {}) => ({ id, text, reply, effects: { company, relation }, ...extra });
const event = (id, day, contact, topic, lines, choices, extra = {}) => ({ id, day, contact, topic, lines, choices, ...extra });
export const EVENTS = [
  event('d1-target',1,'gm','发布目标',[
    '{title}，早。发布会定在本周日，场地和首批渠道都在等我们给最终口径。',
    '我想先跟您对齐一件事：这一周，到底把什么放在第一位？团队需要一句不会每天改变的话。'],[
    choice('a','先兑现产品承诺。销量可以慢一点，别把问题留给用户。','明白。我会把这句话带到晨会上，后面有取舍也按这个标准来。',{ready:8, reputation:4},{trust:5,respect:4},{flag:'quality'}),
    choice('b','窗口很短。按期上，声量要打出来，我来扛压力。','好，我把目标往上提。但您说的“扛压力”，下面的人会当真的。',{hype:15,ready:4,team:-7},{respect:5,tension:6},{flag:'speed'}),
    choice('c','今年投入够多了。预算先锁住，别再往里填。','收到。我会让各部门重报最低方案，只是有些代价不会写在预算表上。',{ready:-6,team:-8},{trust:-5,tension:4},{flag:'cost'}),
  ]),
  event('d1-position',1,'market','宣传口径',[
    '{title}，海报初稿到了。团队做了两种说法：“让每个普通夜晚被好好记录”，以及“重新定义家庭影像”。',
    '后一句传播更快，但“重新定义”这四个字，产品那边还没有点头。您希望怎么发？'],[
    choice('a','用第一句。把真实使用场景拍清楚，承诺只写已验证的。','好，我去重剪素材。少一句大话，我们后面就少一次解释。',{reputation:7,ready:2},{trust:4},{flag:'honest'}),
    choice('b','用第二句，发布前得让大家都看见我们。','明白。我会上集中投放，评论区的期待也会跟着升高。',{hype:16,reputation:-4},{respect:3,tension:4},{flag:'bold'}),
    choice('c','两句都先发，哪句热度高就留下哪句。','可以试，不过截过的图收不回来。我会把风险记下来。',{hype:7,reputation:-8},{trust:-3},{flag:'vague'}),
  ]),
  event('d1-test',1,'product','一个未修复的问题',[
    '测试刚发现：连续录制两小时后，少量样机会重启。演示十分钟完全看不出来。',
    '我能今晚先压住，但需要两天完整复测。这个问题要现在让总经理知道吗？'],[
    choice('a','现在同步。写清概率和复测计划，不要只报“可控”。','谢谢您。我把原始记录也带上，问题摊开反而好解决。',{ready:12,team:4},{trust:8,respect:5,tension:-3},{flag:'open'}),
    choice('b','先修，明早给我结果。今晚先不要打乱发布节奏。','我来安排。只是如果明早没修好，我们还是得面对它。',{ready:5,team:-5},{trust:-2,tension:7},{flag:'quiet'}),
    choice('c','演示没问题就行，这轮先别扩大测试范围。','……收到。我会保留这份测试记录。',{ready:-12,reputation:-5,team:-5},{trust:-10,respect:-6,tension:8},{flag:'ignore'}),
  ]),
  event('d2-budget',2,'finance','测试预算',[
    '早，昨晚各部门补了一轮数字。完整复测和备用器件还差八万元，账上不是没有钱，是每笔都有去处。',
    '您可从董事长专项额度拨付。我把用途和付款节点写好了，按哪个方案执行？'],[
    choice('a','拨付八万元，完整复测，按节点给我原始报告。','已收到专项拨款，我会单独留档。谢谢您把用途和验收一起说清楚。',{ready:10,team:3},{trust:5,respect:4},{kind:'transfer',amount:80000,purpose:'测试与备用器件'}),
    choice('b','先付三万元，只覆盖发布演示和首批样机。','已收到三万元。我会把尚未覆盖的测试范围单列，避免大家误以为都做完了。',{ready:4,team:-3},{tension:4},{kind:'transfer',amount:30000,purpose:'首批样机测试'}),
    choice('c','本周不追加，部门自己从现有额度里调。','我再协调一次。现有额度已经很紧，可能得把两项复测往后排。',{ready:-8,team:-6},{trust:-5,tension:4}),
  ]),
  event('d2-team',2,'hr','加班后的团队',[
    '{title}，昨晚测试组到一点才走。有人在群里说“下次团建能不能就是准时下班”。',
    '大家没有来投诉，但这种话连续出现，我不想等到有人提离职才告诉您。'],[
    choice('a','先排轮休，再发个团队红包。别把红包当加班费的替代。','我替他们收下这份心意，也会把轮休名单今天发出去。他们更在意后半句。',{team:10},{trust:6,tension:-4},{kind:'packet',amount:1200,purpose:'测试团队慰问'}),
    choice('b','发一个大红包，撑过这周，发布后再休。','心意我会转达。休息安排我还是先拟好，免得忙完之后又忘了。',{hype:3,team:-6},{trust:-3,tension:6},{kind:'packet',amount:5000,purpose:'发布冲刺慰问'}),
    choice('c','我知道辛苦，但这个阶段先讲结果，之后一起算。','好，我会如实传达。也请您记得这次“之后”。',{team:-12},{trust:-7,tension:9}),
  ]),
  event('d2-channel',2,'partner','渠道预热',[
    '董事长，我们有二十家门店愿意给拾光一号留展示位，但本周得把演示机寄出来。',
    '如果您愿意承诺首发当天现货，我们能把橱窗资源也给您。现在是留空间，还是把阵势铺开？'],[
    choice('a','先做五家体验店，标清试用性质。复测通过再扩大。','可以，五家做扎实。我宁愿您承诺得少一点，也不想让店员当场解释缺货。',{ready:3,reputation:5},{trust:6,respect:3}),
    choice('b','二十家一起上，首发声势不能小。','那我按全面首发排期。门店物料一旦铺开，临时改口会很被动。',{hype:15,team:-5},{respect:4,tension:5},{flag:'full'}),
    choice('c','先用你们的资源预热，现货时间以后再确认。','预热可以谈，但“以后确认”不能印在海报上。我先给您留到明天。',{hype:5,reputation:-6},{trust:-5,tension:5}),
  ]),
  event('d3-supply',3,'supply','供应商的电话',[
    '刚从工厂出来。主批次有一组器件良率不稳，供应商愿意重检，但要多一天，也要一笔加急费用。',
    '另一条线能赶上，不过批次一致性没跑满。厂里现在等我一句话。'],[
    choice('a','付六万元重检，先保住一致性，时间我去协调。','款项已确认，我留在现场盯重检。这次我能拿着明确标准跟厂里谈了。',{ready:12,team:3},{trust:7,respect:5},{kind:'transfer',amount:60000,purpose:'供应商重检预付款',flag:'recheck'}),
    choice('b','付两万元加急，换另一条线，先把首批赶出来。','我会抽样加看一轮。进度能追回来，但请允许我保留“不确定”这三个字。',{ready:3,hype:5,team:-5},{tension:8},{kind:'transfer',amount:20000,purpose:'替代产线加急款',flag:'rush'}),
    choice('c','不追加。让供应商按原合同交付，问题由他们承担。','我会按合同沟通。不过用户不会区分是谁的器件出了问题。',{ready:-10,reputation:-4},{trust:-6,tension:7},{flag:'contract'}),
  ]),
  event('d3-sample',3,'product','样机名单',[
    '供应链方案我看到了。眼下还有一个选择：给体验店的样机，是只挑表现最好的，还是按正常批次抽？',
    '市场担心现场出问题，测试组担心我们只是在挑一段好看的录像。'],[
    choice('a','正常抽样。现场遇到问题就记录下来，别筛掉坏消息。','好。我让测试和市场一起看抽样过程。这样每个人拿到的是同一份事实。',{ready:10,reputation:4,team:3},{trust:6,respect:4}),
    choice('b','演示样机精挑，正式出货再严格抽检。','我会把演示批次单独标明，至少内部不能把它当作量产结果。',{hype:8,ready:2,team:-5},{trust:-2,tension:5}),
    choice('c','别再纠结，能亮机就发，先抢占门店。','……我会跟进所有反馈。只是发出去以后，我们就没有重来一次的机会了。',{ready:-9,reputation:-6,team:-7},{trust:-8,tension:8}),
  ]),
  event('d3-deadline',3,'gm','关于延期的备选',[
    '我把今晚的信息汇总了一下。现在最怕的不是遇到问题，而是每个部门以为别人已经兜住了。',
    '要不要今天就准备一份延期预案？不是决定延期，只是把退路写清楚。'],[
    choice('a','准备。触发条件、对外说法和负责人一起写，不是谁的错。','好。有您这句话，大家可以讨论风险，不必先讨论责任。',{ready:6,team:5,reputation:3},{trust:6,tension:-5},{flag:'backup'}),
    choice('b','可以私下准备，明面上的冲刺目标不变。','我会留一份备用方案。也请您到时亲自解释，免得中层两头传话。',{ready:5,hype:5,team:-5},{respect:3,tension:5}),
    choice('c','不准备。现在讨论退路，团队就不会拼了。','明白。那我会继续催进度，出现新情况再直接找您。',{ready:-5,team:-9},{trust:-6,tension:8}),
  ]),
  event('d4-leak',4,'hr','流出的截图',[
    '一张内部聊天截图流到了行业群，里面有“重启”“先别公开”几个词，上下文被裁掉了。',
    '群里已经开始猜是谁发的。有经理建议先把测试组所有人拉来问一遍。'],[
    choice('a','先核实来源和上下文，不按部门怀疑人。告诉大家可以私下说明。','我来做单独沟通。至少今晚不会有人因为一句转述就被推到人群中间。',{team:7,reputation:5},{trust:6,tension:-4},{flag:'fair'}),
    choice('b','先统一口径，内部逐个查，发布前不能再有第二张。','收到，我会控制知悉范围。不过大家可能会更谨慎，也更少说真话。',{hype:5,team:-10},{trust:-4,tension:8},{flag:'silence'}),
    choice('c','把测试组负责人停掉，先让外面看到我们的态度。','目前还没有证据。我会记录您的决定，但我建议您再想一遍。',{team:-18,reputation:-8},{trust:-12,respect:-8,tension:10},{flag:'blame'}),
  ]),
  event('d4-statement',4,'market','第一条回应',[
    '截图已经有人转到公开讨论区。现在评论不算多，但有人问：为什么内部知道问题，外面还在宣传？',
    '我们今天的第一句话会决定后面怎么被理解。要发哪一个方向？'],[
    choice('a','承认复测中的问题，写清范围和下一次更新时间。','我会让产品确认每个词。回应不漂亮没关系，至少下一次还能接着说。',{reputation:12,hype:2},{trust:6,respect:4},{flag:'transparent'}),
    choice('b','强调正常测试过程，发布计划不变，别放大细节。','我按这个口径写。后续如果再有证据，我们需要补更具体的信息。',{hype:10,reputation:-6,team:-4},{tension:5},{flag:'spin'}),
    choice('c','不回应。越解释越像有问题，等热度过去。','明白。客服那边我只能先让他们说“正在核实”。',{reputation:-15},{trust:-6,tension:6},{flag:'silent'}),
  ]),
  event('d4-voice',4,'gm','谁能对你说不',[
    '今天的会开得很安静。有人把“我担心”改成了“我都可以”。',
    '我不想替所有人表态，只问您一句：如果明天又发现一个坏消息，您希望谁先告诉您？'],[
    choice('a','任何人都可以。你先做示范，带着事实反对我。','记住了。下次我会先把反对意见说完，再谈怎么执行。',{team:8,ready:4},{trust:8,respect:5,tension:-6}),
    choice('b','先由你过滤，重要的单独报，其他人继续执行。','可以。我会扛住这道口子，但也需要时间核实，消息可能不会那么快。',{ready:3,team:-6},{respect:4,tension:5}),
    choice('c','现在缺的是执行力，不是更多反对意见。','……好，我去把执行清单排完。',{team:-13,ready:-4},{trust:-9,tension:9}),
  ]),
  event('d5-service',5,'market','评论区的人',[
    '一位体验用户发了重启视频，评论区开始把它和昨天的截图放在一起。客服同事一直在解释。',
    '我们可以直接联系用户复检并承担损失，也可以先请他删视频，等正式版本出来再说。'],[
    choice('a','先承担复检与补偿。别把删除视频作为条件。','已通知客服按这笔专项款执行。我们不一定马上被原谅，但至少开始解决他的事。',{reputation:12,ready:5,team:3},{trust:6},{kind:'transfer',amount:10000,purpose:'体验用户复检与补偿'}),
    choice('b','先投一轮新的产品内容，把讨论带回发布会。','我会排内容，但客服那通电话还得有人接。',{hype:13,reputation:-8,team:-7},{trust:-3,tension:6}),
    choice('c','要求删掉未经完整验证的视频，否则停止体验资格。','我理解您着急。不过这条要求本身，也可能成为下一张截图。',{reputation:-18,team:-7},{trust:-8,tension:8}),
  ]),
  event('d5-fix',5,'product','复测结果',[
    '更新：重启问题已经定位到功耗管理，修复版正在跑长时测试。团队建议今晚把测试日志整理出来。',
    '这会占用一部分演示排练时间。我们今天优先做哪个？'],[
    choice('a','把测试跑完，发能复查的日志。发布会可以少一个花哨环节。','谢谢。我会让工程师署上自己的名字，也让大家知道结果是谁验证的。',{ready:14,reputation:7,team:5},{trust:7,tension:-4},{flag:'verified'}),
    choice('b','两边都做，今晚把人手集中，务必别再拖。','好，我们再排一个通宵轮班。结果会给您，只是团队确实有些撑不住了。',{ready:13,hype:9,team:-13},{tension:9},{flag:'overtime'}),
    choice('c','先排演示，修复日志以后补，用户不会看这些。','收到。正式出货前，我仍会保留复测这一关。',{ready:-8,reputation:-5,team:-5},{trust:-7,tension:6}),
  ]),
  event('d5-staff',5,'hr','一条请假消息',[
    '测试组有位同事说头疼，想明天晚一点来。他没直接找经理，而是先问我“会不会影响绩效”。',
    '这种时候，您一句话比一份关怀通知更有用。'],[
    choice('a','让他休息，不扣绩效。给值班组发个红包，我去协调排期。','心意收到了。我会把“不扣绩效”明确写给他，这句才让人真的敢休息。',{team:12,ready:2},{trust:8,tension:-6},{kind:'packet',amount:800,purpose:'值班组慰问'}),
    choice('b','发红包给大家鼓鼓劲，请假等发布会后补上。','我转达。钱能收到，疲惫不会立刻消失，我还会继续看着他们。',{ready:4,team:-8,hype:4},{trust:-3,tension:7},{kind:'packet',amount:2000,purpose:'冲刺团队慰问'}),
    choice('c','这个节点要一视同仁，谁都不能例外。','我知道了。我会先让他去看诊，再向您汇报。',{team:-15},{trust:-9,tension:8}),
  ]),
  event('d6-investor',6,'investor','今晚这顿饭',[
    '董事长，发布前我想直接问问：外面的讨论我都看到了。有人说该加码，有人劝我等等。',
    '您希望我明天对其他投资人说什么？我需要一个我自己也敢相信的判断。'],[
    choice('a','讲清进展，也讲风险。我们不会为了一个日期跳过验证。','可以。这样的解释没那么热闹，但我能在明天继续替它负责。',{reputation:7,team:3},{trust:8,respect:6},{flag:'candid'}),
    choice('b','请替我们造势。明天必须是一个足够大的开局。','我可以组织资源。但从此刻开始，市场会用更高的期待看你们。',{hype:18,team:-8},{respect:5,tension:7},{flag:'pressure'}),
    choice('c','传言没什么依据，您放心支持就好。','我不是来听“放心”的。等您手里有具体材料，我们再继续聊。',{reputation:-10},{trust:-12,respect:-7},{flag:'dismiss'}),
  ]),
  event('d6-partner',6,'partner','合作的边界',[
    '门店已经把展台留出来了。为了稳住这次合作，我建议再补四万元备用机和售后保证金，三周后按实际支出结算。',
    '如果不补，我们也能配合，但首批铺货会保守一些。您定。'],[
    choice('a','补四万元，写清用途和退回条件，给门店一个明确保障。','款项确认。合同我补好，店员面对用户时也更有底气。',{reputation:6,ready:5},{trust:7,respect:4},{kind:'transfer',amount:40000,purpose:'渠道售后保证金'}),
    choice('b','先补两万元，但首发覆盖保持不变，机会不能让出去。','我先收这笔款。覆盖我尽量维持，但不能替尚未到店的机器做承诺。',{hype:10,ready:3,team:-4},{tension:6},{kind:'transfer',amount:20000,purpose:'渠道首发预付款'}),
    choice('c','合作这么久，这次先靠关系，不必谈保证金。','正因为合作久，我才提前说清。那我们按现有保障安排范围。',{reputation:-7,hype:-3},{trust:-8,respect:-4}),
  ]),
  event('d6-plan',6,'gm','发布前的最后一页',[
    '最后版流程到我这里了。技术、客服和渠道的意见都在附件里，分歧没有完全消失。',
    '明天舞台上只能有一种说法，后台最好还能有不同意见。您想怎么分工？'],[
    choice('a','产品有暂停权，客服保留真实反馈。舞台上的解释由我来。','好。我把暂停机制写进流程。有人能踩刹车，其他人才敢认真开车。',{ready:9,team:7},{trust:7,respect:6,tension:-5},{flag:'brake'}),
    choice('b','按既定流程执行，有问题后台消化，别让现场停下来。','明白。我会加强后台值守，但我必须提醒您：这不是风险消失了。',{ready:7,hype:10,team:-10},{trust:-2,tension:8}),
    choice('c','流程不再改。谁负责的环节出错，谁自己解释。','收到。我会逐项确认签字。',{ready:-7,team:-12},{trust:-8,respect:-5,tension:8}),
  ]),
  event('d7-floor',7,'product','开场之前',[
    '{title}，我在后台。最后一轮检查已经结束。无论您今天怎么决定，我想把这一周的真实情况当面讲完。',
    '开场前还有十五分钟。让团队先做一次公开检查，还是直接进主舞台？'],[
    choice('a','检查做完，允许说没准备好的部分。十五分钟我来争取。','好，我们再走一遍。这是这一周最后一次检查，我不想留下没说出口的话。',{ready:10,team:4},{trust:6,respect:3}),
    choice('b','后台快速确认就好，镜头已经在等，按点开场。','明白。我们会在后台继续监控，有异常第一时间报。',{ready:6,hype:8,team:-7},{tension:6}),
    choice('c','不再检查。现在需要的是信心。','……我会带着设备留在侧台。',{ready:-10,team:-6},{trust:-8,tension:8}),
  ]),
  event('d7-thanks',7,'hr','一周之后',[
    '台下快坐满了。我把团队这周的值班记录整理好了，也收到几条大家想转达给您的话。',
    '您今天会在台上提到他们吗？有人说比起大词，更想听到自己的工作被记住。'],[
    choice('a','会。具体说出他们做的事，轮休也从明天兑现。','我会告诉他们。被看见和能休息，都是实实在在的事。',{team:10,reputation:3},{trust:8,tension:-5}),
    choice('b','成功后一起庆功，今天先集中讲产品和市场。','我知道了。庆功安排我先空着，等您确认。',{hype:8,team:-8},{trust:-3,tension:4}),
    choice('c','这是本职工作，发布会不适合说内部的事。','明白。我会在内部补上这份感谢。',{team:-12},{trust:-8,tension:6}),
  ]),
  event('d7-launch',7,'gm','最后的决定',[
    '各组已经到位，门店等着最后一个确认。我把实际准备情况和这一周的承诺都汇到您这里了。',
    '今天可以稳妥地按验证范围发布，也可以主动延期，或者把全部资源压在一次全面首发上。您来定。'],[
    choice('a','按已验证的范围发布。承诺多少，就交付多少。','收到。范围我现在发给渠道，您可以上台了。',{reputation:4},{respect:5},{flag:'measured'}),
    choice('b','主动延期，把未完成的事和补偿安排一起公布。','明白。我通知各组改流程。这句话不好说，我陪您一起说。',{reputation:5},{trust:4},{flag:'delay'}),
    choice('c','全面首发。资源都压上去，今天必须打响。','收到。所有资源转入首发，后续问题我会逐条汇报。',{hype:15,team:-6},{tension:5},{flag:'full'}),
  ]),
];

export const WORKER_EVENTS = [
  event('w1-task',1,'manager','不可能的节点',[
    '{title}，宏远项目周五验收，今晚就拉通上线。需求文档先别纠结，我已经跟客户说了，这次由你负责到底。',
    '今晚十点前给我进展。对外口径先是“能上”，细节你自己解决。'],[
    choice('a','我接，但请您在群里确认范围、截止时间和验收人。','流程可以后补。既然你坚持，我现在把范围发群里。',{evidence:8,reputation:2,pressure:2},{respect:3,tension:3},{evidence:'scope-confirm'}),
    choice('b','明白，我先做，细节边做边对。','这才是解决问题的态度。今晚十点前给我进展。',{evidence:-4,reputation:2,pressure:10},{trust:2}),
    choice('c','这个时间不可能，出了问题别找我。','你的态度我先记下来，明天可能要让 HR 一起听听。',{reputation:-8,pressure:12},{trust:-6,tension:9}),
  ]),
  event('w1-client',1,'client','客户听到的版本',[
    '你们王总说这周能上库存预测和合同审批。我看签字方案里只有数据看板，你接到的是哪一版？',
    '我不想等到验收那天，你们再当着我的面对口径。'],[
    choice('a','我先发当前签字版，请您书面确认新增项和优先级。','可以，以签字版为基线；新增项我单独回邮件。',{evidence:10,reputation:5,pressure:-2},{trust:6,respect:4},{evidence:'client-scope-mail'}),
    choice('b','都能做，周五您直接看结果。','那我就按全量功能准备验收，你们内部要对齐好。',{evidence:-2,reputation:2,pressure:12},{tension:4}),
    choice('c','这是王总承诺的，您直接找他。','我只关心项目交付，内部责任不要再推回客户这里。',{reputation:-7,pressure:4},{trust:-8,respect:-5}),
  ]),
  event('w1-backend',1,'backend','要不要直接上生产',[
    '王总让我今晚直上生产，但测试单没签。你要我按他的口头要求做吗？',
    '我可以执行，但请给我一条能放进变更单的话。'],[
    choice('a','先建风险清单和变更单，我来找他确认。','好，我把版本、时间和指令来源都写进去。',{evidence:8,allies:5,pressure:2},{trust:6,respect:4},{evidence:'change-log'}),
    choice('b','先上，出了事我来扛。','我截图留一下。真出事时，不能只靠一句“我来扛”。',{evidence:-3,allies:-2,pressure:10},{trust:-2,tension:5}),
    choice('c','你是开发，你判断，别把风险推给我。','那我会按拒绝上线记录，也注明没有得到负责人决定。',{reputation:-4,allies:-8,pressure:5},{trust:-7,tension:6}),
  ]),
  event('w2-baseline',2,'project','凌晨修改的文档',[
    '需求文档第六页昨晚 23:47 被替换了，修改账号是王总。旧版本我还留着，要不要冻结基线？',
    '现在不处理，下次打开时大家可能只会看到新版。'],[
    choice('a','冻结旧版和新版，生成只读副本并记录修改时间。','两份版本和校验记录都存好了，之后不会变成各说各话。',{evidence:12,reputation:3,pressure:-2},{trust:7},{evidence:'baseline-archive'}),
    choice('b','先用新版追进度，旧版不用再提。','我照做，但这样以后很难证明范围是什么时候变的。',{evidence:-8,pressure:8},{trust:-5,tension:4}),
    choice('c','把修改截图发大群，直接问是谁改的。','发出去了。记录留下了，但群里现在没人敢继续说话。',{evidence:5,reputation:-5,allies:-2,pressure:10},{tension:7}),
  ]),
  event('w2-expense',2,'admin','夜班交通费',[
    '昨晚阿哲和小鱼打车共 386 元，项目成本中心被锁了。王总让他们先垫，问你能不能处理。',
    '垫款和正式报销是两回事，原始单据我都会留着。'],[
    choice('a','我先转 386 元，备注“项目夜班交通”，你继续走正式报销。','虚构转账已收，我马上分给他们；驳回记录也会继续保留。',{allies:6,pressure:-1},{trust:6},{kind:'transfer',amount:386,purpose:'项目夜班交通'}),
    choice('b','把驳回截图和成本中心状态留档，今天正式重提。','好，单据、时间和驳回原因都放进报销附件了。',{evidence:6,allies:2,pressure:3},{trust:4},{evidence:'expense-rejection'}),
    choice('c','先让他们自己消化，项目结束后再说。','我会转达，但他们已经连续垫过两次了。',{reputation:-3,allies:-10,pressure:5},{trust:-7,tension:5}),
  ]),
  event('w2-clientgroup',2,'success','客户群里的口径',[
    '客户群已经把新增项当成原合同。王总让我别纠正，怕影响关系。我该怎么回？',
    '我两边都要对接，但不想在群里又造出一个版本。'],[
    choice('a','只引用签字版，新增项另列排期；我在群里接话。','收到。我发完基线，你补交付安排，客户也有台阶。',{evidence:5,reputation:6,allies:5,pressure:1},{trust:7},{evidence:'client-group-record'}),
    choice('b','先顺着客户，验收前再解释。','我先不纠正，但群里每确认一次，客户期待就会更高。',{evidence:-3,reputation:-5,pressure:9},{tension:5}),
    choice('c','你负责客户关系，怎么说你自己决定。','明白。我会按最保守的话术回复，但责任边界需要留档。',{reputation:-6,allies:-8,pressure:4},{trust:-7}),
  ]),
  event('w3-credit',3,'manager','汇报里没有你的名字',[
    '上午汇报由我来讲。你的材料我已经合并，署名不用分那么细，领导只看结果。',
    '你把底稿发我，别临上台了还改口径。'],[
    choice('a','您可以主讲，但请保留版本记录和分工页。','行，分工页放附件，台上不展开。',{evidence:7,reputation:3,pressure:-1},{respect:3,tension:2},{evidence:'contribution-record'}),
    choice('b','没问题，您讲得比我好。','识大局就好，后续领导问起来我会说是团队成果。',{evidence:-4,allies:-2},{trust:3}),
    choice('c','不行，我现在就在大群里说明材料是我做的。','你当然可以说，但越过汇报安排的影响由你承担。',{evidence:3,reputation:-8,pressure:9},{trust:-6,tension:9}),
  ]),
  event('w3-scope',3,'client','谁导致了延期',[
    '库存预测怎么没出现在演示里？王总说是你们开发延期。',
    '我需要一个明确答复，不是再听一次你们内部谁的责任。'],[
    choice('a','签字范围没有这项；我把变更确认和可交付时间一起发您。','这样说我能接受。范围和下一步都清楚，比找个人背锅有用。',{evidence:8,reputation:7,pressure:-2},{trust:7,respect:5},{evidence:'scope-delta'}),
    choice('b','确实是开发进度问题，我们今晚补上。','那我等今晚结果，验收节点不变。',{evidence:-4,reputation:-5,allies:-10,pressure:12},{},{flag:'blame-dev'}),
    choice('c','我把王总私聊原图发您，您自己判断。','事实我看到了，但你们的内部聊天不该这样直接发给客户。',{evidence:7,reputation:-12,pressure:8},{trust:-3,tension:6},{flag:'private-chat-leak'}),
  ]),
  event('w3-order',3,'finance','挂在你名下的订单',[
    '短信服务加购单金额 1.2 万元，经办人写的是你，但审批账号和确认消息都来自王总。你知情吗？',
    '付款还没出去。我需要你留一条正式说明。'],[
    choice('a','不知情。请锁定审计日志，封存原始单据和审批链。','已设为只读。谁创建、谁审批、何时修改都能核验。',{evidence:14,reputation:4,pressure:2},{trust:7,respect:5},{evidence:'audit-trail'}),
    choice('b','项目急用就算了，先别把事情搞大。','我会继续付款，但经办责任仍会落在你的名字下面。',{evidence:-10,reputation:-3,pressure:4},{trust:-4}),
    choice('c','直接退单，并备注“王总违规操作”。','我会退回，但在调查前直接定性不符合财务流程。',{evidence:6,reputation:-7,pressure:10},{respect:-4,tension:6}),
  ]),
  event('w4-incident',4,'backend','生产事故',[
    '生产报错了。日志显示临时配置覆盖了正式密钥，执行账号是我的，指令来自王总私聊。',
    '服务还在报错。先救现场，还是先确定谁负责？'],[
    choice('a','先止损，导出只读日志和工单；任何人不要删记录。','服务在恢复，日志、工单和指令时间已经互相对应。',{evidence:13,reputation:6,allies:6,pressure:4},{trust:8,respect:5},{evidence:'incident-log'}),
    choice('b','先恢复服务，日志晚点再整理。','服务我先救，但自动日志轮转后，部分细节可能留不住。',{evidence:-7,reputation:1,pressure:8},{tension:5}),
    choice('c','把王总私聊发朋友圈，先证明不是你干的。','这能自证，但客户信息和生产配置也会一起暴露。',{evidence:6,reputation:-15,allies:-7,pressure:15},{},{flag:'public-exposure'}),
  ]),
  event('w4-report',4,'manager','失实的事故报告',[
    '事故报告我先起草了：“执行负责人未按规范核验配置”。你签字，我会在会上说明是团队问题。',
    '报告今晚必须走完。别把一个项目问题变成个人对抗。'],[
    choice('a','我不签失实报告。我会附上变更单、日志和指令时间线。','那你把异议写进去。明天会上，你自己解释。',{evidence:10,reputation:5,pressure:8},{respect:4,tension:9},{evidence:'refusal-record'}),
    choice('b','我可以签，但请您在会上口头帮我解释。','放心，我不会让你一个人承担。报告先走流程。',{evidence:-12,reputation:-4,pressure:10},{trust:2},{flag:'signed-blame'}),
    choice('c','我补充“按直属领导书面指令执行”后再签。','这句话太具体了。不过你坚持的话，我不会替你删。',{evidence:7,reputation:2,pressure:5},{tension:7},{evidence:'annotated-report'}),
  ]),
  event('w4-boss',4,'boss','一分钟说明',[
    '服务已经恢复。我只给你一分钟：问题是什么，下一步怎么避免？',
    '别给我念聊天记录，先把可核验的事实说清。'],[
    choice('a','先讲事实链：范围变更、审批缺失、配置覆盖；责任等日志核验。','够清楚。把证据编号发给我，先修流程，不先找替罪羊。',{evidence:5,reputation:10,pressure:-5},{trust:7,respect:6}),
    choice('b','都是王总逼的，我早就说过一定会出事。','情绪我听到了，但你还没有回答问题和解决方案。',{evidence:2,reputation:-12,pressure:6},{trust:-7,tension:7}),
    choice('c','只是技术问题，已经解决，没必要再追究。','如果原因不清楚，同一种事故还会再发生。',{evidence:-8,reputation:-4,pressure:5},{respect:-5}),
  ]),
  event('w5-hr',5,'hr','突然出现的绩效问题',[
    '下午做绩效沟通。王总提交了“执行不力、协作态度差”，你可以带材料，也可以先谈改进方案。',
    '我会将你的回应写进正式记录，请不要只说“大家都知道”。'],[
    choice('a','我带一页时间线和原始记录，只谈可核验事实。','可以。我会把事实、评价和待调查事项分开记录。',{evidence:10,reputation:7,pressure:-4},{trust:8,respect:5},{evidence:'hr-timeline'}),
    choice('b','我把全部聊天一次性转发，证明他一直针对我。','与工作无关的私聊不能随意扩散，请先整理范围。',{evidence:4,reputation:-10,allies:-4,pressure:10},{trust:-5}),
    choice('c','我先接受改进计划，别影响工资。','可以，但签字代表你认可当前描述；请确认这是你的真实决定。',{evidence:-8,allies:-2,pressure:5},{},{flag:'accepted-pip'}),
  ]),
  event('w5-witness',5,'coworker','害怕站出来的证人',[
    '我有那晚的群聊导出和测试表，能证明需求凌晨改过。但我不想在公司里被穿小鞋。',
    '如果我交给你，你能不能先不公开我的名字？'],[
    choice('a','先脱敏存档；未经你同意不公开，需要时由 HR 核验原件。','这样我愿意提供。原件交 HR，公开材料只用编号。',{evidence:10,reputation:4,allies:10,pressure:-3},{trust:10,respect:6},{evidence:'witness-packet'}),
    choice('b','现在发大群，大家一起把话说开。','我把记录给你，不代表同意公开我的名字。',{evidence:7,reputation:-8,allies:-10,pressure:14},{trust:-9,tension:8}),
    choice('c','算了，我不想把你卷进来。','谢谢。但如果你改变主意，我可以只向 HR 说明。',{evidence:-5,allies:2,pressure:2},{trust:3}),
  ]),
  event('w5-clientmail',5,'client','客户愿意确认',[
    '我找到王总周一的邮件，写明新增项是“额外承诺”，不是原合同。需要我正式回复你们公司吗？',
    '我可以确认范围，但不想参与你们内部站队。'],[
    choice('a','需要，请只确认范围和时间，不评价任何个人。','可以。我把邮件发给你们赵总、HR 和项目邮箱。',{evidence:15,reputation:10,pressure:-5},{trust:9,respect:7},{evidence:'client-formal-mail'}),
    choice('b','把截图发我，我直接放到朋友圈。','我可以证明项目范围，但不同意材料被公开传播。',{evidence:8,reputation:-15,pressure:12},{trust:-10,tension:8},{flag:'public-exposure'}),
    choice('c','不用，这是内部问题，不麻烦您。','理解。原邮件我会保留，如果公司正式核验可以找我。',{evidence:-8,reputation:2,pressure:3},{trust:2}),
  ]),
  event('w6-legal',6,'legal','什么证据能用',[
    '我可以帮你核对材料，但只能使用工作相关、来源合法且必要范围内的证据。你准备怎么交？',
    '别把“我觉得他在针对我”和“某时某账号修改了文档”混在一起。'],[
    choice('a','建立目录：来源、时间、对应事实；隐去无关个人信息。','这套材料可以提交。它证明什么、不证明什么，都写清楚了。',{evidence:12,reputation:8,pressure:-6},{trust:8,respect:8},{evidence:'legal-index'}),
    choice('b','聊天原图全部打包，私人内容也不要删，越多越有力。','材料多不等于有效。无关隐私会反过来削弱你的可信度。',{evidence:5,reputation:-12,allies:-8,pressure:8},{trust:-8}),
    choice('c','不交材料，会上凭大家良心说话。','复盘处理的是责任，不是猜谁更像好人。',{evidence:-10,pressure:10},{respect:-7}),
  ]),
  event('w6-settlement',6,'manager','两万元离职补偿',[
    '别把事情闹大。今天签协商离职，公司给你两万补偿，事故责任写“双方无争议”，条款定下来再付款。',
    '我已经让 HR 起草了。你现在给个态度，明天会上就不一定有这个条件了。'],[
    choice('a','先发书面条款；我不接受含糊免责，明天会后再决定。','行，我让 HR 出正式版本，但这个条件只保留到明天。',{evidence:5,reputation:4,pressure:3},{respect:3,tension:4},{flag:'settlement-deferred'}),
    choice('b','删除“双方无争议”，写明无个人过错和补偿金额。先留方案，核验后再签。','可以，先按这个方案准备。明天核验后决定离开，财务再打款。',{reputation:2,pressure:-15},{},{flag:'settlement-offer'}),
    choice('c','至少二十万，否则我公开所有材料。','那就没必要私下谈了。我会把你的表态一并提交公司。',{reputation:-15,allies:-7,pressure:15},{trust:-10,tension:10},{flag:'public-threat'}),
  ]),
  event('w6-boardpack',6,'boss','只能提交五项',[
    '明早我主持复盘。你最多提交五项证据，并说明希望公司做什么。',
    '材料多不等于有效。我要看得懂它们之间的关系。'],[
    choice('a','提交范围邮件、版本基线、审批链、事故日志和证人材料；诉求是纠正责任与整改流程。','结构清楚。明天按这五项逐一核验，不允许临场增加指控。',{evidence:10,reputation:10,pressure:-5},{trust:8,respect:7},{evidence:'board-packet',flag:'board-packet'}),
    choice('b','只交最能证明王总有问题的截图，诉求是立即开除他。','公司会调查责任，但你需要证明事实，不是预先决定处分。',{evidence:4,reputation:-10,pressure:10},{trust:-6}),
    choice('c','先交三项核心材料，请 HR 核验其余；诉求是恢复名誉。','可以，但未进入材料包的内容不会成为明天的主要依据。',{evidence:6,reputation:5,pressure:-2},{trust:3},{evidence:'partial-board-pack'}),
  ]),
  event('w7-protect',7,'coworker','作证之前',[
    '我愿意作证，但希望只有 HR 和法务看到我的名字。你会保护我吗？',
    '会议还有十分钟。如果你要公开我的名字，现在请直接告诉我。'],[
    choice('a','会。会上只引用编号材料，除非你主动开口。','好，我现在把原件交给法务。会上你可以引用编号 W-03。',{evidence:4,reputation:5,allies:12,pressure:-4},{trust:10,respect:8},{flag:'witness-protected'}),
    choice('b','这次必须实名，不然证词没有分量。','那我只允许 HR 查看，不授权你在会上说出我的名字。',{evidence:8,reputation:-5,allies:-15,pressure:8},{trust:-10,tension:9}),
    choice('c','你不用出现，我一个人扛。','我尊重你的决定，但有些事实只靠你说，分量会不一样。',{evidence:-4,allies:3,pressure:7},{trust:3}),
  ]),
  event('w7-hearing',7,'boss','五分钟陈述',[
    '复盘开始。王总认为你错过节点、拒绝协作。你有五分钟陈述。',
    '我会打断任何没有来源、时间或对应事实的推测。'],[
    choice('a','按时间线逐项展示，区分事实、判断和待核验部分。','范围、审批和事故日志可以互相印证。HR 继续核验责任。',{evidence:12,reputation:12,pressure:-8},{trust:9,respect:9},{flag:'hearing-factual'}),
    choice('b','先展示最刺激的聊天截图，证明他一直在甩锅。','截图是真实的，但你的陈述混入了未核实动机和无关内容。',{evidence:7,reputation:-12,allies:-6,pressure:12},{trust:-6},{flag:'hearing-attack'}),
    choice('c','先承认自己执行不周，希望公司再给一次机会。','态度我听到了，但这等于你没有对事故责任提出异议。',{evidence:-12,reputation:-5,pressure:4},{},{flag:'hearing-concede'}),
  ]),
  event('w7-future',7,'boss','你要的下一步',[
    '会议进入最后阶段。公司会依据核验结果处理责任。无论结果如何，你现在可以说明自己的下一步。',
    '留下，需要继续和这里的人合作；离开，也要把责任和后续安排写清楚。'],[
    choice('a','我愿意留下，但要书面澄清责任，并由我牵头流程整改。','如果核验支持你的材料，公司会同步澄清，并给你整改授权。',{reputation:5,allies:5,pressure:-5},{},{flag:'final-stay'}),
    choice('b','我选择协商离开，要求无过错证明和合理补偿。','HR 会按核验结论拟定证明与补偿，不要求你承认不存在的责任。',{reputation:3,pressure:-10},{},{flag:'final-exit'}),
    choice('c','我会把材料发到公开平台，让所有人评理。','你有权维护自己，但客户资料、同事隐私和调查程序仍需承担后果。',{reputation:-20,allies:-10,pressure:20},{},{flag:'final-expose'}),
  ]),
];

export const FEED_SEEDS = [
  [['designer','第六版邀请函终于定了。把一束普通的光，装进一个小小的盒子。','invite'],['engineer','今天第 37 次长时测试。机器不会因为人着急就跳过某一秒。','lab']],
  [['hr','忙的时候也要记得吃饭。办公室的小冰箱补满了，路过就拿。','coffee'],['finance','把每一笔“小钱”的去处写清楚，才敢讨论下一件大事。',null]],
  [['supply','在厂里等天亮。样品和量产之间，隔着很多个没人拍照的晚上。','factory'],['designer','体验店的小桌子摆好了。想看看一个真实的家庭会怎么用它。','invite']],
  [['engineer','希望每一张被转发的截图，都能带上前后文。',null],['hr','一个人愿不愿意继续说话，往往取决于上一次开口之后发生了什么。','coffee']],
  [['service','今天接了很多电话。对我们是一个案例，对电话那边的人是他的一整天。',null],['product','把问题一个个复现、定位、修掉。比起“绝不会出错”，更想承诺“出了问题有人管”。','lab']],
  [['partner','展台灯亮了。合作走得长，靠的是每次把小承诺兑现。','factory'],['assistant','给明天留一张空白纸。希望写下来的，都是我们真的做到了的事。',null]],
  [['designer','一周，七个版本。今天轮到它站到光里。','invite'],['engineer','无论台上说什么，这周的测试记录都在。谢谢还愿意认真看它们的人。','lab']],
];
export const WORKER_FEED_SEEDS = [
  [['coworker','今天又是一句“很简单”开始的项目。我先把文档版本存好。','lab'],['backend','没有签字的“先上再说”，通常都会变成某个人的锅。',null]],
  [['admin','凌晨的打车票和第二天的笑容，都要有地方报销。','coffee'],['project','文档会被覆盖，时间戳不会替人说谎。','lab']],
  [['success','客户真正生气的，往往不是延期，是每个人都说自己没承诺过。',null],['finance','经办人、审批人、实际操作人，是三个不能混用的字段。','factory']],
  [['backend','服务恢复了。比“谁的锅”更急的是止损，比止损更不该忘的是原始日志。','lab'],['client','系统可以出问题，但不能每个人都给我一个不同版本。',null]],
  [['coworker','同意提供记录，不等于同意被架到人群中间。','coffee'],['hr','事实、评价和情绪是三栏。混在一起，任何人都很难得到公平结论。',null]],
  [['legal','有效材料不是“越多越好”，而是每一项都有来源、时间和对应事实。','lab'],['former','以前我以为忍到项目结束就好。后来才知道，没留下来的话，就像没说过。','factory']],
  [['admin','会议室预约到中午。门外很安静，但桌上每张纸都有时间。','invite'],['coworker','我愿意说真话，前提是说真话的人不会被当成新的代价。',null]],
];
export const SOCIAL_COMMENTS = [
  {id:'care',text:'辛苦了，有问题直接跟我说。',reply:'谢谢您。我会把具体情况继续同步。',company:{team:2},relation:{trust:2}},
  {id:'professional',text:'事实和细节都留下来，后面一起复盘。',reply:'好，记录已经在整理了。',company:{ready:2,reputation:1},relation:{respect:2}},
  {id:'push',text:'最后几天，再加把劲。',reply:'收到，我们继续推进。',company:{hype:2,team:-2},relation:{tension:2}},
];
export const PLAYER_POSTS = [
  {id:'promise',text:'不让一个发布日期，盖过对用户的承诺。问题摊开来，我们一起解决。',company:{reputation:3,team:2},reply:'这句话我截图了，明天也按这个标准来。',contact:'product'},
  {id:'thanks',text:'这一周最重要的不是舞台，是在后台认真做事的人。谢谢大家。',company:{team:4},reply:'被看见的感觉很好。休息的安排也记得兑现。',contact:'hr'},
  {id:'ambition',text:'机会不会一直等我们。这一次，想和大家做出一点不一样的成绩。',company:{hype:5,team:-2},reply:'方向收到了。我会把资源再集中一些。',contact:'market'},
];
export const WORKER_SOCIAL_COMMENTS = [
  {id:'support',text:'原始记录先留好，有需要可以找我。',reply:'收到。有人愿意看完记录，就不会只剩口头印象。',company:{allies:2,evidence:1},relation:{trust:2}},
  {id:'professional',text:'把时间、版本和责任人分开写，我们按事实复盘。',reply:'好，这样比群里继续猜更有用。',company:{evidence:2,reputation:1},relation:{respect:2}},
  {id:'push',text:'先把问题解决，责任之后再说。',reply:'问题在处理。我也希望“之后”不会再被忘掉。',company:{pressure:3,reputation:-1},relation:{tension:2}},
];
export const WORKER_PLAYER_POSTS = [
  {id:'record',text:'今天开始，重要范围、变更和决定都留下可核验记录。这不是不信任，是对每个人负责。',company:{evidence:3,reputation:2},reply:'这句我赞成。下次变更我也先补单据。',contact:'backend'},
  {id:'thanks',text:'谢谢愿意提供原始记录的人。保护证人，和证明事实一样重要。',company:{allies:4,reputation:1},reply:'谢谢你记得这一点。我愿意把原件交给 HR。',contact:'coworker'},
  {id:'fight',text:'不接受含糊的锅，也不靠公开别人的隐私翻盘。一条一条，让事实回到原位。',company:{evidence:2,allies:2,pressure:-1},reply:'这才是真的反击。我会把可核对的部分整理好。',contact:'legal'},
];

// One authored relationship echo appears on days 2–7. Its wording resolves from
// confirmed history, while every effect is still committed by engine.mjs.
export const CHAIRMAN_ECHOES = [
  event('d2-echo-promise',2,'hr','昨天那句话，今天还算数吗',[
    '昨天晨会后，大家都在等第一项具体安排。口号很容易记住，兑现它才会变成信任。'
  ],[
    choice('a','把昨天的原则写进今天的排期，谁发现冲突都可以直接提。','好。我会把原话和排期放在一起，明天也按同一标准核对。',{team:4,reputation:2},{trust:4,respect:3},{flag:'promise-kept',memory:'你让昨天的原则进入了正式排期。'}),
    choice('b','情况每天都在变，昨天的话只代表昨天。','我明白变化。但以后大家听到承诺，会先等第二天再决定信不信。',{team:-5},{trust:-6,tension:5},{flag:'promise-shifted',memory:'你把昨天的承诺解释成了临时口径。'}),
  ],{echo:true,resolveLines:state=>[
    state.flags['d1-target']==='quality'?'您昨天说“先兑现产品承诺”。测试组已经把这句话写在排期第一页。':state.flags['d1-target']==='speed'?'您昨天说压力由您来扛。今天有人想确认，加班和延期到底由谁决定。':'您昨天先锁了预算。几个部门现在都不敢提计划外风险。',
    '我只问一次：昨天那句话，今天还算数吗？'
  ]}),
  event('d3-echo-trust',3,'partner','合作方的开工利是',['徐总发来一个开工红包，也在等你对首批到店日期的态度。'],[
    choice('a','日期按书面节点走，红包我也会按合适的边界处理。','收到。关系归关系，节点归节点，这样后面最好合作。',{reputation:3},{respect:4},{flag:'boundary-clear',memory:'你把合作关系和交付节点分开处理。'}),
    choice('b','先把关系维护好，日期到时候再协调。','行，我先不追问。但门店不会因为关系好就自动空出档期。',{reputation:-4,hype:2},{trust:-3,tension:4},{flag:'boundary-vague',memory:'你用关系替代了明确的交付节点。'}),
  ],{echo:true,incomingPacket:{amountCents:18800,note:'开工顺利',effects:{claim:{company:{reputation:-1},relation:{trust:2}},return:{company:{reputation:2},relation:{respect:3}}}},resolveLines:state=>[
    state.transactions.some(t=>t.source==='free'&&t.contactId==='partner')?'前两天您的转账我已经按项目用途登记。今天这个只是我个人讨个好彩头。':'新品进店前，我们这里有发开工利是的习惯。金额不大，图个顺利。',
    '不过红包之外，我还是想听一句确定的话：首批到店日期按什么算？'
  ]}),
  event('d4-echo-context',4,'engineer','还愿不愿意说坏消息',['测试群里有人删掉了一段没有上下文的截图。林工想确认，你是否仍愿意听完整记录。'],[
    choice('a','坏消息照发，必须带时间、样机编号和前后文。','好。大家知道标准是什么，就不用猜哪句话会惹麻烦。',{ready:5,team:4},{trust:6,respect:4},{flag:'context-protected',memory:'你要求坏消息保留来源和完整上下文。'}),
    choice('b','先只报结论，原始记录等我需要时再给。','收到。以后我们会把结论写得更短，但您也可能更晚看到风险。',{ready:-5,team:-4},{trust:-5,tension:4},{flag:'context-filtered',memory:'你让团队先过滤坏消息再上报。'}),
  ],{echo:true,resolveLines:state=>[
    state.flags['d1-test']==='open'?'您第一天让我们同步原始记录，所以昨天有人敢补上截图的前后文。':state.flags['d1-test']==='ignore'?'第一天那份长时测试记录还在。只是现在大家不确定，发出来会不会被认为在添乱。':'第一天您让我们先修再报。现在问题更多了，大家想知道汇报边界。',
    '以后出现坏消息，我们还可以直接说吗？'
  ]}),
  event('d5-echo-account',5,'service','公告之后的电话',['客服小陈带来三通用户电话，也记得你昨天怎么处理那张截图。'],[
    choice('a','把三通电话的原话整理出来，我今天逐项给处理节点。','我会把用户问的和我们能回答的分开，不替任何部门找漂亮说法。',{reputation:5,team:2},{trust:5,respect:3},{flag:'users-answered',memory:'你承诺逐项回应用户电话里的具体问题。'}),
    choice('b','统一回复“以官方公告为准”，不要再扩大讨论。','明白。话术会统一，但电话那边的人不一定觉得问题被回答了。',{reputation:-6},{trust:-4,tension:4},{flag:'users-scripted',memory:'你用统一话术结束了用户追问。'}),
  ],{echo:true,resolveLines:state=>[
    state.flags['d4-leak']==='context'?'昨天您要求补齐截图上下文，今天来电的人至少听到了一条完整时间线。':'昨天的截图还在传播，客服现在只能一通一通解释为什么前后说法不同。',
    '用户不是来问谁赢了，他们只想知道自己的产品会怎样处理。'
  ]}),
  event('d6-echo-commit',6,'investor','钱之外的筹码',['程总重新翻出你前几天的承诺，判断你是否只是用预算换时间。'],[
    choice('a','把未兑现项和负责人列出来，发布后继续按周复盘。','可以。钱解决一次资源，追踪机制才决定问题会不会回来。',{reputation:4,team:3},{trust:4,respect:5},{flag:'commit-tracked',memory:'你把未兑现承诺列入了发布后的持续复盘。'}),
    choice('b','先把发布做好，历史承诺以后再翻没有意义。','发布数字我会看。团队以后还信不信新的承诺，也会写在数字之外。',{hype:3,team:-6},{trust:-5,tension:4},{flag:'commit-dropped',memory:'你决定发布后不再追踪本周承诺。'}),
  ],{echo:true,resolveLines:state=>[
    state.flags['d2-echo-promise']==='promise-kept'?'我看到你把第一天的原则写进了排期。现在我想知道，发布后谁继续追。':'你第一天说过的话，第二天已经变过一次。投资人不怕调整，怕的是没有人承认调整。',
    '这周花出去的钱都能查到，没兑现的承诺也应该能查到。'
  ]}),
  event('d7-echo-team',7,'assistant','八块八的祝贺',['发布日前，小叶发来一个很小的红包。它不是奖金，而是团队对这一周关系的试探。'],[
    choice('a','谢谢。我会记住这份心意，也把答应大家的休息安排落下去。','好。大家其实更在意后半句，我会把轮休名单发出去。',{team:4},{trust:5},{flag:'team-thanked',memory:'你收下团队心意，并再次确认轮休承诺。'}),
    choice('b','心意收到，但不用用红包表达。把未完成清单发我。','明白。我会尊重这个边界，也把这周没说完的话一起整理。',{ready:2},{respect:4,tension:1},{flag:'team-formal',memory:'你谢绝用红包表达关系，要求回到未完成事项。'}),
  ],{echo:true,incomingPacket:{amountCents:888,note:'发布顺利',effects:{claim:{company:{team:2},relation:{trust:2}},return:{company:{team:1},relation:{respect:2}}}},resolveLines:state=>[
    state.flags['d2-echo-promise']==='promise-kept'?'这是大家凑的八块八，不是要您发奖金，只是想说这周有人记得您讲过的话。':'这是大家凑的八块八。金额很小，可能也是想看看您还记不记得第一天说过什么。',
    '无论您领不领，发布结束后的安排，请别只留在聊天里。'
  ]}),
];

export const WORKER_ECHOES = [
  event('w2-echo-scope',2,'client','昨天说的范围还认吗',['李总不评价你和领导，只确认昨天留下的项目范围。'],[
    choice('a','认。今天所有新增项继续单列，不把口头催促写成原合同。','可以。我会在客户侧也按这个口径回邮件。',{evidence:5,reputation:4},{trust:5,respect:3},{flag:'scope-kept',memory:'你坚持把新增承诺与原合同范围分开。'}),
    choice('b','先别卡范围，做完再说是谁承诺的。','做完当然好，但到验收时，我还是会问哪些属于原合同。',{evidence:-4,pressure:5},{trust:-3,tension:4},{flag:'scope-blurred',memory:'你允许新增要求继续停留在口头层面。'}),
  ],{echo:true,resolveLines:state=>[
    state.flags['w1-task']==='written'?'你昨天在群里补的负责人和验收时间我看到了，这比一句“尽快”有用。':'昨天群里还是只有“尽快上线”。今天任何人都可能说自己理解得不一样。',
    '我只确认一件事：新增需求是否继续单列？'
  ]}),
  event('w3-echo-lunch',3,'coworker','那顿没吃上的饭',['小鱼发来一个午饭红包。金额很小，但她在观察你是否把同事当工具。'],[
    choice('a','谢谢。材料归材料，午饭归午饭；需要作证时我会先问你的边界。','这句话我记住了。记录我可以给，但别替我决定公开到哪里。',{allies:4,reputation:2},{trust:6,respect:3},{flag:'peer-boundary',memory:'你承诺使用同事材料前先确认授权边界。'}),
    choice('b','先把你手里的截图都发我，吃饭以后再说。','我会给工作相关的部分。其他私聊不是用来证明你赢的。',{evidence:2,allies:-6},{trust:-6,tension:5},{flag:'peer-used',memory:'你把同事的善意首先当成了取证机会。'}),
  ],{echo:true,incomingPacket:{amountCents:1888,note:'别又饿着',effects:{claim:{company:{allies:2},relation:{trust:3}},return:{company:{reputation:1},relation:{respect:2}}}},resolveLines:state=>[
    state.flags['w2-expense']==='documented'?'财务孙姐把昨晚的加班餐和打车都补进记录了。我那顿饭就不用报了。':'昨晚那笔加班费用还没说清。我先把午饭钱发你，别又空着肚子扛项目。',
    '钱不多。你收不收都行，但我的私聊不要直接转给别人。'
  ]}),
  event('w4-echo-record',4,'backend','日志会替谁说话',['阿哲记得你是否尊重技术时间线，决定还愿不愿意给你原始日志。'],[
    choice('a','日志证明操作，不替任何人猜动机。你给原件，我保留校验信息。','可以。这样我愿意把原始导出和说明一起给你。',{evidence:7,reputation:4},{trust:6,respect:5},{flag:'log-respected',memory:'你承诺只用日志证明可核验的操作事实。'}),
    choice('b','只要能证明不是我操作的，其他内容都不重要。','这份日志不只关系到你。截掉后半段，会让新的事实也消失。',{evidence:2,reputation:-5,allies:-3},{trust:-5,tension:4},{flag:'log-selected',memory:'你只想保留对自己有利的日志片段。'}),
  ],{echo:true,resolveLines:state=>[
    state.flags['w3-order']==='audit'?'你昨天要求核对账号、时间和审批链。我可以导出原始日志，但它也会显示我们团队自己的疏漏。':'昨天那张单没有完成来源核对。现在我有日志，但不想它再被截成一句结论。',
    '你要的是完整时间线，还是只要一句“不是你”？'
  ]}),
  event('w5-echo-witness',5,'coworker','我还敢不敢站出来',['小鱼会根据你前几天对待边界的方式，决定证言开放到什么程度。'],[
    choice('a','你先指定授权范围；超出的部分我不会用。','那我授权 HR 和法务核验原件，会上只出现编号。',{evidence:5,allies:6,reputation:3},{trust:7,respect:4},{flag:'witness-trust',memory:'你让证人自己决定材料的授权范围。'}),
    choice('b','现在不是讲边界的时候，先赢下来再说。','那我只向 HR 单独说明，不把原件交给你。',{evidence:-3,allies:-8,pressure:5},{trust:-8,tension:6},{flag:'witness-pressed',memory:'你为了翻盘压过了证人设定的边界。'}),
  ],{echo:true,resolveLines:state=>[
    state.flags['w3-echo-lunch']==='peer-boundary'?'你前天说会先问我的边界。我现在愿意把记录交出来。':'前天我说过不要直接转发私聊，但我不确定你有没有真的听进去。',
    '如果这份材料会进会议，我想自己决定谁能看到名字。'
  ]}),
  event('w6-echo-boundary',6,'manager','两百块辛苦费',['王总发来一个满额红包。它既像慰问，也可能成为会议前的一笔人情。'],[
    choice('a','项目责任按记录核验，红包不能改变我的陈述。','行。那明天会上，我们各自按材料说话。',{evidence:3,reputation:4,pressure:3},{respect:4,tension:5},{flag:'hush-separated',memory:'你明确拒绝让红包影响事故陈述。'}),
    choice('b','只要您把责任说明白，其他都可以商量。','我听懂了。可“说明白”要写成什么，明天你最好别改口。',{evidence:-5,reputation:-6,pressure:-5},{trust:2,tension:3},{flag:'hush-bargained',memory:'你把责任结论与领导的人情放在了一起谈。'}),
  ],{echo:true,incomingPacket:{amountCents:20000,note:'这几天辛苦了',effects:{claim:{company:{evidence:-5,reputation:-6,pressure:-8},relation:{trust:2,tension:3}},return:{company:{evidence:4,reputation:3,pressure:2},relation:{respect:5,tension:4}}}},resolveLines:state=>[
    state.company.evidence>=55?'你手里的材料比我预想的完整。这两百块就是辛苦费，别把同事关系弄得太难看。':'这几天你也够累的。两百块辛苦费收着，明天别把事情讲得像谁故意害你。',
    '红包是红包，明天会上怎么说，你自己想清楚。'
  ]}),
  event('w7-echo-trust',7,'legal','赢了以后怎么做',['顾老师不替你决定输赢，只确认你是否还愿意遵守自己要求别人的规则。'],[
    choice('a','只提交必要材料，结论出来后也不公开同事隐私。','这套边界前后一致。无论留下还是离开，你的材料都更站得住。',{evidence:4,reputation:5,allies:4},{trust:5,respect:5},{flag:'rules-consistent',memory:'你承诺翻盘后仍保护同事和客户隐私。'}),
    choice('b','如果公司不完全按我的要求处理，我就公开全部材料。','维权可以继续，但“全部公开”会把无关的人也变成代价。',{reputation:-8,allies:-6,pressure:8},{trust:-6,tension:5},{flag:'rules-abandoned',memory:'你准备在结果不满意时公开全部材料。'}),
  ],{echo:true,resolveLines:state=>[
    state.flags['w5-echo-witness']==='witness-trust'?'你让证人自己决定授权范围，这让证据更可信。':'你和证人之间的授权范围还没有完全说清，今天尤其不能临时扩大。',
    '最后一个问题：如果公司没有完全按你的期待处理，你还遵守同样的边界吗？'
  ]}),
];

const mergeEvents=(core,echoes)=>[...core,...echoes].sort((a,b)=>a.day-b.day+(a.day===b.day?(Number(Boolean(b.echo))-Number(Boolean(a.echo))):0));

export const SCENARIOS = {
  chairman:{...ROUTES[0],events:mergeEvents(EVENTS,CHAIRMAN_ECHOES),echoIds:CHAIRMAN_ECHOES.map(e=>e.id),feedSeeds:FEED_SEEDS,socialComments:SOCIAL_COMMENTS,playerPosts:PLAYER_POSTS,statKeys:['ready','reputation','team','hype'],guideId:'assistant',feedLikeIds:['assistant','market','product'],summaryEventIds:['d1-target','d3-supply','d4-statement','d5-staff','d7-launch']},
  worker:{...ROUTES[1],events:mergeEvents(WORKER_EVENTS,WORKER_ECHOES),echoIds:WORKER_ECHOES.map(e=>e.id),feedSeeds:WORKER_FEED_SEEDS,socialComments:WORKER_SOCIAL_COMMENTS,playerPosts:WORKER_PLAYER_POSTS,statKeys:['evidence','reputation','allies','pressure'],guideId:'admin',feedLikeIds:['admin','success','project'],summaryEventIds:['w1-task','w2-baseline','w4-incident','w5-hr','w7-future']},
};
export function scenarioFor(routeId='chairman'){return SCENARIOS[routeId]||SCENARIOS.chairman;}

/** ContentProvider: pure rendering and allowed intentions; never commits world state. */
export class ScriptedContentProvider {
  text(text,state) { const scenario=scenarioFor(state.routeId);return text.replaceAll('{title}',state.player.title).replaceAll('{company}',scenario.company).replaceAll('{project}',scenario.project); }
  opening(ev,state) {
    const lines = (ev.resolveLines?ev.resolveLines(state):ev.lines).map(t=>this.text(t,state));
    if(state.routeId==='chairman'){
      if (ev.id === 'd2-budget') lines.unshift(state.flags['d1-target']==='quality' ? '您昨天说先兑现承诺，我按这个标准保留了测试预算。' : '我按昨天定的优先级重排了预算，有些取舍得请您再看一次。');
      if (ev.id === 'd4-statement') lines.unshift(state.flags['d1-position']==='bold' ? '前几天“重新定义家庭影像”的海报也被翻出来了，期待现在成了质疑。' : '前几天我们说的是具体场景，没有夸大，但这次问题仍要说清。');
      if (ev.id === 'd5-fix' && state.flags['d3-supply']==='recheck') lines.unshift('多给的那一天和重检费用没有白花，厂里的批次问题已经被圈定了。');
      if (ev.id === 'd6-investor') lines.unshift(state.company.reputation>=55 ? '今天几条处理进展我看到了，对外至少是连贯的。' : '今天几条对外说法不太一致，我想听您亲自解释。');
      if (ev.id === 'd7-launch') lines.unshift(state.company.ready>=70 ? '产品报告：主要复测已通过，已验证范围内可以交付。' : '产品报告：仍有未充分验证的部分，全面出货有实际风险。');
    } else {
      if(ev.id==='w3-order')lines.unshift(state.evidenceItems.includes('baseline-archive')?'你前面冻结的版本派上用场了，它和这张订单的时间对得上。':'现在需求基线已经不完整，这张单的来路会更难核对。');
      if(ev.id==='w5-hr')lines.unshift(state.company.evidence>=55?'我看到你已经整理了几项原始记录，下午可以逐项说。':'你现在的材料还比较散，下午别只靠回忆对话。');
      if(ev.id==='w7-hearing')lines.unshift(state.company.evidence>=70&&state.evidenceItems.length>=5?'你提交的几项原始记录已经通过初核，现在可以按时间线陈述。':'部分截图缺少来源和完整上下文，会上只能当作线索。');
    }
    return lines;
  }
  response(ev,ch,state) {
    const out = [ch.reply];
    const rel = state.relationships[ev.contact];
    if(rel.trust<25) out.push('后续我先按书面确认执行，有新的情况再汇报。');
    else if(rel.trust>72) out.push('另外，有个还没完全确定的细节，我也愿意提前跟您说。我们后面别只报好消息。');
    return out;
  }
  dayBrief(state) {
    const scenario=scenarioFor(state.routeId);
    if(state.routeId==='chairman'){
      if(state.day===1) return '早上好。距离拾光一号发布还有七个工作日。总经理正在等您定方向，市场和产品随后会来同步。点开有红点的会话即可处理；今天忙完，来我这里说一声。';
      return `${scenario.days[state.day-1]}。${state.company.team<35 ? '今天群里明显安静了一些，几位同事把意见改成了“收到”。' : '今天大家还在主动报进展，有问题也愿意先拿出来说。'}${state.company.reputation<40?'外面的讨论有些尖锐，我把相关信息交给了市场。':'昨晚的外部反馈已经交给市场整理。'}先看新消息吧。`;
    }
    if(state.day===1)return '早。宏远建材项目突然要提前验收，直属领导、客户和开发给了三种说法。别急着证明谁是坏人，先把原话和时间留下来。点开有红点的会话，今天处理完再来我这里下班。';
    return `${scenario.days[state.day-1]}。${state.company.evidence<35?'目前几个关键环节还只有口头说法，不要等到会上才补回忆。':'原始记录正在串成时间线，但每份材料都还要核对来源。'}${state.company.allies<35?'同事们开始只在私聊里说话，他们也在看你会不会保护提供记录的人。':'还有人愿意帮你对时间和版本。'}先看新消息吧。`;
  }
  followUps(ev,ch,state){
    if(state.routeId==='chairman'&&(ev.id==='d2-team'||ev.id==='d5-staff'))return [{contact:'engineer',text:ch.id==='a'?'听人事说可以轮休了。谢谢您，我今晚把交接写清楚，明天接着做。':'人事的安排收到了。我先把这轮测试跑完。'}];
    if(state.routeId==='chairman'&&ev.id==='d4-leak')return [{contact:'assistant',text:ch.id==='a'?'内部群重新有人补充截图的上下文了，我转给人事核实。':'今天内部群消息少了很多。我会继续整理您需要的信息。'}];
    if(state.routeId==='worker'&&ev.id==='w4-incident')return [{contact:'success',text:ch.id==='a'?'客户那边我先同步了恢复进展，没有先猜责任。李总说他愿意等正式时间线。':'客户在问为什么又出现了一个新说法。'}];
    if(state.routeId==='worker'&&ev.id==='w5-witness')return [{contact:'legal',text:ch.id==='a'?'证人材料可以先脱敏编号，这个处理是对的。':'使用同事材料前，请先确认授权范围。'}];
    return [];
  }
}
export const provider = new ScriptedContentProvider();
