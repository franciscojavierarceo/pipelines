/*
 * Copyright 2018 The Kubeflow Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { PlotType } from './Viewer';
import ROCCurve from './ROCCurve';

describe('ROCCurve', () => {
  it('does not break on no config', () => {
    const { container } = render(<ROCCurve configs={[]} />);
    expect(container).toMatchSnapshot();
  });

  it('does not break on empty data', () => {
    const { container } = render(<ROCCurve configs={[{ data: [], type: PlotType.ROC }]} />);
    expect(container).toMatchSnapshot();
  });

  const data = [
    { x: 0, y: 0, label: '1' },
    { x: 0.2, y: 0.3, label: '2' },
    { x: 0.5, y: 0.7, label: '3' },
    { x: 0.9, y: 0.9, label: '4' },
    { x: 1, y: 1, label: '5' },
  ];

  it('renders a simple ROC curve given one config', () => {
    const { container } = render(<ROCCurve configs={[{ data, type: PlotType.ROC }]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders a reference base line series', () => {
    const { container } = render(<ROCCurve configs={[{ data, type: PlotType.ROC }]} />);
    expect(container.querySelectorAll('[class*="rv-xy-plot__series"]').length).toBe(2);
  });

  it('renders an ROC curve using three configs', () => {
    const config = { data, type: PlotType.ROC };
    const { container } = render(<ROCCurve configs={[config, config, config]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders three lines with three different colors', () => {
    const config = { data, type: PlotType.ROC };
    const { container } = render(<ROCCurve configs={[config, config, config]} />);
    expect(container.querySelectorAll('[class*="rv-xy-plot__series"]').length).toBe(4); // +1 for baseline
    const lineElements = container.querySelectorAll('[class*="rv-xy-plot__series"] path');
    expect(lineElements.length).toBeGreaterThanOrEqual(3);
  });

  it('does not render a legend when there is only one config', () => {
    const config = { data, type: PlotType.ROC };
    const { container } = render(<ROCCurve configs={[config]} />);
    expect(container.querySelectorAll('[class*="DiscreteColorLegendItem"]').length).toBe(0);
  });

  it('renders a legend when there is more than one series', () => {
    const config = { data, type: PlotType.ROC };
    render(<ROCCurve configs={[config, config, config]} />);
    expect(screen.getByText('Series #1')).toBeInTheDocument();
    expect(screen.getByText('Series #2')).toBeInTheDocument();
    expect(screen.getByText('Series #3')).toBeInTheDocument();
  });

  it('returns friendly display name', () => {
    expect(ROCCurve.prototype.getDisplayName()).toBe('ROC Curve');
  });

  it('is aggregatable', () => {
    expect(ROCCurve.prototype.isAggregatable()).toBeTruthy();
  });

  it('Force legend display even with one config', async () => {
    const config = { data, type: PlotType.ROC };
    render(<ROCCurve configs={[config]} forceLegend />);

    screen.getByText('Series #1');
  });
});
