import { Component } from 'react';
import Form, { GroupItem, SimpleItem, RequiredRule } from 'devextreme-react/form';
import { Popup } from 'devextreme-react/popup';
import './appointment-booking.css';

export default class BookingForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bookingData: {
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        branch: '',
        appointmentDateTime: null,
        reason: ''
      },
      submitting: false,
      successPopupVisible: false
    };
  }

  handleChange = (e, field) => {
    this.setState((prevState) => ({
      bookingData: {
        ...prevState.bookingData,
        [field]: e.value
      }
    }));
  };

  onSubmit = () => {
    this.setState({ submitting: true });
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8082/booking/api/appointments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(this.state.bookingData)
    })
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        return response.json();
      })
      .then(() => {
        this.setState({
          submitting: false,
          successPopupVisible: true,
          bookingData: {
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            branch: '',
            appointmentDateTime: null,
            reason: ''
          }
        });
      })
      .catch((error) => {
        console.error('Booking failed:', error);
        alert('Failed to submit booking. Please try again.');
        this.setState({ submitting: false });
      });
  };

  render() {
    const { submitting, bookingData, successPopupVisible } = this.state;

    return (
      <div className="center-form">
        <div className="form-container">
          <h3>Book an Appointment</h3>

          <Form colCount={1}>
            <GroupItem>
              <SimpleItem dataField="Branch" isRequired>
                <RequiredRule message="Branch is required" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Branch"
                  value={bookingData.branch}
                  onChange={(e) => this.handleChange({ value: e.target.value }, 'branch')}
                />
              </SimpleItem>

              <SimpleItem dataField="Customer Name" isRequired>
                <RequiredRule message="Customer name is required" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter customer name"
                  value={bookingData.customerName}
                  onChange={(e) => this.handleChange({ value: e.target.value }, 'customerName')}
                />
              </SimpleItem>

              <SimpleItem dataField="Customer Email" isRequired>
                <RequiredRule message="Customer email is required" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter customer email"
                  value={bookingData.customerEmail}
                  onChange={(e) => this.handleChange({ value: e.target.value }, 'customerEmail')}
                />
              </SimpleItem>

              <SimpleItem dataField="Customer Phone" isRequired>
                <RequiredRule message="Customer phone is required" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter customer phone"
                  value={bookingData.customerPhone}
                  onChange={(e) => this.handleChange({ value: e.target.value }, 'customerPhone')}
                />
              </SimpleItem>

              <SimpleItem dataField="Appointment Date Time" editorType="dxDateBox" isRequired>
                <RequiredRule message="Appointment date is required" />
                <input
                  type="datetime-local"
                  className="form-control"
                  value={bookingData.appointmentDateTime || ''}
                  onChange={(e) => this.handleChange({ value: e.target.value }, 'appointmentDateTime')}
                />
              </SimpleItem>

              <SimpleItem dataField="Reason" isRequired>
                <RequiredRule message="Reason is required" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Reason"
                  value={bookingData.reason}
                  onChange={(e) => this.handleChange({ value: e.target.value }, 'reason')}
                />
              </SimpleItem>
            </GroupItem>

            <GroupItem colCount={1}>
              <SimpleItem
                editorType="dxButton"
                editorOptions={{
                  text: submitting ? 'Submitting...' : 'Submit Booking',
                  type: 'default',
                  useSubmitBehavior: true,
                  disabled: submitting,
                  width: '100%',
                  onClick: this.onSubmit
                }}
              />
            </GroupItem>
          </Form>
        </div>

        <Popup
          visible={successPopupVisible}
          onHiding={() => this.setState({ successPopupVisible: false })}
          dragEnabled={false}
          closeOnOutsideClick={true}
          showTitle={true}
          title="Booking Sent"
          width={400}
          height={250}
        >
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h4>Your booking has been sent!</h4>
            <p>Please check your email for confirmation.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => this.setState({ successPopupVisible: false })}
            >
              OK
            </button>
          </div>
        </Popup>
      </div>
    );
  }
}
