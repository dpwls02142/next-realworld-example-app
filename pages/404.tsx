import React from 'react';
import Head from 'next/head';

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>404 - 페이지를 찾을 수 없습니다</title>
        <meta
          name="description"
          content="요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다."
        />
      </Head>

      <div className="error-page">
        <div className="error-content">
          <div className="error-emoji">🔍</div>
          <h1 className="error-title">
            <span className="error-code">404</span>
            페이지를 찾을 수 없습니다
          </h1>
          <p className="error-message">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>

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

export default Custom404;
