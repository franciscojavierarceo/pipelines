/*
 * Copyright 2021 Arrikto Inc.
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
import * as Utils from '../lib/Utils';
import RecurringRunList, { RecurringRunListProps } from './RecurringRunList';
import TestUtils from '../TestUtils';
import produce from 'immer';
import { Apis, JobSortKeys, ListRequest } from '../lib/Apis';
import { render, screen, fireEvent } from '@testing-library/react';
import { range } from 'lodash';
import { V2beta1RecurringRun, V2beta1RecurringRunStatus } from '../apisv2beta1/recurringrun';

class RecurringRunListTest extends RecurringRunList {
  public _loadRecurringRuns(request: ListRequest): Promise<string> {
    return super._loadRecurringRuns(request);
  }
}

describe('RecurringRunList', () => {
  let tree: any;

  const onErrorSpy = jest.fn();
  const listRecurringRunsSpy = jest.spyOn(Apis.recurringRunServiceApi, 'listRecurringRuns');
  const getRecurringRunSpy = jest.spyOn(Apis.recurringRunServiceApi, 'getRecurringRun');
  const listExperimentsSpy = jest.spyOn(Apis.experimentServiceApiV2, 'listExperiments');
  // We mock this because it uses toLocaleDateString, which causes mismatches between local and CI
  // test environments
  const formatDateStringSpy = jest.spyOn(Utils, 'formatDateString');

  function generateProps(): RecurringRunListProps {
    return {
      history: {} as any,
      location: { search: '' } as any,
      match: '' as any,
      onError: onErrorSpy,
      refreshCount: 1,
    };
  }

  function mockNRecurringRuns(n: number, recurringRunTemplate: Partial<V2beta1RecurringRun>): void {
    getRecurringRunSpy.mockImplementation(id =>
      Promise.resolve(
        produce(recurringRunTemplate, draft => {
          draft.recurring_run_id = id;
          draft.display_name = 'recurring run with id: ' + id;
        }),
      ),
    );

    listRecurringRunsSpy.mockImplementation(() =>
      Promise.resolve({
        recurringRuns: range(1, n + 1).map(i => {
          if (recurringRunTemplate) {
            return produce(recurringRunTemplate as Partial<V2beta1RecurringRun>, draft => {
              draft.recurring_run_id = 'testrecurringrun' + i;
              draft.display_name = 'recurring run with id: testrecurringrun' + i;
            });
          }
          return {
            recurring_run_id: 'testrecurringrun' + i,
            display_name: 'recurring run with id: testrecurringrun' + i,
          } as V2beta1RecurringRun;
        }),
      }),
    );

    listExperimentsSpy.mockImplementation(() => ({ display_name: 'some experiment' }));
  }

  function getMountedInstance(): RecurringRunList {
    tree = TestUtils.renderWithRouter(<RecurringRunList {...generateProps()} />);
    return tree.container.querySelector('RecurringRunList') as any;
  }

  beforeEach(() => {
    formatDateStringSpy.mockImplementation((date?: Date) => {
      return date ? '1/2/2019, 12:34:56 PM' : '-';
    });
    onErrorSpy.mockClear();
    listRecurringRunsSpy.mockClear();
    getRecurringRunSpy.mockClear();
    listExperimentsSpy.mockClear();
  });

  afterEach(async () => {
    // cleanup should be called before resetAllMocks() in case any part of the cleanup life cycle
    // depends on mocks/spies
    jest.resetAllMocks();
  });

  it('renders the empty experience', () => {
    const { container } = render(<RecurringRunList {...generateProps()} />);
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        <div
          class="pageOverflowHidden"
        >
          <div>
            <div
              class="MuiFormControl-root-1 filterBox"
              spellcheck="false"
              style="height: 48px; max-width: 100%; width: 100%;"
            >
              <label
                class="MuiFormLabel-root-16 MuiInputLabel-root-5 noMargin MuiInputLabel-formControl-10 MuiInputLabel-animated-13 MuiInputLabel-shrink-12 MuiInputLabel-outlined-15"
                data-shrink="true"
                for="tableFilterBox"
              >
                Filter recurring runs
              </label>
              <div
                class="MuiInputBase-root-36 MuiOutlinedInput-root-23 noLeftPadding MuiInputBase-formControl-37 MuiInputBase-adornedStart-40 MuiOutlinedInput-adornedStart-26"
              >
                <fieldset
                  aria-hidden="true"
                  class="MuiPrivateNotchedOutline-root-53 MuiOutlinedInput-notchedOutline-30 filterBorderRadius"
                  style="padding-left: 8px;"
                >
                  <legend
                    class="MuiPrivateNotchedOutline-legend-54"
                    style="width: 0px;"
                  >
                    <span>
                      ​
                    </span>
                  </legend>
                </fieldset>
                <div
                  class="MuiInputAdornment-root-55 MuiInputAdornment-positionEnd-58"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-60"
                    focusable="false"
                    role="presentation"
                    style="color: rgb(128, 134, 139); padding-right: 16px;"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"
                    />
                    <path
                      d="M0 0h24v24H0z"
                      fill="none"
                    />
                  </svg>
                </div>
                <input
                  aria-invalid="false"
                  class="MuiInputBase-input-46 MuiOutlinedInput-input-31 MuiInputBase-inputAdornedStart-51 MuiOutlinedInput-inputAdornedStart-34"
                  id="tableFilterBox"
                  type="text"
                  value=""
                />
              </div>
            </div>
          </div>
          <div
            class="header"
          >
            <div
              class="columnName cell selectionToggle"
            >
              <span
                class="MuiButtonBase-root-85 MuiIconButton-root-79 MuiPrivateSwitchBase-root-75 MuiCheckbox-root-69 MuiCheckbox-colorPrimary-73"
              >
                <span
                  class="MuiIconButton-label-84"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-60"
                    focusable="false"
                    role="presentation"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                  <input
                    class="MuiPrivateSwitchBase-input-78"
                    data-indeterminate="false"
                    type="checkbox"
                    value=""
                  />
                </span>
                <span
                  class="MuiTouchRipple-root-125"
                />
              </span>
            </div>
            <div
              class="columnName"
              style="width: 30%;"
              title="Recurring Run Name"
            >
              <span
                class="MuiButtonBase-root-85 MuiTableSortLabel-root-96 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Recurring Run Name
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-60 MuiTableSortLabel-icon-98 MuiTableSortLabel-iconDirectionDesc-99"
                  focusable="false"
                  role="presentation"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"
                  />
                </svg>
              </span>
            </div>
            <div
              class="columnName"
              style="width: 10%;"
              title="Status"
            >
              <span
                class="MuiButtonBase-root-85 MuiTableSortLabel-root-96 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Status
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-60 MuiTableSortLabel-icon-98 MuiTableSortLabel-iconDirectionDesc-99"
                  focusable="false"
                  role="presentation"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"
                  />
                </svg>
              </span>
            </div>
            <div
              class="columnName"
              style="width: 20%;"
              title="Trigger"
            >
              <span
                class="MuiButtonBase-root-85 MuiTableSortLabel-root-96 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Trigger
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-60 MuiTableSortLabel-icon-98 MuiTableSortLabel-iconDirectionDesc-99"
                  focusable="false"
                  role="presentation"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"
                  />
                </svg>
              </span>
            </div>
            <div
              class="columnName"
              style="width: 20%;"
              title="Experiment"
            >
              <span
                class="MuiButtonBase-root-85 MuiTableSortLabel-root-96 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Experiment
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-60 MuiTableSortLabel-icon-98 MuiTableSortLabel-iconDirectionDesc-99"
                  focusable="false"
                  role="presentation"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"
                  />
                </svg>
              </span>
            </div>
            <div
              class="columnName"
              style="width: 20%;"
              title="Created at"
            >
              <span
                class="MuiButtonBase-root-85 MuiTableSortLabel-root-96 MuiTableSortLabel-active-97 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Created at
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-60 MuiTableSortLabel-icon-98 MuiTableSortLabel-iconDirectionDesc-99"
                  focusable="false"
                  role="presentation"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div
            class="scrollContainer"
            style="min-height: 60px;"
          >
            <div
              class="busyOverlay"
            />
            <div
              class="MuiCircularProgress-root-132 MuiCircularProgress-colorPrimary-135 MuiCircularProgress-indeterminate-134 absoluteCenter"
              role="progressbar"
              style="width: 25px; height: 25px; z-index: 2;"
            >
              <svg
                class="MuiCircularProgress-svg-137"
                viewBox="22 22 44 44"
              >
                <circle
                  class="MuiCircularProgress-circle-138 MuiCircularProgress-circleIndeterminate-140"
                  cx="44"
                  cy="44"
                  fill="none"
                  r="20.2"
                  stroke-width="3.6"
                />
              </svg>
            </div>
          </div>
          <div
            class="footer"
          >
            <span
              class=""
            >
              Rows per page:
            </span>
            <div
              class="MuiFormControl-root-1 verticalAlignInitial rowsPerPage"
            >
              <div
                class="MuiInputBase-root-36 MuiInput-root-108 MuiInputBase-formControl-37 MuiInput-formControl-109"
              >
                <div
                  class="MuiSelect-root-101"
                >
                  <div
                    aria-haspopup="true"
                    aria-pressed="false"
                    class="MuiSelect-select-102 MuiSelect-selectMenu-105 MuiInputBase-input-46 MuiInput-input-116"
                    role="button"
                    tabindex="0"
                  >
                    10
                  </div>
                  <input
                    type="hidden"
                    value="10"
                  />
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-60 MuiSelect-icon-107"
                    focusable="false"
                    role="presentation"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7 10l5 5 5-5z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <button
              class="MuiButtonBase-root-85 MuiButtonBase-disabled-86 MuiIconButton-root-79 MuiIconButton-disabled-83"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-84"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-60"
                  focusable="false"
                  role="presentation"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                  />
                  <path
                    d="M0 0h24v24H0z"
                    fill="none"
                  />
                </svg>
              </span>
            </button>
            <button
              class="MuiButtonBase-root-85 MuiIconButton-root-79"
              tabindex="0"
              type="button"
            >
              <span
                class="MuiIconButton-label-84"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-60"
                  focusable="false"
                  role="presentation"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                  />
                  <path
                    d="M0 0h24v24H0z"
                    fill="none"
                  />
                </svg>
              </span>
              <span
                class="MuiTouchRipple-root-125"
              />
            </button>
          </div>
        </div>
      </div>
    `);
  });

  it('loads one recurring run', async () => {
    mockNRecurringRuns(1, {});
    const props = generateProps();
    const { container } = render(<RecurringRunList {...props} />);
    tree = container;
    await (container.querySelector('RecurringRunList') as any)._loadRecurringRuns({});
    expect(Apis.recurringRunServiceApi.listRecurringRuns).toHaveBeenLastCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    expect(props.onError).not.toHaveBeenCalled();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        <CustomTable
          columns={
            Array [
              Object {
                "customRenderer": [Function],
                "flex": 1.5,
                "label": "Recurring Run Name",
                "sortKey": "name",
              },
              Object {
                "customRenderer": [Function],
                "flex": 0.5,
                "label": "Status",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Trigger",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Experiment",
              },
              Object {
                "flex": 1,
                "label": "Created at",
                "sortKey": "created_at",
              },
            ]
          }
          emptyMessage="No available recurring runs found."
          filterLabel="Filter recurring runs"
          initialSortColumn="created_at"
          reload={[Function]}
          rows={
            Array [
              Object {
                "error": undefined,
                "id": "testrecurringrun1",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun1",
                  undefined,
                  undefined,
                  undefined,
                  "-",
                ],
              },
            ]
          }
        />
      </div>
    `);
  });

  it('reloads the recurring run when refresh is called', async () => {
    mockNRecurringRuns(0, {});
    const props = generateProps();
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await (tree.container.querySelector('RecurringRunList') as any).refresh();
    expect(Apis.recurringRunServiceApi.listRecurringRuns).toHaveBeenCalledTimes(2);
    expect(Apis.recurringRunServiceApi.listRecurringRuns).toHaveBeenLastCalledWith(
      '',
      10,
      JobSortKeys.CREATED_AT + ' desc',
      undefined,
      '',
      undefined,
    );
    expect(props.onError).not.toHaveBeenCalled();
  });

  it('loads multiple recurring runs', async () => {
    mockNRecurringRuns(5, {});
    const props = generateProps();
    const { container } = render(<RecurringRunList {...props} />);
    tree = container;
    await (container.querySelector('RecurringRunList') as any)._loadRecurringRuns({});
    expect(props.onError).not.toHaveBeenCalled();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        <CustomTable
          columns={
            Array [
              Object {
                "customRenderer": [Function],
                "flex": 1.5,
                "label": "Recurring Run Name",
                "sortKey": "name",
              },
              Object {
                "customRenderer": [Function],
                "flex": 0.5,
                "label": "Status",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Trigger",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Experiment",
              },
              Object {
                "flex": 1,
                "label": "Created at",
                "sortKey": "created_at",
              },
            ]
          }
          emptyMessage="No available recurring runs found."
          filterLabel="Filter recurring runs"
          initialSortColumn="created_at"
          reload={[Function]}
          rows={
            Array [
              Object {
                "error": undefined,
                "id": "testrecurringrun1",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun1",
                  undefined,
                  undefined,
                  undefined,
                  "-",
                ],
              },
              Object {
                "error": undefined,
                "id": "testrecurringrun2",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun2",
                  undefined,
                  undefined,
                  undefined,
                  "-",
                ],
              },
              Object {
                "error": undefined,
                "id": "testrecurringrun3",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun3",
                  undefined,
                  undefined,
                  undefined,
                  "-",
                ],
              },
              Object {
                "error": undefined,
                "id": "testrecurringrun4",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun4",
                  undefined,
                  undefined,
                  undefined,
                  "-",
                ],
              },
              Object {
                "error": undefined,
                "id": "testrecurringrun5",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun5",
                  undefined,
                  undefined,
                  undefined,
                  "-",
                ],
              },
            ]
          }
        />
      </div>
    `);
  });

  it('calls error callback when loading recurring runs fails', async () => {
    TestUtils.makeErrorResponseOnce(
      jest.spyOn(Apis.recurringRunServiceApi, 'listRecurringRuns'),
      'bad stuff happened',
    );
    const props = generateProps();
    const { container } = render(<RecurringRunList {...props} />);
    tree = container;
    await (container.querySelector('RecurringRunList') as any)._loadRecurringRuns({});
    expect(props.onError).toHaveBeenLastCalledWith(
      'Error: failed to fetch recurring runs.',
      new Error('bad stuff happened'),
    );
  });

  it('loads recurring runs for a given experiment id', async () => {
    mockNRecurringRuns(1, {});
    const props = generateProps();
    props.experimentIdMask = 'experiment1';
    const { container } = render(<RecurringRunList {...props} />);
    tree = container;
    await (container.querySelector('RecurringRunList') as any)._loadRecurringRuns({});
    expect(props.onError).not.toHaveBeenCalled();
    expect(Apis.recurringRunServiceApi.listRecurringRuns).toHaveBeenLastCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'experiment1',
    );
  });

  it('loads recurring runs for a given namespace', async () => {
    mockNRecurringRuns(1, {});
    const props = generateProps();
    props.namespaceMask = 'namespace1';
    const { container } = render(<RecurringRunList {...props} />);
    tree = container;
    await (container.querySelector('RecurringRunList') as any)._loadRecurringRuns({});
    expect(props.onError).not.toHaveBeenCalled();
    expect(Apis.recurringRunServiceApi.listRecurringRuns).toHaveBeenLastCalledWith(
      undefined,
      undefined,
      undefined,
      'namespace1',
      undefined,
      undefined,
    );
  });

  it('loads given list of recurring runs only', async () => {
    mockNRecurringRuns(5, {});
    const props = generateProps();
    props.recurringRunIdListMask = ['recurring run1', 'recurring run2'];
    const { container } = render(<RecurringRunList {...props} />);
    tree = container;
    await (container.querySelector('RecurringRunList') as any)._loadRecurringRuns({});
    expect(props.onError).not.toHaveBeenCalled();
    expect(Apis.recurringRunServiceApi.listRecurringRuns).not.toHaveBeenCalled();
    expect(Apis.recurringRunServiceApi.getRecurringRun).toHaveBeenCalledTimes(2);
    expect(Apis.recurringRunServiceApi.getRecurringRun).toHaveBeenCalledWith('recurring run1');
    expect(Apis.recurringRunServiceApi.getRecurringRun).toHaveBeenCalledWith('recurring run2');
  });

  it('shows recurring run status', async () => {
    mockNRecurringRuns(1, {
      status: V2beta1RecurringRunStatus.ENABLED,
    });
    const props = generateProps();
    const { container } = render(<RecurringRunList {...props} />);
    tree = container;
    await (container.querySelector('RecurringRunList') as any)._loadRecurringRuns({});
    expect(props.onError).not.toHaveBeenCalled();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        <CustomTable
          columns={
            Array [
              Object {
                "customRenderer": [Function],
                "flex": 1.5,
                "label": "Recurring Run Name",
                "sortKey": "name",
              },
              Object {
                "customRenderer": [Function],
                "flex": 0.5,
                "label": "Status",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Trigger",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Experiment",
              },
              Object {
                "flex": 1,
                "label": "Created at",
                "sortKey": "created_at",
              },
            ]
          }
          emptyMessage="No available recurring runs found."
          filterLabel="Filter recurring runs"
          initialSortColumn="created_at"
          reload={[Function]}
          rows={
            Array [
              Object {
                "error": undefined,
                "id": "testrecurringrun1",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun1",
                  "ENABLED",
                  undefined,
                  undefined,
                  "-",
                ],
              },
            ]
          }
        />
      </div>
    `);
  });

  it('shows trigger periodic', async () => {
    mockNRecurringRuns(1, {
      trigger: { periodic_schedule: { interval_second: '3600' } },
    });
    const props = generateProps();
    const { container } = render(<RecurringRunList {...props} />);
    tree = container;
    await (container.querySelector('RecurringRunList') as any)._loadRecurringRuns({});
    expect(props.onError).not.toHaveBeenCalled();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        <CustomTable
          columns={
            Array [
              Object {
                "customRenderer": [Function],
                "flex": 1.5,
                "label": "Recurring Run Name",
                "sortKey": "name",
              },
              Object {
                "customRenderer": [Function],
                "flex": 0.5,
                "label": "Status",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Trigger",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Experiment",
              },
              Object {
                "flex": 1,
                "label": "Created at",
                "sortKey": "created_at",
              },
            ]
          }
          emptyMessage="No available recurring runs found."
          filterLabel="Filter recurring runs"
          initialSortColumn="created_at"
          reload={[Function]}
          rows={
            Array [
              Object {
                "error": undefined,
                "id": "testrecurringrun1",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun1",
                  undefined,
                  Object {
                    "periodic_schedule": Object {
                      "interval_second": "3600",
                    },
                  },
                  undefined,
                  "-",
                ],
              },
            ]
          }
        />
      </div>
    `);
  });

  it('shows trigger cron', async () => {
    mockNRecurringRuns(1, {
      trigger: { cron_schedule: { cron: '0 * * * * ?' } },
    });
    const props = generateProps();
    const { container } = render(<RecurringRunList {...props} />);
    tree = container;
    await (container.querySelector('RecurringRunList') as any)._loadRecurringRuns({});
    expect(props.onError).not.toHaveBeenCalled();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        <CustomTable
          columns={
            Array [
              Object {
                "customRenderer": [Function],
                "flex": 1.5,
                "label": "Recurring Run Name",
                "sortKey": "name",
              },
              Object {
                "customRenderer": [Function],
                "flex": 0.5,
                "label": "Status",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Trigger",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Experiment",
              },
              Object {
                "flex": 1,
                "label": "Created at",
                "sortKey": "created_at",
              },
            ]
          }
          emptyMessage="No available recurring runs found."
          filterLabel="Filter recurring runs"
          initialSortColumn="created_at"
          reload={[Function]}
          rows={
            Array [
              Object {
                "error": undefined,
                "id": "testrecurringrun1",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun1",
                  undefined,
                  Object {
                    "cron_schedule": Object {
                      "cron": "0 * * * * ?",
                    },
                  },
                  undefined,
                  "-",
                ],
              },
            ]
          }
        />
      </div>
    `);
  });

  it('shows experiment name', async () => {
    mockNRecurringRuns(1, {
      experiment_id: 'test-experiment-id',
    });
    listExperimentsSpy.mockImplementationOnce(() => ({
      experiments: [
        {
          experiment_id: 'test-experiment-id',
          display_name: 'test experiment',
        },
      ],
    }));
    const props = generateProps();
    tree = shallow(<RecurringRunList {...props} />);
    await (tree.instance() as RecurringRunListTest)._loadRecurringRuns({});
    expect(props.onError).not.toHaveBeenCalled();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        <CustomTable
          columns={
            Array [
              Object {
                "customRenderer": [Function],
                "flex": 1.5,
                "label": "Recurring Run Name",
                "sortKey": "name",
              },
              Object {
                "customRenderer": [Function],
                "flex": 0.5,
                "label": "Status",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Trigger",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Experiment",
              },
              Object {
                "flex": 1,
                "label": "Created at",
                "sortKey": "created_at",
              },
            ]
          }
          emptyMessage="No available recurring runs found."
          filterLabel="Filter recurring runs"
          initialSortColumn="created_at"
          reload={[Function]}
          rows={
            Array [
              Object {
                "error": undefined,
                "id": "testrecurringrun1",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun1",
                  undefined,
                  undefined,
                  Object {
                    "displayName": "test experiment",
                    "id": "test-experiment-id",
                  },
                  "-",
                ],
              },
            ]
          }
        />
      </div>
    `);
  });

  it('hides experiment name if instructed', async () => {
    mockNRecurringRuns(1, {
      experiment_id: 'test-experiment-id',
    });
    listExperimentsSpy.mockImplementationOnce(() => ({ display_name: 'test experiment' }));
    const props = generateProps();
    props.hideExperimentColumn = true;
    tree = shallow(<RecurringRunList {...props} />);
    await (tree.instance() as RecurringRunListTest)._loadRecurringRuns({});
    expect(props.onError).not.toHaveBeenCalled();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        <CustomTable
          columns={
            Array [
              Object {
                "customRenderer": [Function],
                "flex": 1.5,
                "label": "Recurring Run Name",
                "sortKey": "name",
              },
              Object {
                "customRenderer": [Function],
                "flex": 0.5,
                "label": "Status",
              },
              Object {
                "customRenderer": [Function],
                "flex": 1,
                "label": "Trigger",
              },
              Object {
                "flex": 1,
                "label": "Created at",
                "sortKey": "created_at",
              },
            ]
          }
          emptyMessage="No available recurring runs found."
          filterLabel="Filter recurring runs"
          initialSortColumn="created_at"
          reload={[Function]}
          rows={
            Array [
              Object {
                "error": undefined,
                "id": "testrecurringrun1",
                "otherFields": Array [
                  "recurring run with id: testrecurringrun1",
                  undefined,
                  undefined,
                  "-",
                ],
              },
            ]
          }
        />
      </div>
    `);
  });

  it('renders recurring run trigger in seconds', () => {
    expect(
      getMountedInstance()._triggerCustomRenderer({
        value: { periodic_schedule: { interval_second: '42' } },
        id: 'recurring run-id',
      }),
    ).toMatchInlineSnapshot(`
      <div>
        Every 
        42
         seconds
      </div>
    `);
  });

  it('renders recurring run trigger in minutes', () => {
    expect(
      getMountedInstance()._triggerCustomRenderer({
        value: { periodic_schedule: { interval_second: '120' } },
        id: 'recurring run-id',
      }),
    ).toMatchInlineSnapshot(`
      <div>
        Every 
        2
         minutes
      </div>
    `);
  });

  it('renders recurring run trigger in hours', () => {
    expect(
      getMountedInstance()._triggerCustomRenderer({
        value: { periodic_schedule: { interval_second: '7200' } },
        id: 'recurring run-id',
      }),
    ).toMatchInlineSnapshot(`
      <div>
        Every 
        2
         hours
      </div>
    `);
  });

  it('renders recurring run trigger in days', () => {
    expect(
      getMountedInstance()._triggerCustomRenderer({
        value: { periodic_schedule: { interval_second: '86400' } },
        id: 'recurring run-id',
      }),
    ).toMatchInlineSnapshot(`
      <div>
        Every 
        1
         days
      </div>
    `);
  });

  it('renders recurring run trigger as cron', () => {
    expect(
      getMountedInstance()._triggerCustomRenderer({
        value: { cron_schedule: { cron: '0 * * * * ?' } },
        id: 'recurring run-id',
      }),
    ).toMatchInlineSnapshot(`
      <div>
        Cron: 
        0 * * * * ?
      </div>
    `);
  });

  it('renders status enabled', () => {
    expect(
      getMountedInstance()._statusCustomRenderer({
        value: 'Enabled',
        id: 'recurring run-id',
      }),
    ).toMatchInlineSnapshot(`
      <div
        style={
          Object {
            "color": "#d50000",
          }
        }
      >
        Enabled
      </div>
    `);
  });

  it('renders status disabled', () => {
    expect(
      getMountedInstance()._statusCustomRenderer({
        value: 'Disabled',
        id: 'recurring run-id',
      }),
    ).toMatchInlineSnapshot(`
      <div
        style={
          Object {
            "color": "#d50000",
          }
        }
      >
        Disabled
      </div>
    `);
  });

  it('renders status unknown', () => {
    expect(
      getMountedInstance()._statusCustomRenderer({
        value: 'Unknown Status',
        id: 'recurring run-id',
      }),
    ).toMatchInlineSnapshot(`
      <div
        style={
          Object {
            "color": "#d50000",
          }
        }
      >
        Unknown Status
      </div>
    `);
  });
});
