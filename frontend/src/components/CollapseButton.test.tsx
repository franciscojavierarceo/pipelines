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
import CollapseButton from './CollapseButton';
import { render, screen, fireEvent } from '@testing-library/react';

describe('CollapseButton', () => {
  const compareComponent = {
    collapseSectionsUpdate: jest.fn(),
    state: {
      collapseSections: {},
    },
  } as any;

  afterEach(() => (compareComponent.state.collapseSections = {}));

  it('initial render', () => {
    const { container } = render(
      <CollapseButton
        collapseSections={compareComponent.state.collapseSections}
        collapseSectionsUpdate={compareComponent.collapseSectionsUpdate}
        sectionName='testSection'
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the button collapsed if in collapsedSections', () => {
    compareComponent.state.collapseSections.testSection = true;
    const { container } = render(
      <CollapseButton
        collapseSections={compareComponent.state.collapseSections}
        collapseSectionsUpdate={compareComponent.collapseSectionsUpdate}
        sectionName='testSection'
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('collapses given section when clicked', () => {
    render(
      <CollapseButton
        collapseSections={compareComponent.state.collapseSections}
        collapseSectionsUpdate={compareComponent.collapseSectionsUpdate}
        sectionName='testSection'
      />,
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(compareComponent.collapseSectionsUpdate).toHaveBeenCalledWith({ testSection: true });
  });

  it('expands given section when clicked if it is collapsed', () => {
    compareComponent.state.collapseSections.testSection = true;
    render(
      <CollapseButton
        collapseSections={compareComponent.state.collapseSections}
        collapseSectionsUpdate={compareComponent.collapseSectionsUpdate}
        sectionName='testSection'
      />,
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(compareComponent.collapseSectionsUpdate).toHaveBeenCalledWith({ testSection: false });
  });
});
