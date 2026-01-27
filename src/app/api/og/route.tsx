import { ImageResponse } from 'next/og';
import { site } from '../../../config/site';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取动态参数，如果没有则使用默认值
    const title = searchParams.get('title') || site.name;
    const description = searchParams.get('description') || site.description;
    const locale = searchParams.get('locale') || 'ja';

    // 简单的字体大小自适应逻辑
    const titleFontSize = title.length > 20 ? 60 : 80;

    // 加载 Happy Monkey 字体
    // 使用 raw.githubusercontent.com 确保获取到二进制文件
    const fontData = await fetch(
      new URL('https://raw.githubusercontent.com/google/fonts/main/ofl/happymonkey/HappyMonkey-Regular.ttf', import.meta.url)
    ).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch font');
      return res.arrayBuffer();
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
            padding: '80px',
            fontFamily: '"Happy Monkey", sans-serif',
          }}
        >
          {/* 装饰背景圆 */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'rgba(4, 196, 182, 0.15)', // 使用品牌色 teal
              filter: 'blur(80px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-50px',
              left: '-50px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(3, 153, 145, 0.15)', // 使用品牌色 teal darker
              filter: 'blur(80px)',
            }}
          />

          {/* Logo 区域 - 完美复刻 CSS 样式 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            {/* 图标容器 */}
            <div
              style={{
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // 对应 .app-icon 的样式
                borderRadius: '22%', // 14px / 64px ≈ 22%
                background: 'linear-gradient(135deg, #04c4b6, #039991)', // --ai-gradient-light-start to end
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.14)',
                border: '1px solid rgba(255,255,255,0.18)',
                marginRight: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 内部光泽效果 (模拟 ::after) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.22), rgba(255,255,255,0) 50%)',
                }}
              />
              {/* 字母 A */}
              <div
                style={{
                  fontSize: 42, // 64 * 0.66
                  color: '#fff',
                  lineHeight: 1,
                  fontFamily: '"Happy Monkey"',
                  marginTop: '-4px', // 微调垂直居中
                }}
              >
                A
              </div>
            </div>

            {/* 文字 Logo */}
            <div
              style={{
                fontSize: 48,
                color: '#f8fafc',
                fontFamily: '"Happy Monkey"',
                display: 'flex',
              }}
            >
              <span style={{ background: 'linear-gradient(to right, #04c4b6, #039991)', backgroundClip: 'text', color: 'transparent' }}>AI</span>
              <span>Visa</span>
            </div>
          </div>

          {/* 标题 */}
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 400, // Happy Monkey 只有 400
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '24px',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              maxWidth: '90%',
              wordWrap: 'break-word',
            }}
          >
            {title}
          </div>

          {/* 描述 */}
          <div
            style={{
              fontSize: 36,
              color: '#94a3b8',
              lineHeight: 1.4,
              maxWidth: '85%',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </div>

          {/* 底部标签 */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                fontSize: 20,
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {locale.toUpperCase()}
            </div>
            <div style={{ fontSize: 20, color: '#64748b' }}>
              aivisa.jp
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Happy Monkey',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e: unknown) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
