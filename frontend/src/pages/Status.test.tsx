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

import * as Utils from '../lib/Utils';
import { statusToIcon } from './Status';
import { NodePhase } from '../lib/StatusUtils';
import { render } from '@testing-library/react';

describe('Status', () => {
  // We mock this because it uses toLocaleDateString, which causes mismatches between local and CI
  // test enviroments
  const formatDateStringSpy = jest.spyOn(Utils, 'formatDateString');

  const startDate = new Date('Wed Jan 2 2019 9:10:11 GMT-0800');
  const endDate = new Date('Thu Jan 3 2019 10:11:12 GMT-0800');

  beforeEach(() => {
    formatDateStringSpy.mockImplementation((date: Date) => {
      return date === startDate ? '1/2/2019, 9:10:11 AM' : '1/3/2019, 10:11:12 AM';
    });
  });

  describe('statusToIcon', () => {
    it('handles an unknown phase', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementationOnce(() => null);
      const { container } = render(statusToIcon('bad phase' as any));
      expect(container.firstChild).toMatchSnapshot();
      expect(consoleSpy).toHaveBeenLastCalledWith('Unknown node phase:', 'bad phase');
    });

    it('handles an undefined phase', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementationOnce(() => null);
      const { container } = render(statusToIcon(/* no phase */));
      expect(container.firstChild).toMatchSnapshot();
      expect(consoleSpy).toHaveBeenLastCalledWith('Unknown node phase:', undefined);
    });

    // TODO: Enable this test after react-scripts is upgraded to v4.0.0
    // it('react testing for ERROR phase', async () => {
    //   const { findByText, getByTestId } = render(
    //     statusToIcon(NodePhase.ERROR),
    //   );

    //   fireEvent.mouseOver(getByTestId('node-status-sign'));
    //   findByText('Error while running this resource');
    // });

    it('handles ERROR phase', () => {
      const { container } = render(statusToIcon(NodePhase.ERROR));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <svg
            aria-hidden="true"
            class="MuiSvgIcon-root-43"
            data-testid="node-status-sign"
            focusable="false"
            role="presentation"
            style="color: rgb(213, 0, 0); height: 18px; width: 18px;"
            viewBox="0 0 24 24"
          >
            <path
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
        </div>
      `);
    });

    it('handles FAILED phase', () => {
      const { container } = render(statusToIcon(NodePhase.FAILED));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <svg
            aria-hidden="true"
            class="MuiSvgIcon-root-60"
            data-testid="node-status-sign"
            focusable="false"
            role="presentation"
            style="color: rgb(213, 0, 0); height: 18px; width: 18px;"
            viewBox="0 0 24 24"
          >
            <path
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
        </div>
      `);
    });

    it('handles PENDING phase', () => {
      const { container } = render(statusToIcon(NodePhase.PENDING));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <svg
            aria-hidden="true"
            class="MuiSvgIcon-root-77"
            data-testid="node-status-sign"
            focusable="false"
            role="presentation"
            style="color: rgb(154, 160, 166); height: 18px; width: 18px;"
            viewBox="0 0 24 24"
          >
            <path
              d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
            />
            <path
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path
              d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
            />
          </svg>
        </div>
      `);
    });

    it('handles RUNNING phase', () => {
      const { container } = render(statusToIcon(NodePhase.RUNNING));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <svg
            height="18"
            viewBox="0 0 18 18"
            width="18"
          >
            <g
              fill="#4285f4"
              fill-rule="nonzero"
              transform="translate(-450, -307)"
            >
              <g
                transform="translate(450, 266)"
              >
                <g
                  transform="translate(0, 41)"
                >
                  <path
                    d="M9,4 C6.23857143,4 4,6.23857143 4,9 C4,11.7614286 6.23857143,14 9,14 C11.7614286,14 14,11.7614286 14,9 C14,8.40214643 13.8950716,7.8288007 13.702626,7.29737398 L15.2180703,5.78192967 C15.7177126,6.74539838 16,7.83973264 16,9 C16,12.866 12.866,16 9,16 C5.134,16 2,12.866 2,9 C2,5.134 5.134,2 9,2 C10.933,2 12.683,2.7835 13.94975,4.05025 L12.7677679,5.23223214 L9,9 L9,4 Z"
                  />
                </g>
              </g>
            </g>
          </svg>
        </div>
      `);
    });

    it('handles TERMINATING phase', () => {
      const { container } = render(statusToIcon(NodePhase.TERMINATING));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <svg
            height="18"
            viewBox="0 0 18 18"
            width="18"
          >
            <g
              fill="#4285f4"
              fill-rule="nonzero"
              transform="translate(-450, -307)"
            >
              <g
                transform="translate(450, 266)"
              >
                <g
                  transform="translate(0, 41)"
                >
                  <path
                    d="M9,4 C6.23857143,4 4,6.23857143 4,9 C4,11.7614286 6.23857143,14 9,14 C11.7614286,14 14,11.7614286 14,9 C14,8.40214643 13.8950716,7.8288007 13.702626,7.29737398 L15.2180703,5.78192967 C15.7177126,6.74539838 16,7.83973264 16,9 C16,12.866 12.866,16 9,16 C5.134,16 2,12.866 2,9 C2,5.134 5.134,2 9,2 C10.933,2 12.683,2.7835 13.94975,4.05025 L12.7677679,5.23223214 L9,9 L9,4 Z"
                  />
                </g>
              </g>
            </g>
          </svg>
        </div>
      `);
    });

    it('handles SKIPPED phase', () => {
      const { container } = render(statusToIcon(NodePhase.SKIPPED));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <svg
            aria-hidden="true"
            class="MuiSvgIcon-root-110"
            data-testid="node-status-sign"
            focusable="false"
            role="presentation"
            style="color: rgb(95, 99, 104); height: 18px; width: 18px;"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"
            />
            <path
              d="M0 0h24v24H0z"
              fill="none"
            />
          </svg>
        </div>
      `);
    });

    it('handles SUCCEEDED phase', () => {
      const { container } = render(statusToIcon(NodePhase.SUCCEEDED));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <svg
            aria-hidden="true"
            class="MuiSvgIcon-root-127"
            data-testid="node-status-sign"
            focusable="false"
            role="presentation"
            style="color: rgb(52, 168, 83); height: 18px; width: 18px;"
            viewBox="0 0 24 24"
          >
            <path
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </div>
      `);
    });

    it('handles CACHED phase', () => {
      const { container } = render(statusToIcon(NodePhase.CACHED));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <div
            style="display: flex; height: 100%; flex-direction: column; justify-content: space-between;"
          >
            <svg
              aria-hidden="true"
              class="MuiSvgIcon-root-144"
              focusable="false"
              role="presentation"
              style="color: rgb(52, 168, 83); height: 18px; width: 18px;"
              viewBox="0 0 24 24"
            >
              <path
                d="M0 0h24v24H0z"
                fill="none"
              />
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
            <div>
              <svg
                aria-hidden="true"
                class="MuiSvgIcon-root-144"
                focusable="false"
                role="presentation"
                style="color: rgb(52, 168, 83); height: 18px; width: 18px;"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"
                />
                <path
                  d="M0 0h24v24H0z"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      `);
    });

    it('handles TERMINATED phase', () => {
      const { container } = render(statusToIcon(NodePhase.TERMINATED));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <svg
            height="18"
            viewBox="0 0 18 18"
            width="18"
          >
            <g
              fill="none"
              fill-rule="evenodd"
              stroke="none"
              stroke-width="1"
            >
              <g
                transform="translate(-1.000000, -1.000000)"
              >
                <polygon
                  points="0 0 18 0 18 18 0 18"
                />
                <path
                  d="M8.9925,1.5 C4.8525,1.5 1.5,4.86 1.5,9 C1.5,13.14 4.8525,16.5 8.9925,16.5 C13.14,16.5 16.5,13.14 16.5,9 C16.5,4.86 13.14,1.5 8.9925,1.5 Z M9,15 C5.685,15 3,12.315 3,9 C3,5.685 5.685,3 9,3 C12.315,3 15,5.685 15,9 C15,12.315 12.315,15 9,15 Z"
                  fill="#80868b"
                  fill-rule="nonzero"
                />
                <polygon
                  fill="#80868b"
                  fill-rule="nonzero"
                  points="6 6 12 6 12 12 6 12"
                />
              </g>
            </g>
          </svg>
        </div>
      `);
    });

    it('handles OMITTED phase', () => {
      const { container } = render(statusToIcon(NodePhase.OMITTED));
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div
          class=""
        >
          <svg
            aria-hidden="true"
            class="MuiSvgIcon-root-169"
            data-testid="node-status-sign"
            focusable="false"
            role="presentation"
            style="color: rgb(95, 99, 104); height: 18px; width: 18px;"
            viewBox="0 0 24 24"
          >
            <path
              d="M0 0h24v24H0z"
              fill="none"
            />
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"
            />
          </svg>
        </div>
      `);
    });

    it('displays start and end dates if both are provided', () => {
      const { container } = render(statusToIcon(NodePhase.SUCCEEDED, startDate, endDate));
      expect(container.firstChild).toMatchSnapshot();
    });

    it('does not display a end date if none was provided', () => {
      const { container } = render(statusToIcon(NodePhase.SUCCEEDED, startDate));
      expect(container.firstChild).toMatchSnapshot();
    });

    it('does not display a start date if none was provided', () => {
      const { container } = render(statusToIcon(NodePhase.SUCCEEDED, undefined, endDate));
      expect(container.firstChild).toMatchSnapshot();
    });

    it('does not display any dates if neither was provided', () => {
      const { container } = render(statusToIcon(NodePhase.SUCCEEDED /* No dates */));
      expect(container.firstChild).toMatchSnapshot();
    });

    Object.keys(NodePhase).map(status =>
      it('renders an icon with tooltip for phase: ' + status, () => {
        const { container } = render(statusToIcon(NodePhase[status]));
        expect(container.firstChild).toMatchSnapshot();
      }),
    );
  });
});
