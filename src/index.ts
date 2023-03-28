import * as cheerio from 'cheerio';

const getCellText = (element: cheerio.CheerioAPI, selector: string) => element(selector).text().trim();
const boardBaseUrl = 'https://leaderboardhq.com/';

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    const boardId = url.pathname.substring(1);
    console.log(boardId)
    if (!boardId) {
      return new Response(null, {
        status: 400,
      });
    }
    const boardUrl = new URL(boardId as string, boardBaseUrl);
    const boardFetched = await fetch(boardUrl.toString());
    const boardBody = await boardFetched.text();

    const $boardHtml = cheerio.load(boardBody);
    const data = $boardHtml('.list-group-item').map((index, $boardLitItem) => {
      const $rankListItemChildren = cheerio.load($boardLitItem.children, null, false);
      const rank = getCellText($rankListItemChildren, '.row > div:nth-child(1)');
      const name = getCellText($rankListItemChildren, '.row > div:nth-child(2)');
      const total = getCellText($rankListItemChildren, '.row > div:nth-child(3)');
      return {
        rank,
        name,
        total
      }
    }).toArray();


    return new Response(JSON.stringify({ data }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
