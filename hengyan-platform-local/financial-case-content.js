(function () {
  const owner = {name:'李思远', short:'李', role:'金融服务顾问', department:'产业客户金融服务部', phone:'400-800-2026 转 2', email:'finance-service@gtjas.com'};
  const common = {publishedAt:'2026-08-21 10:00',contentType:'场景案例',owner,category:'金融服务',parentTitle:'场景案例',showHomeBack:true,homeBackLabel:'返回金融服务页',suitabilityTitle:'适用范围与使用提示',suitability:'适用于有真实采购、库存或销售回款需求，并希望了解产业融资路径的企业。案例内容为原型模拟，实际方案需结合企业资质、货权、合同与还款来源评估。',files:[{name:'融资意向登记材料清单',format:'PDF · 示例资料'},{name:'企业经营与货权说明模板',format:'DOCX · 示例模板'}],disclaimer:'本文仅用于一般性业务交流和知识普及，不构成授信承诺、交易、法律、会计或投资建议。具体业务以合作机构审核结果及正式协议为准。'};
  ContentServiceTemplates.register('finance-case-inventory','common',{...common,title:'库存周转资金需求',summary:'某金属贸易企业以标准仓单为基础登记融资意向，围绕库存占用、采购节奏与销售回款周期寻求周转资金安排。',body:`<h2>业务背景</h2><p>某金属贸易企业持有已登记的标准仓单，近期采购规模增加，库存占用资金上升。企业希望在不影响正常交付的前提下，盘活合规货权并改善库存周转。</p><h2>需求判断</h2><ul><li>融资基础：标准仓单及对应货权资料真实、完整、可核验。</li><li>资金用途：用于真实贸易项下的采购与库存周转。</li><li>还款来源：销售回款、库存处置收入及企业经营现金流。</li><li>重点关注：货权控制、仓储监管、价格波动和保证金安排。</li></ul><h2>可参考的服务路径</h2><p>企业可先完成融资意向登记，由客户经理协助梳理仓单、贸易合同、企业经营和还款来源等资料，再根据货权与风险评估结果匹配合适的合作机构和产品。</p><div class="cs-notice-box"><b>案例提示</b><p>标准仓单并不等同于自动获得融资。融资额度、期限、利率、担保方式及放款条件均需经过正式审核。</p></div><h2>建议准备的材料</h2><p>企业基本资料、近期开票与销售记录、采购及销售合同、仓单与仓储信息、库存清单、银行流水及资金用途说明。</p>`});
  ContentServiceTemplates.register('finance-case-seasonal','common',{...common,title:'季节性采购资金安排',summary:'某加工企业结合采购合同与销售回款周期规划资金，重点解决季节性备货阶段的短期流动性压力。',body:`<h2>业务背景</h2><p>某加工企业在旺季前需要集中采购原料，采购合同交付期与下游销售回款期存在时间差，企业希望提前规划阶段性资金安排。</p><h2>需求判断</h2><ul><li>采购计划应与订单、产能和库存上限相匹配。</li><li>资金期限应覆盖采购、生产、交付及回款的完整周期。</li><li>应明确销售回款、存货处置和备用流动性的还款来源。</li><li>需要关注原料价格、库存价值及销售价格变化带来的风险。</li></ul><h2>可参考的服务路径</h2><p>企业可提交采购合同、销售订单、历史回款及季节性经营数据，登记资金需求后由客户经理协助评估期限、额度和配套的风险控制安排。</p><h2>实施建议</h2><p>将采购批次、库存水平和销售回款节点纳入滚动计划，按周或按月复核资金缺口，避免因过度备货造成资金长期占用。</p>`});
  const crossborderOwner = {name:'赵澜',short:'赵',role:'跨境业务顾问',department:'跨境业务与合规服务部',phone:'400-800-2026 转 4',email:'crossborder-service@gtjas.com'};
  const crossborderCommon = {publishedAt:'2026-08-22 09:30',contentType:'场景案例',owner:crossborderOwner,category:'跨境支持',parentTitle:'场景案例',showHomeBack:true,homeBackLabel:'返回跨境支持页',suitabilityTitle:'适用范围与使用提示',suitability:'适用于具有真实跨境贸易、境外价格风险管理或保税交割需求的产业企业。案例为原型模拟，实际路径需结合企业资质、贸易背景、账户通道、外汇管理及适用监管要求评估。',files:[{name:'跨境业务需求材料清单',format:'PDF · 示例资料'},{name:'跨境敞口信息采集表',format:'XLSX · 示例模板'}],disclaimer:'本文仅用于一般性业务交流和知识普及，不构成开户、交易、法律、税务、外汇或投资建议。具体业务规则、准入条件和办理结果以境内外机构审核及正式协议为准。'};
  ContentServiceTemplates.register('crossborder-case-import-hedge','common',{...crossborderCommon,title:'进口原料跨境套保',summary:'统筹外盘价格、汇率与境内销售定价的风险暴露，帮助进口型企业梳理跨境套保目标、工具与执行边界。',body:`<h2>业务背景</h2><p>某制造企业长期进口有色金属原料，采购价格参考境外市场报价并以美元结算，产成品主要在境内销售。外盘价格与汇率同时波动，使采购成本和销售毛利面临复合风险。</p><h2>风险识别</h2><ul><li>价格风险：境外基准价格上涨推高原料采购成本。</li><li>汇率风险：美元兑人民币波动改变实际结算成本。</li><li>基差风险：境外定价与境内销售价格并非完全同步。</li><li>时间风险：合同定价、付款、到港和销售节点存在错位。</li></ul><h2>可参考的服务路径</h2><p>先按合同逐笔梳理定价币种、定价窗口、付款节点和境内销售方式，形成价格与汇率敞口台账；再结合企业境外通道、授权体系和资金能力，评估工具组合与分阶段执行方案。</p><div class="cs-notice-box"><b>案例提示</b><p>跨境套保应服务于真实贸易风险管理，不应脱离现货合同扩大交易规模。价格工具与外汇工具还需分别满足对应市场和监管要求。</p></div><h2>建议准备的材料</h2><p>进口合同、历史采购与销售数据、定价条款、付款计划、币种信息、境内外账户与授权资料，以及现行风险管理制度。</p>`});
  ContentServiceTemplates.register('crossborder-case-bonded-warrant','common',{...crossborderCommon,title:'保税仓单业务准备',summary:'围绕真实贸易背景、保税货物流转与交割安排，明确保税仓单业务所需的参与条件、单据和协同节点。',body:`<h2>业务背景</h2><p>某贸易企业计划使用保税区域内的商品参与仓单及跨境交收业务，希望提前确认货物流、单据流、资金流和税务处理要求。</p><h2>准备重点</h2><ul><li>核验企业主体、贸易背景及相关业务资质。</li><li>确认货物品种、质量标准、仓库和仓单状态。</li><li>梳理报关、保税监管、发票及结算单据流转。</li><li>明确交割、过户、提货和异常处置的责任边界。</li></ul><h2>可参考的服务路径</h2><p>企业可先提交贸易合同、货物与仓储信息，由客户经理协同交割、仓库及跨境服务团队核对参与条件，形成材料清单和办理节点，再进入正式业务系统。</p><h2>关键风险提示</h2><p>保税仓单业务涉及交易所规则、海关监管、税务处理和跨境结算等多项要求。货物状态、单据一致性或时间节点不匹配，均可能影响交割与提货安排。</p><h2>建议准备的材料</h2><p>企业及经办人资料、贸易合同、报关与保税单据、仓储及仓单信息、质量证明、结算安排和授权文件。</p>`});
  // 内容模板是叠加在原 React 页面上的独立视图。主导航继续切换页面前，
  // 必须先清理模板模式，否则新的类目已经切换但仍被模板视图遮住。
  document.addEventListener('click',function(event){
    if(!document.body.classList.contains('content-service-mode'))return;
    if(!event.target.closest('.main-header nav button,.main-header .logo,.main-header .workspace-entry'))return;
    ContentServiceTemplates.close();
    // 原页面的导航处理会在本次点击周期内继续更新视图；结束后再次确保
    // 案例 hash 已移除，避免用户刷新时重新进入刚才的内容页。
    setTimeout(function(){
      if(location.hash.indexOf('#content/')===0)location.hash='';
    },0);
  },true);
  document.addEventListener('click',function(event){
    const card=event.target.closest('section.scenario-section article');if(!card)return;
    const text=card.textContent||'';
    const routes=[['库存周转资金需求','finance-case-inventory'],['季节性采购资金安排','finance-case-seasonal'],['进口原料跨境套保','crossborder-case-import-hedge'],['保税仓单业务准备','crossborder-case-bonded-warrant']];
    const route=routes.find(function(item){return text.includes(item[0]);});if(!route)return;
    event.preventDefault();event.stopImmediatePropagation();ContentServiceTemplates.openRegistered(route[1]);
  },true);
})();
