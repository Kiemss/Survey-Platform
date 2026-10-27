<script setup lang="ts">
import { setMeta } from '../engine/meta'

setMeta('免责声明', '绿帆心理测评的免责声明：站内量表仅供自我探索参考，不构成医学诊断。')
const hotline = '全国心理援助热线：12356（或北京 010-82951332）'
</script>

<template>
  <div class="legal">
    <h1>免责声明</h1>

    <section>
      <h2>一、本网站的性质</h2>
      <p>
        本站是一个免费的心理学自评工具集合平台，收录的量表均为国内外公开发布或广泛流传的心理测评工具，
        由本站按通行版本整理为网页自测形式。本站为个人维护的非商业、非医疗网站，与任何量表的原编制机构、
        出版方均无隶属或授权关系（另有注明者除外）。
      </p>
    </section>

    <section>
      <h2>二、测评结果不构成诊断</h2>
      <p>
        <strong>本站所有测评结果仅供自我探索与参考，不构成医学诊断、心理诊断或治疗建议。</strong>
        任何心理疾病（如抑郁症、焦虑障碍等）的诊断，必须由具备执业资格的精神科医生或临床心理工作者，
        结合访谈、观察与专业检查后作出。自评量表存在作答偏差、状态干扰等固有局限，其结果可能不准确。
      </p>
      <p>若结果提示你可能存在困扰，或你正被相关症状持续困扰，请及时寻求专业帮助：</p>
      <ul>
        <li>前往正规医院的精神科 / 心理科就诊</li>
        <li>联系学校、单位的心理咨询中心</li>
        <li>拨打 {{ hotline }}</li>
      </ul>
      <p class="crisis">
        如果你或你身边的人出现自伤、自杀念头，请立即拨打上述热线，或前往最近医院急诊。
      </p>
    </section>

    <section>
      <h2>三、量表来源与改编说明</h2>
      <ul>
        <li>部分量表（如 IPIP 系列、AQ-50、PHQ-9、GAD-7、ASRS 等）来自官方网站或权利方明确公开授权的渠道，本站如实整理并注明出处</li>
        <li>部分量表为互联网长期流传版本，原始出处不可考（如 MBTI 类自编题库、部分国内校园量表），本站取最通行版本整理，无法保证与官方版本一致</li>
        <li>部分量表为适应网页自测形式做了计分整合或选项改编，均已在对应测评页的声明中注明</li>
        <li>如你认为本站收录的内容侵犯了你的著作权，请通过 GitHub 仓库 Issues 联系，核实后将立即处理</li>
      </ul>
    </section>

    <section>
      <h2>四、责任限制</h2>
      <p>
        本站按「现状」提供，不保证服务不中断或结果绝对准确。对于你依据本站测评结果作出的任何决定
        （包括但不限于就医、用药、自我调整），本站不承担责任。使用本站即表示你已理解并同意上述内容。
      </p>
    </section>

    <p class="updated">最近更新：2026-10</p>
  </div>
</template>

<style scoped>
.legal {
  max-width: 720px;
}
section {
  margin-bottom: 20px;
}
h2 {
  font-size: 16px;
  margin: 0 0 8px;
}
p,
li {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text);
}
ul {
  padding-left: 20px;
  margin: 8px 0;
}
.crisis {
  color: var(--danger, #c0392b);
  font-weight: 600;
}
.updated {
  font-size: 12px;
  color: var(--muted);
}
</style>
