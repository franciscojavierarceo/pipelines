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
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import { range } from 'lodash';
import { V2beta1RecurringRun, V2beta1RecurringRunStatus } from '../apisv2beta1/recurringrun';
import { V2beta1Experiment } from '../apisv2beta1/experiment';

class RecurringRunListTest extends RecurringRunList {
  public _loadRecurringRuns(request: ListRequest): Promise<string> {
    return super._loadRecurringRuns(request);
  }
}

describe('RecurringRunList', () => {
  let tree: RenderResult;

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

  function renderRecurringRunList(props?: Partial<RecurringRunListProps>) {
    const finalProps = { ...generateProps(), ...props };
    tree = TestUtils.renderWithRouter(<RecurringRunList {...finalProps} />);
    return tree;
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
    if (tree) {
      tree.unmount();
    }
    jest.resetAllMocks();
  });

  it('renders the empty experience', () => {
    tree = TestUtils.renderWithRouter(<RecurringRunList {...generateProps()} />);
    expect(tree.container.firstChild).toMatchInlineSnapshot(`
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
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(Apis.recurringRunServiceApi.listRecurringRuns).toHaveBeenLastCalledWith(
      '',
      10,
      'created_at desc',
      undefined,
      '',
      undefined,
    );
    expect(props.onError).not.toHaveBeenCalled();
    expect(tree.container.firstChild).toMatchInlineSnapshot(`
      <div>
        <div
          class="pageOverflowHidden"
        >
          <div>
            <div
              class="MuiFormControl-root-142 filterBox"
              spellcheck="false"
              style="height: 48px; max-width: 100%; width: 100%;"
            >
              <label
                class="MuiFormLabel-root-157 MuiInputLabel-root-146 noMargin MuiInputLabel-formControl-151 MuiInputLabel-animated-154 MuiInputLabel-shrink-153 MuiInputLabel-outlined-156"
                data-shrink="true"
                for="tableFilterBox"
              >
                Filter recurring runs
              </label>
              <div
                class="MuiInputBase-root-177 MuiOutlinedInput-root-164 noLeftPadding MuiInputBase-formControl-178 MuiInputBase-adornedStart-181 MuiOutlinedInput-adornedStart-167"
              >
                <fieldset
                  aria-hidden="true"
                  class="MuiPrivateNotchedOutline-root-194 MuiOutlinedInput-notchedOutline-171 filterBorderRadius"
                  style="padding-left: 8px;"
                >
                  <legend
                    class="MuiPrivateNotchedOutline-legend-195"
                    style="width: 0px;"
                  >
                    <span>
                      ​
                    </span>
                  </legend>
                </fieldset>
                <div
                  class="MuiInputAdornment-root-196 MuiInputAdornment-positionEnd-199"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-201"
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
                  class="MuiInputBase-input-187 MuiOutlinedInput-input-172 MuiInputBase-inputAdornedStart-192 MuiOutlinedInput-inputAdornedStart-175"
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
                class="MuiButtonBase-root-226 MuiIconButton-root-220 MuiPrivateSwitchBase-root-216 MuiCheckbox-root-210 MuiCheckbox-colorPrimary-214"
              >
                <span
                  class="MuiIconButton-label-225"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-201"
                    focusable="false"
                    role="presentation"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                  <input
                    class="MuiPrivateSwitchBase-input-219"
                    data-indeterminate="false"
                    type="checkbox"
                    value=""
                  />
                </span>
                <span
                  class="MuiTouchRipple-root-266"
                />
              </span>
            </div>
            <div
              class="columnName"
              style="width: 30%;"
              title="Recurring Run Name"
            >
              <span
                class="MuiButtonBase-root-226 MuiTableSortLabel-root-237 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Recurring Run Name
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-201 MuiTableSortLabel-icon-239 MuiTableSortLabel-iconDirectionDesc-240"
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
                class="MuiButtonBase-root-226 MuiTableSortLabel-root-237 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Status
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-201 MuiTableSortLabel-icon-239 MuiTableSortLabel-iconDirectionDesc-240"
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
                class="MuiButtonBase-root-226 MuiTableSortLabel-root-237 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Trigger
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-201 MuiTableSortLabel-icon-239 MuiTableSortLabel-iconDirectionDesc-240"
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
                class="MuiButtonBase-root-226 MuiTableSortLabel-root-237 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Experiment
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-201 MuiTableSortLabel-icon-239 MuiTableSortLabel-iconDirectionDesc-240"
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
                class="MuiButtonBase-root-226 MuiTableSortLabel-root-237 MuiTableSortLabel-active-238 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Created at
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-201 MuiTableSortLabel-icon-239 MuiTableSortLabel-iconDirectionDesc-240"
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
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-226 MuiIconButton-root-220 MuiPrivateSwitchBase-root-216 MuiCheckbox-root-210 MuiCheckbox-colorPrimary-214"
                  >
                    <span
                      class="MuiIconButton-label-225"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-201"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-219"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-266"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun1"
                    title="recurring run with id: testrecurringrun1"
                  >
                    recurring run with id: testrecurringrun1
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
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
              class="MuiFormControl-root-142 verticalAlignInitial rowsPerPage"
            >
              <div
                class="MuiInputBase-root-177 MuiInput-root-249 MuiInputBase-formControl-178 MuiInput-formControl-250"
              >
                <div
                  class="MuiSelect-root-242"
                >
                  <div
                    aria-haspopup="true"
                    aria-pressed="false"
                    class="MuiSelect-select-243 MuiSelect-selectMenu-246 MuiInputBase-input-187 MuiInput-input-257"
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
                    class="MuiSvgIcon-root-201 MuiSelect-icon-248"
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
              class="MuiButtonBase-root-226 MuiButtonBase-disabled-227 MuiIconButton-root-220 MuiIconButton-disabled-224"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-225"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-201"
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
              class="MuiButtonBase-root-226 MuiButtonBase-disabled-227 MuiIconButton-root-220 MuiIconButton-disabled-224"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-225"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-201"
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
            </button>
          </div>
        </div>
      </div>
    `);
  });

  it('reloads the recurring run when refresh is called', async () => {
    mockNRecurringRuns(0, {});
    const props = generateProps();
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(Apis.recurringRunServiceApi.listRecurringRuns).toHaveBeenCalledTimes(1);
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
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(props.onError).not.toHaveBeenCalled();
    expect(tree.container.firstChild).toMatchInlineSnapshot(`
      <div>
        <div
          class="pageOverflowHidden"
        >
          <div>
            <div
              class="MuiFormControl-root-424 filterBox"
              spellcheck="false"
              style="height: 48px; max-width: 100%; width: 100%;"
            >
              <label
                class="MuiFormLabel-root-439 MuiInputLabel-root-428 noMargin MuiInputLabel-formControl-433 MuiInputLabel-animated-436 MuiInputLabel-shrink-435 MuiInputLabel-outlined-438"
                data-shrink="true"
                for="tableFilterBox"
              >
                Filter recurring runs
              </label>
              <div
                class="MuiInputBase-root-459 MuiOutlinedInput-root-446 noLeftPadding MuiInputBase-formControl-460 MuiInputBase-adornedStart-463 MuiOutlinedInput-adornedStart-449"
              >
                <fieldset
                  aria-hidden="true"
                  class="MuiPrivateNotchedOutline-root-476 MuiOutlinedInput-notchedOutline-453 filterBorderRadius"
                  style="padding-left: 8px;"
                >
                  <legend
                    class="MuiPrivateNotchedOutline-legend-477"
                    style="width: 0px;"
                  >
                    <span>
                      ​
                    </span>
                  </legend>
                </fieldset>
                <div
                  class="MuiInputAdornment-root-478 MuiInputAdornment-positionEnd-481"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-483"
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
                  class="MuiInputBase-input-469 MuiOutlinedInput-input-454 MuiInputBase-inputAdornedStart-474 MuiOutlinedInput-inputAdornedStart-457"
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
                class="MuiButtonBase-root-508 MuiIconButton-root-502 MuiPrivateSwitchBase-root-498 MuiCheckbox-root-492 MuiCheckbox-colorPrimary-496"
              >
                <span
                  class="MuiIconButton-label-507"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-483"
                    focusable="false"
                    role="presentation"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                  <input
                    class="MuiPrivateSwitchBase-input-501"
                    data-indeterminate="false"
                    type="checkbox"
                    value=""
                  />
                </span>
                <span
                  class="MuiTouchRipple-root-548"
                />
              </span>
            </div>
            <div
              class="columnName"
              style="width: 30%;"
              title="Recurring Run Name"
            >
              <span
                class="MuiButtonBase-root-508 MuiTableSortLabel-root-519 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Recurring Run Name
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-483 MuiTableSortLabel-icon-521 MuiTableSortLabel-iconDirectionDesc-522"
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
                class="MuiButtonBase-root-508 MuiTableSortLabel-root-519 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Status
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-483 MuiTableSortLabel-icon-521 MuiTableSortLabel-iconDirectionDesc-522"
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
                class="MuiButtonBase-root-508 MuiTableSortLabel-root-519 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Trigger
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-483 MuiTableSortLabel-icon-521 MuiTableSortLabel-iconDirectionDesc-522"
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
                class="MuiButtonBase-root-508 MuiTableSortLabel-root-519 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Experiment
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-483 MuiTableSortLabel-icon-521 MuiTableSortLabel-iconDirectionDesc-522"
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
                class="MuiButtonBase-root-508 MuiTableSortLabel-root-519 MuiTableSortLabel-active-520 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Created at
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-483 MuiTableSortLabel-icon-521 MuiTableSortLabel-iconDirectionDesc-522"
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
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-508 MuiIconButton-root-502 MuiPrivateSwitchBase-root-498 MuiCheckbox-root-492 MuiCheckbox-colorPrimary-496"
                  >
                    <span
                      class="MuiIconButton-label-507"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-483"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-501"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-548"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun1"
                    title="recurring run with id: testrecurringrun1"
                  >
                    recurring run with id: testrecurringrun1
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
            </div>
            <div
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-508 MuiIconButton-root-502 MuiPrivateSwitchBase-root-498 MuiCheckbox-root-492 MuiCheckbox-colorPrimary-496"
                  >
                    <span
                      class="MuiIconButton-label-507"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-483"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-501"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-548"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun2"
                    title="recurring run with id: testrecurringrun2"
                  >
                    recurring run with id: testrecurringrun2
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
            </div>
            <div
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-508 MuiIconButton-root-502 MuiPrivateSwitchBase-root-498 MuiCheckbox-root-492 MuiCheckbox-colorPrimary-496"
                  >
                    <span
                      class="MuiIconButton-label-507"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-483"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-501"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-548"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun3"
                    title="recurring run with id: testrecurringrun3"
                  >
                    recurring run with id: testrecurringrun3
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
            </div>
            <div
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-508 MuiIconButton-root-502 MuiPrivateSwitchBase-root-498 MuiCheckbox-root-492 MuiCheckbox-colorPrimary-496"
                  >
                    <span
                      class="MuiIconButton-label-507"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-483"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-501"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-548"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun4"
                    title="recurring run with id: testrecurringrun4"
                  >
                    recurring run with id: testrecurringrun4
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
            </div>
            <div
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-508 MuiIconButton-root-502 MuiPrivateSwitchBase-root-498 MuiCheckbox-root-492 MuiCheckbox-colorPrimary-496"
                  >
                    <span
                      class="MuiIconButton-label-507"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-483"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-501"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-548"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun5"
                    title="recurring run with id: testrecurringrun5"
                  >
                    recurring run with id: testrecurringrun5
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
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
              class="MuiFormControl-root-424 verticalAlignInitial rowsPerPage"
            >
              <div
                class="MuiInputBase-root-459 MuiInput-root-531 MuiInputBase-formControl-460 MuiInput-formControl-532"
              >
                <div
                  class="MuiSelect-root-524"
                >
                  <div
                    aria-haspopup="true"
                    aria-pressed="false"
                    class="MuiSelect-select-525 MuiSelect-selectMenu-528 MuiInputBase-input-469 MuiInput-input-539"
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
                    class="MuiSvgIcon-root-483 MuiSelect-icon-530"
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
              class="MuiButtonBase-root-508 MuiButtonBase-disabled-509 MuiIconButton-root-502 MuiIconButton-disabled-506"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-507"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-483"
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
              class="MuiButtonBase-root-508 MuiButtonBase-disabled-509 MuiIconButton-root-502 MuiIconButton-disabled-506"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-507"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-483"
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
            </button>
          </div>
        </div>
      </div>
    `);
  });

  it('calls error callback when loading recurring runs fails', async () => {
    TestUtils.makeErrorResponseOnce(
      jest.spyOn(Apis.recurringRunServiceApi, 'listRecurringRuns'),
      'bad stuff happened',
    );
    const props = generateProps();
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(props.onError).toHaveBeenLastCalledWith(
      'Error: failed to fetch recurring runs.',
      new Error('bad stuff happened'),
    );
  });

  it('loads recurring runs for a given experiment id', async () => {
    mockNRecurringRuns(1, {});
    const props = generateProps();
    props.experimentIdMask = 'experiment1';
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(props.onError).not.toHaveBeenCalled();
    expect(Apis.recurringRunServiceApi.listRecurringRuns).toHaveBeenLastCalledWith(
      '',
      10,
      'created_at desc',
      undefined,
      '',
      'experiment1',
    );
  });

  it('loads recurring runs for a given namespace', async () => {
    mockNRecurringRuns(1, {});
    const props = generateProps();
    props.namespaceMask = 'namespace1';
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(props.onError).not.toHaveBeenCalled();
    expect(Apis.recurringRunServiceApi.listRecurringRuns).toHaveBeenLastCalledWith(
      '',
      10,
      'created_at desc',
      'namespace1',
      '',
      undefined,
    );
  });

  it('loads given list of recurring runs only', async () => {
    mockNRecurringRuns(5, {});
    const props = generateProps();
    props.recurringRunIdListMask = ['recurring run1', 'recurring run2'];
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
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
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(props.onError).not.toHaveBeenCalled();
    expect(tree.container.firstChild).toMatchInlineSnapshot(`
      <div>
        <div
          class="pageOverflowHidden"
        >
          <div>
            <div
              class="MuiFormControl-root-1129 filterBox"
              spellcheck="false"
              style="height: 48px; max-width: 100%; width: 100%;"
            >
              <label
                class="MuiFormLabel-root-1144 MuiInputLabel-root-1133 noMargin MuiInputLabel-formControl-1138 MuiInputLabel-animated-1141 MuiInputLabel-shrink-1140 MuiInputLabel-outlined-1143"
                data-shrink="true"
                for="tableFilterBox"
              >
                Filter recurring runs
              </label>
              <div
                class="MuiInputBase-root-1164 MuiOutlinedInput-root-1151 noLeftPadding MuiInputBase-formControl-1165 MuiInputBase-adornedStart-1168 MuiOutlinedInput-adornedStart-1154"
              >
                <fieldset
                  aria-hidden="true"
                  class="MuiPrivateNotchedOutline-root-1181 MuiOutlinedInput-notchedOutline-1158 filterBorderRadius"
                  style="padding-left: 8px;"
                >
                  <legend
                    class="MuiPrivateNotchedOutline-legend-1182"
                    style="width: 0px;"
                  >
                    <span>
                      ​
                    </span>
                  </legend>
                </fieldset>
                <div
                  class="MuiInputAdornment-root-1183 MuiInputAdornment-positionEnd-1186"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1188"
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
                  class="MuiInputBase-input-1174 MuiOutlinedInput-input-1159 MuiInputBase-inputAdornedStart-1179 MuiOutlinedInput-inputAdornedStart-1162"
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
                class="MuiButtonBase-root-1213 MuiIconButton-root-1207 MuiPrivateSwitchBase-root-1203 MuiCheckbox-root-1197 MuiCheckbox-colorPrimary-1201"
              >
                <span
                  class="MuiIconButton-label-1212"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1188"
                    focusable="false"
                    role="presentation"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                  <input
                    class="MuiPrivateSwitchBase-input-1206"
                    data-indeterminate="false"
                    type="checkbox"
                    value=""
                  />
                </span>
                <span
                  class="MuiTouchRipple-root-1253"
                />
              </span>
            </div>
            <div
              class="columnName"
              style="width: 30%;"
              title="Recurring Run Name"
            >
              <span
                class="MuiButtonBase-root-1213 MuiTableSortLabel-root-1224 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Recurring Run Name
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1188 MuiTableSortLabel-icon-1226 MuiTableSortLabel-iconDirectionDesc-1227"
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
                class="MuiButtonBase-root-1213 MuiTableSortLabel-root-1224 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Status
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1188 MuiTableSortLabel-icon-1226 MuiTableSortLabel-iconDirectionDesc-1227"
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
                class="MuiButtonBase-root-1213 MuiTableSortLabel-root-1224 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Trigger
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1188 MuiTableSortLabel-icon-1226 MuiTableSortLabel-iconDirectionDesc-1227"
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
                class="MuiButtonBase-root-1213 MuiTableSortLabel-root-1224 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Experiment
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1188 MuiTableSortLabel-icon-1226 MuiTableSortLabel-iconDirectionDesc-1227"
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
                class="MuiButtonBase-root-1213 MuiTableSortLabel-root-1224 MuiTableSortLabel-active-1225 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Created at
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1188 MuiTableSortLabel-icon-1226 MuiTableSortLabel-iconDirectionDesc-1227"
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
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-1213 MuiIconButton-root-1207 MuiPrivateSwitchBase-root-1203 MuiCheckbox-root-1197 MuiCheckbox-colorPrimary-1201"
                  >
                    <span
                      class="MuiIconButton-label-1212"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-1188"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-1206"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-1253"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun1"
                    title="recurring run with id: testrecurringrun1"
                  >
                    recurring run with id: testrecurringrun1
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div
                    style="color: rgb(52, 168, 83);"
                  >
                    ENABLED
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
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
              class="MuiFormControl-root-1129 verticalAlignInitial rowsPerPage"
            >
              <div
                class="MuiInputBase-root-1164 MuiInput-root-1236 MuiInputBase-formControl-1165 MuiInput-formControl-1237"
              >
                <div
                  class="MuiSelect-root-1229"
                >
                  <div
                    aria-haspopup="true"
                    aria-pressed="false"
                    class="MuiSelect-select-1230 MuiSelect-selectMenu-1233 MuiInputBase-input-1174 MuiInput-input-1244"
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
                    class="MuiSvgIcon-root-1188 MuiSelect-icon-1235"
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
              class="MuiButtonBase-root-1213 MuiButtonBase-disabled-1214 MuiIconButton-root-1207 MuiIconButton-disabled-1211"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1212"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1188"
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
              class="MuiButtonBase-root-1213 MuiButtonBase-disabled-1214 MuiIconButton-root-1207 MuiIconButton-disabled-1211"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1212"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1188"
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
            </button>
          </div>
        </div>
      </div>
    `);
  });

  it('shows trigger periodic', async () => {
    mockNRecurringRuns(1, {
      trigger: { periodic_schedule: { interval_second: '3600' } },
    });
    const props = generateProps();
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(props.onError).not.toHaveBeenCalled();
    expect(tree.container.firstChild).toMatchInlineSnapshot(`
      <div>
        <div
          class="pageOverflowHidden"
        >
          <div>
            <div
              class="MuiFormControl-root-1270 filterBox"
              spellcheck="false"
              style="height: 48px; max-width: 100%; width: 100%;"
            >
              <label
                class="MuiFormLabel-root-1285 MuiInputLabel-root-1274 noMargin MuiInputLabel-formControl-1279 MuiInputLabel-animated-1282 MuiInputLabel-shrink-1281 MuiInputLabel-outlined-1284"
                data-shrink="true"
                for="tableFilterBox"
              >
                Filter recurring runs
              </label>
              <div
                class="MuiInputBase-root-1305 MuiOutlinedInput-root-1292 noLeftPadding MuiInputBase-formControl-1306 MuiInputBase-adornedStart-1309 MuiOutlinedInput-adornedStart-1295"
              >
                <fieldset
                  aria-hidden="true"
                  class="MuiPrivateNotchedOutline-root-1322 MuiOutlinedInput-notchedOutline-1299 filterBorderRadius"
                  style="padding-left: 8px;"
                >
                  <legend
                    class="MuiPrivateNotchedOutline-legend-1323"
                    style="width: 0px;"
                  >
                    <span>
                      ​
                    </span>
                  </legend>
                </fieldset>
                <div
                  class="MuiInputAdornment-root-1324 MuiInputAdornment-positionEnd-1327"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1329"
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
                  class="MuiInputBase-input-1315 MuiOutlinedInput-input-1300 MuiInputBase-inputAdornedStart-1320 MuiOutlinedInput-inputAdornedStart-1303"
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
                class="MuiButtonBase-root-1354 MuiIconButton-root-1348 MuiPrivateSwitchBase-root-1344 MuiCheckbox-root-1338 MuiCheckbox-colorPrimary-1342"
              >
                <span
                  class="MuiIconButton-label-1353"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1329"
                    focusable="false"
                    role="presentation"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                  <input
                    class="MuiPrivateSwitchBase-input-1347"
                    data-indeterminate="false"
                    type="checkbox"
                    value=""
                  />
                </span>
                <span
                  class="MuiTouchRipple-root-1394"
                />
              </span>
            </div>
            <div
              class="columnName"
              style="width: 30%;"
              title="Recurring Run Name"
            >
              <span
                class="MuiButtonBase-root-1354 MuiTableSortLabel-root-1365 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Recurring Run Name
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1329 MuiTableSortLabel-icon-1367 MuiTableSortLabel-iconDirectionDesc-1368"
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
                class="MuiButtonBase-root-1354 MuiTableSortLabel-root-1365 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Status
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1329 MuiTableSortLabel-icon-1367 MuiTableSortLabel-iconDirectionDesc-1368"
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
                class="MuiButtonBase-root-1354 MuiTableSortLabel-root-1365 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Trigger
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1329 MuiTableSortLabel-icon-1367 MuiTableSortLabel-iconDirectionDesc-1368"
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
                class="MuiButtonBase-root-1354 MuiTableSortLabel-root-1365 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Experiment
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1329 MuiTableSortLabel-icon-1367 MuiTableSortLabel-iconDirectionDesc-1368"
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
                class="MuiButtonBase-root-1354 MuiTableSortLabel-root-1365 MuiTableSortLabel-active-1366 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Created at
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1329 MuiTableSortLabel-icon-1367 MuiTableSortLabel-iconDirectionDesc-1368"
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
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-1354 MuiIconButton-root-1348 MuiPrivateSwitchBase-root-1344 MuiCheckbox-root-1338 MuiCheckbox-colorPrimary-1342"
                  >
                    <span
                      class="MuiIconButton-label-1353"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-1329"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-1347"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-1394"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun1"
                    title="recurring run with id: testrecurringrun1"
                  >
                    recurring run with id: testrecurringrun1
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    Every 
                    1
                     hours
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
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
              class="MuiFormControl-root-1270 verticalAlignInitial rowsPerPage"
            >
              <div
                class="MuiInputBase-root-1305 MuiInput-root-1377 MuiInputBase-formControl-1306 MuiInput-formControl-1378"
              >
                <div
                  class="MuiSelect-root-1370"
                >
                  <div
                    aria-haspopup="true"
                    aria-pressed="false"
                    class="MuiSelect-select-1371 MuiSelect-selectMenu-1374 MuiInputBase-input-1315 MuiInput-input-1385"
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
                    class="MuiSvgIcon-root-1329 MuiSelect-icon-1376"
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
              class="MuiButtonBase-root-1354 MuiButtonBase-disabled-1355 MuiIconButton-root-1348 MuiIconButton-disabled-1352"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1353"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1329"
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
              class="MuiButtonBase-root-1354 MuiButtonBase-disabled-1355 MuiIconButton-root-1348 MuiIconButton-disabled-1352"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1353"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1329"
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
            </button>
          </div>
        </div>
      </div>
    `);
  });

  it('shows trigger cron', async () => {
    mockNRecurringRuns(1, {
      trigger: { cron_schedule: { cron: '0 * * * * ?' } },
    });
    const props = generateProps();
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(props.onError).not.toHaveBeenCalled();
    expect(tree.container.firstChild).toMatchInlineSnapshot(`
      <div>
        <div
          class="pageOverflowHidden"
        >
          <div>
            <div
              class="MuiFormControl-root-1411 filterBox"
              spellcheck="false"
              style="height: 48px; max-width: 100%; width: 100%;"
            >
              <label
                class="MuiFormLabel-root-1426 MuiInputLabel-root-1415 noMargin MuiInputLabel-formControl-1420 MuiInputLabel-animated-1423 MuiInputLabel-shrink-1422 MuiInputLabel-outlined-1425"
                data-shrink="true"
                for="tableFilterBox"
              >
                Filter recurring runs
              </label>
              <div
                class="MuiInputBase-root-1446 MuiOutlinedInput-root-1433 noLeftPadding MuiInputBase-formControl-1447 MuiInputBase-adornedStart-1450 MuiOutlinedInput-adornedStart-1436"
              >
                <fieldset
                  aria-hidden="true"
                  class="MuiPrivateNotchedOutline-root-1463 MuiOutlinedInput-notchedOutline-1440 filterBorderRadius"
                  style="padding-left: 8px;"
                >
                  <legend
                    class="MuiPrivateNotchedOutline-legend-1464"
                    style="width: 0px;"
                  >
                    <span>
                      ​
                    </span>
                  </legend>
                </fieldset>
                <div
                  class="MuiInputAdornment-root-1465 MuiInputAdornment-positionEnd-1468"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1470"
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
                  class="MuiInputBase-input-1456 MuiOutlinedInput-input-1441 MuiInputBase-inputAdornedStart-1461 MuiOutlinedInput-inputAdornedStart-1444"
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
                class="MuiButtonBase-root-1495 MuiIconButton-root-1489 MuiPrivateSwitchBase-root-1485 MuiCheckbox-root-1479 MuiCheckbox-colorPrimary-1483"
              >
                <span
                  class="MuiIconButton-label-1494"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1470"
                    focusable="false"
                    role="presentation"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                  <input
                    class="MuiPrivateSwitchBase-input-1488"
                    data-indeterminate="false"
                    type="checkbox"
                    value=""
                  />
                </span>
                <span
                  class="MuiTouchRipple-root-1535"
                />
              </span>
            </div>
            <div
              class="columnName"
              style="width: 30%;"
              title="Recurring Run Name"
            >
              <span
                class="MuiButtonBase-root-1495 MuiTableSortLabel-root-1506 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Recurring Run Name
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1470 MuiTableSortLabel-icon-1508 MuiTableSortLabel-iconDirectionDesc-1509"
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
                class="MuiButtonBase-root-1495 MuiTableSortLabel-root-1506 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Status
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1470 MuiTableSortLabel-icon-1508 MuiTableSortLabel-iconDirectionDesc-1509"
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
                class="MuiButtonBase-root-1495 MuiTableSortLabel-root-1506 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Trigger
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1470 MuiTableSortLabel-icon-1508 MuiTableSortLabel-iconDirectionDesc-1509"
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
                class="MuiButtonBase-root-1495 MuiTableSortLabel-root-1506 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Experiment
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1470 MuiTableSortLabel-icon-1508 MuiTableSortLabel-iconDirectionDesc-1509"
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
                class="MuiButtonBase-root-1495 MuiTableSortLabel-root-1506 MuiTableSortLabel-active-1507 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Created at
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1470 MuiTableSortLabel-icon-1508 MuiTableSortLabel-iconDirectionDesc-1509"
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
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-1495 MuiIconButton-root-1489 MuiPrivateSwitchBase-root-1485 MuiCheckbox-root-1479 MuiCheckbox-colorPrimary-1483"
                  >
                    <span
                      class="MuiIconButton-label-1494"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-1470"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-1488"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-1535"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun1"
                    title="recurring run with id: testrecurringrun1"
                  >
                    recurring run with id: testrecurringrun1
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    Cron: 
                    0 * * * * ?
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
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
              class="MuiFormControl-root-1411 verticalAlignInitial rowsPerPage"
            >
              <div
                class="MuiInputBase-root-1446 MuiInput-root-1518 MuiInputBase-formControl-1447 MuiInput-formControl-1519"
              >
                <div
                  class="MuiSelect-root-1511"
                >
                  <div
                    aria-haspopup="true"
                    aria-pressed="false"
                    class="MuiSelect-select-1512 MuiSelect-selectMenu-1515 MuiInputBase-input-1456 MuiInput-input-1526"
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
                    class="MuiSvgIcon-root-1470 MuiSelect-icon-1517"
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
              class="MuiButtonBase-root-1495 MuiButtonBase-disabled-1496 MuiIconButton-root-1489 MuiIconButton-disabled-1493"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1494"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1470"
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
              class="MuiButtonBase-root-1495 MuiButtonBase-disabled-1496 MuiIconButton-root-1489 MuiIconButton-disabled-1493"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1494"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1470"
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
            </button>
          </div>
        </div>
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
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(props.onError).not.toHaveBeenCalled();
    expect(tree.container.firstChild).toMatchInlineSnapshot(`
      <div>
        <div
          class="pageOverflowHidden"
        >
          <div>
            <div
              class="MuiFormControl-root-1552 filterBox"
              spellcheck="false"
              style="height: 48px; max-width: 100%; width: 100%;"
            >
              <label
                class="MuiFormLabel-root-1567 MuiInputLabel-root-1556 noMargin MuiInputLabel-formControl-1561 MuiInputLabel-animated-1564 MuiInputLabel-shrink-1563 MuiInputLabel-outlined-1566"
                data-shrink="true"
                for="tableFilterBox"
              >
                Filter recurring runs
              </label>
              <div
                class="MuiInputBase-root-1587 MuiOutlinedInput-root-1574 noLeftPadding MuiInputBase-formControl-1588 MuiInputBase-adornedStart-1591 MuiOutlinedInput-adornedStart-1577"
              >
                <fieldset
                  aria-hidden="true"
                  class="MuiPrivateNotchedOutline-root-1604 MuiOutlinedInput-notchedOutline-1581 filterBorderRadius"
                  style="padding-left: 8px;"
                >
                  <legend
                    class="MuiPrivateNotchedOutline-legend-1605"
                    style="width: 0px;"
                  >
                    <span>
                      ​
                    </span>
                  </legend>
                </fieldset>
                <div
                  class="MuiInputAdornment-root-1606 MuiInputAdornment-positionEnd-1609"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1611"
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
                  class="MuiInputBase-input-1597 MuiOutlinedInput-input-1582 MuiInputBase-inputAdornedStart-1602 MuiOutlinedInput-inputAdornedStart-1585"
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
                class="MuiButtonBase-root-1636 MuiIconButton-root-1630 MuiPrivateSwitchBase-root-1626 MuiCheckbox-root-1620 MuiCheckbox-colorPrimary-1624"
              >
                <span
                  class="MuiIconButton-label-1635"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1611"
                    focusable="false"
                    role="presentation"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                  <input
                    class="MuiPrivateSwitchBase-input-1629"
                    data-indeterminate="false"
                    type="checkbox"
                    value=""
                  />
                </span>
                <span
                  class="MuiTouchRipple-root-1676"
                />
              </span>
            </div>
            <div
              class="columnName"
              style="width: 30%;"
              title="Recurring Run Name"
            >
              <span
                class="MuiButtonBase-root-1636 MuiTableSortLabel-root-1647 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Recurring Run Name
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1611 MuiTableSortLabel-icon-1649 MuiTableSortLabel-iconDirectionDesc-1650"
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
                class="MuiButtonBase-root-1636 MuiTableSortLabel-root-1647 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Status
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1611 MuiTableSortLabel-icon-1649 MuiTableSortLabel-iconDirectionDesc-1650"
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
                class="MuiButtonBase-root-1636 MuiTableSortLabel-root-1647 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Trigger
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1611 MuiTableSortLabel-icon-1649 MuiTableSortLabel-iconDirectionDesc-1650"
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
                class="MuiButtonBase-root-1636 MuiTableSortLabel-root-1647 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Experiment
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1611 MuiTableSortLabel-icon-1649 MuiTableSortLabel-iconDirectionDesc-1650"
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
                class="MuiButtonBase-root-1636 MuiTableSortLabel-root-1647 MuiTableSortLabel-active-1648 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Created at
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1611 MuiTableSortLabel-icon-1649 MuiTableSortLabel-iconDirectionDesc-1650"
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
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-1636 MuiIconButton-root-1630 MuiPrivateSwitchBase-root-1626 MuiCheckbox-root-1620 MuiCheckbox-colorPrimary-1624"
                  >
                    <span
                      class="MuiIconButton-label-1635"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-1611"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-1629"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-1676"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 30%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun1"
                    title="recurring run with id: testrecurringrun1"
                  >
                    recurring run with id: testrecurringrun1
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 10%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  <a
                    class="link"
                    href="/experiments/details/test-experiment-id"
                  >
                    test experiment
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 20%;"
                >
                  -
                </div>
              </div>
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
              class="MuiFormControl-root-1552 verticalAlignInitial rowsPerPage"
            >
              <div
                class="MuiInputBase-root-1587 MuiInput-root-1659 MuiInputBase-formControl-1588 MuiInput-formControl-1660"
              >
                <div
                  class="MuiSelect-root-1652"
                >
                  <div
                    aria-haspopup="true"
                    aria-pressed="false"
                    class="MuiSelect-select-1653 MuiSelect-selectMenu-1656 MuiInputBase-input-1597 MuiInput-input-1667"
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
                    class="MuiSvgIcon-root-1611 MuiSelect-icon-1658"
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
              class="MuiButtonBase-root-1636 MuiButtonBase-disabled-1637 MuiIconButton-root-1630 MuiIconButton-disabled-1634"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1635"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1611"
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
              class="MuiButtonBase-root-1636 MuiButtonBase-disabled-1637 MuiIconButton-root-1630 MuiIconButton-disabled-1634"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1635"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1611"
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
            </button>
          </div>
        </div>
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
    tree = TestUtils.renderWithRouter(<RecurringRunList {...props} />);
    await TestUtils.flushPromises();
    expect(props.onError).not.toHaveBeenCalled();
    expect(tree.container.firstChild).toMatchInlineSnapshot(`
      <div>
        <div
          class="pageOverflowHidden"
        >
          <div>
            <div
              class="MuiFormControl-root-1693 filterBox"
              spellcheck="false"
              style="height: 48px; max-width: 100%; width: 100%;"
            >
              <label
                class="MuiFormLabel-root-1708 MuiInputLabel-root-1697 noMargin MuiInputLabel-formControl-1702 MuiInputLabel-animated-1705 MuiInputLabel-shrink-1704 MuiInputLabel-outlined-1707"
                data-shrink="true"
                for="tableFilterBox"
              >
                Filter recurring runs
              </label>
              <div
                class="MuiInputBase-root-1728 MuiOutlinedInput-root-1715 noLeftPadding MuiInputBase-formControl-1729 MuiInputBase-adornedStart-1732 MuiOutlinedInput-adornedStart-1718"
              >
                <fieldset
                  aria-hidden="true"
                  class="MuiPrivateNotchedOutline-root-1745 MuiOutlinedInput-notchedOutline-1722 filterBorderRadius"
                  style="padding-left: 8px;"
                >
                  <legend
                    class="MuiPrivateNotchedOutline-legend-1746"
                    style="width: 0px;"
                  >
                    <span>
                      ​
                    </span>
                  </legend>
                </fieldset>
                <div
                  class="MuiInputAdornment-root-1747 MuiInputAdornment-positionEnd-1750"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1752"
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
                  class="MuiInputBase-input-1738 MuiOutlinedInput-input-1723 MuiInputBase-inputAdornedStart-1743 MuiOutlinedInput-inputAdornedStart-1726"
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
                class="MuiButtonBase-root-1777 MuiIconButton-root-1771 MuiPrivateSwitchBase-root-1767 MuiCheckbox-root-1761 MuiCheckbox-colorPrimary-1765"
              >
                <span
                  class="MuiIconButton-label-1776"
                >
                  <svg
                    aria-hidden="true"
                    class="MuiSvgIcon-root-1752"
                    focusable="false"
                    role="presentation"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                  <input
                    class="MuiPrivateSwitchBase-input-1770"
                    data-indeterminate="false"
                    type="checkbox"
                    value=""
                  />
                </span>
                <span
                  class="MuiTouchRipple-root-1817"
                />
              </span>
            </div>
            <div
              class="columnName"
              style="width: 37.5%;"
              title="Recurring Run Name"
            >
              <span
                class="MuiButtonBase-root-1777 MuiTableSortLabel-root-1788 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Recurring Run Name
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1752 MuiTableSortLabel-icon-1790 MuiTableSortLabel-iconDirectionDesc-1791"
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
              style="width: 12.5%;"
              title="Status"
            >
              <span
                class="MuiButtonBase-root-1777 MuiTableSortLabel-root-1788 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Status
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1752 MuiTableSortLabel-icon-1790 MuiTableSortLabel-iconDirectionDesc-1791"
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
              style="width: 25%;"
              title="Trigger"
            >
              <span
                class="MuiButtonBase-root-1777 MuiTableSortLabel-root-1788 ellipsis"
                role="button"
                tabindex="0"
                title="Cannot sort by this column"
              >
                Trigger
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1752 MuiTableSortLabel-icon-1790 MuiTableSortLabel-iconDirectionDesc-1791"
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
              style="width: 25%;"
              title="Created at"
            >
              <span
                class="MuiButtonBase-root-1777 MuiTableSortLabel-root-1788 MuiTableSortLabel-active-1789 ellipsis"
                role="button"
                tabindex="0"
                title="Sort"
              >
                Created at
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1752 MuiTableSortLabel-icon-1790 MuiTableSortLabel-iconDirectionDesc-1791"
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
              class="expandableContainer"
            >
              <div
                aria-checked="false"
                class="tableRow row"
                role="checkbox"
                tabindex="-1"
              >
                <div
                  class="cell selectionToggle"
                >
                  <span
                    class="MuiButtonBase-root-1777 MuiIconButton-root-1771 MuiPrivateSwitchBase-root-1767 MuiCheckbox-root-1761 MuiCheckbox-colorPrimary-1765"
                  >
                    <span
                      class="MuiIconButton-label-1776"
                    >
                      <svg
                        aria-hidden="true"
                        class="MuiSvgIcon-root-1752"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                        />
                      </svg>
                      <input
                        class="MuiPrivateSwitchBase-input-1770"
                        data-indeterminate="false"
                        type="checkbox"
                        value=""
                      />
                    </span>
                    <span
                      class="MuiTouchRipple-root-1817"
                    />
                  </span>
                </div>
                <div
                  class="cell"
                  style="width: 37.5%;"
                >
                  <a
                    class="link"
                    href="/recurringrun/details/testrecurringrun1"
                    title="recurring run with id: testrecurringrun1"
                  >
                    recurring run with id: testrecurringrun1
                  </a>
                </div>
                <div
                  class="cell"
                  style="width: 12.5%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 25%;"
                >
                  <div>
                    -
                  </div>
                </div>
                <div
                  class="cell"
                  style="width: 25%;"
                >
                  -
                </div>
              </div>
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
              class="MuiFormControl-root-1693 verticalAlignInitial rowsPerPage"
            >
              <div
                class="MuiInputBase-root-1728 MuiInput-root-1800 MuiInputBase-formControl-1729 MuiInput-formControl-1801"
              >
                <div
                  class="MuiSelect-root-1793"
                >
                  <div
                    aria-haspopup="true"
                    aria-pressed="false"
                    class="MuiSelect-select-1794 MuiSelect-selectMenu-1797 MuiInputBase-input-1738 MuiInput-input-1808"
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
                    class="MuiSvgIcon-root-1752 MuiSelect-icon-1799"
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
              class="MuiButtonBase-root-1777 MuiButtonBase-disabled-1778 MuiIconButton-root-1771 MuiIconButton-disabled-1775"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1776"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1752"
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
              class="MuiButtonBase-root-1777 MuiButtonBase-disabled-1778 MuiIconButton-root-1771 MuiIconButton-disabled-1775"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiIconButton-label-1776"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root-1752"
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
            </button>
          </div>
        </div>
      </div>
    `);
  });
});
