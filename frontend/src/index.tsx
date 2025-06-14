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

// import './CSSReset';
import 'src/build/tailwind.output.css';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter } from 'react-router-dom';
import { cssRule } from 'typestyle';
import Router from './components/Router';
import { fonts, createAppTheme } from './Css';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { initFeatures } from './features';
import { Deployments, KFP_FLAGS } from './lib/Flags';
import { GkeMetadataProvider } from './lib/GkeMetadata';
import {
  init as initKfClient,
  NamespaceContext,
  NamespaceContextProvider,
} from './lib/KubeflowClient';
import { BuildInfoProvider } from './lib/BuildInfo';
// import { ReactQueryDevtools } from 'react-query/devtools';

// TODO: license headers

if (KFP_FLAGS.DEPLOYMENT === Deployments.KUBEFLOW) {
  initKfClient();
}

cssRule('html, body, #root', {
  display: 'flex',
  fontFamily: fonts.main,
  fontSize: 13,
  height: '100%',
  width: '100%',
  transition: 'background-color 0.3s ease, color 0.3s ease',
});

cssRule('html.dark, html.dark body, html.dark #root', {
  background: '#121212',
  color: 'rgba(255, 255, 255, .87)',
});

cssRule('html:not(.dark), html:not(.dark) body, html:not(.dark) #root', {
  background: 'white',
  color: 'rgba(0, 0, 0, .66)',
});

initFeatures();

const AppWithTheme: React.FC = () => {
  const { isDark } = useTheme();
  const muiTheme = createAppTheme(isDark);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <BuildInfoProvider>
        <GkeMetadataProvider>
          <HashRouter>
            <Router />
          </HashRouter>
        </GkeMetadataProvider>
      </BuildInfoProvider>
    </MuiThemeProvider>
  );
};

export const queryClient = new QueryClient();
const app = (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
    {/* <ReactQueryDevtools initialIsOpen={false} /> */}
  </QueryClientProvider>
);
ReactDOM.render(
  KFP_FLAGS.DEPLOYMENT === Deployments.KUBEFLOW ? (
    <NamespaceContextProvider>{app}</NamespaceContextProvider>
  ) : (
    <NamespaceContext.Provider value={process.env.REACT_APP_NAMESPACE || undefined}>
      {app}
    </NamespaceContext.Provider>
  ),
  document.getElementById('root'),
);
