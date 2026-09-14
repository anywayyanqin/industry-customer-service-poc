window.BasicServiceActivities=[
 {id:'policy-live',type:'政策直播',title:'监管政策解读及企业合规专题直播',desc:'围绕最新监管要求、业务适用边界与企业合规关注事项开展线上解读。',date:'2026-08-26 14:00',place:'线上直播',capacity:'开放预约',audience:'产业企业管理、业务、风控及合规相关人员',speaker:'风险管理与合规专业团队',agenda:['监管规则变化概览','产业企业适用边界','内部制度与行动清单','在线问答交流'],notice:['活动开始前将通过预留手机号发送参会提醒。','直播链接仅供报名人员使用，请勿公开转发。']},
 {id:'industry-salon',type:'产业沙龙',title:'产业风险管理实践与工具应用沙龙',desc:'邀请产业企业与专业团队交流风险识别、方案设计和执行管理经验。',date:'2026-09-05 13:30',place:'上海 · 线下活动',capacity:'限额 80 人',audience:'产业企业负责人、风险管理及相关业务人员',speaker:'产业客户代表与衍生品业务专家',agenda:['产业形势主题分享','企业风险管理案例','衍生工具应用讨论','自由交流与资源对接'],notice:['报名信息提交后由活动团队审核确认。','具体场地与签到安排将在审核通过后通知。']},
 {id:'industry-research',type:'行业调研',title:'重点产业链企业调研与信息分享',desc:'通过企业走访和专题座谈了解产业运行情况，沉淀调研观察与行业信息。',date:'2026-09-18 全天',place:'华东地区',capacity:'限额 30 人',audience:'产业企业经营管理、采购销售及研究相关人员',speaker:'产业研究团队与受访企业代表',agenda:['产业链运行情况交流','重点企业现场走访','经营风险与需求座谈','调研纪要与信息分享'],notice:['调研行程可能根据企业接待安排进行调整。','参与人员需遵守现场安全与信息保密要求。']}
];
window.getBasicServiceActivity=id=>window.BasicServiceActivities.find(x=>x.id===id)||window.BasicServiceActivities[0];
