import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 强制滚动窗口到顶部
    window.scrollTo(0, 0);
    
    // 同时也尝试重置所有 .scroll-area 容器（以防万一）
    const scrollAreas = document.querySelectorAll('.scroll-area');
    scrollAreas.forEach(area => {
      area.scrollTop = 0;
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
