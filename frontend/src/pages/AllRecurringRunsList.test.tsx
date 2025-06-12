/*
 * Copyright 2021 Arrikto Inc.
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

import { render, screen, fireEvent } from '@testing-library/react';
import TestUtils from '../TestUtils';
import * as React from 'react';
import { RoutePage } from '../components/Router';
import { ButtonKeys } from '../lib/Buttons';
import { AllRecurringRunsList } from './AllRecurringRunsList';
import { PageProps } from './Page';

describe('AllRecurringRunsList', () => {
  const updateBannerSpy = jest.fn();
  let _toolbarProps: any = { actions: {}, breadcrumbs: [], pageTitle: '' };
  const updateToolbarSpy = jest.fn(toolbarProps => (_toolbarProps = toolbarProps));
  const historyPushSpy = jest.fn();

  let container: HTMLElement;

  function generateProps(): PageProps {
    const props: PageProps = {
      history: { push: historyPushSpy } as any,
      location: '' as any,
      match: '' as any,
      toolbarProps: _toolbarProps,
      updateBanner: updateBannerSpy,
      updateDialog: jest.fn(),
      updateSnackbar: jest.fn(),
      updateToolbar: updateToolbarSpy,
    };
    _toolbarProps = new AllRecurringRunsList(props).getInitialToolbarState();
    return Object.assign(props, {
      toolbarProps: _toolbarProps,
    });
  }

  function renderComponent(
    propsPatch: Partial<PageProps & { namespace?: string }> = {},
  ): void {
    const result = TestUtils.renderWithRouter(<AllRecurringRunsList {...generateProps()} {...propsPatch} />);
    container = result.container;
    updateToolbarSpy.mockClear();
  }

  beforeEach(() => {
    updateBannerSpy.mockClear();
    updateToolbarSpy.mockClear();
    historyPushSpy.mockClear();
  });

  afterEach(() => {
    if (container) {
      container.remove();
    }
  });

  it('renders all recurring runs', () => {
    renderComponent();
    expect(container).toMatchSnapshot();
  });

  it('lists all recurring runs in namespace', () => {
    renderComponent({ namespace: 'test-ns' });
    expect(container.querySelector('[data-testid="recurring-run-list"]')).toBeInTheDocument();
  });

  it('removes error banner on unmount', () => {
    renderComponent();
    container.remove();
    expect(updateBannerSpy).toHaveBeenCalledWith({});
  });

  // TODO: We want to test that clicking the refresh button in AllRecurringRunsList calls the
  //  RecurringRunList.refresh method. This is not straightforward because `render` does not
  //  render the toolbar in this case. RoutedPage is where the page level common elements are
  //  rendered in KFP UI. However, in tests, we built a util that generates similar page callbacks
  //  and passes them to the tested component without actually rendering the page common elements.
  // it('refreshes the recurring run list when refresh button is clicked', async () => {
  //   const tree = render(<AllRecurringRunsList {...generateProps()} />);
  //   await TestUtils.flushPromises()
  //   fireEvent.click(tree.getByText('Refresh'));
  // });

  it('navigates to new run page when new run is clicked', () => {
    renderComponent();

    _toolbarProps.actions[ButtonKeys.NEW_RECURRING_RUN].action();
    expect(historyPushSpy).toHaveBeenLastCalledWith(
      RoutePage.NEW_RUN + '?experimentId=&recurring=1',
    );
  });
});
