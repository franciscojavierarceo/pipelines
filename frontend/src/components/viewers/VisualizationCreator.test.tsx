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

import { render, screen, fireEvent } from '@testing-library/react';
import { PlotType } from './Viewer';
import VisualizationCreator, { VisualizationCreatorConfig } from './VisualizationCreator';
import { ApiVisualizationType } from '../../apis/visualization';
import { diffHTML } from '../../TestUtils';

describe('VisualizationCreator', () => {
  it('does not render component when no config is provided', () => {
    const { container } = render(<VisualizationCreator configs={[]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders component when empty config is provided', () => {
    const config: VisualizationCreatorConfig = {
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders component when isBusy is not provided', () => {
    const config: VisualizationCreatorConfig = {
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders component when onGenerate is not provided', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders component when all parameters in config are provided', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    expect(container).toMatchSnapshot();
  });

  it('does not render an Editor component if a visualization type is not specified', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders an Editor component if a visualization type is specified', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    const select = container.querySelector('select');
    if (select) {
      fireEvent.change(select, { target: { value: ApiVisualizationType.ROCCURVE } });
    }
    expect(container).toMatchSnapshot();
  });

  it('renders two Editor components if the CUSTOM visualization type is specified', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    const select = container.querySelector('select');
    if (select) {
      fireEvent.change(select, { target: { value: ApiVisualizationType.CUSTOM } });
    }
    expect(container).toMatchSnapshot();
  });

  it('has a disabled BusyButton if selectedType is an undefined', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('has a disabled BusyButton if source is an empty string', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('has a disabled BusyButton if onGenerate is not provided as a prop', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('has a disabled BusyButton if isBusy is true', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: true,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('has an enabled BusyButton if onGenerate is provided and source and selectedType are set', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    const select = container.querySelector('select');
    const sourceInput = container.querySelectorAll('input')[1]; // source input
    if (select && sourceInput) {
      fireEvent.change(select, { target: { value: ApiVisualizationType.ROCCURVE } });
      fireEvent.change(sourceInput, { target: { value: 'gs://ml-pipeline/data.csv' } });
    }
    const button = container.querySelector('button');
    expect(button).not.toBeDisabled();
  });

  it('calls onGenerate when BusyButton is clicked', () => {
    const onGenerate = jest.fn();
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate,
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const tree = shallow(<VisualizationCreator configs={[config]} />);
    tree.setState({
      arguments: '{}',
      selectedType: ApiVisualizationType.ROCCURVE,
      source: 'gs://ml-pipeline/data.csv',
    });
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onGenerate).toBeCalled();
  });

  it('passes state as parameters to onGenerate when BusyButton is clicked', () => {
    const onGenerate = jest.fn();
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate,
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const tree = shallow(<VisualizationCreator configs={[config]} />);
    tree.setState({
      arguments: '{}',
      selectedType: ApiVisualizationType.ROCCURVE,
      source: 'gs://ml-pipeline/data.csv',
    });
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onGenerate).toBeCalledWith(
      '{}',
      'gs://ml-pipeline/data.csv',
      ApiVisualizationType.ROCCURVE,
    );
  });

  it('renders the provided arguments', () => {
    const config: VisualizationCreatorConfig = {
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const tree = shallow(<VisualizationCreator configs={[config]} />);
    tree.setState({
      arguments: JSON.stringify({ is_generated: 'True' }),
      // selectedType is required to be set so that the argument editor
      // component is visible.
      selectedType: ApiVisualizationType.ROCCURVE,
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders a provided source', () => {
    const source = 'gs://ml-pipeline/data.csv';
    const config: VisualizationCreatorConfig = {
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const { container } = render(<VisualizationCreator configs={[config]} />);
    const inputs = container.querySelectorAll('input');
    expect(inputs[1]).toHaveValue(source);
  });

  it('renders the selected visualization type', () => {
    const config: VisualizationCreatorConfig = {
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const tree = shallow(<VisualizationCreator configs={[config]} />);
    tree.setState({
      selectedType: ApiVisualizationType.ROCCURVE,
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders the custom type when it is allowed', () => {
    const config: VisualizationCreatorConfig = {
      allowCustomVisualizations: true,
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const tree = shallow(<VisualizationCreator configs={[config]} />);
    expect(tree).toMatchSnapshot();
  });

  it('disables all select and input fields when busy', () => {
    const config: VisualizationCreatorConfig = {
      isBusy: true,
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const tree = shallow(<VisualizationCreator configs={[config]} />);
    // toMatchSnapshot is used rather than three individual checks for the
    // disabled prop due to an issue where the Input components are not
    // selectable by tree.find().
    expect(tree).toMatchSnapshot();
  });

  it('has an argument placeholder for every visualization type', () => {
    // Taken from VisualizationCreator.tsx, update this if updated within
    // VisualizationCreator.tsx.
    const types = Object.keys(ApiVisualizationType)
      .map((key: string) => key.replace('_', ''))
      .filter((key: string, i: number, arr: string[]) => arr.indexOf(key) === i);
    const config: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
    };
    const tree = shallow(<VisualizationCreator configs={[config]} />);
    // Iterate through all selectable types to ensure a placeholder is set
    // for the argument editor for each type.
    for (const type of types) {
      tree.setState({
        // source by default is set to ''
        selectedType: type,
      });
      expect(
        tree
          .find('Editor')
          .at(0)
          .prop('placeholder'),
      ).not.toBeNull();
    }
  });

  it('returns friendly display name', () => {
    expect(VisualizationCreator.prototype.getDisplayName()).toBe('Visualization Creator');
  });

  it('can be configured as collapsed initially and clicks to open', () => {
    const baseConfig: VisualizationCreatorConfig = {
      isBusy: false,
      onGenerate: jest.fn(),
      type: PlotType.VISUALIZATION_CREATOR,
      collapsedInitially: false,
    };
    const { container: baseContainer } = render(<VisualizationCreator configs={[baseConfig]} />);
    const { container } = render(
      <VisualizationCreator
        configs={[
          {
            ...baseConfig,
            collapsedInitially: true,
          },
        ]}
      />,
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          class="MuiButtonBase-root-114 MuiButton-root-88 MuiButton-text-90 MuiButton-flat-93"
          tabindex="0"
          type="button"
        >
          <span
            class="MuiButton-label-89"
          >
            create visualizations manually
          </span>
          <span
            class="MuiTouchRipple-root-117"
          />
        </button>
      </div>
    `);
    const button = screen.getByText('create visualizations manually');
    fireEvent.click(button);
    // expanding a visualization creator is equivalent to rendering a non-collapsed visualization creator
    expect(diffHTML({ base: baseContainer.innerHTML, update: container.innerHTML }))
      .toMatchInlineSnapshot(`
      Snapshot Diff:
      Compared values have no visual difference.
    `);
  });
});
