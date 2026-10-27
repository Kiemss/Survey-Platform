<template>
  <div class="app">
    <header class="topbar">
      <RouterLink to="/" class="logo">心理测评站</RouterLink>
    </header>
    <main class="main">
      <RouterView />
    </main>
    <footer class="footer">本站测评仅供自我探索参考，不构成医学诊断</footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.topbar {
  padding: 16px 24px;
  border-bottom: 1px solid var(--line);
}
.logo {
  font-weight: 700;
  font-size: 18px;
  color: var(--text);
  text-decoration: none;
}
.main {
  flex: 1;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  box-sizing: border-box;
}
.footer {
  padding: 16px;
  text-align: center;
  color: var(--muted);
  font-size: 12px;
  border-top: 1px solid var(--line);
}
</style>
