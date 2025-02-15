import React from 'react';
import {
  Chart as C,
  ChartOptions,
  BarElement,
  BarController,
} from 'chart.js';
import ChartJS from '@/components/charts/ChartJS';
import type { ChartProps } from 'react-chartjs-2';

C.register(
  BarElement,
  BarController,
);

export const OPTIONS: ChartOptions<'bar'> = {};

export default function Bar({
  options,
  ...props
}: Omit<ChartProps<'bar'>, 'type'>): React.JSX.Element {
  return (
    <ChartJS<'bar'>
      {...props}
      type="bar"
      options={{
        ...OPTIONS,
        ...options,
      }}
    />
  );
}
