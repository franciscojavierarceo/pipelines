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
import MD2Tabs from './MD2Tabs';
import { logger } from '../lib/Utils';
import { render, screen, fireEvent } from '@testing-library/react';

describe('Input', () => {
  const buttonSelector = 'WithStyles(Button)';
  it('renders with the right styles by default', () => {
    const { container } = render(<MD2Tabs tabs={['tab1', 'tab2']} selectedTab={0} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('does not try to call the onSwitch handler if it is not defined', () => {
    render(<MD2Tabs tabs={['tab1', 'tab2']} selectedTab={0} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
  });

  it('calls the onSwitch function if an unselected button is clicked', () => {
    const switchHandler = jest.fn();
    render(
      <MD2Tabs tabs={['tab1', 'tab2']} selectedTab={0} onSwitch={switchHandler} />,
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(switchHandler).toHaveBeenCalled();
  });

  it('does not the onSwitch function if the already selected button is clicked', () => {
    const switchHandler = jest.fn();
    render(
      <MD2Tabs tabs={['tab1', 'tab2']} selectedTab={1} onSwitch={switchHandler} />,
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(switchHandler).not.toHaveBeenCalled();
  });

  it('gracefully handles an out of bound selectedTab value', () => {
    logger.error = jest.fn();
    const { container } = render(<MD2Tabs tabs={['tab1', 'tab2']} selectedTab={100} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('recalculates indicator styles when props are updated', () => {
    const spy = jest.fn();
    jest.useFakeTimers();
    jest.spyOn(MD2Tabs.prototype as any, '_updateIndicator').mockImplementationOnce(spy);
    const { rerender } = render(<MD2Tabs tabs={['tab1', 'tab2']} selectedTab={0} />);
    rerender(<MD2Tabs tabs={['tab1', 'tab2']} selectedTab={1} />);
    jest.runAllTimers();
    expect(spy).toHaveBeenCalled();
  });
});
