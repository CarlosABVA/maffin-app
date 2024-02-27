import React from 'react';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import type { UseQueryResult } from '@tanstack/react-query';

import { AssetInfo } from '@/components/pages/account';
import { NetWorthHistogram } from '@/components/charts';
import StatisticsWidget from '@/components/StatisticsWidget';
import * as apiHook from '@/hooks/api';
import Money from '@/book/Money';
import type { Account } from '@/book/entities';
import type { AccountsTotals } from '@/types/book';

jest.mock('@/hooks/api', () => ({
  __esModule: true,
  ...jest.requireActual('@/hooks/api'),
}));

jest.mock('@/components/charts/NetWorthHistogram', () => jest.fn(
  () => <div data-testid="NetWorthHistogram" />,
));

jest.mock('@/components/StatisticsWidget', () => jest.fn(
  () => <div data-testid="StatisticsWidget" />,
));

describe('AssetInfo', () => {
  let account: Account;
  beforeEach(() => {
    jest.spyOn(apiHook, 'useAccountsTotals').mockReturnValue({ data: undefined } as UseQueryResult<AccountsTotals>);
    jest.spyOn(DateTime, 'now').mockReturnValue(DateTime.fromISO('2023-03-01') as DateTime<true>);
    account = {
      guid: 'guid',
      name: 'Assets',
      type: 'ASSET',
      commodity: {
        mnemonic: 'EUR',
      },
    } as Account;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected when no splits', () => {
    const { container } = render(
      <AssetInfo account={account} />,
    );

    expect(NetWorthHistogram).toBeCalledWith(
      {
        height: 300,
        assetsGuid: 'guid',
        assetsLabel: 'Assets',
        hideAssets: true,
        hideLiabilities: true,
        liabilitiesGuid: '',
        showLegend: false,
      },
      {},
    );
    expect(StatisticsWidget).toHaveBeenNthCalledWith(
      1,
      {
        className: 'mr-2',
        title: 'Total',
        stats: '€0.00',
        description: expect.anything(),
      },
      {},
    );
    expect(container).toMatchSnapshot();
  });

  it('renders as expected with splits', () => {
    jest.spyOn(apiHook, 'useAccountsTotals').mockReturnValue({
      data: { guid: new Money(100, 'EUR') } as AccountsTotals,
    } as UseQueryResult<AccountsTotals>);

    render(
      <AssetInfo account={account} />,
    );

    expect(StatisticsWidget).toHaveBeenNthCalledWith(
      1,
      {
        className: 'mr-2',
        title: 'Total',
        description: expect.anything(),
        stats: '€100.00',
      },
      {},
    );
  });
});