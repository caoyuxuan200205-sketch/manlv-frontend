import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, TripIcon, LearnIcon, InboxIcon, ProfileIcon } from './Icons';

const tabs = [
  { path: '/home', label: '首页', Icon: HomeIcon },
  { path: '/trip', label: '行程', Icon: TripIcon },
  { path: '/learn', label: '漫学', Icon: LearnIcon },
  { path: '/inbox', label: '通知', Icon: InboxIcon },
  { path: '/profile', label: '我的', Icon: ProfileIcon },
];

function BottomNav() {
  const location = useLocation();

  return (
    <>
      <div className="app-footer">
        <span>© 2026 大轩保研研究院 All Rights Reserved</span>
      </div>
      <div className="bottom-nav">
        {tabs.map(({ path, label, Icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`nav-item ${active ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Icon size={22} />
            </span>
            <span className="nav-label">{label}</span>
          </Link>
        );
      })}
      </div>
    </>
  );
}

export default BottomNav;
