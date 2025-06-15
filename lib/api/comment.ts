import { supabase, getCurrentUser } from '../utils/supabase/client';

const CommentAPI = {
  create: async (slug: string, commentBody: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('인증되지 않은 사용자입니다.');

      const articleId = parseInt(slug);

      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          content: commentBody,
          article_id: articleId,
          author_id: user.id,
        })
        .select(
          `
          *,
          user_profiles!comments_author_id_fkey (
            username,
            bio,
            image
          )
        `,
        )
        .single();

      if (error) throw error;

      return {
        data: {
          comment: comment,
        },
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          errors: [error.message || '댓글 작성에 실패했습니다.'],
        },
        status: error.status || 500,
      };
    }
  },

  delete: async (slug: string, commentId: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('인증되지 않은 사용자입니다.');

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', parseInt(commentId))
        .eq('author_id', user.id);

      if (error) throw error;

      return {
        data: {},
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          errors: [error.message || '댓글 삭제에 실패했습니다.'],
        },
        status: error.status || 500,
      };
    }
  },

  forArticle: async (slug: string) => {
    try {
      const currentUser = await getCurrentUser();
      const articleId = parseInt(slug);

      const { data: comments, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          user_profiles!comments_author_id_fkey (
            username,
            bio,
            image
          )
        `,
        )
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithFollowing = await Promise.all(
        (comments || []).map(async (comment) => {
          let following = false;

          if (currentUser && comment.author_id !== currentUser.id) {
            const { data: followData } = await supabase
              .from('user_followers')
              .select('id')
              .eq('from_user_id', currentUser.id)
              .eq('to_user_id', comment.author_id)
              .single();

            following = !!followData;
          }

          return {
            ...comment,
            user_profiles: {
              ...comment.user_profiles,
              following,
            },
          };
        }),
      );

      return {
        data: {
          comments: commentsWithFollowing,
        },
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          errors: [error.message || '댓글을 불러오는데 실패했습니다.'],
        },
        status: error.status || 500,
      };
    }
  },

  update: async (slug: string, commentId: string, commentBody: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('인증되지 않은 사용자입니다.');

      const { data: comment, error } = await supabase
        .from('comments')
        .update({
          content: commentBody,
        })
        .eq('id', parseInt(commentId))
        .eq('author_id', user.id)
        .select(
          `
          *,
          user_profiles!comments_author_id_fkey (
            username,
            bio,
            image
          )
        `,
        )
        .single();

      if (error) throw error;

      return {
        data: {
          comment: comment,
        },
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          errors: [error.message || '댓글 수정에 실패했습니다.'],
        },
        status: error.status || 500,
      };
    }
  },
};

export default CommentAPI;
