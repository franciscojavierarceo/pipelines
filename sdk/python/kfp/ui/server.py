#
#
#

from http.server import BaseHTTPRequestHandler
from http.server import HTTPServer
import mimetypes
import os
from typing import Optional
import urllib.parse
import urllib.request

import pkg_resources


class UIRequestHandler(BaseHTTPRequestHandler):

    def __init__(self, api_server_address: str, *args, **kwargs):
        self.api_server_address = api_server_address
        super().__init__(*args, **kwargs)

    def log_message(self, format, *args):
        print(f"{self.command} {self.path}")

    def do_GET(self):
        self._handle_request()

    def do_POST(self):
        self._handle_request()

    def do_PUT(self):
        self._handle_request()

    def do_DELETE(self):
        self._handle_request()

    def do_PATCH(self):
        self._handle_request()

    def _handle_request(self):
        path = self.path

        if path.startswith('/apis/v1beta1/') or path.startswith(
                '/apis/v2beta1/'):
            self._proxy_to_api_server(path)
        elif path.startswith('/ml_metadata'):
            self._send_error_response(501, 'Metadata service not implemented')
        elif path.startswith('/k8s/pod/logs'):
            self._proxy_pod_logs(path)
        elif path.startswith('/artifacts/'):
            self._send_error_response(501, 'Artifacts service not implemented')
        elif path == '/' or path == '/index.html':
            self._serve_index_html()
        elif path.startswith('/static/'):
            self._serve_static_file(path)
        else:
            self._serve_index_html()

    def _proxy_to_api_server(self, path: str):
        if not self.api_server_address:
            self._send_error_response(502, 'API server address not configured')
            return

        try:
            url = f"{self.api_server_address}{path}"
            if self.path.find('?') != -1:
                url += '?' + self.path.split('?', 1)[1]

            headers = {}
            for header_name, header_value in self.headers.items():
                if header_name.lower() not in ['host', 'connection']:
                    headers[header_name] = header_value

            data = None
            if self.command in ['POST', 'PUT', 'PATCH']:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    data = self.rfile.read(content_length)

            req = urllib.request.Request(
                url, data=data, headers=headers, method=self.command)

            with urllib.request.urlopen(req) as response:
                self.send_response(response.status)
                for header_name, header_value in response.headers.items():
                    if header_name.lower() not in [
                            'connection', 'transfer-encoding'
                    ]:
                        self.send_header(header_name, header_value)
                self.end_headers()

                while True:
                    chunk = response.read(8192)
                    if not chunk:
                        break
                    self.wfile.write(chunk)

        except Exception as e:
            print(f"Proxy error: {e}")
            self._send_error_response(502, f"Proxy error: {str(e)}")

    def _proxy_pod_logs(self, path: str):
        self._send_error_response(501, 'Pod logs service not implemented')

    def _serve_index_html(self):
        try:
            static_dir = pkg_resources.resource_filename('kfp.ui', 'static')
            index_path = os.path.join(static_dir, 'index.html')

            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()

            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length',
                             str(len(content.encode('utf-8'))))
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))

        except Exception as e:
            print(f"Error serving index.html: {e}")
            self._send_error_response(500, 'Internal server error')

    def _serve_static_file(self, path: str):
        try:
            static_dir = pkg_resources.resource_filename('kfp.ui', 'static')
            file_path = os.path.join(static_dir, path[1:])

            if not os.path.exists(file_path) or not os.path.isfile(file_path):
                self._send_error_response(404, 'File not found')
                return

            if not file_path.startswith(static_dir):
                self._send_error_response(403, 'Forbidden')
                return

            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type is None:
                mime_type = 'application/octet-stream'

            with open(file_path, 'rb') as f:
                content = f.read()

            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)

        except Exception as e:
            print(f"Error serving static file {path}: {e}")
            self._send_error_response(500, 'Internal server error')

    def _send_error_response(self, status_code: int, message: str):
        self.send_response(status_code)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(message.encode('utf-8'))


def create_handler_class(api_server_address: str):

    def handler(*args, **kwargs):
        return UIRequestHandler(api_server_address, *args, **kwargs)

    return handler


def start_ui_server(host: str = 'localhost',
                    port: int = 3000,
                    api_server: Optional[str] = None):
    if api_server is None:
        ml_host = os.environ.get('ML_PIPELINE_SERVICE_HOST', 'localhost')
        ml_port = os.environ.get('ML_PIPELINE_SERVICE_PORT', '3001')
        api_server = f"http://{ml_host}:{ml_port}"

    handler_class = create_handler_class(api_server)
    server = HTTPServer((host, port), handler_class)

    print(f"Starting Kubeflow Pipelines UI server at http://{host}:{port}")
    print(f"API server: {api_server}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        server.shutdown()
        server.server_close()
