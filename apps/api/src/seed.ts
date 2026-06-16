import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const defaultPassword = await bcrypt.hash('123456', 10)

  await prisma.adminLog.deleteMany({})
  await prisma.evaluation.deleteMany({})
  await prisma.achievement.deleteMany({})
  await prisma.course.deleteMany({})
  await prisma.teacherProfile.deleteMany({})
  await prisma.user.deleteMany({})

  const superAdmin = await prisma.user.create({
    data: {
      username: 'admin',
      password: defaultPassword,
      role: 'SUPER_ADMIN',
      email: 'admin@tdp.edu.cn',
      phone: '13800138000'
    }
  })

  const admin = await prisma.user.create({
    data: {
      username: 'manager',
      password: defaultPassword,
      role: 'ADMIN',
      email: 'manager@tdp.edu.cn',
      phone: '13800138001'
    }
  })

  const teachers = await prisma.user.createManyAndReturn({
    data: [
      { username: 'zhangwei', password: defaultPassword, role: 'TEACHER', email: 'zhangwei@tdp.edu.cn', phone: '13900139001' },
      { username: 'lihua', password: defaultPassword, role: 'TEACHER', email: 'lihua@tdp.edu.cn', phone: '13900139002' },
      { username: 'wangming', password: defaultPassword, role: 'TEACHER', email: 'wangming@tdp.edu.cn', phone: '13900139003' },
      { username: 'chenyu', password: defaultPassword, role: 'TEACHER', email: 'chenyu@tdp.edu.cn', phone: '13900139004' },
      { username: 'zhaoxin', password: defaultPassword, role: 'TEACHER', email: 'zhaoxin@tdp.edu.cn', phone: '13900139005' },
      { username: 'sunli', password: defaultPassword, role: 'TEACHER', email: 'sunli@tdp.edu.cn', phone: '13900139006' },
      { username: 'zhoujun', password: defaultPassword, role: 'TEACHER', email: 'zhoujun@tdp.edu.cn', phone: '13900139007' },
      { username: 'wuqiang', password: defaultPassword, role: 'TEACHER', email: 'wuqiang@tdp.edu.cn', phone: '13900139008' },
      { username: 'chenhong', password: defaultPassword, role: 'TEACHER', email: 'chenhong@tdp.edu.cn', phone: '13900139009' },
      { username: 'yangfan', password: defaultPassword, role: 'TEACHER', email: 'yangfan@tdp.edu.cn', phone: '13900139010' },
      { username: 'liuqing', password: defaultPassword, role: 'TEACHER', email: 'liuqing@tdp.edu.cn', phone: '13900139011' },
      { username: 'zhaoyun', password: defaultPassword, role: 'TEACHER', email: 'zhaoyun@tdp.edu.cn', phone: '13900139012' },
      { username: 'songlei', password: defaultPassword, role: 'TEACHER', email: 'songlei@tdp.edu.cn', phone: '13900139013' },
      { username: 'huangmei', password: defaultPassword, role: 'TEACHER', email: 'huangmei@tdp.edu.cn', phone: '13900139014' },
      { username: 'linjie', password: defaultPassword, role: 'TEACHER', email: 'linjie@tdp.edu.cn', phone: '13900139015' }
    ]
  })

  const students = await prisma.user.createManyAndReturn({
    data: [
      { username: 'student001', password: defaultPassword, role: 'STUDENT' as const, email: 'student001@tdp.edu.cn', phone: '13000130001' },
      { username: 'student002', password: defaultPassword, role: 'STUDENT' as const, email: 'student002@tdp.edu.cn', phone: '13000130002' },
      { username: 'student003', password: defaultPassword, role: 'STUDENT' as const, email: 'student003@tdp.edu.cn', phone: '13000130003' },
      { username: 'student004', password: defaultPassword, role: 'STUDENT' as const, email: 'student004@tdp.edu.cn', phone: '13000130004' },
      { username: 'student005', password: defaultPassword, role: 'STUDENT' as const, email: 'student005@tdp.edu.cn', phone: '13000130005' },
      { username: 'student006', password: defaultPassword, role: 'STUDENT' as const, email: 'student006@tdp.edu.cn', phone: '13000130006' },
      { username: 'student007', password: defaultPassword, role: 'STUDENT' as const, email: 'student007@tdp.edu.cn', phone: '13000130007' },
      { username: 'student008', password: defaultPassword, role: 'STUDENT' as const, email: 'student008@tdp.edu.cn', phone: '13000130008' },
      { username: 'student009', password: defaultPassword, role: 'STUDENT' as const, email: 'student009@tdp.edu.cn', phone: '13000130009' },
      { username: 'student010', password: defaultPassword, role: 'STUDENT' as const, email: 'student010@tdp.edu.cn', phone: '13000130010' }
    ]
  })

  await prisma.teacherProfile.createMany({
    data: [
      { userId: teachers[0].id, name: '张伟', title: '教授', department: '软件工程系', college: '计算机学院', education: '博士', major: '计算机科学与技术', hireDate: new Date('2010-09-01'), abilityRadar: { teaching: 92, research: 88, service: 85, collaboration: 90, innovation: 86 }, tags: ['教学名师', '科研骨干'], overallScore: 89.2, description: '主要从事软件工程、人工智能方向的教学与研究工作，发表SCI/EI论文30余篇，主持国家级科研项目2项。' },
      { userId: teachers[1].id, name: '李华', title: '副教授', department: '网络工程系', college: '计算机学院', education: '硕士', major: '网络工程', hireDate: new Date('2015-09-01'), abilityRadar: { teaching: 85, research: 78, service: 90, collaboration: 88, innovation: 82 }, tags: ['服务标兵'], overallScore: 84.5, description: '主要研究方向为网络安全、云计算，主持省部级项目1项，发表核心期刊论文10余篇。' },
      { userId: teachers[2].id, name: '王明', title: '教授', department: '数据科学系', college: '计算机学院', education: '博士', major: '数据科学', hireDate: new Date('2008-09-01'), abilityRadar: { teaching: 88, research: 95, service: 75, collaboration: 82, innovation: 90 }, tags: ['科研骨干', '创新先锋'], overallScore: 88.8, description: '研究方向为数据挖掘、机器学习，发表SCI论文40余篇，其中TOP期刊10篇，获省级科技奖2项。' },
      { userId: teachers[3].id, name: '陈宇', title: '讲师', department: '软件工程系', college: '计算机学院', education: '硕士', major: '软件工程', hireDate: new Date('2020-09-01'), abilityRadar: { teaching: 90, research: 70, service: 88, collaboration: 92, innovation: 85 }, tags: [], overallScore: 83.0, description: '主要承担软件工程专业课程教学，参与国家级科研项目1项，发表EI论文5篇。' },
      { userId: teachers[4].id, name: '赵鑫', title: '副教授', department: '人工智能系', college: '计算机学院', education: '博士', major: '人工智能', hireDate: new Date('2017-09-01'), abilityRadar: { teaching: 86, research: 92, service: 80, collaboration: 85, innovation: 95 }, tags: ['科研骨干', '创新先锋'], overallScore: 88.5, description: '研究方向为深度学习、自然语言处理，发表SCI论文20余篇，主持国家级青年项目1项。' },
      { userId: teachers[5].id, name: '孙丽', title: '教授', department: '会计学系', college: '经济管理学院', education: '博士', major: '会计学', hireDate: new Date('2005-09-01'), abilityRadar: { teaching: 91, research: 85, service: 88, collaboration: 86, innovation: 78 }, tags: ['教学名师'], overallScore: 86.8, description: '主要从事财务管理、审计理论方向研究，发表CSSCI论文20余篇，主编教材3部。' },
      { userId: teachers[6].id, name: '周军', title: '副教授', department: '市场营销系', college: '经济管理学院', education: '硕士', major: '市场营销', hireDate: new Date('2012-09-01'), abilityRadar: { teaching: 84, research: 76, service: 92, collaboration: 85, innovation: 88 }, tags: ['服务标兵'], overallScore: 83.5, description: '研究方向为消费者行为、品牌管理，发表核心期刊论文15篇。' },
      { userId: teachers[7].id, name: '武强', title: '教授', department: '机械工程系', college: '智能制造学院', education: '博士', major: '机械设计及理论', hireDate: new Date('2003-09-01'), abilityRadar: { teaching: 87, research: 90, service: 80, collaboration: 84, innovation: 89 }, tags: ['科研骨干'], overallScore: 86.2, description: '主要从事智能制造、机器人技术研究，主持国家级项目3项，获发明专利10项。' },
      { userId: teachers[8].id, name: '陈红', title: '讲师', department: '电气工程系', college: '智能制造学院', education: '硕士', major: '电气工程', hireDate: new Date('2019-09-01'), abilityRadar: { teaching: 88, research: 72, service: 85, collaboration: 90, innovation: 80 }, tags: [], overallScore: 82.8, description: '主要承担电工电子技术、自动化控制等课程教学。' },
      { userId: teachers[9].id, name: '杨帆', title: '副教授', department: '英语系', college: '外国语学院', education: '硕士', major: '英语语言文学', hireDate: new Date('2014-09-01'), abilityRadar: { teaching: 93, research: 68, service: 86, collaboration: 82, innovation: 75 }, tags: ['教学名师'], overallScore: 82.5, description: '主要从事大学英语教学与研究，发表教学改革论文10余篇，获校级教学成果奖2项。' },
      { userId: teachers[10].id, name: '柳青', title: '教授', department: '中文系', college: '人文学院', education: '博士', major: '中国现当代文学', hireDate: new Date('2006-09-01'), abilityRadar: { teaching: 89, research: 88, service: 78, collaboration: 80, innovation: 72 }, tags: ['科研骨干'], overallScore: 83.2, description: '研究方向为中国现代文学、文化研究，发表CSSCI论文25篇，出版专著2部。' },
      { userId: teachers[11].id, name: '赵云', title: '副教授', department: '法学系', college: '法学院', education: '硕士', major: '民商法', hireDate: new Date('2013-09-01'), abilityRadar: { teaching: 82, research: 80, service: 95, collaboration: 88, innovation: 76 }, tags: ['服务标兵'], overallScore: 84.0, description: '主要从事民商法教学与研究，发表核心期刊论文12篇，主持横向课题多项。' },
      { userId: teachers[12].id, name: '宋磊', title: '讲师', department: '体育系', college: '体育学院', education: '硕士', major: '体育教育训练学', hireDate: new Date('2021-09-01'), abilityRadar: { teaching: 95, research: 55, service: 88, collaboration: 92, innovation: 65 }, tags: [], overallScore: 79.0, description: '主要承担大学体育课程教学，擅长篮球、足球教学训练。' },
      { userId: teachers[13].id, name: '黄梅', title: '教授', department: '音乐系', college: '艺术学院', education: '博士', major: '音乐学', hireDate: new Date('2004-09-01'), abilityRadar: { teaching: 90, research: 78, service: 82, collaboration: 85, innovation: 88 }, tags: ['创新先锋'], overallScore: 84.6, description: '主要从事音乐教育、作曲理论研究，发表核心期刊论文18篇，创作音乐作品多部。' },
      { userId: teachers[14].id, name: '林杰', title: '副教授', department: '视觉传达设计系', college: '艺术学院', education: '硕士', major: '设计艺术学', hireDate: new Date('2016-09-01'), abilityRadar: { teaching: 86, research: 74, service: 80, collaboration: 88, innovation: 92 }, tags: ['创新先锋'], overallScore: 84.0, description: '研究方向为视觉传达设计、品牌设计，主持设计项目多项，获省级设计奖项5项。' }
    ]
  })

  const profiles = await prisma.teacherProfile.findMany()

  await prisma.course.createMany({
    data: [
      { name: '软件工程导论', code: 'SE101', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[0].id },
      { name: '高级软件工程', code: 'SE201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[0].id },
      { name: '计算机网络', code: 'NE101', credit: 4, semester: '秋季', year: 2024, teacherId: profiles[1].id },
      { name: '网络安全', code: 'NE201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[1].id },
      { name: '数据挖掘', code: 'DS101', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[2].id },
      { name: '机器学习', code: 'AI101', credit: 4, semester: '春季', year: 2024, teacherId: profiles[4].id },
      { name: '前端开发', code: 'SE102', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[3].id },
      { name: '数据库原理', code: 'SE103', credit: 3, semester: '春季', year: 2024, teacherId: profiles[0].id },
      { name: '人工智能导论', code: 'AI102', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[4].id },
      { name: '数据结构', code: 'SE104', credit: 4, semester: '秋季', year: 2024, teacherId: profiles[0].id },
      { name: '操作系统', code: 'SE202', credit: 4, semester: '春季', year: 2024, teacherId: profiles[3].id },
      { name: '信息安全', code: 'NE202', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[1].id },
      { name: '大数据技术', code: 'DS102', credit: 3, semester: '春季', year: 2024, teacherId: profiles[2].id },
      { name: '深度学习', code: 'AI201', credit: 4, semester: '春季', year: 2024, teacherId: profiles[4].id },
      { name: '会计学原理', code: 'AC101', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[5].id },
      { name: '财务管理', code: 'AC201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[5].id },
      { name: '市场营销学', code: 'MK101', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[6].id },
      { name: '消费者行为学', code: 'MK201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[6].id },
      { name: '机械设计基础', code: 'ME101', credit: 4, semester: '秋季', year: 2024, teacherId: profiles[7].id },
      { name: '智能制造技术', code: 'ME201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[7].id },
      { name: '电工电子技术', code: 'EE101', credit: 4, semester: '秋季', year: 2024, teacherId: profiles[8].id },
      { name: '自动控制原理', code: 'EE201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[8].id },
      { name: '大学英语', code: 'EN101', credit: 4, semester: '秋季', year: 2024, teacherId: profiles[9].id },
      { name: '商务英语', code: 'EN201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[9].id },
      { name: '中国现代文学', code: 'CH101', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[10].id },
      { name: '文学理论', code: 'CH201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[10].id },
      { name: '民法总论', code: 'LA101', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[11].id },
      { name: '商法', code: 'LA201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[11].id },
      { name: '大学体育', code: 'PE101', credit: 2, semester: '秋季', year: 2024, teacherId: profiles[12].id },
      { name: '篮球专项', code: 'PE201', credit: 2, semester: '春季', year: 2024, teacherId: profiles[12].id },
      { name: '音乐欣赏', code: 'MU101', credit: 2, semester: '秋季', year: 2024, teacherId: profiles[13].id },
      { name: '作曲基础', code: 'MU201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[13].id },
      { name: '平面设计', code: 'DE101', credit: 3, semester: '秋季', year: 2024, teacherId: profiles[14].id },
      { name: '品牌设计', code: 'DE201', credit: 3, semester: '春季', year: 2024, teacherId: profiles[14].id }
    ]
  })

  const courses = await prisma.course.findMany()

  await prisma.evaluation.createMany({
    data: [
      { type: 'TEACHING', score: 95, comment: '教学认真负责，课堂互动性强，学生参与度高', evaluator: '学生A', teacherId: profiles[0].id, courseId: courses[0].id },
      { type: 'TEACHING', score: 92, comment: '讲解清晰，重点突出，善于引导学生思考', evaluator: '学生B', teacherId: profiles[0].id, courseId: courses[0].id },
      { type: 'TEACHING', score: 88, comment: '教学方法灵活多样，课堂氛围活跃', evaluator: '学生C', teacherId: profiles[0].id, courseId: courses[1].id },
      { type: 'RESEARCH', score: 88, comment: '科研能力强，指导学生耐心细致', evaluator: '研究生D', teacherId: profiles[0].id },
      { type: 'COLLABORATION', score: 90, comment: '团队合作意识强，乐于助人', evaluator: '同事E', teacherId: profiles[0].id },
      { type: 'TEACHING', score: 85, comment: '教学方法新颖，注重实践能力培养', evaluator: '学生F', teacherId: profiles[1].id, courseId: courses[2].id },
      { type: 'TEACHING', score: 88, comment: '备课充分，讲解深入浅出', evaluator: '学生G', teacherId: profiles[1].id, courseId: courses[3].id },
      { type: 'SERVICE', score: 92, comment: '积极参与学院服务工作，责任心强', evaluator: '学院', teacherId: profiles[1].id },
      { type: 'COLLABORATION', score: 86, comment: '团队协作良好，沟通顺畅', evaluator: '同事H', teacherId: profiles[1].id },
      { type: 'TEACHING', score: 87, comment: '讲课富有激情，能激发学生兴趣', evaluator: '学生I', teacherId: profiles[2].id, courseId: courses[4].id },
      { type: 'RESEARCH', score: 96, comment: '研究成果丰硕，学术影响力大', evaluator: '学术委员会', teacherId: profiles[2].id },
      { type: 'INNOVATION', score: 92, comment: '创新能力强，勇于探索新方向', evaluator: '评审专家', teacherId: profiles[2].id },
      { type: 'TEACHING', score: 90, comment: '课堂氛围活跃，师生互动良好', evaluator: '学生J', teacherId: profiles[3].id, courseId: courses[6].id },
      { type: 'COLLABORATION', score: 93, comment: '团队协作能力优秀，乐于助人', evaluator: '同事K', teacherId: profiles[3].id },
      { type: 'SERVICE', score: 85, comment: '积极参与学生指导工作', evaluator: '学院', teacherId: profiles[3].id },
      { type: 'TEACHING', score: 86, comment: '教学内容前沿，紧跟行业发展', evaluator: '学生L', teacherId: profiles[4].id, courseId: courses[5].id },
      { type: 'RESEARCH', score: 94, comment: '论文质量高，发表在顶级期刊', evaluator: '期刊编辑', teacherId: profiles[4].id },
      { type: 'INNOVATION', score: 96, comment: '技术创新突出，具有应用价值', evaluator: '评审专家', teacherId: profiles[4].id },
      { type: 'TEACHING', score: 91, comment: '教学经验丰富，讲解清晰易懂', evaluator: '学生M', teacherId: profiles[5].id, courseId: courses[14].id },
      { type: 'RESEARCH', score: 85, comment: '研究方向明确，成果稳定', evaluator: '同行N', teacherId: profiles[5].id },
      { type: 'TEACHING', score: 84, comment: '注重案例教学，理论联系实际', evaluator: '学生O', teacherId: profiles[6].id, courseId: courses[16].id },
      { type: 'SERVICE', score: 95, comment: '积极参与社会服务，贡献突出', evaluator: '学院', teacherId: profiles[6].id },
      { type: 'TEACHING', score: 87, comment: '实验教学安排合理，学生收获大', evaluator: '学生P', teacherId: profiles[7].id, courseId: courses[18].id },
      { type: 'RESEARCH', score: 90, comment: '科研项目主持能力强，成果显著', evaluator: '科研处', teacherId: profiles[7].id },
      { type: 'TEACHING', score: 88, comment: '理论讲解透彻，实验指导耐心', evaluator: '学生Q', teacherId: profiles[8].id, courseId: courses[20].id },
      { type: 'COLLABORATION', score: 90, comment: '团队合作精神好，配合默契', evaluator: '同事R', teacherId: profiles[8].id },
      { type: 'TEACHING', score: 93, comment: '发音标准，课堂生动有趣', evaluator: '学生S', teacherId: profiles[9].id, courseId: courses[22].id },
      { type: 'TEACHING', score: 91, comment: '教学方法得当，学生进步明显', evaluator: '学生T', teacherId: profiles[9].id, courseId: courses[23].id },
      { type: 'TEACHING', score: 89, comment: '文学功底深厚，讲解富有感染力', evaluator: '学生U', teacherId: profiles[10].id, courseId: courses[24].id },
      { type: 'RESEARCH', score: 88, comment: '学术研究扎实，成果丰富', evaluator: '同行V', teacherId: profiles[10].id },
      { type: 'TEACHING', score: 82, comment: '法律知识扎实，案例分析到位', evaluator: '学生W', teacherId: profiles[11].id, courseId: courses[26].id },
      { type: 'SERVICE', score: 95, comment: '积极参与法律援助，服务社会', evaluator: '法学院', teacherId: profiles[11].id },
      { type: 'TEACHING', score: 95, comment: '体育课组织有序，学生积极性高', evaluator: '学生X', teacherId: profiles[12].id, courseId: courses[28].id },
      { type: 'COLLABORATION', score: 92, comment: '团队活动组织能力强', evaluator: '体育学院', teacherId: profiles[12].id },
      { type: 'TEACHING', score: 90, comment: '音乐素养高，教学富有感染力', evaluator: '学生Y', teacherId: profiles[13].id, courseId: courses[30].id },
      { type: 'INNOVATION', score: 88, comment: '艺术创新能力强，作品有特色', evaluator: '艺术学院', teacherId: profiles[13].id },
      { type: 'TEACHING', score: 86, comment: '设计教学专业，学生作品质量高', evaluator: '学生Z', teacherId: profiles[14].id, courseId: courses[32].id },
      { type: 'INNOVATION', score: 92, comment: '设计理念新颖，具有前瞻性', evaluator: '设计协会', teacherId: profiles[14].id },
      { type: 'INNOVATION', score: 85, comment: '教学改革积极，效果良好', evaluator: '教务处', teacherId: profiles[0].id },
      { type: 'SERVICE', score: 88, comment: '积极参与学科建设', evaluator: '计算机学院', teacherId: profiles[2].id },
      { type: 'RESEARCH', score: 78, comment: '科研潜力大，发展前景好', evaluator: '导师', teacherId: profiles[3].id },
      { type: 'TEACHING', score: 83, comment: '教学态度认真，课堂管理严格', evaluator: '学生AA', teacherId: profiles[6].id, courseId: courses[17].id },
      { type: 'RESEARCH', score: 82, comment: '研究方向与产业结合紧密', evaluator: '企业', teacherId: profiles[7].id },
      { type: 'SERVICE', score: 80, comment: '参与校园文化建设', evaluator: '团委', teacherId: profiles[13].id }
    ]
  })

  await prisma.achievement.createMany({
    data: [
      { title: '基于深度学习的软件缺陷检测方法研究', type: 'PAPER', authors: '张伟, 李明', journal: 'IEEE Transactions on Software Engineering', publishDate: new Date('2024-03-15'), impactFactor: 5.8, level: 'A', teacherId: profiles[0].id, url: 'https://ieeexplore.ieee.org/document/1234567', summary: '本文提出了一种基于深度学习的软件缺陷检测方法，通过构建多层神经网络模型，实现了对源代码中潜在缺陷的自动识别和定位。实验结果表明，该方法在多个基准数据集上取得了优于现有方法的检测准确率。', keywords: '深度学习,软件缺陷检测,神经网络' },
      { title: '云计算环境下的资源优化调度算法', type: 'PAPER', authors: '李华', journal: '计算机学报', publishDate: new Date('2023-12-20'), level: 'A', teacherId: profiles[1].id, url: 'https://cjc.ict.ac.cn/CN/10.11897/SP.J.1016.2023.02345', summary: '针对云计算环境中资源调度的效率问题，提出了一种基于遗传算法的优化调度策略，有效降低了任务执行时间和资源消耗。', keywords: '云计算,资源调度,遗传算法' },
      { title: '大规模数据挖掘中的隐私保护技术', type: 'PAPER', authors: '王明, 刘洋', journal: 'ACM Transactions on Knowledge Discovery from Data', publishDate: new Date('2024-01-10'), impactFactor: 8.2, level: 'A+', teacherId: profiles[2].id, url: 'https://dl.acm.org/doi/10.1145/3583788', summary: '研究了大规模数据挖掘场景下的隐私保护问题，提出了基于差分隐私的保护框架，在保证数据可用性的同时有效保护用户隐私。', keywords: '数据挖掘,隐私保护,差分隐私' },
      { title: '一种基于区块链的数字版权保护系统', type: 'PATENT', authors: '陈宇', level: '发明专利', teacherId: profiles[3].id, url: 'https://www.cnipa.gov.cn', summary: '本发明公开了一种基于区块链技术的数字版权保护系统，通过去中心化的方式实现版权的登记、认证和追踪。', keywords: '区块链,数字版权,知识产权' },
      { title: '面向智能客服的对话生成模型研究', type: 'PAPER', authors: '赵鑫', journal: 'Neural Networks', publishDate: new Date('2024-02-28'), impactFactor: 6.5, level: 'A', teacherId: profiles[4].id, url: 'https://www.sciencedirect.com/science/article/pii/S0893608024000567', summary: '提出了一种基于Transformer架构的对话生成模型，通过引入领域知识增强机制，显著提升了智能客服系统的对话质量和用户满意度。', keywords: '对话生成,智能客服,Transformer' },
      { title: '广东省自然科学基金项目：人工智能驱动的教育质量评估', type: 'PROJECT', authors: '张伟', level: '省部级', teacherId: profiles[0].id, url: 'https://gdstc.gd.gov.cn', summary: '本项目旨在构建基于人工智能的教育质量评估体系，通过大数据分析和机器学习方法实现对教学质量的全面评估。', keywords: '人工智能,教育评估,大数据' },
      { title: '国家级教学成果奖二等奖', type: 'AWARD', authors: '李华, 王明', level: '国家级', teacherId: profiles[1].id, url: 'https://www.moe.gov.cn', summary: '该成果围绕高校计算机专业人才培养模式改革展开，构建了"理论+实践+创新"三位一体的培养体系。', keywords: '教学成果,人才培养,教育改革' },
      { title: '基于强化学习的软件测试用例生成方法', type: 'PAPER', authors: '张伟, 王芳', journal: 'Software Testing, Verification and Reliability', publishDate: new Date('2023-11-05'), impactFactor: 3.2, level: 'B', teacherId: profiles[0].id, url: 'https://onlinelibrary.wiley.com/doi/10.1002/stvr.1897', summary: '将强化学习技术应用于软件测试用例生成，通过智能探索策略自动生成高效的测试用例集，显著提高了测试覆盖率和缺陷发现率。', keywords: '强化学习,软件测试,测试用例生成' },
      { title: '网络安全态势感知系统设计与实现', type: 'PAPER', authors: '李华, 刘强', journal: '通信学报', publishDate: new Date('2024-01-20'), level: 'A', teacherId: profiles[1].id, url: 'https://www.infocomm-journal.com/txxb/CN/10.11959/j.issn.1000-436x.2024023', summary: '设计并实现了一套面向大规模网络的安全态势感知系统，通过多源数据融合和智能分析实现对网络安全威胁的实时监测和预警。', keywords: '网络安全,态势感知,威胁检测' },
      { title: '联邦学习在医疗数据隐私保护中的应用研究', type: 'PAPER', authors: '王明', journal: 'Nature Communications', publishDate: new Date('2024-04-01'), impactFactor: 17.6, level: 'A+', teacherId: profiles[2].id, url: 'https://www.nature.com/articles/s41467-024-46789-3', summary: '研究了联邦学习框架在医疗数据隐私保护中的应用，实现了多机构间的协同学习而不泄露原始数据，为医疗AI模型训练提供了新的解决方案。', keywords: '联邦学习,医疗数据,隐私保护,AI' },
      { title: '智能合约安全漏洞检测工具', type: 'PATENT', authors: '陈宇, 张伟', level: '发明专利', teacherId: profiles[3].id, url: 'https://www.cnipa.gov.cn', summary: '本发明提供了一种智能合约安全漏洞检测工具，能够自动识别智能合约代码中的常见安全漏洞，如重入攻击、整数溢出等。', keywords: '智能合约,安全检测,区块链' },
      { title: '基于Transformer的代码生成模型研究', type: 'PAPER', authors: '赵鑫, 孙丽', journal: 'ACM Computing Surveys', publishDate: new Date('2024-05-15'), impactFactor: 12.3, level: 'A+', teacherId: profiles[4].id, url: 'https://dl.acm.org/doi/10.1145/3643947', summary: '系统综述了基于Transformer架构的代码生成模型研究进展，分析了现有方法的优缺点，并指出了未来的研究方向。', keywords: '代码生成,Transformer,程序合成' },
      { title: '数字经济背景下企业财务风险预警研究', type: 'PAPER', authors: '孙丽', journal: '会计研究', publishDate: new Date('2024-02-10'), level: 'A', teacherId: profiles[5].id, url: 'http://kjyj.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=KJYJ202402003', summary: '基于数字经济背景，构建了企业财务风险预警模型，通过机器学习算法实现对企业财务状况的实时监控和风险预警。', keywords: '财务风险,预警模型,机器学习' },
      { title: '审计质量影响因素的实证研究', type: 'PAPER', authors: '孙丽, 周军', journal: '审计研究', publishDate: new Date('2023-10-25'), level: 'A', teacherId: profiles[5].id, url: 'http://sjyj.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=SJYJ202305004', summary: '通过实证研究分析了影响审计质量的关键因素，为提高审计质量提供了理论依据和实践建议。', keywords: '审计质量,实证研究,公司治理' },
      { title: '消费者网络购买决策影响因素研究', type: 'PAPER', authors: '周军', journal: '管理世界', publishDate: new Date('2024-03-01'), impactFactor: 10.5, level: 'A+', teacherId: profiles[6].id, url: 'http://glsj.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=GLSJ202403008', summary: '基于计划行为理论，研究了消费者网络购买决策的影响因素，为电商企业制定营销策略提供了参考。', keywords: '消费者行为,网络购物,购买决策' },
      { title: '品牌社群认同对消费者忠诚度的影响', type: 'PAPER', authors: '周军, 吴强', journal: '营销科学学报', publishDate: new Date('2023-12-15'), level: 'B', teacherId: profiles[6].id, url: 'http://yxkx.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=YXKX202304005', summary: '探讨了品牌社群认同对消费者忠诚度的影响机制，揭示了情感依恋在其中的中介作用。', keywords: '品牌社群,消费者忠诚,品牌管理' },
      { title: '工业机器人路径规划算法研究', type: 'PAPER', authors: '武强', journal: '机械工程学报', publishDate: new Date('2024-01-05'), level: 'A', teacherId: profiles[7].id, url: 'http://jme.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=JCHG202401002', summary: '提出了一种基于改进A*算法的工业机器人路径规划方法，在保证路径最优的同时提高了算法的效率和稳定性。', keywords: '工业机器人,路径规划,A*算法' },
      { title: '智能制造生产线优化设计方法', type: 'PATENT', authors: '武强, 陈红', level: '发明专利', teacherId: profiles[7].id, url: 'https://www.cnipa.gov.cn', summary: '本发明提供了一种智能制造生产线的优化设计方法，通过仿真建模和智能优化算法实现生产线的高效配置。', keywords: '智能制造,生产线设计,优化算法' },
      { title: '国家自然科学基金：智能制造系统可靠性研究', type: 'PROJECT', authors: '武强', level: '国家级', teacherId: profiles[7].id, url: 'https://www.nsfc.gov.cn', summary: '本项目旨在研究智能制造系统的可靠性问题，建立可靠性评估模型和维护策略，提高制造系统的稳定性和效率。', keywords: '智能制造,可靠性,维护策略' },
      { title: '电动汽车电池管理系统设计', type: 'PAPER', authors: '陈红', journal: '电工技术学报', publishDate: new Date('2024-04-20'), level: 'A', teacherId: profiles[8].id, url: 'http://dgjsxb.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=DGJZ202404005', summary: '设计了一种基于模型预测控制的电动汽车电池管理系统，实现了对电池状态的精确估计和优化控制。', keywords: '电动汽车,电池管理,模型预测控制' },
      { title: '大学英语教学改革实践与探索', type: 'PAPER', authors: '杨帆', journal: '外语教学与研究', publishDate: new Date('2024-03-10'), level: 'A', teacherId: profiles[9].id, url: 'http://wyjxyj.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=WYJY202402006', summary: '介绍了大学英语教学改革的实践经验，构建了"线上+线下"混合教学模式，显著提升了学生的英语综合应用能力。', keywords: '大学英语,教学改革,混合教学' },
      { title: '校级教学成果奖一等奖', type: 'AWARD', authors: '杨帆', level: '校级', teacherId: profiles[9].id, url: 'https://www.tdp.edu.cn', summary: '该成果围绕大学英语教学模式创新展开，建立了以学生为中心的教学体系，获校级教学成果奖一等奖。', keywords: '教学成果,英语教学,教学模式' },
      { title: '中国当代文学中的城市书写研究', type: 'PAPER', authors: '柳青', journal: '文学评论', publishDate: new Date('2024-02-15'), level: 'A', teacherId: profiles[10].id, url: 'http://wxpl.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=WXPL202402007', summary: '探讨了中国当代文学中的城市书写传统，分析了不同时期城市文学的特点和演变轨迹。', keywords: '当代文学,城市书写,文学研究' },
      { title: '现代性与中国文学转型', type: 'OTHER', authors: '柳青', journal: '专著', publishDate: new Date('2023-11-01'), level: 'A', teacherId: profiles[10].id, url: 'https://www.dangdang.com', summary: '本书从现代性视角探讨了中国文学的现代转型过程，分析了传统文学向现代文学转变的内在机制和外部因素。', keywords: '现代性,文学转型,中国文学' },
      { title: '民法典时代的物权保护研究', type: 'PAPER', authors: '赵云', journal: '中国法学', publishDate: new Date('2024-01-25'), impactFactor: 8.5, level: 'A+', teacherId: profiles[11].id, url: 'http://zgfz.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=ZGFZ202401008', summary: '分析了民法典时代物权保护的新问题和新挑战，提出了完善物权保护制度的建议。', keywords: '民法典,物权保护,法律研究' },
      { title: '地方立法研究', type: 'PROJECT', authors: '赵云', level: '省部级', teacherId: profiles[11].id, url: 'https://www.npc.gov.cn', summary: '本项目旨在研究地方立法的理论与实践问题，为完善地方立法体制提供理论支持和实践指导。', keywords: '地方立法,立法研究,法治建设' },
      { title: '校园足球发展模式研究', type: 'PAPER', authors: '宋磊', journal: '北京体育大学学报', publishDate: new Date('2024-04-10'), level: 'A', teacherId: profiles[12].id, url: 'http://bjtydxxb.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=BTDX202404012', summary: '探讨了校园足球发展的模式和路径，分析了制约校园足球发展的因素，并提出了相应的发展策略。', keywords: '校园足球,发展模式,体育教育' },
      { title: '岭南音乐文化传承与创新', type: 'PAPER', authors: '黄梅', journal: '音乐研究', publishDate: new Date('2024-03-20'), level: 'A', teacherId: profiles[13].id, url: 'http://yyyj.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=YYYJ202402009', summary: '研究了岭南音乐文化的历史传承和当代创新，分析了岭南音乐的特点和价值，探讨了保护和传承的路径。', keywords: '岭南音乐,文化传承,音乐创新' },
      { title: '原创钢琴曲《岭南印象》', type: 'OTHER', authors: '黄梅', level: '作品', teacherId: profiles[13].id, url: 'https://music.163.com', summary: '原创钢琴曲《岭南印象》以岭南音乐元素为素材，通过钢琴独奏的形式展现了岭南地区的风土人情和文化特色。', keywords: '钢琴创作,岭南音乐,原创作品' },
      { title: '品牌视觉识别系统设计研究', type: 'PAPER', authors: '林杰', journal: '装饰', publishDate: new Date('2024-02-01'), level: 'A', teacherId: profiles[14].id, url: 'http://zs.cbpt.cnki.net/KCMS/detail/detail.aspx?dbcode=CJFD&filename=ZS202402015', summary: '探讨了品牌视觉识别系统的设计原则和方法，结合案例分析了优秀品牌视觉设计的特点和成功经验。', keywords: '品牌设计,视觉识别,设计研究' },
      { title: '广东省优秀设计奖', type: 'AWARD', authors: '林杰', level: '省部级', teacherId: profiles[14].id, url: 'https://gdada.cn', summary: '该设计作品凭借创新的设计理念和出色的视觉表现，获得广东省优秀设计奖。', keywords: '设计奖项,品牌设计,视觉传达' },
      { title: '软件工程专业人才培养模式改革', type: 'PROJECT', authors: '张伟, 李华', level: '校级', teacherId: profiles[0].id, url: 'https://www.tdp.edu.cn', summary: '本项目旨在改革软件工程专业人才培养模式，构建"产教融合、校企合作"的人才培养体系。', keywords: '软件工程,人才培养,产教融合' },
      { title: '数据科学与大数据技术新专业建设', type: 'PROJECT', authors: '王明', level: '省部级', teacherId: profiles[2].id, url: 'https://www.moe.gov.cn', summary: '本项目围绕数据科学与大数据技术新专业建设展开，制定了专业培养方案和课程体系。', keywords: '数据科学,专业建设,大数据' },
      { title: 'AI辅助教学系统开发', type: 'OTHER', authors: '赵鑫', level: '软件著作权', teacherId: profiles[4].id, url: 'https://github.com', summary: '开发了一套基于人工智能的辅助教学系统，支持智能答疑、个性化学习推荐等功能。', keywords: 'AI教育,辅助教学,智能系统' }
    ]
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
