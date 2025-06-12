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
import Banner, { css } from './Banner';

describe('Banner', () => {
  it('defaults to error mode', () => {
    const { container } = render(<Banner message={'Some message'} />);
    expect(container).toMatchSnapshot();
  });

  it('uses error mode when instructed', () => {
    const { container } = render(<Banner message={'Some message'} mode={'error'} />);
    expect(container).toMatchSnapshot();
  });

  it('uses warning mode when instructed', () => {
    const { container } = render(<Banner message={'Some message'} mode={'warning'} />);
    expect(container).toMatchSnapshot();
  });

  it('uses info mode when instructed', () => {
    const { container } = render(<Banner message={'Some message'} mode={'info'} />);
    expect(container).toMatchSnapshot();
  });

  it('shows "Details" button and has dialog when there is additional info', () => {
    const { container } = render(<Banner message={'Some message'} additionalInfo={'More info'} />);
    expect(container).toMatchSnapshot();
  });

  it('shows "Refresh" button when passed a refresh function', () => {
    const { container } = render(
      <Banner
        message={'Some message'}
        refresh={() => {
          /* do nothing */
        }}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('does not show "Refresh" button if mode is "info"', () => {
    render(
      <Banner
        message={'Some message'}
        mode={'info'}
        refresh={() => {
          /* do nothing */
        }}
      />,
    );
    expect(screen.queryByText('Refresh')).toBeNull();
  });

  it('shows troubleshooting link instructed by prop', () => {
    const { container } = render(
      <Banner message='Some message' mode='error' showTroubleshootingGuideLink={true} />,
    );
    expect(screen.getByText('Troubleshooting guide')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('does not show troubleshooting link if warning', () => {
    render(
      <Banner message='Some message' mode='warning' showTroubleshootingGuideLink={true} />,
    );
    expect(screen.queryByText('Troubleshooting guide')).toBeNull();
  });

  it('opens details dialog when button is clicked', () => {
    render(<Banner message='hello' additionalInfo='world' />);
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes details dialog when cancel button is clicked', () => {
    render(<Banner message='hello' additionalInfo='world' />);
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const dismissButton = screen.getByTestId('dismissDialogBtn');
    fireEvent.click(dismissButton);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('calls refresh callback', () => {
    const spy = jest.fn();
    render(<Banner message='hello' refresh={spy} />);
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    expect(spy).toHaveBeenCalled();
  });
});
