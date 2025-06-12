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
import PipelineVersionList, { PipelineVersionListProps } from './PipelineVersionList';
import TestUtils from '../TestUtils';
import { V2beta1PipelineVersion } from '../apisv2beta1/pipeline';
import { Apis, ListRequest } from '../lib/Apis';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import { range } from 'lodash';

class PipelineVersionListTest extends PipelineVersionList {
  public _loadPipelineVersions(request: ListRequest): Promise<string> {
    return super._loadPipelineVersions(request);
  }
}

describe('PipelineVersionList', () => {
  let tree: RenderResult;

  const listPipelineVersionsSpy = jest.spyOn(Apis.pipelineServiceApiV2, 'listPipelineVersions');
  const onErrorSpy = jest.fn();

  function generateProps(): PipelineVersionListProps {
    return {
      history: {} as any,
      location: { search: '' } as any,
      match: '' as any,
      onError: onErrorSpy,
      pipelineId: 'pipeline',
    };
  }

  async function mountWithNPipelineVersions(n: number): Promise<RenderResult> {
    listPipelineVersionsSpy.mockResolvedValue({
      pipeline_versions: range(n).map(i => ({
        pipeline_version_id: 'test-pipeline-version-id' + i,
        display_name: 'test pipeline version name' + i,
      })),
    });
    tree = TestUtils.renderWithRouter(<PipelineVersionList {...generateProps()} />);
    await TestUtils.flushPromises();
    return tree;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    listPipelineVersionsSpy.mockResolvedValue({ pipeline_versions: [] });
  });

  afterEach(async () => {
    // unmount() should be called before resetAllMocks() in case any part of the unmount life cycle
    // depends on mocks/spies
    tree.unmount();
    jest.resetAllMocks();
  });

  it('renders an empty list with empty state message', () => {
    tree = TestUtils.renderWithRouter(<PipelineVersionList {...generateProps()} />);
    expect(tree.container).toMatchSnapshot();
  });

  it('renders a list of one pipeline version', async () => {
    const props = generateProps();
    tree = TestUtils.renderWithRouter(<PipelineVersionList {...props} />);
    await listPipelineVersionsSpy;
    expect(tree.container).toMatchSnapshot();
  });

  it('renders a list of one pipeline version with description', async () => {
    const props = generateProps();
    tree = TestUtils.renderWithRouter(<PipelineVersionList {...props} />);
    await listPipelineVersionsSpy;
    expect(tree.container).toMatchSnapshot();
  });

  it('renders a list of one pipeline version without created date', async () => {
    const props = generateProps();
    tree = TestUtils.renderWithRouter(<PipelineVersionList {...props} />);
    await listPipelineVersionsSpy;
    expect(tree.container).toMatchSnapshot();
  });

  it('renders a list of one pipeline version with error', async () => {
    const props = generateProps();
    tree = TestUtils.renderWithRouter(<PipelineVersionList {...props} />);
    await listPipelineVersionsSpy;
    expect(tree.container).toMatchSnapshot();
  });

  it('calls Apis to list pipeline versions, sorted by creation time in descending order', async () => {
    tree = await mountWithNPipelineVersions(2);
    expect(listPipelineVersionsSpy).toHaveBeenCalled();
    expect(tree.container).toMatchSnapshot();
  });

  it('calls Apis to list pipeline versions, sorted by pipeline version name in descending order', async () => {
    tree = await mountWithNPipelineVersions(3);
    expect(listPipelineVersionsSpy).toHaveBeenCalled();
    expect(tree.container).toMatchSnapshot();
  });
});
