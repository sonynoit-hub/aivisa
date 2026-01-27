const fs = require('fs');
const path = require('path');

// 根目录下的 messages 路径
const MESSAGES_DIR = path.resolve(__dirname, '../../src/i18n/messages');
const SRC_LANG = 'ja';
const SUBDIR = 'visa-pages';

// 只重置这些目标语言目录（根据你的实际语言目录名调整）
const ALLOW_LANGS = ['en', 'zh', 'ko', 'vi'];

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const sp = path.join(src, name);
    const dp = path.join(dst, name);
    const st = fs.statSync(sp);
    if (st.isDirectory()) copyDir(sp, dp);
    else if (st.isFile() && sp.endsWith('.json')) {
      const buf = fs.readFileSync(sp);
      fs.writeFileSync(dp, buf);
    }
  }
}

(function main() {
  const srcDir = path.join(MESSAGES_DIR, SRC_LANG, SUBDIR);
  if (!fs.existsSync(srcDir)) {
    console.error('未找到源目录: ' + srcDir);
    process.exit(1);
  }

  // 仅选择白名单内的语言目录
  const langs = fs.readdirSync(MESSAGES_DIR).filter((d) => {
    const p = path.join(MESSAGES_DIR, d);
    return (
      d !== SRC_LANG &&
      fs.statSync(p).isDirectory() &&
      (ALLOW_LANGS.length === 0 || ALLOW_LANGS.includes(d))
    );
  });

  if (langs.length === 0) {
    console.warn('未匹配到需要重置的语言目录。请检查 ALLOW_LANGS 设置或目录结构。');
    return;
  }

  console.log(`将把 ${path.relative(MESSAGES_DIR, path.join(SRC_LANG, SUBDIR))} 同步到: ${langs.join(', ')}`);
  for (const lang of langs) {
    const dstDir = path.join(MESSAGES_DIR, lang, SUBDIR);
    rmrf(dstDir);               // 仅清空该语言的 visa-pages
    copyDir(srcDir, dstDir);    // 复制 ja/visa-pages 全部 JSON
    console.log('✓ 重置完成:', path.relative(MESSAGES_DIR, dstDir));
  }
  console.log('完成。');
})();
