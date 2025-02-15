import React from 'react';

export default function Footer(): React.JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 w-full">
      <div className="w-full flex justify-end bg-background-700 text-sm px-5">
        {currentYear}
        ©
        {' '}
        maffin.io
      </div>
    </footer>
  );
}
