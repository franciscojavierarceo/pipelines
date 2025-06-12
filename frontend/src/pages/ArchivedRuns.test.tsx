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
import { ArchivedRuns } from './ArchivedRuns';
import TestUtils from '../TestUtils';
import { PageProps } from './Page';
import { V2beta1RunStorageState } from '../apisv2beta1/run';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonKeys } from '../lib/Buttons';
import { Apis } from '../lib/Apis';

describe('ArchivedRuns', () => {
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const deleteRunSpy = jest.spyOn(Apis.runServiceApi, 'deleteRun');
  const updateDialogSpy = jest.fn();
  const updateSnackbarSpy = jest.fn();
  let renderResult: any;

  function generateProps(): PageProps {
    return TestUtils.generatePageProps(
      ArchivedRuns,
      {} as any,
      {} as any,
      historyPushSpy,
      updateBannerSpy,
      updateDialogSpy,
      updateToolbarSpy,
      updateSnackbarSpy,
    );
  }

  beforeEach(() => {
    updateBannerSpy.mockClear();
    updateToolbarSpy.mockClear();
    historyPushSpy.mockClear();
    deleteRunSpy.mockClear();
    updateDialogSpy.mockClear();
    updateSnackbarSpy.mockClear();
  });

  afterEach(() => {
    if (renderResult && renderResult.unmount) {
      renderResult.unmount();
    }
  });

  it('renders archived runs', () => {
    renderResult = render(<ArchivedRuns {...generateProps()} />);
    expect(renderResult.container).toMatchSnapshot();
  });

  it('lists archived runs in namespace', () => {
    renderResult = render(<ArchivedRuns {...generateProps()} namespace='test-ns' />);
    const runList = renderResult.container.querySelector('[data-testid="run-list"]') || renderResult.container.querySelector('div');
    expect(runList).toBeInTheDocument();
  });

  it('removes error banner on unmount', () => {
    renderResult = render(<ArchivedRuns {...generateProps()} />);
    renderResult.unmount();
    expect(updateBannerSpy).toHaveBeenCalledWith({});
  });

  it('enables restore and delete button when at least one run is selected', () => {
    renderResult = render(<ArchivedRuns {...generateProps()} />);
    TestUtils.flushPromises();
    expect(TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.RESTORE).disabled).toBeTruthy();
    expect(
      TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.DELETE_RUN).disabled,
    ).toBeTruthy();
    const runList = screen.getByTestId('run-list') || renderResult.container.querySelector('div');
    fireEvent(runList, new CustomEvent('selectionChange', { detail: ['run1'] }));
    expect(TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.RESTORE).disabled).toBeFalsy();
    expect(
      TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.DELETE_RUN).disabled,
    ).toBeFalsy();
    fireEvent(runList, new CustomEvent('selectionChange', { detail: ['run1', 'run2'] }));
    expect(TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.RESTORE).disabled).toBeFalsy();
    expect(
      TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.DELETE_RUN).disabled,
    ).toBeFalsy();
    fireEvent(runList, new CustomEvent('selectionChange', { detail: [] }));
    expect(TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.RESTORE).disabled).toBeTruthy();
    expect(
      TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.DELETE_RUN).disabled,
    ).toBeTruthy();
  });

  it('refreshes the run list when refresh button is clicked', async () => {
    renderResult = render(<ArchivedRuns {...generateProps()} />);
    const spy = jest.fn();
    await TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.REFRESH).action();
    expect(spy).toHaveBeenLastCalledWith();
  });

  it('shows a list of available runs', () => {
    renderResult = render(<ArchivedRuns {...generateProps()} />);
    const runList = screen.getByTestId('run-list') || renderResult.container.querySelector('div');
    expect(runList).toBeInTheDocument();
  });

  it('cancells deletion when Cancel is clicked', async () => {
    tree = shallow(<ArchivedRuns {...generateProps()} />);

    // Click delete button to delete selected ids.
    const deleteBtn = (tree.instance() as ArchivedRuns).getInitialToolbarState().actions[
      ButtonKeys.DELETE_RUN
    ];
    await deleteBtn!.action();

    // Dialog pops up to confirm the deletion.
    expect(updateDialogSpy).toHaveBeenCalledTimes(1);
    expect(updateDialogSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        content: 'Do you want to delete the selected runs? This action cannot be undone.',
      }),
    );

    // Cancel deletion.
    const call = updateDialogSpy.mock.calls[0][0];
    const cancelBtn = call.buttons.find((b: any) => b.text === 'Cancel');
    await cancelBtn.onClick();
    expect(deleteRunSpy).not.toHaveBeenCalled();
  });

  it('deletes selected ids when Confirm is clicked', async () => {
    tree = shallow(<ArchivedRuns {...generateProps()} />);
    tree.setState({ selectedIds: ['id1', 'id2', 'id3'] });

    // Mock the behavior where the deletion of id1 fails, the deletion of id2 and id3 succeed.
    TestUtils.makeErrorResponseOnce(deleteRunSpy, 'woops');
    deleteRunSpy.mockImplementation(() => Promise.resolve({}));

    // Click delete button to delete selected ids.
    const deleteBtn = (tree.instance() as ArchivedRuns).getInitialToolbarState().actions[
      ButtonKeys.DELETE_RUN
    ];
    await deleteBtn!.action();

    // Dialog pops up to confirm the deletion.
    expect(updateDialogSpy).toHaveBeenCalledTimes(1);
    expect(updateDialogSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        content: 'Do you want to delete the selected runs? This action cannot be undone.',
      }),
    );

    // Confirm.
    const call = updateDialogSpy.mock.calls[0][0];
    const confirmBtn = call.buttons.find((b: any) => b.text === 'Delete');
    await confirmBtn.onClick();
    await deleteRunSpy;
    await TestUtils.flushPromises();
    tree.update();
    expect(deleteRunSpy).toHaveBeenCalledTimes(3);
    expect(deleteRunSpy).toHaveBeenCalledWith('id1');
    expect(deleteRunSpy).toHaveBeenCalledWith('id2');
    expect(deleteRunSpy).toHaveBeenCalledWith('id3');
    expect(tree.state('selectedIds')).toEqual(['id1']); // id1 is left over since its deletion failed.
  });
});
