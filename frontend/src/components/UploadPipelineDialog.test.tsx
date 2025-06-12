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
import UploadPipelineDialog, { ImportMethod } from './UploadPipelineDialog';
import TestUtils from '../TestUtils';

describe('UploadPipelineDialog', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders closed', () => {
    render(<UploadPipelineDialog open={false} onClose={jest.fn()} />);
    expect(screen.getByRole('dialog', { hidden: true })).toMatchSnapshot();
  });

  it('renders open', () => {
    render(<UploadPipelineDialog open={true} onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toMatchSnapshot();
  });

  it('renders an active dropzone', () => {
    render(<UploadPipelineDialog open={true} onClose={jest.fn()} />);
    const dropzone = screen.getByTestId('dropZone');
    fireEvent.dragEnter(dropzone);
    expect(screen.getByRole('dialog')).toMatchSnapshot();
  });

  it('renders with a selected file to upload', () => {
    render(<UploadPipelineDialog open={true} onClose={jest.fn()} />);
    const dropzone = screen.getByTestId('dropZone');
    const file = new File(['test'], 'test.yaml', { type: 'application/yaml' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    expect(screen.getByRole('dialog')).toMatchSnapshot();
  });

  it('renders alternate UI for uploading via URL', () => {
    render(<UploadPipelineDialog open={true} onClose={jest.fn()} />);
    const urlRadio = screen.getByTestId('uploadFromUrlBtn');
    fireEvent.click(urlRadio);
    expect(screen.getByRole('dialog')).toMatchSnapshot();
  });

  it('calls close callback with null and empty string when canceled', () => {
    const spy = jest.fn();
    render(<UploadPipelineDialog open={false} onClose={spy} />);
    const cancelBtn = screen.getByTestId('cancelUploadBtn');
    fireEvent.click(cancelBtn);
    expect(spy).toHaveBeenCalledWith(false, '', null, '', ImportMethod.LOCAL, true, '');
  });

  it('calls close callback with null and empty string when dialog is closed', () => {
    const spy = jest.fn();
    render(<UploadPipelineDialog open={false} onClose={spy} />);
    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(spy).toHaveBeenCalledWith(false, '', null, '', ImportMethod.LOCAL, true, '');
  });

  it('calls close callback with file name, file object, and description when confirmed', () => {
    const spy = jest.fn();
    render(<UploadPipelineDialog open={false} onClose={spy} />);
    const nameInput = screen.getByLabelText(/pipeline name/i);
    fireEvent.change(nameInput, { target: { value: 'test name' } });
    const confirmBtn = screen.getByTestId('confirmUploadBtn');
    fireEvent.click(confirmBtn);
    expect(spy).toHaveBeenLastCalledWith(true, 'test name', null, '', ImportMethod.LOCAL, true, '');
  });

  it('calls close callback with trimmed file url and pipeline name when confirmed', () => {
    const spy = jest.fn();
    render(<UploadPipelineDialog open={false} onClose={spy} />);
    // Click 'Import by URL'
    const urlRadio = screen.getByTestId('uploadFromUrlBtn');
    fireEvent.click(urlRadio);
    const urlInput = screen.getByLabelText(/file url/i);
    fireEvent.change(urlInput, { target: { value: '\n https://www.google.com/test-file.txt ' } });
    const nameInput = screen.getByLabelText(/pipeline name/i);
    fireEvent.change(nameInput, { target: { value: 'test name' } });
    const confirmBtn = screen.getByTestId('confirmUploadBtn');
    fireEvent.click(confirmBtn);
    expect(spy).toHaveBeenLastCalledWith(
      true,
      'test name',
      null,
      'https://www.google.com/test-file.txt',
      ImportMethod.URL,
      true,
      '',
    );
  });

  it('trims file extension for pipeline name suggestion', () => {
    render(<UploadPipelineDialog open={false} onClose={jest.fn()} />);
    const dropzone = screen.getByTestId('dropZone');
    const file = new File(['test'], 'test_upload_file.tar.gz', { type: 'application/gzip' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    const nameInput = screen.getByLabelText(/pipeline name/i);
    expect(nameInput).toHaveValue('test_upload_file');
  });

  it('sets the import method based on which radio button is toggled', () => {
    render(<UploadPipelineDialog open={false} onClose={jest.fn()} />);
    // Import method is LOCAL by default - check that local file input is visible
    expect(screen.getByTestId('dropZone')).toBeInTheDocument();

    // Click 'Import by URL'
    const urlRadio = screen.getByTestId('uploadFromUrlBtn');
    fireEvent.click(urlRadio);
    expect(screen.getByLabelText(/file url/i)).toBeInTheDocument();

    // Click back to default, 'Upload a file'
    const localRadio = screen.getByTestId('uploadLocalFileBtn');
    fireEvent.click(localRadio);
    expect(screen.getByTestId('dropZone')).toBeInTheDocument();
  });

  it('resets all state if the dialog is closed and the callback returns true', async () => {
    const spy = jest.fn(() => true);

    render(<UploadPipelineDialog open={true} onClose={spy} />);

    const urlRadio = screen.getByTestId('uploadFromUrlBtn');
    fireEvent.click(urlRadio);

    const urlInput = screen.getByLabelText(/file url/i);
    fireEvent.change(urlInput, { target: { value: 'https://some.url.com' } });

    const nameInput = screen.getByLabelText(/pipeline name/i);
    fireEvent.change(nameInput, { target: { value: 'test pipeline name' } });

    const descInput = screen.getByLabelText(/pipeline description/i);
    fireEvent.change(descInput, { target: { value: 'test description' } });

    const confirmBtn = screen.getByTestId('confirmUploadBtn');
    fireEvent.click(confirmBtn);
    await TestUtils.flushPromises();

    expect(spy).toHaveBeenCalledWith(
      true,
      'test pipeline name',
      null,
      'https://some.url.com',
      ImportMethod.URL,
      true,
      'test description',
    );
  });

  it('does not reset the state if the dialog is closed and the callback returns false', async () => {
    const spy = jest.fn(() => false);

    tree = shallow(<UploadPipelineDialog open={false} onClose={spy} />);
    tree.setState({
      busy: true,
      dropzoneActive: true,
      file: {},
      fileName: 'test file name',
      fileUrl: 'https://some.url.com',
      importMethod: ImportMethod.URL,
      uploadPipelineDescription: 'test description',
      uploadPipelineName: 'test pipeline name',
    });

    tree.find('#confirmUploadBtn').simulate('click');
    await TestUtils.flushPromises();

    expect(tree.state('dropzoneActive')).toBe(true);
    expect(tree.state('file')).toEqual({});
    expect(tree.state('fileName')).toBe('test file name');
    expect(tree.state('fileUrl')).toBe('https://some.url.com');
    expect(tree.state('importMethod')).toBe(ImportMethod.URL);
    expect(tree.state('uploadPipelineDescription')).toBe('test description');
    expect(tree.state('uploadPipelineName')).toBe('test pipeline name');
    // 'busy' is set to false regardless upon the callback returning
    expect(tree.state('busy')).toBe(false);
  });

  it('sets an active dropzone on drag', () => {
    tree = shallow(<UploadPipelineDialog open={false} onClose={jest.fn()} />);
    tree.find('#dropZone').simulate('dragEnter');
    expect(tree.state()).toHaveProperty('dropzoneActive', true);
  });

  it('sets an inactive dropzone on drag leave', () => {
    tree = shallow(<UploadPipelineDialog open={false} onClose={jest.fn()} />);
    tree.find('#dropZone').simulate('dragLeave');
    expect(tree.state()).toHaveProperty('dropzoneActive', false);
  });

  it('sets a file object on drop', () => {
    tree = shallow(<UploadPipelineDialog open={false} onClose={jest.fn()} />);
    const file = { name: 'test upload file' };
    tree.find('#dropZone').simulate('drop', [file]);
    expect(tree.state()).toHaveProperty('dropzoneActive', false);
    expect(tree.state()).toHaveProperty('uploadPipelineName', file.name);
  });
});
