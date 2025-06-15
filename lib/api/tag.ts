import { supabase } from '../utils/supabase/client';

export type ApiError = {
  message: string;
  code: string;
  status?: number;
};

const handleApiError = (error: any): never => {
  const apiError: ApiError = {
    message: error.message || '알 수 없는 오류가 발생했습니다.',
    code: error.code || 'UNKNOWN_ERROR',
    status: error.status || 500,
  };
  throw apiError;
};

const TagAPI = {
  getAll: async () => {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('name')
        .order('name');

      if (error) throw error;

      const tagNames = (tags || []).map((tag) => tag.name);

      return {
        data: {
          tags: tagNames,
        },
        status: 200,
      };
    } catch (error) {
      handleApiError(error);
    }
  },

  getPopular: async (limit: number = 10) => {
    try {
      const { data: popularTags, error } = await supabase
        .from('tags')
        .select(
          `
          name,
          article_tags (
            article_id
          )
        `,
        )
        .order('name');

      if (error) throw error;

      const tagsWithCount = (popularTags || []).map((tag) => ({
        name: tag.name,
        count: tag.article_tags?.length || 0,
      }));

      const sortedTags = tagsWithCount
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map((tag) => tag.name);

      return {
        data: {
          tags: sortedTags,
        },
        status: 200,
      };
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (tagName: string) => {
    try {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');

      const { data: tag, error } = await supabase
        .from('tags')
        .insert({
          name: tagName,
          slug: slug,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          const { data: existingTag } = await supabase
            .from('tags')
            .select('*')
            .eq('name', tagName)
            .single();

          return {
            data: {
              tag: existingTag,
            },
            status: 200,
          };
        }
        throw error;
      }

      return {
        data: {
          tag: tag,
        },
        status: 201,
      };
    } catch (error) {
      handleApiError(error);
    }
  },

  search: async (query: string, limit: number = 10) => {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('name')
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(limit);

      if (error) throw error;

      const tagNames = (tags || []).map((tag) => tag.name);

      return {
        data: {
          tags: tagNames,
        },
        status: 200,
      };
    } catch (error) {
      handleApiError(error);
    }
  },

  getByArticleCount: async (minCount: number = 1) => {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select(
          `
          name,
          article_tags (
            article_id
          )
        `,
        )
        .order('name');

      if (error) throw error;

      const filteredTags = (tags || [])
        .filter((tag) => (tag.article_tags?.length || 0) >= minCount)
        .map((tag) => tag.name);

      return {
        data: {
          tags: filteredTags,
        },
        status: 200,
      };
    } catch (error) {
      handleApiError(error);
    }
  },
};

export default TagAPI;
