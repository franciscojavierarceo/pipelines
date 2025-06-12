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

import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { V2beta1RunStorageState } from '../apisv2beta1/run';
import { RoutePage } from '../components/Router';
import { ButtonKeys } from '../lib/Buttons';
import { AllRunsList } from './AllRunsList';
import { PageProps } from './Page';

describe('AllRunsList', () => {
  const updateBannerSpy = jest.fn();
  let _toolbarProps: any = {};
  const updateToolbarSpy = jest.fn(toolbarProps => (_toolbarProps = toolbarProps));
  const historyPushSpy = jest.fn();
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
  let renderResult: any;
  let component: AllRunsList;

  function renderComponent(
    propsPatch: Partial<PageProps & { namespace?: string }> = {},
  ): void {
    renderResult = render(<AllRunsList {...props} {...propsPatch} />);
    // Necessary since the component calls updateToolbar with the toolbar props,
    // then expects to get them back in props
    component = renderResult.container.querySelector('[data-testid="all-runs-list"]') as any;
    if (!component) {
      const fiber = (renderResult.container as any)._reactInternalFiber || 
                   (renderResult.container as any)._reactInternalInstance;
      component = fiber?.child?.stateNode;
    }
    if (component && component.getInitialToolbarState) {
      _toolbarProps = component.getInitialToolbarState();
      renderResult.rerender(<AllRunsList {...props} {...propsPatch} toolbarProps={_toolbarProps} />);
    }
    updateToolbarSpy.mockClear();
  }

  beforeEach(() => {
    updateBannerSpy.mockClear();
    updateToolbarSpy.mockClear();
    historyPushSpy.mockClear();
  });

  afterEach(() => {
    if (renderResult) {
      renderResult.unmount();
    }
  });

  it('renders all runs', () => {
    renderComponent();
    expect(renderResult.container).toMatchSnapshot();
  });

  it('lists all runs in namespace', () => {
    renderComponent({ namespace: 'test-ns' });
    const runList = renderResult.container.querySelector('[data-testid="run-list"]');
    expect(runList).toHaveAttribute('data-namespace-mask', 'test-ns');
  });

  it('removes error banner on unmount', () => {
    renderComponent();
    renderResult.unmount();
    expect(updateBannerSpy).toHaveBeenCalledWith({});
  });

  it('only enables clone button when exactly one run is selected', () => {
    renderComponent();
    const cloneBtn = _toolbarProps.actions[ButtonKeys.CLONE_RUN];
    expect(cloneBtn.disabled).toBeTruthy();
    const runList = renderResult.container.querySelector('[data-testid="run-list"]');
    fireEvent(runList, new CustomEvent('selectionChange', { detail: ['run1'] }));
    expect(cloneBtn.disabled).toBeFalsy();
    fireEvent(runList, new CustomEvent('selectionChange', { detail: ['run1', 'run2'] }));
    expect(cloneBtn.disabled).toBeTruthy();
  });

  it('enables archive button when at least one run is selected', () => {
    renderComponent();
    const archiveBtn = _toolbarProps.actions[ButtonKeys.ARCHIVE];
    expect(archiveBtn.disabled).toBeTruthy();
    const runList = renderResult.container.querySelector('[data-testid="run-list"]');
    fireEvent(runList, new CustomEvent('selectionChange', { detail: ['run1'] }));
    expect(archiveBtn.disabled).toBeFalsy();
    fireEvent(runList, new CustomEvent('selectionChange', { detail: ['run1', 'run2'] }));
    expect(archiveBtn.disabled).toBeFalsy();
  });

  it('refreshes the run list when refresh button is clicked', () => {
    renderComponent();
    const spy = jest.fn();
    (component as any)._runlistRef = { current: { refresh: spy } };
    _toolbarProps.actions[ButtonKeys.REFRESH].action();
    expect(spy).toHaveBeenLastCalledWith();
  });

  it('navigates to new run page when clone is clicked', () => {
    renderComponent();
    const runList = renderResult.container.querySelector('[data-testid="run-list"]');
    fireEvent(runList, new CustomEvent('selectionChange', { detail: ['run1'] }));
    _toolbarProps.actions[ButtonKeys.CLONE_RUN].action();
    expect(historyPushSpy).toHaveBeenLastCalledWith(RoutePage.NEW_RUN + '?cloneFromRun=run1');
  });

  it('navigates to compare page when compare button is clicked', () => {
    renderComponent();
    const runList = renderResult.container.querySelector('[data-testid="run-list"]');
    fireEvent(runList, new CustomEvent('selectionChange', { detail: ['run1', 'run2', 'run3'] }));
    _toolbarProps.actions[ButtonKeys.COMPARE].action();
    expect(historyPushSpy).toHaveBeenLastCalledWith(RoutePage.COMPARE + '?runlist=run1,run2,run3');
  });

  it('shows thrown error in error banner', () => {
    renderComponent();
    const spy = jest.spyOn(component, 'showPageError');
    const errorMessage = 'test error message';
    const error = new Error('error object message');
    const runList = renderResult.container.querySelector('[data-testid="run-list"]');
    fireEvent(runList, new CustomEvent('error', { detail: { errorMessage, error } }));
    expect(spy).toHaveBeenLastCalledWith(errorMessage, error);
  });

  it('shows a list of available runs', () => {
    renderComponent();
    const runList = renderResult.container.querySelector('[data-testid="run-list"]');
    expect(runList).toHaveAttribute('data-storage-state', V2beta1RunStorageState.AVAILABLE.toString());
  });
});
