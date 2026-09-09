// Authored fiction. Content proposes effects; only engine.mjs commits them.
export const COMPANY = '澄屿科技';
export const PRODUCT = '拾光一号';
export const DAYS = ['发布倒计时', '预算的另一面', '供应链来电', '那张截图', '风向变了', '最后的筹码', '聚光灯下'];
export const PERSONAS = [
  {id:'handsome',label:'超级大帅哥',tag:'镜头焦点',defaultTitle:'陆董',bio:'外形出众、舆论关注度高；被看见也意味着更容易被放大。'},
  {id:'tycoon',label:'富豪',tag:'资本老手',defaultTitle:'林董',bio:'资金从容、谈判强势；钱能解决付款，却买不到团队信任。'},
  {id:'richwoman',label:'富婆',tag:'冷静掌舵',defaultTitle:'沈董',bio:'口碑基础更好、决断克制；合作方对每次承诺都格外认真。'},
  {id:'underdog',label:'牛马逆袭',tag:'基层反杀',defaultTitle:'周董',bio:'从一线一路反抗到董事长；团队亲近你，投资人却在等你失手。'},
];
const roles = [
  ['gm', '总经理', 42, '核心', '把结果看得很重，也记得谁替团队扛过压力。'],
  ['finance', '财务负责人', 38, '核心', '讲话克制，习惯先问凭证，再讨论信任。'],
  ['product', '产品负责人', 34, '核心', '有一点倔，愿意为一项体验反复争取时间。'],
  ['supply', '供应链负责人', 41, '核心', '不爱说漂亮话，坏消息通常由他先带来。'],
  ['market', '市场负责人', 32, '核心', '嗅觉敏锐，知道公众记得故事，也记得失约。'],
  ['hr', '人力负责人', 36, '核心', '先听人说完，最在意承诺有没有兑现。'],
  ['investor', '投资方代表', 47, '核心', '谈利益很直接，尊重能说清底线的人。'],
  ['partner', '渠道合作方', 40, '核心', '关系可以讲，合同里每一个日期也得算数。'],
  ['assistant', '董事长助理', 28, '环境', '把细节放在心上，替你记住每一件未完的事。'],
  ['engineer', '测试工程师', 27, '环境', '话不多，对测试结果认真得近乎固执。'],
  ['service', '客服主管', 31, '环境', '每天接触用户，知道一句公告后面有多少来电。'],
  ['designer', '设计师', 29, '环境', '爱观察，忙到很晚也会拍一张窗外的天。'],
];
const firstNames = ['林','陈','周','许','沈','顾','方','陆','苏','程','徐','叶'];
const givenNames = ['砚舟','知远','予安','景和','以宁','清禾','允诚','书衡','若岚','子衡','明舒','知夏'];
const palette = ['#6c8296','#8b7465','#4f7370','#637b53','#a57762','#988083','#747f96','#8a774f','#739084','#687888','#a08277','#879977'];
const avatarImages = Object.fromEntries(roles.map(([id]) => [id, `./assets/avatars/${id}.png`]));
export function createContacts(seed = 4107) {
  const shift = Math.abs(seed | 0) % roles.length;
  return roles.map(([id, role, age, tier, personality], i) => ({
    id, role, age, tier, personality,
    name: firstNames[(i + shift) % firstNames.length] + givenNames[(i * 5 + shift) % givenNames.length],
    color: palette[(i + shift) % palette.length], avatar: (i + shift) % 4, image: avatarImages[id],
    company: id === 'investor' ? '远岑资本（虚构）' : id === 'partner' ? '森渡渠道（虚构）' : COMPANY,
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

export const FEED_SEEDS = [
  [['designer','第六版邀请函终于定了。把一束普通的光，装进一个小小的盒子。','invite'],['engineer','今天第 37 次长时测试。机器不会因为人着急就跳过某一秒。','lab']],
  [['hr','忙的时候也要记得吃饭。办公室的小冰箱补满了，路过就拿。','coffee'],['finance','把每一笔“小钱”的去处写清楚，才敢讨论下一件大事。',null]],
  [['supply','在厂里等天亮。样品和量产之间，隔着很多个没人拍照的晚上。','factory'],['designer','体验店的小桌子摆好了。想看看一个真实的家庭会怎么用它。','invite']],
  [['engineer','希望每一张被转发的截图，都能带上前后文。',null],['hr','一个人愿不愿意继续说话，往往取决于上一次开口之后发生了什么。','coffee']],
  [['service','今天接了很多电话。对我们是一个案例，对电话那边的人是他的一整天。',null],['product','把问题一个个复现、定位、修掉。比起“绝不会出错”，更想承诺“出了问题有人管”。','lab']],
  [['partner','展台灯亮了。合作走得长，靠的是每次把小承诺兑现。','factory'],['assistant','给明天留一张空白纸。希望写下来的，都是我们真的做到了的事。',null]],
  [['designer','一周，七个版本。今天轮到它站到光里。','invite'],['engineer','无论台上说什么，这周的测试记录都在。谢谢还愿意认真看它们的人。','lab']],
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

/** ContentProvider: pure rendering and allowed intentions; never commits world state. */
export class ScriptedContentProvider {
  text(text,state) { return text.replaceAll('{title}',state.player.title); }
  opening(ev,state) {
    const lines = ev.lines.map(t=>this.text(t,state));
    if (ev.id === 'd2-budget') lines.unshift(state.flags['d1-target']==='quality' ? '您昨天说先兑现承诺，我按这个标准保留了测试预算。' : '我按昨天定的优先级重排了预算，有些取舍得请您再看一次。');
    if (ev.id === 'd4-statement') lines.unshift(state.flags['d1-position']==='bold' ? '前几天“重新定义家庭影像”的海报也被翻出来了，期待现在成了质疑。' : '前几天我们说的是具体场景，没有夸大，但这次问题仍要说清。');
    if (ev.id === 'd5-fix' && state.flags['d3-supply']==='recheck') lines.unshift('多给的那一天和重检费用没有白花，厂里的批次问题已经被圈定了。');
    if (ev.id === 'd6-investor') lines.unshift(state.company.reputation>=55 ? '今天几条处理进展我看到了，对外至少是连贯的。' : '今天几条对外说法不太一致，我想听您亲自解释。');
    if (ev.id === 'd7-launch') lines.unshift(state.company.ready>=70 ? '产品报告：主要复测已通过，已验证范围内可以交付。' : '产品报告：仍有未充分验证的部分，全面出货有实际风险。');
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
    if(state.day===1) return '早上好。距离拾光一号发布还有七个工作日。总经理正在等您定方向，市场和产品随后会来同步。点开有红点的会话即可处理；今天忙完，来我这里说一声。';
    return `${DAYS[state.day-1]}。${state.company.team<35 ? '今天群里明显安静了一些，几位同事把意见改成了“收到”。' : '今天大家还在主动报进展，有问题也愿意先拿出来说。'}${state.company.reputation<40?'外面的讨论有些尖锐，我把相关信息交给了市场。':'昨晚的外部反馈已经交给市场整理。'}先看新消息吧。`;
  }
}
export const provider = new ScriptedContentProvider();
