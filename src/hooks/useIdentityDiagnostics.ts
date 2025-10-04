import { useEffect, useState } from 'react';
import { getIdentityDiagnostics, subscribeIdentityDiagnostics } from '@/lib/auth';

export function useIdentityDiagnostics() {
  const [diagnostics, setDiagnostics] = useState(getIdentityDiagnostics());

  useEffect(() => {
    return subscribeIdentityDiagnostics(setDiagnostics);
  }, []);

  return diagnostics;
}
