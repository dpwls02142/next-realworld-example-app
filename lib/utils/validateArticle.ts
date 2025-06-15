export type ArticleFields = {
  title: string;
  summary: string;
  content: string;
};

function validateArticle(article: ArticleFields): string | null {
  const missingFields: string[] = [];

  const title = article.title.trim();
  const summary = article.summary.trim();
  const content = article.content.trim();

  if (!title) {
    missingFields.push('제목');
  }
  if (!summary) {
    missingFields.push('설명');
  }
  if (!content) {
    missingFields.push('본문');
  }
  if (missingFields.length > 0) {
    return `${missingFields.join(', ')}을(를) 입력해주세요.`;
  }

  return null;
}

export default validateArticle;
