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
import { ArchivedExperiments } from './ArchivedExperiments';
import TestUtils from '../TestUtils';
import { PageProps } from './Page';
import { ApiExperimentStorageState } from '../apis/experiment';
import { V2beta1ExperimentStorageState } from '../apisv2beta1/experiment';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonKeys } from '../lib/Buttons';

describe('ArchivedExperiemnts', () => {
  const updateBannerSpy = jest.fn();
  const updateToolbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const updateDialogSpy = jest.fn();
  const updateSnackbarSpy = jest.fn();
  let container: HTMLElement;

  function generateProps(): PageProps {
    return TestUtils.generatePageProps(
      ArchivedExperiments,
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
    jest.clearAllMocks();
  });

  it('renders archived experiments', () => {
    const { container: renderedContainer } = TestUtils.renderWithRouter(
      <ArchivedExperiments {...generateProps()} />,
    );
    container = renderedContainer;
    expect(container).toMatchSnapshot();
  });

  it('removes error banner on unmount', () => {
    const { unmount } = TestUtils.renderWithRouter(<ArchivedExperiments {...generateProps()} />);
    unmount();
    expect(updateBannerSpy).toHaveBeenCalledWith({});
  });

  it('refreshes the experiment list when refresh button is clicked', async () => {
    TestUtils.renderWithRouter(<ArchivedExperiments {...generateProps()} />);
    await TestUtils.getToolbarButton(updateToolbarSpy, ButtonKeys.REFRESH).action();
  });

  it('shows a list of archived experiments', () => {
    TestUtils.renderWithRouter(<ArchivedExperiments {...generateProps()} />);
    const experimentList = screen.getByTestId('experiment-list');
    expect(experimentList).toHaveAttribute(
      'data-storage-state',
      V2beta1ExperimentStorageState.ARCHIVED.toString(),
    );
  });
});
