import React from 'react';
import { NextPageContext } from 'next';
import Head from 'next/head';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

const ErrorPage = ({ statusCode }: ErrorProps) => {
  const getErrorMessage = () => {
    if (statusCode === 404) {
      return {
        title: '페이지를 찾을 수 없습니다',
        message: '요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.',
        emoji: '🔍',
      };
    }

    if (statusCode === 500) {
      return {
        title: '서버 오류가 발생했습니다',
        message:
          '일시적인 서버 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        emoji: '🔧',
      };
    }

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return {
        title: '요청 오류',
        message: '잘못된 요청입니다. 다시 확인해주세요.',
        emoji: '⚠️',
      };
    }

    return {
      title: '오류가 발생했습니다',
      message: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      emoji: '😵',
    };
  };

  const { title, message, emoji } = getErrorMessage();

  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} - ${title}` : title}</title>
        <meta name="description" content={message} />
      </Head>

      <div className="error-page">
        <div className="error-content">
          <div className="error-emoji">{emoji}</div>
          <h1 className="error-title">
            {statusCode && <span className="error-code">{statusCode}</span>}
            {title}
          </h1>
          <p className="error-message">{message}</p>

          <div className="error-actions">
            <a href="/">홈으로 돌아가기</a>
          </div>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .error-content {
            text-align: center;
          }

          .error-emoji {
            font-size: 64px;
            margin-bottom: 24px;
            animation: bounce 2s infinite;
          }

          @keyframes bounce {
            0%,
            20%,
            50%,
            80%,
            100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }

          .error-title {
            font-size: 28px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .error-code {
            background: #fed7d7;
            color: #c53030;
            padding: 4px 12px;
            border-radius: 8px;
            font-size: 20px;
            font-weight: 600;
          }

          .error-message {
            font-size: 16px;
            color: #718096;
            line-height: 1.6;
            margin-bottom: 32px;
          }

          .error-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .error-details {
            margin-top: 32px;
            text-align: left;
            background: #f7fafc;
            border-radius: 8px;
            padding: 16px;
          }

          .error-details summary {
            cursor: pointer;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 12px;
          }

          @media (max-width: 640px) {
            .error-content {
              padding: 32px 24px;
            }

            .error-title {
              font-size: 24px;
            }

            .error-emoji {
              font-size: 48px;
            }

            .error-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </>
  );
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
