import React, { useInsertionEffect } from 'react';

const KEYFRAMES = '@keyframes dheme-spin{to{transform:rotate(360deg)}}';

function injectSpinnerStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('dheme-spin')) return;
  const style = document.createElement('style');
  style.id = 'dheme-spin';
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

function DefaultSpinner() {
  useInsertionEffect(injectSpinnerStyle, []);
  return React.createElement('span', {
    'aria-hidden': true,
    style: {
      display: 'block',
      width: 24,
      height: 24,
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'dheme-spin 0.7s linear infinite',
      opacity: 0.35,
    },
  });
}

export function DhemeLoadingOverlay({ children }: { children?: React.ReactNode }) {
  return React.createElement(
    'div',
    {
      'aria-busy': true,
      'aria-live': 'polite',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
      },
    },
    children ?? React.createElement(DefaultSpinner, null)
  );
}
