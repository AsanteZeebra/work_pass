import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './Dasbaord';


function App() {
  return (
  <Router>
    <Routes>
      <Route path="/" element={<Layout><Dashboard/></Layout>}></Route>
    </Routes>
     </Router>
  );
}

export default App;
