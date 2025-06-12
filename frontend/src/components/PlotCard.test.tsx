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
import PlotCard from './PlotCard';
import { ViewerConfig, PlotType } from './viewers/Viewer';

describe('PlotCard', () => {
  it('handles no configs', () => {
    const { container } = render(<PlotCard title='' configs={[]} maxDimension={100} />);
    expect(container).toMatchSnapshot();
  });

  const config: ViewerConfig = { type: PlotType.CONFUSION_MATRIX };

  it('renders on confusion matrix viewer card', () => {
    const { container } = render(
      <PlotCard title='test title' configs={[config]} maxDimension={100} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('pops out a full screen view of the viewer', () => {
    const { container } = render(<PlotCard title='' configs={[config]} maxDimension={100} />);
    const popOutButton = container.querySelector('.popOutButton');
    fireEvent.click(popOutButton!);
    expect(container).toMatchSnapshot();
  });

  it('close button closes full screen dialog', () => {
    const { container } = render(<PlotCard title='' configs={[config]} maxDimension={100} />);
    const popOutButton = container.querySelector('.popOutButton');
    fireEvent.click(popOutButton!);
    const closeButton = container.querySelector('.fullscreenCloseButton');
    fireEvent.click(closeButton!);
    expect(container).toMatchSnapshot();
  });

  it('clicking outside full screen dialog closes it', () => {
    const { container } = render(<PlotCard title='' configs={[config]} maxDimension={100} />);
    const popOutButton = container.querySelector('.popOutButton');
    fireEvent.click(popOutButton!);
    const dialog = container.querySelector('[role="dialog"]');
    fireEvent.click(dialog!);
    expect(container).toMatchSnapshot();
  });
});
