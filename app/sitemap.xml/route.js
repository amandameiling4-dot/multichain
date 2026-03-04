export const revalidate = 0;

export async function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>`;
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}