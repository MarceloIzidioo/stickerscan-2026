import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Album from './pages/Album';
import Scanner from './pages/Scanner';
import Duplicates from './pages/Duplicates';
import Missing from './pages/Missing';
import TradePage from './pages/TradePage';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/album" element={<Album />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/repetidas" element={<Duplicates />} />
          <Route path="/faltantes" element={<Missing />} />
          <Route path="/troca" element={<TradePage />} />
          <Route path="/config" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
