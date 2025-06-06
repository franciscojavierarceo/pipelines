#
#
#

import click
from kfp.ui.server import start_ui_server


@click.command()
@click.option('--port', default=3000, help='Port to run the UI server on')
@click.option('--host', default='localhost', help='Host to bind the server to')
@click.option('--api-server', help='ML Pipeline API server address (e.g., http://localhost:8888)')
def ui(port, host, api_server):
    """Start the Kubeflow Pipelines UI server."""
    start_ui_server(host=host, port=port, api_server=api_server)
