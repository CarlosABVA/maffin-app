import React from 'react';

export const metadata = {
  title: 'SQL Editor',
};

export default function EditorLayout({
  children,
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <div>
      {children}
    </div>
  );
}
