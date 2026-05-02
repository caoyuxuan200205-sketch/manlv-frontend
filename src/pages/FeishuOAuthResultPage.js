import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckIcon, WarningIcon } from '../components/Icons';
import { fetchFeishuStatus } from '../services/feishuAuth';

function FeishuOAuthResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [detail, setDetail] = useState('正在确认飞书授权结果...');
  const [displayStatus, setDisplayStatus] = useState('pending');

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const nextPath = params.get('next') || (params.get('scene') === 'profile' ? '/profile' : '/chat');
  const rawStatus = params.get('status') || 'error';
  const rawMessage = params.get('message') || '';

  useEffect(() => {
    setDisplayStatus(rawStatus === 'success' ? 'pending' : 'error');
    setDetail('正在确认飞书授权结果...');
  }, [rawStatus]);

  useEffect(() => {
    let cancelled = false;

    const settleResult = async () => {
      let status = rawStatus;
      let message = rawMessage || (status === 'success' ? '飞书授权成功' : '飞书授权未完成');

      if (status === 'success') {
        try {
          const latestStatus = await fetchFeishuStatus();
          if (!latestStatus?.connected) {
            status = 'error';
            message = '授权已返回，但当前账号尚未完成飞书绑定，请稍后重试。';
          } else {
            message = latestStatus?.profile?.name
              ? `已连接飞书账号：${latestStatus.profile.name}`
              : '飞书授权成功，正在返回漫旅';
          }
        } catch (error) {
          status = 'error';
          message = error.message || '飞书授权结果确认失败';
        }
      }

      if (cancelled) return;
      setDisplayStatus(status === 'success' ? 'success' : 'error');
      setDetail(message);

      window.setTimeout(() => {
        if (cancelled) return;
        navigate(nextPath, {
          replace: true,
          state: {
            feishuAuthResult: {
              provider: 'feishu',
              status,
              message
            }
          }
        });
      }, 1200);
    };

    settleResult();

    return () => {
      cancelled = true;
    };
  }, [navigate, nextPath, rawMessage, rawStatus]);

  const isPending = displayStatus === 'pending';
  const isSuccess = displayStatus === 'success';

  return (
    <div className="page oauth-result-page">
      <div className="oauth-result-card">
        <div className={`oauth-result-icon ${isSuccess || isPending ? 'success' : 'error'}`}>
          {isSuccess ? <CheckIcon size={26} /> : <WarningIcon size={26} />}
        </div>
        <div className="oauth-result-title">
          {isPending ? '飞书授权处理中' : isSuccess ? '飞书授权成功' : '飞书授权未完成'}
        </div>
        <div className="oauth-result-text">{detail}</div>
        <div className="oauth-result-hint">正在返回漫旅，请稍候...</div>
      </div>
    </div>
  );
}

export default FeishuOAuthResultPage;
