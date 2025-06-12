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
import { createMemoryHistory } from 'history';
import EnhancedCompareV1, { TEST_ONLY, TaggedViewerConfig } from './CompareV1';
import TestUtils from '../TestUtils';
import { render, screen, fireEvent } from '@testing-library/react';
import { Apis } from '../lib/Apis';
import { PageProps } from './Page';
import { RoutePage, QUERY_PARAMS } from '../components/Router';
import { ApiRunDetail } from '../apis/run';
import { PlotType } from '../components/viewers/Viewer';
import { OutputArtifactLoader } from '../lib/OutputArtifactLoader';
import { Workflow } from '../../third_party/argo-ui/argo_template';
import { ButtonKeys } from '../lib/Buttons';
import { Router } from 'react-router-dom';
import { NamespaceContext } from '../lib/KubeflowClient';
import { METRICS_SECTION_NAME, OVERVIEW_SECTION_NAME, PARAMS_SECTION_NAME } from './Compare';

const CompareV1 = TEST_ONLY.CompareV1;
class TestCompare extends CompareV1 {
  public _selectionChanged(selectedIds: string[]): void {
    return super._selectionChanged(selectedIds);
  }
}

describe('CompareV1', () => {
  let tree: any;

  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => null);
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => null);

  const updateToolbarSpy = jest.fn();
  const updateBannerSpy = jest.fn();
  const updateDialogSpy = jest.fn();
  const updateSnackbarSpy = jest.fn();
  const historyPushSpy = jest.fn();
  const getRunSpy = jest.spyOn(Apis.runServiceApi, 'getRun');
  const outputArtifactLoaderSpy = jest.spyOn(OutputArtifactLoader, 'load');

  function generateProps(): PageProps {
    const location = {
      pathname: RoutePage.COMPARE,
      search: `?${QUERY_PARAMS.runlist}=${MOCK_RUN_1_ID},${MOCK_RUN_2_ID},${MOCK_RUN_3_ID}`,
    } as any;
    return TestUtils.generatePageProps(
      CompareV1,
      location,
      {} as any,
      historyPushSpy,
      updateBannerSpy,
      updateDialogSpy,
      updateToolbarSpy,
      updateSnackbarSpy,
    );
  }

  const MOCK_RUN_1_ID = 'mock-run-1-id';
  const MOCK_RUN_2_ID = 'mock-run-2-id';
  const MOCK_RUN_3_ID = 'mock-run-3-id';

  let runs: ApiRunDetail[] = [];

  function newMockRun(id?: string, v2?: boolean): ApiRunDetail {
    return {
      pipeline_runtime: {
        workflow_manifest: '{}',
      },
      run: {
        id: id || 'test-run-id',
        name: 'test run ' + id,
        pipeline_spec: v2 ? { pipeline_manifest: '' } : { workflow_manifest: '' },
      },
    };
  }

  /**
   * After calling this function, the global 'tree' will be a Compare instance with a table viewer
   * and a tensorboard viewer.
   */
  async function setUpViewersAndShallowMount(): Promise<void> {
    // Simulate returning a tensorboard and table viewer
    outputArtifactLoaderSpy.mockImplementation(() => [
      { type: PlotType.TENSORBOARD, url: 'gs://path' },
      { data: [[]], labels: ['col1, col2'], type: PlotType.TABLE },
    ]);

    const workflow = {
      status: {
        nodes: {
          node1: {
            outputs: {
              artifacts: [
                {
                  name: 'mlpipeline-ui-metadata',
                  s3: { s3Bucket: { bucket: 'test bucket' }, key: 'test key' },
                },
              ],
            },
          },
        },
      },
    };
    const run1 = newMockRun('run-with-workflow-1');
    run1.pipeline_runtime!.workflow_manifest = JSON.stringify(workflow);
    const run2 = newMockRun('run-with-workflow-2');
    run2.pipeline_runtime!.workflow_manifest = JSON.stringify(workflow);
    runs.push(run1, run2);

    const props = generateProps();
    props.location.search = `?${QUERY_PARAMS.runlist}=run-with-workflow-1,run-with-workflow-2`;

    tree = TestUtils.renderWithRouter(<TestCompare {...props} />);
    await TestUtils.flushPromises();
  }

  beforeEach(async () => {
    // Reset mocks
    consoleErrorSpy.mockReset();
    consoleLogSpy.mockReset();
    updateBannerSpy.mockReset();
    updateDialogSpy.mockReset();
    updateSnackbarSpy.mockReset();
    updateToolbarSpy.mockReset();
    historyPushSpy.mockReset();
    outputArtifactLoaderSpy.mockReset();

    getRunSpy.mockClear();

    runs = [newMockRun(MOCK_RUN_1_ID), newMockRun(MOCK_RUN_2_ID), newMockRun(MOCK_RUN_3_ID)];

    getRunSpy.mockImplementation((id: string) => runs.find(r => r.run!.id === id));
  });

  afterEach(async () => {
    // cleanup should be called before resetAllMocks() in case any part of the cleanup life cycle
    // depends on mocks/spies
    if (tree && tree.unmount) {
      tree.unmount();
    }
  });

  it('clears banner upon initial load', () => {
    tree = TestUtils.renderWithRouter(<CompareV1 {...generateProps()} />);
    expect(updateBannerSpy).toHaveBeenCalledTimes(1);
    expect(updateBannerSpy).toHaveBeenLastCalledWith({});
  });

  it('renders a page with no runs', async () => {
    const props = generateProps();
    // Ensure there are no run IDs in the query
    props.location.search = '';
    tree = TestUtils.renderWithRouter(<CompareV1 {...props} />);
    await TestUtils.flushPromises();

    expect(updateBannerSpy).toHaveBeenCalledTimes(1);
    expect(updateBannerSpy).toHaveBeenLastCalledWith({});

    expect(tree).toMatchSnapshot();
  });

  it('renders a page with multiple runs', async () => {
    const props = generateProps();
    // Ensure there are run IDs in the query
    props.location.search = `?${QUERY_PARAMS.runlist}=${MOCK_RUN_1_ID},${MOCK_RUN_2_ID},${MOCK_RUN_3_ID}`;

    tree = TestUtils.renderWithRouter(<CompareV1 {...props} />);
    await TestUtils.flushPromises();
    expect(tree).toMatchSnapshot();
  });

  it('fetches a run for each ID in query params', async () => {
    runs.push(newMockRun('run-1'), newMockRun('run-2'), newMockRun('run-2'));
    const props = generateProps();
    props.location.search = `?${QUERY_PARAMS.runlist}=run-1,run-2,run-3`;

    tree = TestUtils.renderWithRouter(<CompareV1 {...props} />);
    await TestUtils.flushPromises();

    expect(getRunSpy).toHaveBeenCalledTimes(3);
    expect(getRunSpy).toHaveBeenCalledWith('run-1');
    expect(getRunSpy).toHaveBeenCalledWith('run-2');
    expect(getRunSpy).toHaveBeenCalledWith('run-3');
  });

  it('shows an error banner if fetching any run fails', async () => {
    TestUtils.makeErrorResponseOnce(getRunSpy, 'test error');

    tree = TestUtils.renderWithRouter(<CompareV1 {...generateProps()} />);
    await TestUtils.flushPromises();

    expect(updateBannerSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        additionalInfo: 'test error',
        message: 'Error: failed loading 1 runs. Click Details for more information.',
        mode: 'error',
      }),
    );
  });

  it('shows an info banner if all runs are v2', async () => {
    runs = [
      newMockRun(MOCK_RUN_1_ID, true),
      newMockRun(MOCK_RUN_2_ID, true),
      newMockRun(MOCK_RUN_3_ID, true),
    ];
    getRunSpy.mockImplementation((id: string) => runs.find(r => r.run!.id === id));

    tree = TestUtils.renderWithRouter(<CompareV1 {...generateProps()} />);
    await TestUtils.flushPromises();

    expect(updateBannerSpy).toHaveBeenLastCalledWith({
      additionalInfo:
        'The selected runs are all V2, but the V2_ALPHA feature flag is disabled.' +
        ' The V1 page will not show any useful information for these runs.',
      message:
        'Info: enable the V2_ALPHA feature flag in order to view the updated Run Comparison page.',
      mode: 'info',
    });
  });

  it('shows an error banner indicating the number of getRun calls that failed', async () => {
    getRunSpy.mockImplementation(() => {
      throw {
        text: () => Promise.resolve('test error'),
      };
    });

    tree = TestUtils.renderWithRouter(<CompareV1 {...generateProps()} />);
    await TestUtils.flushPromises();

    expect(updateBannerSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        additionalInfo: 'test error',
        message: `Error: failed loading ${runs.length} runs. Click Details for more information.`,
        mode: 'error',
      }),
    );
  });

  it('clears the error banner on refresh', async () => {
    TestUtils.makeErrorResponseOnce(getRunSpy, 'test error');

    tree = TestUtils.renderWithRouter(<CompareV1 {...generateProps()} />);
    await TestUtils.flushPromises();

    // Verify that error banner is being shown
    expect(updateBannerSpy).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'error' }));


    // Error banner should be cleared
    expect(updateBannerSpy).toHaveBeenLastCalledWith({});
  });

  it("displays run's parameters if the run has any", async () => {
    const workflow = {
      spec: {
        arguments: {
          parameters: [
            { name: 'param1', value: 'value1' },
            { name: 'param2', value: 'value2' },
          ],
        },
      },
    } as Workflow;

    const run = newMockRun('run-with-parameters');
    run.pipeline_runtime!.workflow_manifest = JSON.stringify(workflow);
    runs.push(run);

    const props = generateProps();
    props.location.search = `?${QUERY_PARAMS.runlist}=run-with-parameters`;

    tree = TestUtils.renderWithRouter(<CompareV1 {...props} />);
    await TestUtils.flushPromises();
    expect(tree).toMatchSnapshot();
  });

  it('displays parameters from multiple runs', async () => {
    const run1Workflow = {
      spec: {
        arguments: {
          parameters: [
            { name: 'r1-unique-param', value: 'r1-unique-val1' },
            { name: 'shared-param', value: 'r1-shared-val2' },
          ],
        },
      },
    } as Workflow;
    const run2Workflow = {
      spec: {
        arguments: {
          parameters: [
            { name: 'r2-unique-param1', value: 'r2-unique-val1' },
            { name: 'shared-param', value: 'r2-shared-val2' },
          ],
        },
      },
    } as Workflow;

    const run1 = newMockRun('run1');
    run1.pipeline_runtime!.workflow_manifest = JSON.stringify(run1Workflow);
    const run2 = newMockRun('run2');
    run2.pipeline_runtime!.workflow_manifest = JSON.stringify(run2Workflow);
    runs.push(run1, run2);

    const props = generateProps();
    props.location.search = `?${QUERY_PARAMS.runlist}=run1,run2`;

    tree = TestUtils.renderWithRouter(<CompareV1 {...props} />);
    await TestUtils.flushPromises();
    tree.update();

    expect(tree).toMatchSnapshot();
  });

  it("displays a run's metrics if the run has any", async () => {
    const run = newMockRun('run-with-metrics');
    run.run!.metrics = [
      { name: 'some-metric', number_value: 0.33 },
      { name: 'another-metric', number_value: 0.554 },
    ];
    runs.push(run);

    const props = generateProps();
    props.location.search = `?${QUERY_PARAMS.runlist}=run-with-metrics`;

    tree = TestUtils.renderWithRouter(<CompareV1 {...props} />);
    await TestUtils.flushPromises();
    expect(tree).toMatchSnapshot();
  });

  it('displays metrics from multiple runs', async () => {
    const run1 = newMockRun('run1');
    run1.run!.metrics = [
      { name: 'some-metric', number_value: 0.33 },
      { name: 'another-metric', number_value: 0.554 },
    ];
    const run2 = newMockRun('run2');
    run2.run!.metrics = [{ name: 'some-metric', number_value: 0.67 }];
    runs.push(run1, run2);

    const props = generateProps();
    props.location.search = `?${QUERY_PARAMS.runlist}=run1,run2`;

    tree = TestUtils.renderWithRouter(<CompareV1 {...props} />);
    await TestUtils.flushPromises();
    tree.update();

    expect(tree).toMatchSnapshot();
  });

  it('creates a map of viewers', async () => {
    // Simulate returning a tensorboard and table viewer
    outputArtifactLoaderSpy.mockImplementationOnce(() => [
      { type: PlotType.TENSORBOARD, url: 'gs://path' },
      { data: [['test']], labels: ['col1, col2'], type: PlotType.TABLE },
    ]);

    const workflow = {
      status: {
        nodes: {
          node1: {
            outputs: {
              artifacts: [
                {
                  name: 'mlpipeline-ui-metadata',
                  s3: { s3Bucket: { bucket: 'test bucket' }, key: 'test key' },
                },
              ],
            },
          },
        },
      },
    };
    const run = newMockRun('run-with-workflow');
    run.pipeline_runtime!.workflow_manifest = JSON.stringify(workflow);
    runs.push(run);

    const props = generateProps();
    props.location.search = `?${QUERY_PARAMS.runlist}=run-with-workflow`;

    tree = TestUtils.renderWithRouter(<CompareV1 {...props} />);
    await TestUtils.flushPromises();

    const expectedViewerMap = new Map([
      [
        PlotType.TABLE,
        [
          {
            config: { data: [['test']], labels: ['col1, col2'], type: PlotType.TABLE },
            runId: run.run!.id,
            runName: run.run!.name,
          } as TaggedViewerConfig,
        ],
      ],
      [
        PlotType.TENSORBOARD,
        [
          {
            config: { type: PlotType.TENSORBOARD, url: 'gs://path' },
            runId: run.run!.id,
            runName: run.run!.name,
          } as TaggedViewerConfig,
        ],
      ],
    ]);

    expect(tree).toMatchSnapshot();
  });

  it('collapses all sections', async () => {
    await setUpViewersAndShallowMount();
    const collapseButton = screen.getByRole('button', { name: /collapse/i });
    fireEvent.click(collapseButton);
    
    // Verify sections are collapsed by checking if content is hidden
    expect(screen.queryByText('Metrics')).not.toBeVisible();
    expect(screen.queryByText('Parameters')).not.toBeVisible();

    expect(tree).toMatchSnapshot();
  });

  it('expands all sections if they were collapsed', async () => {
    await setUpViewersAndShallowMount();
    
    const collapseButton = screen.getByRole('button', { name: /collapse/i });
    fireEvent.click(collapseButton);
    
    // Verify sections are collapsed by checking if content is hidden
    expect(screen.queryByText('Metrics')).not.toBeVisible();
    expect(screen.queryByText('Parameters')).not.toBeVisible();
    
    const expandButton = screen.getByRole('button', { name: /expand/i });
    fireEvent.click(expandButton);
    
    // Verify sections are expanded by checking if content is visible
    expect(screen.getByText('Metrics')).toBeVisible();
    expect(screen.getByText('Parameters')).toBeVisible();

    expect(tree.container).toMatchSnapshot();
  });

  it('allows individual viewers to be collapsed and expanded', async () => {
    tree = TestUtils.renderWithRouter(<CompareV1 {...generateProps()} />);
    await TestUtils.flushPromises();

    const collapseButtons = screen.getAllByRole('button', { name: /collapse/i });

    // Collapse run overview (first collapse button)
    fireEvent.click(collapseButtons[0]);

    // Verify overview section is collapsed
    expect(screen.queryByText('Overview')).not.toBeVisible();

    // Collapse run parameters (second collapse button)
    fireEvent.click(collapseButtons[1]);

    // Verify parameters section is collapsed
    expect(screen.queryByText('Parameters')).not.toBeVisible();

    // Re-expand run overview and parameters
    const expandButtons = screen.getAllByRole('button', { name: /expand/i });
    fireEvent.click(expandButtons[0]);
    fireEvent.click(expandButtons[1]);

    // Verify sections are expanded again
    expect(screen.getByText('Overview')).toBeVisible();
    expect(screen.getByText('Parameters')).toBeVisible();
  });

  it('allows individual runs to be selected and deselected', async () => {
    tree = TestUtils.renderWithRouter(<CompareV1 {...generateProps()} />);
    await TestUtils.flushPromises();

    const tableRows = screen.getAllByRole('row');
    
    fireEvent.click(tableRows[0]);
    fireEvent.click(tableRows[2]);

    // Verify only middle run remains selected by checking checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();

    fireEvent.click(tableRows[0]);

    // Verify first and middle runs are now selected
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('does not show viewers for deselected runs', async () => {
    await setUpViewersAndShallowMount();

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        fireEvent.click(checkbox);
      }
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('creates an extra aggregation plot for compatible viewers', async () => {
    // Tensorboard and ROC curves are the only viewers that currently support aggregation
    outputArtifactLoaderSpy.mockImplementation(() => [
      { type: PlotType.TENSORBOARD, url: 'gs://path' },
      { data: [], type: PlotType.ROC },
    ]);
    const workflow = {
      status: {
        nodes: {
          node1: {
            outputs: {
              artifacts: [
                {
                  name: 'mlpipeline-ui-metadata',
                  s3: { s3Bucket: { bucket: 'test bucket' }, key: 'test key' },
                },
              ],
            },
          },
        },
      },
    };
    const run1 = newMockRun('run1-id');
    run1.pipeline_runtime!.workflow_manifest = JSON.stringify(workflow);
    const run2 = newMockRun('run2-id');
    run2.pipeline_runtime!.workflow_manifest = JSON.stringify(workflow);
    runs.push(run1, run2);

    const props = generateProps();
    props.location.search = `?${QUERY_PARAMS.runlist}=run1-id,run2-id`;

    tree = TestUtils.renderWithRouter(<TestCompare {...props} />);
    await TestUtils.flushPromises();

    // 6 plot cards because there are (2 runs * 2 plots per run) + 2 aggregated plots, one for
    // Tensorboard and one for ROC.
    expect(tree.find('PlotCard').length).toBe(6);

    expect(tree).toMatchSnapshot();
  });

  describe('EnhancedCompareV1', () => {
    it('redirects to experiments page when namespace changes', () => {
      const history = createMemoryHistory({
        initialEntries: ['/does-not-matter'],
      });
      const { rerender } = render(
        <Router history={history}>
          <NamespaceContext.Provider value='ns1'>
            <EnhancedCompareV1 {...generateProps()} />
          </NamespaceContext.Provider>
        </Router>,
      );
      expect(history.location.pathname).not.toEqual('/experiments');
      rerender(
        <Router history={history}>
          <NamespaceContext.Provider value='ns2'>
            <EnhancedCompareV1 {...generateProps()} />
          </NamespaceContext.Provider>
        </Router>,
      );
      expect(history.location.pathname).toEqual('/experiments');
    });

    it('does not redirect when namespace stays the same', () => {
      const history = createMemoryHistory({
        initialEntries: ['/initial-path'],
      });
      const { rerender } = render(
        <Router history={history}>
          <NamespaceContext.Provider value='ns1'>
            <EnhancedCompareV1 {...generateProps()} />
          </NamespaceContext.Provider>
        </Router>,
      );
      expect(history.location.pathname).toEqual('/initial-path');
      rerender(
        <Router history={history}>
          <NamespaceContext.Provider value='ns1'>
            <EnhancedCompareV1 {...generateProps()} />
          </NamespaceContext.Provider>
        </Router>,
      );
      expect(history.location.pathname).toEqual('/initial-path');
    });

    it('does not redirect when namespace initializes', () => {
      const history = createMemoryHistory({
        initialEntries: ['/initial-path'],
      });
      const { rerender } = render(
        <Router history={history}>
          <NamespaceContext.Provider value={undefined}>
            <EnhancedCompareV1 {...generateProps()} />
          </NamespaceContext.Provider>
        </Router>,
      );
      expect(history.location.pathname).toEqual('/initial-path');
      rerender(
        <Router history={history}>
          <NamespaceContext.Provider value='ns1'>
            <EnhancedCompareV1 {...generateProps()} />
          </NamespaceContext.Provider>
        </Router>,
      );
      expect(history.location.pathname).toEqual('/initial-path');
    });
  });
});
