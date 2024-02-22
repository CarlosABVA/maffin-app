import React from 'react';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import type { UseQueryResult } from '@tanstack/react-query';

import Money from '@/book/Money';
import Bar from '@/components/charts/Bar';
import IncomeExpenseHistogram from '@/components/pages/accounts/IncomeExpenseHistogram';
import * as apiHook from '@/hooks/api';
import type { Commodity } from '@/book/entities';
import type { AccountsTotals } from '@/types/book';

jest.mock('@/components/charts/Bar', () => jest.fn(
  () => <div data-testid="Bar" />,
));

jest.mock('@/hooks/api', () => ({
  __esModule: true,
  ...jest.requireActual('@/hooks/api'),
}));

describe('IncomeExpenseHistogram', () => {
  beforeEach(() => {
    jest.spyOn(apiHook, 'useAccountsMonthlyTotal').mockReturnValue({ data: undefined } as UseQueryResult<AccountsTotals[]>);
    jest.spyOn(apiHook, 'useMainCurrency').mockReturnValue({ data: { mnemonic: 'EUR' } } as UseQueryResult<Commodity>);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('renders with no data', () => {
    render(
      <IncomeExpenseHistogram />,
    );

    expect(Bar).toBeCalledWith(
      {
        height: '400',
        data: {
          datasets: [
            {
              backgroundColor: '#22C55E',
              data: [],
              label: 'Income',
            },
            {
              backgroundColor: '#EF4444',
              data: [],
              label: 'Expenses',
            },
            {
              backgroundColor: '#06B6D4',
              data: [],
              label: 'Savings',
              datalabels: {
                anchor: 'end',
                display: true,
                formatter: expect.any(Function),
                align: 'end',
                backgroundColor: '#06B6D4FF',
                borderRadius: 5,
                color: '#FFF',
              },
            },
          ],
          labels: [
            DateTime.now().minus({ month: 6 }),
            expect.any(DateTime),
            expect.any(DateTime),
            expect.any(DateTime),
            expect.any(DateTime),
            // When it's the 1st of the month, we only show 6 labels instead
            DateTime.fromISO('2022-12-01'),
          ],
        },
        options: {
          layout: {
            padding: {
              right: 15,
            },
          },
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
          },
          plugins: {
            title: {
              align: 'start',
              display: true,
              text: 'Monthly Savings',
              font: {
                size: 18,
              },
              padding: {
                bottom: 30,
                top: 0,
              },
            },
            legend: {
              onClick: expect.any(Function),
              labels: {
                boxHeight: 8,
                boxWidth: 8,
                pointStyle: 'circle',
                usePointStyle: true,
              },
              position: 'bottom',
            },
            tooltip: {
              backgroundColor: '#323b44',
              callbacks: {
                label: expect.any(Function),
                labelColor: expect.any(Function),
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                align: 'center',
              },
              time: {
                displayFormats: {
                  month: 'MMM-yy',
                },
                tooltipFormat: 'MMMM yyyy',
                unit: 'month',
              },
              type: 'time',
            },
            y: {
              grace: 1,
              border: {
                display: false,
              },
              position: 'left',
              ticks: {
                callback: expect.any(Function),
                maxTicksLimit: 10,
              },
            },
          },
        },
      },
      {},
    );
  });

  it('generates datasets as expected', () => {
    jest.spyOn(apiHook, 'useAccountsMonthlyTotal').mockReturnValue(
      {
        data: [
          {
            type_income: new Money(0, 'EUR'),
            type_expense: new Money(0, 'EUR'),
          } as AccountsTotals,
          {
            type_income: new Money(0, 'EUR'),
            type_expense: new Money(0, 'EUR'),
          } as AccountsTotals,
          {
            type_income: new Money(0, 'EUR'),
            type_expense: new Money(0, 'EUR'),
          } as AccountsTotals,
          {
            type_income: new Money(0, 'EUR'),
            type_expense: new Money(0, 'EUR'),
          } as AccountsTotals,
          {
            type_income: new Money(0, 'EUR'),
            type_expense: new Money(0, 'EUR'),
          } as AccountsTotals,
          {
            type_income: new Money(600, 'EUR'),
            type_expense: new Money(400, 'EUR'),
          } as AccountsTotals,
          {
            type_income: new Money(400, 'EUR'),
            type_expense: new Money(500, 'EUR'),
          } as AccountsTotals,
        ],
      } as UseQueryResult<AccountsTotals[]>,
    );

    render(
      <IncomeExpenseHistogram
        selectedDate={DateTime.fromISO('2022-12-30')}
      />,
    );

    expect(Bar).toBeCalledWith(
      expect.objectContaining({
        data: {
          datasets: [
            expect.objectContaining({
              data: [0, 0, 0, 0, 0, 600, 400],
              label: 'Income',
            }),
            expect.objectContaining({
              data: [0, 0, 0, 0, 0, -400, -500],
              label: 'Expenses',
            }),
            expect.objectContaining({
              data: [0, 0, 0, 0, 0, 200, -100],
              label: 'Savings',
            }),
          ],
          labels: [
            DateTime.fromISO('2022-06-01'),
            expect.any(DateTime),
            expect.any(DateTime),
            expect.any(DateTime),
            expect.any(DateTime),
            expect.any(DateTime),
            // Note this is not filtering data but just a label to display
            // in the X axes
            DateTime.fromISO('2022-12-01'),
          ],
        },
      }),
      {},
    );
  });
});
