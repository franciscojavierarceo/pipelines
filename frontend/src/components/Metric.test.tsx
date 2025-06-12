/*
 * Copyright 2019 The Kubeflow Authors
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
import Metric from './Metric';
import { render, RenderResult } from '@testing-library/react';
import { RunMetricFormat } from '../apis/run';

describe('Metric', () => {
  let renderResult: RenderResult;

  const onErrorSpy = jest.fn();

  beforeEach(() => {
    onErrorSpy.mockClear();
  });

  afterEach(async () => {
    // cleanup() should be called before resetAllMocks() in case any part of the cleanup life cycle
    // depends on mocks/spies
    if (renderResult) {
      renderResult.unmount();
    }
    jest.resetAllMocks();
  });

  it('renders an empty metric when there is no metric', () => {
    renderResult = render(<Metric />);
    expect(renderResult.container).toMatchSnapshot();
  });

  it('renders an empty metric when metric has no value', () => {
    renderResult = render(<Metric metric={{}} />);
    expect(renderResult.container).toMatchSnapshot();
  });

  it('renders a metric when metric has value and percentage format', () => {
    renderResult = render(<Metric metric={{ format: RunMetricFormat.PERCENTAGE, number_value: 0.54 }} />);
    expect(renderResult.container).toMatchSnapshot();
  });

  it('renders an empty metric when metric has no metadata and unspecified format', () => {
    renderResult = render(<Metric metric={{ format: RunMetricFormat.UNSPECIFIED, number_value: 0.54 }} />);
    expect(renderResult.container).toMatchSnapshot();
  });

  it('renders an empty metric when metric has no metadata and raw format', () => {
    renderResult = render(<Metric metric={{ format: RunMetricFormat.RAW, number_value: 0.54 }} />);
    expect(renderResult.container).toMatchSnapshot();
  });

  it('renders a metric when metric has max and min value of 0', () => {
    renderResult = render(
      <Metric
        metadata={{ name: 'some metric', count: 1, maxValue: 0, minValue: 0 }}
        metric={{ format: RunMetricFormat.RAW, number_value: 0.54 }}
      />,
    );
    expect(renderResult.container).toMatchSnapshot();
  });

  it('renders a metric and does not log an error when metric is between max and min value', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    renderResult = render(
      <Metric
        metadata={{ name: 'some metric', count: 1, maxValue: 1, minValue: 0 }}
        metric={{ format: RunMetricFormat.RAW, number_value: 0.54 }}
      />,
    );
    expect(consoleSpy).toHaveBeenCalledTimes(0);
    expect(renderResult.container).toMatchSnapshot();
  });

  it('renders a metric and logs an error when metric has value less than min value', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    renderResult = render(
      <Metric
        metadata={{ name: 'some metric', count: 1, maxValue: 1, minValue: 0 }}
        metric={{ format: RunMetricFormat.RAW, number_value: -0.54 }}
      />,
    );
    expect(consoleSpy).toHaveBeenCalled();
    expect(renderResult.container).toMatchSnapshot();
  });

  it('renders a metric and logs an error when metric has value greater than max value', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    renderResult = render(
      <Metric
        metadata={{ name: 'some metric', count: 1, maxValue: 1, minValue: 0 }}
        metric={{ format: RunMetricFormat.RAW, number_value: 2 }}
      />,
    );
    expect(consoleSpy).toHaveBeenCalled();
    expect(renderResult.container).toMatchSnapshot();
  });
});
