import React from 'react';
import type { DhemeScriptProps } from '../types';
import { getBlockingScriptPayload } from '../utils/scriptPayload';

export function DhemeScript({
  defaultMode = 'light',
  nonce,
}: DhemeScriptProps): React.ReactElement {
  const scriptContent = getBlockingScriptPayload(defaultMode);

  return React.createElement('script', {
    nonce,
    dangerouslySetInnerHTML: { __html: scriptContent },
  });
}
