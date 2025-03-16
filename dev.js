const { spawn } = require('child_process');
const { createServer } = require('vite');

async function startDevServers() {
  console.log('🚀 启动开发服务器...');

  // 启动 Vite 开发服务器
  const vite = await createServer({
    configFile: './vite.config.ts',
    server: {
      port: 3000,
    },
  });

  await vite.listen();
  console.log('✅ Vite 开发服务器已启动，地址: http://localhost:3000');

  // 启动 Wrangler 开发服务器，并设置环境变量
  const wrangler = spawn('npx', ['wrangler', 'dev', '--port', '8787', '--env', 'development'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('🛑 正在关闭开发服务器...');
    vite.close();
    wrangler.kill();
    process.exit();
  });
}

startDevServers().catch((err) => {
  console.error('❌ 启动开发服务器时出错:', err);
  process.exit(1);
});
