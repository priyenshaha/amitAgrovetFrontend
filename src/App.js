import './App.css';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Navigation from './components/Navigation';
import PartyScreen from './screens/PartyScreen';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"
import SellingScreen from './screens/SellingScreen';
import PurchaseScreen from './screens/PurchaseScreen';
import ReportScreen from './screens/ReportScreen';

function App() {
  
  return (
    <div className="App">
      <Router>
        <div className="">
          <Navigation />
          <ToastContainer theme='colored' />
          <Switch>
            <Route exact path="/">
              <Redirect to="/party" />
            </Route>
            <Route path="/party" component={PartyScreen} />
            <Route path="/sell" component={SellingScreen} />
            <Route path="/purchase" component={PurchaseScreen} />
            <Route path="/report" component={ReportScreen} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
