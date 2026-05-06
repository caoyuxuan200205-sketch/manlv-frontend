/**
 * 首页动态示例数据配置
 * 根据用户的专业名称（major）进行模糊匹配，返回贴合其学科背景的示例行程与任务。
 */

export const getDynamicData = (major) => {
  const safeMajor = major ? major.toLowerCase() : '';

  // 1. 工学类 (计算机/软件/人工智能/电子)
  if (/(计算机|软件|人工智能|电子|信息|自动化|通信)/.test(safeMajor)) {
    return {
      tasks: [
        { label: '购买去往北京的高铁票', done: false, urgent: true },
        { label: '准备机试 (LeetCode/PAT 刷题)', done: false, urgent: false },
        { label: '整理 GitHub 开源项目和科研经历', done: true, urgent: false },
        { label: '复习数据结构与算法核心代码', done: false, urgent: false },
      ],
      trips: [
        { id: 1, school: '清华大学 交叉信息研究院', city: '北京', date: '7月18–22日', type: 'camp', status: 'upcoming', progress: 65, daysLeft: 3, conflict: true },
        { id: 2, school: '浙江大学 计算机科学与技术学院', city: '杭州', date: '7月20日', type: 'interview', status: 'confirmed', progress: 40, conflict: true },
        { id: 3, school: '上海交通大学 电子信息与电气工程学院', city: '上海', date: '7月25–28日', type: 'camp', status: 'pending', progress: 15 },
      ]
    };
  }

  // 2. 经济学/管理学类 (金融/会计/商科)
  if (/(经济|金融|会计|管理|商|财务)/.test(safeMajor)) {
    return {
      tasks: [
        { label: '购买去往北京的高铁票', done: false, urgent: true },
        { label: '模拟无领导小组讨论 (群面)', done: false, urgent: false },
        { label: '整理投行/券商实习证明材料', done: true, urgent: false },
        { label: '复习宏微观经济学及近期宏观政策热点', done: false, urgent: false },
      ],
      trips: [
        { id: 1, school: '北京大学 光华管理学院', city: '北京', date: '7月18–22日', type: 'camp', status: 'upcoming', progress: 65, daysLeft: 3, conflict: true },
        { id: 2, school: '复旦大学 经济学院', city: '上海', date: '7月20日', type: 'interview', status: 'confirmed', progress: 40, conflict: true },
        { id: 3, school: '上海财经大学 金融学院', city: '上海', date: '7月25–28日', type: 'camp', status: 'pending', progress: 15 },
      ]
    };
  }

  // 3. 医学类
  if (/(医|临床|药|护理|公共卫生)/.test(safeMajor)) {
    return {
      tasks: [
        { label: '购买去往北京的高铁票', done: false, urgent: true },
        { label: '准备 OSCE 临床技能操作考试', done: false, urgent: false },
        { label: '整理科研论文/病历书写样本', done: true, urgent: false },
        { label: '复习内外妇儿核心考点', done: false, urgent: false },
      ],
      trips: [
        { id: 1, school: '北京协和医学院', city: '北京', date: '7月18–22日', type: 'camp', status: 'upcoming', progress: 65, daysLeft: 3, conflict: true },
        { id: 2, school: '上海交通大学 医学院', city: '上海', date: '7月20日', type: 'interview', status: 'confirmed', progress: 40, conflict: true },
        { id: 3, school: '中山大学 中山医学院', city: '广州', date: '7月25–28日', type: 'camp', status: 'pending', progress: 15 },
      ]
    };
  }

  // 4. 文学/传媒类
  if (/(文|语言|翻译|新闻|传媒|传播)/.test(safeMajor)) {
    return {
      tasks: [
        { label: '购买去往北京的高铁票', done: false, urgent: true },
        { label: '整理个人作品集 (新闻报道/文学创作)', done: false, urgent: false },
        { label: '梳理近期社会热点与传播学理论结合点', done: true, urgent: false },
        { label: '准备英文自我介绍及专业名词翻译', done: false, urgent: false },
      ],
      trips: [
        { id: 1, school: '中国人民大学 新闻学院', city: '北京', date: '7月18–22日', type: 'camp', status: 'upcoming', progress: 65, daysLeft: 3, conflict: true },
        { id: 2, school: '中国传媒大学', city: '北京', date: '7月20日', type: 'interview', status: 'confirmed', progress: 40, conflict: true },
        { id: 3, school: '复旦大学 新闻学院', city: '上海', date: '7月25–28日', type: 'camp', status: 'pending', progress: 15 },
      ]
    };
  }

  // 5. 理学类 (数/理/化/生/材)
  if (/(数学|物理|化学|生物|材料|理学)/.test(safeMajor)) {
    return {
      tasks: [
        { label: '购买去往北京的高铁票', done: false, urgent: true },
        { label: '准备英文文献翻译/阅读测试', done: false, urgent: false },
        { label: '熟记本科实验操作细节及原理解析', done: true, urgent: false },
        { label: '发邮件联系意向实验室导师', done: false, urgent: false },
      ],
      trips: [
        { id: 1, school: '北京大学 物理学院', city: '北京', date: '7月18–22日', type: 'camp', status: 'upcoming', progress: 65, daysLeft: 3, conflict: true },
        { id: 2, school: '中国科学技术大学', city: '合肥', date: '7月20日', type: 'interview', status: 'confirmed', progress: 40, conflict: true },
        { id: 3, school: '南京大学 化学化工学院', city: '南京', date: '7月25–28日', type: 'camp', status: 'pending', progress: 15 },
      ]
    };
  }

  // 6. 艺术学/设计类
  if (/(艺术|美术|设计|音乐|舞蹈|戏剧)/.test(safeMajor)) {
    return {
      tasks: [
        { label: '购买去往北京的高铁票', done: false, urgent: true },
        { label: '完善并打印高质量个人作品集 (Portfolio)', done: false, urgent: false },
        { label: '准备快题设计工具包', done: true, urgent: false },
        { label: '复习中外美术史/设计史核心流派', done: false, urgent: false },
      ],
      trips: [
        { id: 1, school: '中央美术学院', city: '北京', date: '7月18–22日', type: 'camp', status: 'upcoming', progress: 65, daysLeft: 3, conflict: true },
        { id: 2, school: '中国美术学院', city: '杭州', date: '7月20日', type: 'interview', status: 'confirmed', progress: 40, conflict: true },
        { id: 3, school: '清华大学 美术学院', city: '北京', date: '7月25–28日', type: 'camp', status: 'pending', progress: 15 },
      ]
    };
  }

  // 7. 法学类
  if (/(法)/.test(safeMajor)) {
    return {
      tasks: [
        { label: '购买去往北京的高铁票', done: false, urgent: true },
        { label: '准备法考/法硕面谈材料', done: false, urgent: false },
        { label: '确认人大报到要求', done: true, urgent: false },
        { label: '复习民法典重点章节', done: false, urgent: false },
      ],
      trips: [
        { id: 1, school: '中国人民大学 法学院', city: '北京', date: '7月18–22日', type: 'camp', status: 'upcoming', progress: 65, daysLeft: 3, conflict: true },
        { id: 2, school: '中国政法大学', city: '北京', date: '7月20日', type: 'interview', status: 'confirmed', progress: 40, conflict: true },
        { id: 3, school: '武汉大学 法学院', city: '武汉', date: '7月25–28日', type: 'camp', status: 'pending', progress: 15 },
      ]
    };
  }

  // 默认兜底示例 (建筑学)
  return {
    tasks: [
      { label: '购买北京高铁票', done: false, urgent: true },
      { label: '准备自我介绍稿', done: false, urgent: false },
      { label: '确认清华报到要求', done: true, urgent: false },
      { label: '打印成绩单备份', done: false, urgent: false },
    ],
    trips: [
      { id: 1, school: '清华大学 建筑学院', city: '北京', date: '7月18–22日', type: 'camp', status: 'upcoming', progress: 65, daysLeft: 3, conflict: true },
      { id: 2, school: '同济大学 建筑与城规学院', city: '上海', date: '7月20日', type: 'interview', status: 'confirmed', progress: 40, conflict: true },
      { id: 3, school: '东南大学 建筑学院', city: '南京', date: '7月25–28日', type: 'camp', status: 'pending', progress: 15 },
    ]
  };
};

// 根据具体的院校名称推断城市、学科上下文，并生成动态的行程详情数据
export const getTripDetailData = (school) => {
  let city = '北京';
  if (school.includes('复旦') || school.includes('上海') || school.includes('同济')) city = '上海';
  else if (school.includes('中山') || school.includes('广州')) city = '广州';
  else if (school.includes('浙江') || school.includes('中国美术学院') || school.includes('杭州')) city = '杭州';
  else if (school.includes('南京') || school.includes('东南')) city = '南京';
  else if (school.includes('武汉')) city = '武汉';
  else if (school.includes('中国科学技术大学') || school.includes('合肥')) city = '合肥';

  // 推断专业大类
  let majorCtx = '建筑学';
  if (/(计算机|信息|软件|电子|人工智能|自动化)/.test(school)) majorCtx = '计算机';
  else if (/(管理|经济|金融|商|财经)/.test(school)) majorCtx = '经管';
  else if (/(医|临床|药|卫生)/.test(school)) majorCtx = '医学';
  else if (/(文|传媒|新闻|外语)/.test(school)) majorCtx = '文学传媒';
  else if (/(理|物理|化学|生物|生命)/.test(school)) majorCtx = '理学';
  else if (/(艺术|美术|设计|音乐)/.test(school)) majorCtx = '艺术设计';
  else if (/(法)/.test(school)) majorCtx = '法学';

  const timeline = [
    { time: '7月15日 已完成', title: '收到入营通知邮件', sub: '漫旅自动从邮箱读取，已解析截止日期和报到要求', tag: '邮件已解析', status: 'done' },
    { time: '7月16日 已完成', title: '资料确认 · 完成材料清单', sub: '成绩单、简历、相关证明材料 PDF 已上传备用', tag: '已准备完毕', status: 'done' },
    { time: '今天 进行中', title: `备考专业知识 · AI陪练`, sub: `复习${majorCtx}核心理论、导师研究方向`, tag: '进行中', status: 'active', tagType: 'gold' },
    { time: '7月17日 待完成', title: `购买去${city}的高铁/机票`, sub: '建议提前预订，票量紧张', tag: '票量紧张', status: 'todo', tagType: 'warn' },
    { time: '7月18日', title: `抵达${city} · 入住酒店`, sub: `推荐：${school}周边，步行15分钟内`, status: 'todo' },
    { time: '7月19–21日', title: '夏令营正式开始', sub: '学术报告、工作坊、导师面谈、参观实验室', status: 'todo' },
    { time: '7月22日', title: '面试 · 个人展示', sub: '预计下午14:00，5分钟自我介绍 + 15分钟问答', tag: '关键节点', status: 'todo', tagType: 'warn' }
  ];

  let studyCards = [];
  if (majorCtx === '医学') {
    studyCards = [
      { title: '临床技能操作 (OSCE)', priority: '必考', points: ['四大穿刺标准流程与注意事项', '心肺复苏 (CPR) 及气管插管最新指南', '外科打结与缝合规范'] },
      { title: '内外妇儿核心考点', priority: '高频', points: ['心血管系统疾病诊断标准 (心衰、心梗)', '常见肿瘤的病理分型与治疗原则', '抗生素的合理应用与阶梯治疗'] },
      { title: '前沿转化医学进展', priority: '重要', points: ['靶向治疗与免疫治疗机制 (PD-1/PD-L1)', '干细胞在再生医学中的应用', '基因编辑技术 (CRISPR) 的伦理与前景'] }
    ];
  } else if (majorCtx === '计算机') {
    studyCards = [
      { title: '数据结构与算法', priority: '必考', points: ['图论核心算法：Dijkstra, BFS/DFS, 最小生成树', '动态规划常见题型变形 (背包问题, 序列比对)', '红黑树、B+树的区别与应用场景'] },
      { title: '计算机网络与操作系统', priority: '高频', points: ['TCP/IP三次握手四次挥手及拥塞控制', '进程与线程的区别、进程间通信(IPC)方式', '虚拟内存、分页分段机制、死锁条件'] },
      { title: '人工智能与前沿热点', priority: '重要', points: ['大模型(LLM)的基础架构(Transformer)与微调技术', '计算机视觉主流网络(ResNet, YOLO)', '分布式系统的一致性协议(Raft, Paxos)'] }
    ];
  } else if (majorCtx === '经管') {
    studyCards = [
      { title: '宏微观经济学基础', priority: '必考', points: ['供求定理与弹性分析', '市场失灵与外部性、科斯定理', 'IS-LM模型与财政/货币政策分析'] },
      { title: '金融市场与公司理财', priority: '高频', points: ['CAPM模型与套利定价理论(APT)', 'MM定理及其现实意义(考虑税收、破产成本)', '有效市场假说(EMH)及其检验'] },
      { title: '时事热点与行业趋势', priority: '重要', points: ['近期央行货币政策调整及降准降息影响', '新能源/半导体行业的投资逻辑', 'ESG投资与绿色金融的发展现状'] }
    ];
  } else if (majorCtx === '法学') {
    studyCards = [
      { title: '民法典核心要点', priority: '必考', points: ['物权编：居住权、担保物权的最新变动', '合同编：情势变更原则、违约责任的认定', '侵权责任编：高空抛物、医疗损害责任'] },
      { title: '刑法与行政法', priority: '高频', points: ['正当防卫与紧急避险的界限', '共同犯罪的认定与量刑', '行政处罚法修订与行政复议程序'] },
      { title: '法学前沿交叉', priority: '重要', points: ['人工智能与著作权保护(AI生成内容的定性)', '数据合规与个人信息保护法(PIPL)', '自动驾驶的交通事故侵权责任划分'] }
    ];
  } else if (majorCtx === '文学传媒') {
    studyCards = [
      { title: '传播学经典理论', priority: '必考', points: ['议程设置、沉默的螺旋、使用与满足理论', '麦克卢汉的媒介决定论与技术异化', '符号学基础与文化研究学派'] },
      { title: '新媒体与智能传播', priority: '高频', points: ['算法推荐与信息茧房的破局', 'AI主播/生成式AI对新闻生产的影响', '短视频时代的视觉叙事与社交表达'] },
      { title: '社会热点案例评析', priority: '重要', points: ['近期重大突发新闻的危机公关分析', '网红经济与直播带货的传播逻辑', '跨文化传播中的国家形象构建'] }
    ];
  } else if (majorCtx === '理学') {
    studyCards = [
      { title: '专业基础核心课', priority: '必考', points: ['四大力学/有机无机化学的基础推导', '偏微分方程/实变函数核心定理证明', '经典实验步骤与误差分析'] },
      { title: '英文文献与科研方法', priority: '高频', points: ['快速提炼 SCI 摘要与结论', '实验设计原则(对照、随机、重复)', '常见科研作图与数据分析工具(Origin, SPSS)'] },
      { title: '导师研究方向与前沿', priority: '重要', points: ['量子计算与凝聚态物理进展', '合成生物学与靶向药物设计', '高分子材料改性与新能源电池'] }
    ];
  } else if (majorCtx === '艺术设计') {
    studyCards = [
      { title: '中外艺术史/设计史', priority: '必考', points: ['西方现代主义流派演变(包豪斯, 立体主义)', '中国传统山水画/陶瓷器形赏析', '波普艺术与当代设计的融合'] },
      { title: '作品集(Portfolio)答辩', priority: '高频', points: ['项目设计理念与核心痛点解决', '材料选择、色彩搭配与排版逻辑', '设计过程推导图(Sketch/Render)解析'] },
      { title: '快题与前沿趋势', priority: '重要', points: ['服务设计与用户体验(UX)创新', 'AIGC(如Midjourney/SD)在设计中的应用', '可持续设计与适老化设计'] }
    ];
  } else {
    // 默认建筑学
    studyCards = [
      { title: '建筑历史与理论', priority: '必考', points: ['梁思成与中国建筑史研究', '现代主义运动：柯布西耶、密斯的思想脉络', '北京城市历史格局与更新矛盾'] },
      { title: '城市规划前沿', priority: '高频', points: ['城市更新 vs 大拆大建', '碳中和与绿色建筑：LEED标准', '数字孪生与BIM应用'] },
      { title: '导师研究热点', priority: '重要', points: ['建筑空间类型学研究', '建筑策划理论与方法', '古建筑测绘与数字化'] }
    ];
  }

  let cityCards = [];
  if (city === '北京') {
    cityCards = [
      { title: `${majorCtx}相关必打卡`, priority: '学术', points: ['清华/北大校园游览', '国家大剧院/故宫博物院', '798艺术区/首钢园工业遗址'] },
      { title: '放松充能推荐', priority: '减压', points: ['南锣鼓巷咖啡馆静心备考', '五道口“宇宙中心”感受学生氛围', '面试当天品尝北京地道早餐(豆腐脑/炒肝)'] }
    ];
  } else if (city === '上海') {
    cityCards = [
      { title: `${majorCtx}相关必打卡`, priority: '学术', points: ['外滩历史建筑群 (万国建筑博览会)', '陆家嘴金融中心 (经管/商科感受氛围)', '上海博物馆/中华艺术宫'] },
      { title: '放松充能推荐', priority: '减压', points: ['武康路/安福路 Citywalk 感受海派文化', '苏州河畔夜游放松心情', '徐家汇商圈便利的住宿与餐饮选择'] }
    ];
  } else if (city === '广州') {
    cityCards = [
      { title: `${majorCtx}相关必打卡`, priority: '学术', points: ['中山大学南校区 (康乐园古建筑群)', '陈家祠 (岭南建筑与文化代表)', '珠江新城CBD (广东博物馆/大剧院)'] },
      { title: '放松充能推荐', priority: '减压', points: ['体验正宗广式早茶 (面试前一天放松)', '沙面岛异国风情散步', '珠江夜游吹风解压'] }
    ];
  } else if (city === '杭州') {
    cityCards = [
      { title: `${majorCtx}相关必打卡`, priority: '学术', points: ['浙江大学紫金港校区', '中国美术学院象山校区 (王澍作品)', '良渚文化村'] },
      { title: '放松充能推荐', priority: '减压', points: ['西湖风景区骑行 (苏堤/白堤)', '灵隐寺周边茶园喝茶静心', '吃一顿正宗的杭帮菜(西湖醋鱼/龙井虾仁)'] }
    ];
  } else if (city === '南京') {
    cityCards = [
      { title: `${majorCtx}相关必打卡`, priority: '学术', points: ['东南大学四牌楼校区 (六朝松/大礼堂)', '南京博物院 (中国三大博物馆之一)', '中山陵/明孝陵建筑群'] },
      { title: '放松充能推荐', priority: '减压', points: ['夫子庙/老门东品尝金陵小吃', '玄武湖晚风漫步', '先锋书店(五台山总店)看书解压'] }
    ];
  } else if (city === '武汉') {
    cityCards = [
      { title: `${majorCtx}相关必打卡`, priority: '学术', points: ['武汉大学 (珞珈山/早期建筑群)', '湖北省博物馆 (曾侯乙编钟)', '光谷广场 (科技创新中心)'] },
      { title: '放松充能推荐', priority: '减压', points: ['东湖绿道骑行', '江汉路步行街/寻觅热干面过早', '长江大桥看江景吹风'] }
    ];
  } else if (city === '合肥') {
    cityCards = [
      { title: `${majorCtx}相关必打卡`, priority: '学术', points: ['中科大校园 (感受顶尖科研氛围)', '安徽省博物馆', '科学岛 (中科院合肥物质科学研究院)'] },
      { title: '放松充能推荐', priority: '减压', points: ['天鹅湖夜景漫步', '罍街品尝合肥小吃', '合肥融创文旅城放松体验'] }
    ];
  } else {
    cityCards = [
      { title: `${majorCtx}相关必打卡`, priority: '学术', points: ['目标院校标志性建筑与图书馆', '当地市级/省级博物馆', '专业相关的产业园区/地标'] },
      { title: '放松充能推荐', priority: '减压', points: ['寻找当地特色美食/咖啡馆', '城市公园/绿地散步', '考前保证充足睡眠为主'] }
    ];
  }

  return { city, date: '7月18–22日', type: '夏令营', timeline, studyCards, cityCards, majorCtx };
};
