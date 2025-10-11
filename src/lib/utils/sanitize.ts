// 极简 HTML 清洗：
// - 移除 <script> 标签与内容
// - 移除 on* 事件属性（如 onclick）
// 注意：这不是完全的 XSS 防护，生产建议在后端使用成熟库清洗，比如 DOMPurify/OWASP 工具链。
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  // 移除 <script>...</script>
  let out = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  // 移除 on* 事件属性，如 onclick="..."
  out = out.replace(/\son[a-z]+\s*=\s*(["']).*?\1/gi, "");
  // 可按需加入更多白名单策略
  return out;
}
