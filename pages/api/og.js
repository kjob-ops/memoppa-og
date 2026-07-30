import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

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
    const rawBody = searchParams.get('body') || '';
    // タイトルと本文が同じ（or 本文がタイトルで始まるだけ）なら本文は表示しない
    const body = rawBody && rawBody.trim() !== title.trim() ? rawBody : '';
    const charCount = searchParams.get('len') || (rawBody ? String(rawBody.length) : '');

    const fontData = await loadJapaneseFont(title + body + '約文字0123456789');

    const titleSize = title.length > 24 ? 38 : title.length > 14 ? 46 : 54;

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              width: '1000px',
              height: '460px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: '#0F6E56',
              borderRadius: '24px',
              padding: '48px 56px',
            }}
          >
            {/* タイトル＋本文 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: titleSize,
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.35,
                  fontFamily: 'Noto Sans JP',
                  maxWidth: '890px',
                }}
              >
                {title}
              </div>
              {body && (
                <div
                  style={{
                    display: 'flex',
                    marginTop: 18,
                    fontSize: 24,
                    color: '#eaffee',
                    fontFamily: 'Noto Sans JP',
                    maxWidth: '860px',
                  }}
                >
                  {body}
                </div>
              )}
            </div>

            {/* フッター：文字数のみ */}
            {charCount && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 20,
                  color: '#eaffee',
                  fontFamily: 'Noto Sans JP',
                }}
              >
                約{charCount}文字
              </div>
            )}
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
