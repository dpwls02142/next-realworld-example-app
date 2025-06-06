export interface ArticleFields {
  title: string;
  description: string;
  body: string;
}

function validateArticle(article: ArticleFields): string | null {
  const missingFields: string[] = [];

  const title = article.title.trim();
  const description = article.description.trim();
  const body = article.body.trim();

  if (!title) {
    missingFields.push('제목');
  }
  if (!description) {
    missingFields.push('설명');
  }
  if (!body) {
    missingFields.push('본문');
  }
  if (missingFields.length > 0) {
    return `${missingFields.join(', ')}을(를) 입력해주세요.`;
  }

  return null;
}

export default validateArticle;
