import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Noto Sans JP (Google Fonts) を実行時に取得してフォント埋め込み
async function loadJapaneseFont(text) {
  const fontUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(
    text
  )}`;
  const cssRes = await fetch(fontUrl);
  const css = await cssRes.text();
  const fontFileUrl = css.match(/src: url\(([^)]+)\)/)?.[1];
  if (!fontFileUrl) throw new Error('font url not found');
  const fontRes = await fetch(fontFileUrl);
  return await fontRes.arrayBuffer();
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'ちょっといいプロンプト、とっておこう。';
    const body = searchParams.get('body') || '';

    const fontData = await loadJapaneseFont(title + body + 'memoppa');

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            backgroundColor: '#1DB954',
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.4,
              fontFamily: 'Noto Sans JP',
            }}
          >
            {title}
          </div>
          {body && (
            <div
              style={{
                marginTop: 30,
                fontSize: 32,
                color: '#eaffee',
                fontFamily: 'Noto Sans JP',
              }}
            >
              {body}
            </div>
          )}
          <div
            style={{
              marginTop: 60,
              fontSize: 28,
              color: '#ffffff',
              fontFamily: 'Noto Sans JP',
            }}
          >
            memoppa
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Noto Sans JP',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
      }
    );
  } catch (e) {
    return new Response(`OG image error: ${e.message}`, { status: 500 });
  }
}
