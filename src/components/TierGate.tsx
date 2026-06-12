import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { TIER_RANK, type Tier } from '../types';
import { UpgradeModal } from '../screens/modals/UpgradeModal';

interface Props {
  requiredTier: Exclude<Tier, 'free'>;
  children: React.ReactNode;
}

/**
 * Gate wrapper: renders children only when the user's tier meets the
 * requirement; otherwise shows the upgrade upsell in place.
 */
export function TierGate({ requiredTier, children }: Props): React.JSX.Element {
  const tier = useAuthStore((s) => s.tier);
  const [dismissed, setDismissed] = useState(false);

  if (TIER_RANK[tier] >= TIER_RANK[requiredTier]) {
    return <>{children}</>;
  }

  return (
    <UpgradeModal
      visible={!dismissed}
      inline
      onClose={() => setDismissed(true)}
      highlightTier={requiredTier}
    />
  );
}
