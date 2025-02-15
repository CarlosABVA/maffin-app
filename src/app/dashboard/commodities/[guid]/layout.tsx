import React from 'react';

export const metadata = {
  title: 'Commodity | Maffin',
};

export default function CommodityLayout({
  children,
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <div>
      {children}
    </div>
  );
}
