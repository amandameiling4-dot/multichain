import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;
const stroke = { stroke: "currentColor", fill: "none", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const DashboardIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><rect x="4" y="4" width="7" height="7" rx="2" {...stroke}/><rect x="13" y="4" width="7" height="5" rx="2" {...stroke}/><rect x="13" y="11" width="7" height="9" rx="2" {...stroke}/><rect x="4" y="13" width="7" height="7" rx="2" {...stroke}/></svg>
);
export const TradeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M6 16V8m6 8V6m6 12v-5" {...stroke}/><path d="M6 10.5 8.5 8 11 10.5 13.5 8 16 10.5" {...stroke}/></svg>
);
export const FuturesIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M12 3v6l-3 4h6l-3 8" {...stroke}/></svg>
);
export const ArbitrageIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M7 7h10l-3-3m3 13H7l3 3" {...stroke}/><path d="M7 11h10" {...stroke}/></svg>
);
export const DemoIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M8 6.5 17 12l-9 5.5V6.5Z" {...stroke}/></svg>
);
export const P2PIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><circle cx="7" cy="7" r="2.5" {...stroke}/><circle cx="17" cy="17" r="2.5" {...stroke}/><path d="M9 9l6 6M9 15l6-6" {...stroke}/></svg>
);
export const BorrowIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><rect x="5" y="5" width="14" height="14" rx="2" {...stroke}/><path d="M8 9h5m-5 4h8M12 9v-2" {...stroke}/></svg>
);
export const WalletIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><rect x="4" y="6" width="16" height="12" rx="2" {...stroke}/><path d="M16 12h2.5m-4.5-4v-1.5" {...stroke}/></svg>
);
export const WithdrawIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M12 5v10m0 0-3-3m3 3 3-3" {...stroke}/><rect x="4" y="15" width="16" height="4" rx="1.5" {...stroke}/></svg>
);
export const HistoryIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M5 12a7 7 0 1 1 2 5.1" {...stroke}/><path d="M5 12h3m4-4v4l2.5 1.5" {...stroke}/></svg>
);
export const KYCIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><rect x="5" y="5" width="14" height="14" rx="2" {...stroke}/><circle cx="12" cy="11" r="2" {...stroke}/><path d="M8.5 17c1-1.2 2.3-1.8 3.5-1.8s2.5.6 3.5 1.8" {...stroke}/></svg>
);
export const NewsIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><rect x="5" y="5" width="14" height="14" rx="2" {...stroke}/><path d="M8 9h8M8 13h5M8 17h6" {...stroke}/></svg>
);
export const BellIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M6 10a6 6 0 0 1 12 0c0 3 1 4.5 1 4.5H5S6 13 6 10Z" {...stroke}/><path d="M10 18a2 2 0 0 0 4 0" {...stroke}/></svg>
);
export const SettingsIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="2.3" {...stroke}/><path d="M4 12h2m12 0h2M7.2 7.2l1.4 1.4m6.8 6.8 1.4 1.4M7.2 16.8l1.4-1.4m6.8-6.8 1.4-1.4" {...stroke}/></svg>
);
export const SupportIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M7 12a5 5 0 0 1 10 0v5H7v-5Z" {...stroke}/><path d="M7 12H5v3h2m10-3h2v3h-2" {...stroke}/><path d="M10 18.5a2 2 0 0 0 4 0" {...stroke}/></svg>
);
export const AdminIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M12 4 6 7v5c0 4 2.8 6.5 6 8 3.2-1.5 6-4 6-8V7l-6-3Z" {...stroke}/><path d="M10.5 12.5 12 14l3-3" {...stroke}/></svg>
);
export const PromoTradeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><path d="M5 15 10 9l3 3 4-5" {...stroke}/><path d="M4 18h16" {...stroke}/></svg>
);
export const PromoAiIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><rect x="6" y="6" width="12" height="12" rx="3" {...stroke}/><path d="M9 9h6m-6 3h6m-6 3h3.5" {...stroke}/></svg>
);
export const PromoStakeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="6.5" {...stroke}/><path d="M12 7v5l3 2" {...stroke}/></svg>
);