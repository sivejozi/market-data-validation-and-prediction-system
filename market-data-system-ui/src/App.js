import 'devextreme/dist/css/dx.light.css';
import { Component } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './login/login'
import Appointment from './booking/appointment-booking'
import Bookings from './bookings/bookings';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <div>
            <Routes>
              <Route exact path="/" element={<Appointment />} />
              <Route path="/login" element={<Login />} />
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/bookings" element={<Bookings />} />
            </Routes>
          </div>
        </div>
      </Router>
    )
  }
}

export default App