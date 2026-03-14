import { Component } from 'react'
import Form, { GroupItem, SimpleItem, RequiredRule } from 'devextreme-react/form';
import { TextBox } from 'devextreme-react';
import { Navigate } from 'react-router-dom';
import './login.css';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.loginUser = this.loginUser.bind(this);

    this.state = {
      username: '',
      password: '',
      loggedIn: false,
      loadIndicatorVisible: false,
      shouldRedirect: false,
      showPassword: false
    };

    this.loginButtonOptions = {
      text: 'Login',
      type: "default",
      useSubmitBehavior: true,
      stylingMode: 'contained',
      disabled: (this.state.username !== '' && this.state.password !== '') ? true : false,
      width: '100%',
      onClick: () => {
        this.onSubmit();
      },
    };
  }

  onSubmit = () => {
    var username = this.state.username;
    var password = this.state.password;
    this.loginUser({
      username: username,
      password: password,
    });
  };

  handlePasswordChange = (e) => {
    this.setState({
      password: e.value,
    });
  }

  handleUsernameChange = (e) => {
    this.setState({
      username: e.value,
    });
  }

  toggleShowPassword = () => {
    this.setState(prevState => ({ showPassword: !prevState.showPassword }));
  };

  loginUser = (credentials) => {
    this.setState({ loadIndicatorVisible: true });

    const url = "http://localhost:8082/auth/login";

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: credentials.username,
        password: credentials.password
      })
    };

    fetch(url, config)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const token = data.token;

        if (token) {
          localStorage.setItem("token", token);
          this.setState({
            loggedIn: true,
            loadIndicatorVisible: false
          });
        } else {
          throw new Error("Token missing in response");
        }
      })
      .catch((error) => {
        console.error("Login not successful:", error);
        alert("Login not successful. Please check your email and password.");
        this.setState({ loadIndicatorVisible: false });
      });
  };

  render() {
    return (
      <div className="center-login">
        {this.state.loggedIn ?
          <Navigate to="/bookings" replace={true} /> : ""
        }
        <div className="auth-inner">
          <h3>Sign In</h3>
          <Form colCount={1}>
            <GroupItem>
              <GroupItem className="mb-3">
                <SimpleItem dataField="Username" isRequired={true}>
                  <RequiredRule message="Username/Email is required" />
                  <TextBox
                    className="form-control"
                    showClearButton={true}
                    valueChangeEvent="keyup"
                    value={this.state.username}
                    onValueChanged={this.handleUsernameChange}
                    placeholder="Username"
                  />
                </SimpleItem>

                <SimpleItem dataField="Password" isRequired={true}>
                  <RequiredRule message="Password is required" />
                  <div style={{ position: "relative" }}>
                    <TextBox
                      className="form-control"
                      showClearButton={false}
                      valueChangeEvent="keyup"
                      value={this.state.password}
                      onValueChanged={this.handlePasswordChange}
                      mode={this.state.showPassword ? "text" : "password"}
                      placeholder="Password"
                    />
                    <span
                      onClick={this.toggleShowPassword}
                      className="password-toggle"
                    >
                      {this.state.showPassword ? "Hide" : "Show"}
                    </span>
                  </div>
                </SimpleItem>

                <GroupItem colCount={1}>
                  <SimpleItem
                    editorType="dxButton"
                    editorOptions={this.loginButtonOptions}
                  />
                </GroupItem>
              </GroupItem>
            </GroupItem>
          </Form>
        </div></div>
    )
  }
}