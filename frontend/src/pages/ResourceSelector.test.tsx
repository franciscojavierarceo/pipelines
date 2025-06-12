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
import ResourceSelector, { ResourceSelectorProps, BaseResource } from './ResourceSelector';
import TestUtils from '../TestUtils';
import { ListRequest } from '../lib/Apis';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Row } from '../components/CustomTable';

class TestResourceSelector extends ResourceSelector {
  public async _load(request: ListRequest): Promise<string> {
    return super._load(request);
  }

  public _selectionChanged(selectedIds: string[]): void {
    return super._selectionChanged(selectedIds);
  }

  public _resourcesToRow(resources: BaseResource[]): Row[] {
    return super._resourcesToRow(resources);
  }
}

let testResourceSelectorRef: TestResourceSelector | null = null;

describe('ResourceSelector', () => {
  let renderResult: any;

  const updateDialogSpy = jest.fn();
  const selectionChangedCbSpy = jest.fn();
  const listResourceSpy = jest.fn();
  const RESOURCES: BaseResource[] = [
    {
      created_at: new Date(2018, 1, 2, 3, 4, 5),
      description: 'test-1 description',
      id: 'some-id-1',
      name: 'test-1 name',
    },
    {
      created_at: new Date(2018, 10, 9, 8, 7, 6),
      description: 'test-2 description',
      id: 'some-2-id',
      name: 'test-2 name',
    },
  ];

  const selectorColumns = [
    { label: 'Resource name', flex: 1, sortKey: 'name' },
    { label: 'Description', flex: 1.5 },
    { label: 'Uploaded on', flex: 1, sortKey: 'created_at' },
  ];

  const testEmptyMessage = 'Test - Sorry, no resources.';
  const testTitle = 'A test selector';

  function generateProps(): ResourceSelectorProps {
    return {
      columns: selectorColumns,
      emptyMessage: testEmptyMessage,
      filterLabel: 'test filter label',
      history: {} as any,
      initialSortColumn: 'created_at',
      listApi: listResourceSpy as any,
      location: '' as any,
      match: {} as any,
      selectionChanged: selectionChangedCbSpy,
      title: testTitle,
      updateDialog: updateDialogSpy,
    };
  }

  beforeEach(() => {
    testResourceSelectorRef = null;
    listResourceSpy.mockReset();
    listResourceSpy.mockImplementation(() => ({
      nextPageToken: 'test-next-page-token',
      resources: RESOURCES,
    }));
    updateDialogSpy.mockReset();
    selectionChangedCbSpy.mockReset();
  });

  afterEach(async () => {
    // unmount() should be called before resetAllMocks() in case any part of the unmount life cycle
    // depends on mocks/spies
    if (renderResult && renderResult.unmount) {
      renderResult.unmount();
    }
  });

  it('displays resource selector', async () => {
    listResourceSpy.mockClear();
    renderResult = render(
      <TestResourceSelector 
        {...generateProps()} 
        ref={(ref: TestResourceSelector) => { testResourceSelectorRef = ref; }}
      />
    );
    
    await waitFor(() => {
      expect(testResourceSelectorRef).not.toBeNull();
    });
    
    if (testResourceSelectorRef) {
      await testResourceSelectorRef._load({});
    }

    expect(listResourceSpy).toHaveBeenCalledTimes(2);
    expect(listResourceSpy).toHaveBeenLastCalledWith(undefined, undefined, undefined, undefined);
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  it('converts resources into a table rows', async () => {
    const props = generateProps();
    const resources: BaseResource[] = [
      {
        created_at: new Date(2018, 1, 2, 3, 4, 5),
        description: 'a description',
        id: 'an-id',
        name: 'a name',
      },
    ];
    listResourceSpy.mockReset();
    listResourceSpy.mockImplementation(() => ({ resources, nextPageToken: '' }));
    props.listApi = listResourceSpy as any;

    renderResult = render(
      <TestResourceSelector 
        {...props} 
        ref={(ref: TestResourceSelector) => { testResourceSelectorRef = ref; }}
      />
    );
    
    await waitFor(() => {
      expect(testResourceSelectorRef).not.toBeNull();
    });
    
    if (testResourceSelectorRef) {
      await testResourceSelectorRef._load({});
    }

    expect(screen.getByText('a name')).toBeInTheDocument();
    expect(screen.getByText('a description')).toBeInTheDocument();
  });

  it('shows error dialog if listing fails', async () => {
    listResourceSpy.mockReset();
    TestUtils.makeErrorResponseOnce(listResourceSpy, 'woops!');
    jest.spyOn(console, 'error').mockImplementation();

    renderResult = render(
      <TestResourceSelector 
        {...generateProps()} 
        ref={(ref: TestResourceSelector) => { testResourceSelectorRef = ref; }}
      />
    );
    
    await waitFor(() => {
      expect(testResourceSelectorRef).not.toBeNull();
    });
    
    if (testResourceSelectorRef) {
      await testResourceSelectorRef._load({});
    }

    expect(listResourceSpy).toHaveBeenCalledTimes(2);
    expect(updateDialogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'List request failed with:\nwoops!',
        title: 'Error retrieving resources',
      }),
    );
  });

  it('calls selection callback when a resource is selected', async () => {
    renderResult = render(
      <TestResourceSelector 
        {...generateProps()} 
        ref={(ref: TestResourceSelector) => { testResourceSelectorRef = ref; }}
      />
    );
    
    await waitFor(() => {
      expect(testResourceSelectorRef).not.toBeNull();
    });
    
    if (testResourceSelectorRef) {
      await testResourceSelectorRef._load({});
      testResourceSelectorRef._selectionChanged([RESOURCES[1].id!]);
    }
    
    expect(selectionChangedCbSpy).toHaveBeenLastCalledWith(RESOURCES[1].id!);
  });

  it('logs error if more than one resource is selected', async () => {
    renderResult = render(
      <TestResourceSelector 
        {...generateProps()} 
        ref={(ref: TestResourceSelector) => { testResourceSelectorRef = ref; }}
      />
    );
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await waitFor(() => {
      expect(testResourceSelectorRef).not.toBeNull();
    });
    
    if (testResourceSelectorRef) {
      await testResourceSelectorRef._load({});
      testResourceSelectorRef._selectionChanged([
        RESOURCES[0].id!,
        RESOURCES[1].id!,
      ]);
    }

    expect(selectionChangedCbSpy).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenLastCalledWith('2 resources were selected somehow', [
      RESOURCES[0].id,
      RESOURCES[1].id,
    ]);
  });
});
