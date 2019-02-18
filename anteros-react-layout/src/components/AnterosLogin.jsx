import React, { Component } from 'react';
import {
    Redirect
} from 'react-router-dom';
import axios from 'axios';
import { convertJsonToObject } from '../../app/utils/AnterosJacksonParser';
import { connect } from "react-redux";
import { handleLogin, handleLogout, setToken } from '../actions/authenticationActions';
import PropTypes from 'prop-types';

class AnterosLogin extends Component {

    constructor(props) {
        super(props);
        this.login = this.login.bind(this);
        this.state = {
            redirectToReferrer: false
        }
    }

    login(event) {
        event.preventDefault();

        this.props.handleLogin(this.props.currentUser);
        // axios.get('http://localhost:8090/AnterosCFC-Service/resource/buscaTodos', {
        //     auth: {
        //         username: 'EDSON',
        //         password: '727204'
        //     }
        // }).then(function (response) {
        //     console.log(convertJsonToObject(response.data));
        // })
        //     .catch(function (error) {
        //         console.log(error);
        //     });

        this.setState({ redirectToReferrer: true });
    }

    render() {
        const { from } = this.props.location.state || { from: { pathname: '/' } }
        const { redirectToReferrer } = this.state

        if (redirectToReferrer) {
            return (
                <Redirect to={from} />
            )
        }

        return (
            <div className="auth">
                <div className="auth-container">
                    <div className="card">
                        <header className="auth-header">
                            <img src={require('../assets/img/security-menu-1.png')} />
                        </header>
                        <div className="auth-content">
                            <p className="text-xs-center">LOGIN</p>
                            <form id="login-form" onSubmit={this.login} method="GET" >
                                <div className="form-group"> <label>Username</label> <input type="email" className="form-control underlined" name="username" id="username" placeholder="Your email address" required="" aria-required="true" /> </div>
                                <div className="form-group"> <label>Password</label> <input type="password" className="form-control underlined" name="password" id="password" placeholder="Your password" required="" aria-required="true" /> </div>
                                <div className="form-group"> <label>
                                    <input className="checkbox" id="remember" type="checkbox" />
                                    <span>Remember me</span>
                                </label> <a href="reset.html" className="forgot-btn pull-right">Forgot password?</a> </div>
                                <div className="form-group"> <button type="submit" className="btn btn-block btn-primary">Login</button> </div>
                                <div className="form-group">
                                    <p className="text-muted text-xs-center">Do not have an account? <a href="signup.html">Sign Up!</a></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        currentUser: state.authentication.currentUser,
        isLoggedIn: state.authentication.isLoggedIn,
        token: state.authentication.token
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleLogin: (currentUser) => {
            dispatch(handleLogin(currentUser));
        },
        handleLogout: () => {
            dispatch(handleLogout());
        },
        setToken: (token) => {
            dispatch(setToken(token));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AnterosLogin);