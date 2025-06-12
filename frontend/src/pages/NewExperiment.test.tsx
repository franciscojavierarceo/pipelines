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
import { NewExperiment } from './NewExperiment';
import TestUtils from '../TestUtils';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import { PageProps } from './Page';
import { Apis } from '../lib/Apis';
import { RoutePage, QUERY_PARAMS } from '../components/Router';
import { ApiResourceType, ApiRelationship } from '../apis/experiment';

describe('NewExperiment', () => {
  let renderResult: RenderResult;
  let tree: any;
  const createExperimentSpy = jest.spyOn(Apis.experimentServiceApiV2, 'createExperiment');
  const historyPushSpy = jest.fn();
  const updateDialogSpy = jest.fn();
  const updateSnackbarSpy = jest.fn();
  const updateToolbarSpy = jest.fn();

  function generateProps(): PageProps {
    return {
      history: { push: historyPushSpy } as any,
      location: { pathname: RoutePage.NEW_EXPERIMENT } as any,
      match: '' as any,
      toolbarProps: NewExperiment.prototype.getInitialToolbarState(),
      updateBanner: () => null,
      updateDialog: updateDialogSpy,
      updateSnackbar: updateSnackbarSpy,
      updateToolbar: updateToolbarSpy,
    };
  }

  // Used by tests that don't care about exact experiment name
  function fillAnyExperimentName() {
    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'a-random-experiment-name-DO-NOT-VERIFY-THIS' },
    });
  }

  beforeEach(() => {
    // Reset mocks
    createExperimentSpy.mockReset();
    historyPushSpy.mockReset();
    updateDialogSpy.mockReset();
    updateSnackbarSpy.mockReset();
    updateToolbarSpy.mockReset();

    createExperimentSpy.mockImplementation(() => ({ experiment_id: 'new-experiment-id' }));
  });

  afterEach(() => renderResult?.unmount());

  it('renders the new experiment page', () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);
    expect(renderResult.container).toMatchSnapshot();
  });

  it('does not include any action buttons in the toolbar', () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);

    expect(updateToolbarSpy).toHaveBeenCalledWith({
      actions: {},
      breadcrumbs: [{ displayName: 'Experiments', href: RoutePage.EXPERIMENTS }],
      pageTitle: 'New experiment',
    });
  });

  it("enables the 'Next' button when an experiment name is entered", () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);
    const createBtn = screen.getByTestId('createExperimentBtn');
    expect(createBtn).toBeDisabled();

    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment name' },
    });

    expect(createBtn).not.toBeDisabled();
    expect(renderResult.container).toMatchSnapshot();
  });

  it("re-disables the 'Next' button when an experiment name is cleared after having been entered", () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);
    const createBtn = screen.getByTestId('createExperimentBtn');
    expect(createBtn).toBeDisabled();

    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment name' },
    });
    expect(createBtn).not.toBeDisabled();

    fireEvent.change(nameInput, { target: { value: '' } });
    expect(createBtn).toBeDisabled();
    expect(renderResult.container).toMatchSnapshot();
  });

  it('updates the experiment name', () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);
    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment name' },
    });

    expect(nameInput.value).toBe('experiment name');
  });

  it('updates the experiment description', () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    fireEvent.change(descriptionInput, { target: { value: 'a description!' } });

    expect(descriptionInput.value).toBe('a description!');
  });

  it("sets the page to a busy state upon clicking 'Next'", async () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);

    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment-name' },
    });

    const createBtn = screen.getByTestId('createExperimentBtn');
    fireEvent.click(createBtn);
    await TestUtils.flushPromises();

    expect(createBtn).toHaveAttribute('busy');
  });

  it("calls the createExperiment API with the new experiment upon clicking 'Next'", async () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);

    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment name' },
    });
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    fireEvent.change(descriptionInput, {
      target: { value: 'experiment description' },
    });

    const createBtn = screen.getByTestId('createExperimentBtn');
    fireEvent.click(createBtn);
    await TestUtils.flushPromises();

    expect(createExperimentSpy).toHaveBeenCalledWith({
      description: 'experiment description',
      display_name: 'experiment name',
    });
  });

  it('calls the createExperimentAPI with namespace when it is provided', async () => {
    renderResult = TestUtils.renderWithRouter(
      <NewExperiment {...(generateProps() as any)} namespace='test-ns' />,
    );

    fillAnyExperimentName();
    const createBtn = screen.getByTestId('createExperimentBtn');
    fireEvent.click(createBtn);
    await TestUtils.flushPromises();

    expect(createExperimentSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'test-ns',
      }),
    );
  });

  it('navigates to NewRun page upon successful creation', async () => {
    const experimentId = 'test-exp-id-1';
    createExperimentSpy.mockImplementation(() => ({ experiment_id: experimentId }));
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);

    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment-name' },
    });

    const createBtn = screen.getByTestId('createExperimentBtn');
    fireEvent.click(createBtn);
    await createExperimentSpy;
    await TestUtils.flushPromises();

    expect(historyPushSpy).toHaveBeenCalledWith(
      RoutePage.NEW_RUN + `?experimentId=${experimentId}` + `&firstRunInExperiment=1`,
    );
  });

  it('includes pipeline ID and version ID in NewRun page query params if present', async () => {
    const experimentId = 'test-exp-id-1';
    createExperimentSpy.mockImplementation(() => ({ experiment_id: experimentId }));

    const pipelineId = 'some-pipeline-id';
    const pipelineVersionId = 'version-id';
    const listPipelineVersionsSpy = jest.spyOn(Apis.pipelineServiceApiV2, 'listPipelineVersions');
    listPipelineVersionsSpy.mockImplementation(() => ({
      pipeline_versions: [{ pipeline_version_id: pipelineVersionId }],
    }));

    const props = generateProps();
    props.location.search = `?${QUERY_PARAMS.pipelineId}=${pipelineId}`;
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(props as any)} />);

    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment-name' },
    });

    const createBtn = screen.getByTestId('createExperimentBtn');
    fireEvent.click(createBtn);
    await createExperimentSpy;
    await listPipelineVersionsSpy;
    await TestUtils.flushPromises();

    expect(historyPushSpy).toHaveBeenCalledWith(
      RoutePage.NEW_RUN +
        `?experimentId=${experimentId}` +
        `&pipelineId=${pipelineId}` +
        `&pipelineVersionId=${pipelineVersionId}` +
        `&firstRunInExperiment=1`,
    );
  });

  it('shows snackbar confirmation after experiment is created', async () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);

    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment-name' },
    });

    const createBtn = screen.getByTestId('createExperimentBtn');
    fireEvent.click(createBtn);
    await TestUtils.flushPromises();

    expect(updateSnackbarSpy).toHaveBeenLastCalledWith({
      autoHideDuration: 10000,
      message: 'Successfully created new Experiment: experiment-name',
      open: true,
    });
  });

  it('unsets busy state when creation fails', async () => {
    // Don't actually log to console.
    // tslint:disable-next-line:no-console
    console.error = jest.spyOn(console, 'error').mockImplementation();

    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);

    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment-name' },
    });

    TestUtils.makeErrorResponseOnce(createExperimentSpy, 'test error!');
    const createBtn = screen.getByTestId('createExperimentBtn');
    fireEvent.click(createBtn);
    await createExperimentSpy;
    await TestUtils.flushPromises();

    expect(createBtn).not.toHaveAttribute('busy');
  });

  it('shows error dialog when creation fails', async () => {
    // Don't actually log to console.
    // tslint:disable-next-line:no-console
    console.error = jest.spyOn(console, 'error').mockImplementation();

    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);

    const nameInput = screen.getByDisplayValue('') as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { value: 'experiment-name' },
    });

    TestUtils.makeErrorResponseOnce(createExperimentSpy, 'test error!');
    const createBtn = screen.getByTestId('createExperimentBtn');
    fireEvent.click(createBtn);
    await createExperimentSpy;
    await TestUtils.flushPromises();

    const call = updateDialogSpy.mock.calls[0][0];
    expect(call).toHaveProperty('title', 'Experiment creation failed');
    expect(call).toHaveProperty('content', 'test error!');
  });

  it('navigates to experiment list page upon cancellation', async () => {
    renderResult = TestUtils.renderWithRouter(<NewExperiment {...(generateProps() as any)} />);
    const cancelBtn = screen.getByTestId('cancelNewExperimentBtn');
    fireEvent.click(cancelBtn);
    await TestUtils.flushPromises();

    expect(historyPushSpy).toHaveBeenCalledWith(RoutePage.EXPERIMENTS);
  });
});
