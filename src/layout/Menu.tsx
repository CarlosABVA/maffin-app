'use client';

import {
  BiBook,
  BiCode,
  BiCoin,
  BiHomeAlt,
} from 'react-icons/bi';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type ItemType = {
  url: string;
  icon: React.JSX.Element;
  label: string;
  target?: string;
  submenu?: { label: string, url: string }[],
};

type MenuItemProps = {
  item: ItemType,
  className: string,
};

const MENU_ITEMS: ItemType[] = [
  {
    label: 'Home',
    icon: <BiHomeAlt className="text-xl" />,
    url: '/dashboard/accounts',
  },
];

const BOTTOM_MENU: ItemType[] = [
  {
    label: 'Commodities',
    icon: <BiCoin className="text-xl" />,
    url: '/dashboard/commodities',
  },
  {
    label: 'SQL Editor',
    icon: <BiCode className="text-xl" />,
    url: '/dashboard/editor',
  },
  {
    label: 'Help',
    icon: <BiBook className="text-xl" />,
    url: 'http://docs.maffin.io',
    target: '_blank',
  },
];

export default function DashboardMenu(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col h-full">
      {MENU_ITEMS.map((item, idx) => (
        <MenuItem
          key={idx}
          item={item}
          className={pathname === item.url ? 'text-foreground' : ''}
        />
      ))}
      <div className="mt-auto">
        {BOTTOM_MENU.map((item, idx) => (
          <MenuItem
            key={idx}
            item={item}
            className={pathname === item.url ? 'text-foreground' : ''}
          />
        ))}
      </div>
    </ul>
  );
}

function MenuItem({ item, className }: MenuItemProps): React.JSX.Element {
  return (
    <li
      className="group h-12 text-slate-400 lg:hover:bg-cyan-700 lg:hover:text-white lg:hover:w-64 lg:hover:rounded-r-sm"
    >
      <Link
        href={item.url}
        target={item.target}
        className="flex items-center text-inherit lg:hover:text-inherit h-full px-8 py-4"
      >
        <span className={`mr-8 ${className}`}>
          {item.icon}
        </span>
        <span className="hidden lg:group-hover:inline-block ml-1">
          {item.label}
        </span>
      </Link>
      <SubMenu items={item.submenu} />
    </li>
  );
}

function SubMenu({
  items,
}: {
  items: { label: string, url: string }[] | undefined,
}): React.JSX.Element {
  if (items && items.length) {
    return (
      <ul className="hidden float-right w-44 bg-background-700 shadow-md group-hover:inline-block">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm ml-2 text-left py-2">
            <Link
              href={item.url}
              className="text-slate-400 hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return <span />;
}
