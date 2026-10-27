<script setup lang="ts">
const lastUpdated = '2026-10'
</script>

<template>
  <div class="legal">
    <h1>隐私政策</h1>

    <section>
      <h2>一句话版本</h2>
      <p>
        <strong>本站不收集你的任何数据。</strong>
        你的作答、结果与设置全部保存在你自己浏览器的 localStorage 中，不会发送到任何服务器。
      </p>
    </section>

    <section>
      <h2>具体说明</h2>
      <h3>我们收集什么</h3>
      <p>什么都不收集。本站没有账号系统、没有统计埋点、没有广告追踪、没有 Cookie。</p>

      <h3>数据存在哪里</h3>
      <ul>
        <li><strong>作答与结果</strong>：仅存于你设备浏览器的 localStorage（用于草稿恢复与「我的历史」功能）</li>
        <li><strong>偏好设置</strong>（深色模式、自动翻题等）：同样仅存于本机 localStorage</li>
        <li>清除浏览器数据（或使用「历史」页的删除/清空功能）即彻底删除，无法恢复</li>
      </ul>

      <h3>服务器看到什么</h3>
      <p>
        本站静态文件由 Cloudflare CDN 分发。与访问任何网站一样，Cloudflare 会记录匿名的请求日志
        （如 IP、访问时间、页面地址），用于安全防护与流量管理，此为 CDN 服务商的标准行为，
        本站无法也无需利用这些日志识别你的身份或关联你的作答。
      </p>

      <h3>第三方服务</h3>
      <p>
        本站仅使用两个外部资源：Cloudflare（托管与 CDN）和 jsDelivr CDN（加载开源字体霞鹜文楷）。
        不使用任何第三方统计、广告或追踪脚本。
      </p>
    </section>

    <section>
      <h2>政策变更</h2>
      <p>若未来引入需要收集数据的功能（如云端同步），将在本页明确更新并提前告知。</p>
    </section>

    <p class="updated">最近更新：{{ lastUpdated }}</p>
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
h3 {
  font-size: 14px;
  margin: 12px 0 4px;
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
.updated {
  font-size: 12px;
  color: var(--muted);
}
</style>
