import React, { useInsertionEffect } from 'react';

const RAINBOW_CSS =
  '@keyframes dheme-rainbow-gradient{0%{background-position:0% 50%}100%{background-position:100% 50%}}' +
  '.dheme-rainbow-text{background:linear-gradient(90deg,#d7427a,#ff795c,#fcb863,#6ac48a,#5879e4,#4e4098,#904cc3,#d7427a,#ff795c,#fcb863,#6ac48a,#5879e4,#4e4098,#904cc3,#d7427a,#ff795c,#fcb863,#6ac48a,#5879e4,#4e4098,#904cc3,#d7427a,#ff795c,#fcb863,#6ac48a);background-size:1000% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:dheme-rainbow-gradient 10s infinite linear}';

function injectRainbowStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('dheme-rainbow')) return;
  const style = document.createElement('style');
  style.id = 'dheme-rainbow';
  style.textContent = RAINBOW_CSS;
  document.head.appendChild(style);
}

function DefaultDhemeBranding() {
  useInsertionEffect(injectRainbowStyle, []);
  return React.createElement(
    'h2',
    {
      style: {
        fontSize: '1.25rem',
        fontWeight: 600,
        fontFamily: 'inherit',
        margin: 0,
      },
    },
    React.createElement('span', {
      className: 'dheme-rainbow-text',
      style: { filter: 'grayscale(10%)' },
      children: 'dheme',
    })
  );
}

export function DhemeLoadingOverlay({
  children,
  background,
}: {
  children?: React.ReactNode;
  background?: string | null;
}) {
  return React.createElement(
    'div',
    {
      'aria-busy': true,
      'aria-live': 'polite',
      style: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: background ?? undefined,
      },
    },
    children ?? React.createElement(DefaultDhemeBranding, null)
  );
}
