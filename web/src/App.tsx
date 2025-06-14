import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { store } from './store';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App; 