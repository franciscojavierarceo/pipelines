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
import AllRunsAndArchive, {
  AllRunsAndArchiveProps,
  AllRunsAndArchiveTab,
} from './AllRunsAndArchive';
import { render, screen, fireEvent } from '@testing-library/react';

function generateProps(): AllRunsAndArchiveProps {
  return {
    history: {} as any,
    location: '' as any,
    match: '' as any,
    toolbarProps: {} as any,
    updateBanner: () => null,
    updateDialog: jest.fn(),
    updateSnackbar: jest.fn(),
    updateToolbar: () => null,
    view: AllRunsAndArchiveTab.RUNS,
  };
}

describe('RunsAndArchive', () => {
  it('renders runs page', () => {
    expect(render(<AllRunsAndArchive {...(generateProps() as any)} />)).toMatchSnapshot();
  });

  it('renders archive page', () => {
    const props = generateProps();
    props.view = AllRunsAndArchiveTab.ARCHIVE;
    expect(render(<AllRunsAndArchive {...(props as any)} />)).toMatchSnapshot();
  });

  it('switches to clicked page by pushing to history', () => {
    const spy = jest.fn();
    const props = generateProps();
    props.history.push = spy;
    const { container } = render(<AllRunsAndArchive {...(props as any)} />);

    const tabs = container.querySelector('[data-testid="MD2Tabs"]') || container.querySelector('MD2Tabs');
    if (tabs) {
      fireEvent.click(tabs, { detail: { index: 1 } });
      expect(spy).toHaveBeenCalledWith('/archive/runs');

      fireEvent.click(tabs, { detail: { index: 0 } });
      expect(spy).toHaveBeenCalledWith('/runs');
    }
  });
});
