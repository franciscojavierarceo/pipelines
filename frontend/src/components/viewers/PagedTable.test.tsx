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
import { render, screen, fireEvent } from '@testing-library/react';
import PagedTable from './PagedTable';
import { PlotType } from './Viewer';

describe('PagedTable', () => {
  it('does not break on no config', () => {
    const { container } = render(<PagedTable configs={[]} />);
    expect(container).toMatchSnapshot();
  });

  it('does not break on empty data', () => {
    const { container } = render(<PagedTable configs={[{ data: [], labels: [], type: PlotType.TABLE }]} />);
    expect(container).toMatchSnapshot();
  });

  const data = [
    ['col1', 'col2', 'col3'],
    ['col4', 'col5', 'col6'],
  ];
  const labels = ['field1', 'field2', 'field3'];

  it('renders simple data', () => {
    const { container } = render(<PagedTable configs={[{ data, labels, type: PlotType.TABLE }]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders simple data without labels', () => {
    const { container } = render(<PagedTable configs={[{ data, labels: [], type: PlotType.TABLE }]} />);
    expect(container).toMatchSnapshot();
  });

  it('sorts on first column descending', () => {
    const { container } = render(<PagedTable configs={[{ data, labels, type: PlotType.TABLE }]} />);
    const sortButton = screen.getAllByRole('button')[0];
    fireEvent.click(sortButton);
    expect(container).toMatchSnapshot();
  });

  it('sorts on first column ascending', () => {
    const { container } = render(<PagedTable configs={[{ data, labels, type: PlotType.TABLE }]} />);
    const sortButton = screen.getAllByRole('button')[0];
    // Once for descending
    fireEvent.click(sortButton);
    // Once for ascending
    fireEvent.click(sortButton);
    expect(container).toMatchSnapshot();
  });

  it('returns a user friendly display name', () => {
    expect(PagedTable.prototype.getDisplayName()).toBe('Table');
  });
});
