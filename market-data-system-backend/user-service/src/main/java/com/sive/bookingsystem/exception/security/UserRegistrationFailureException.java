package com.sive.bookingsystem.exception.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Failed to register user")
public class UserRegistrationFailureException extends RuntimeException {

    private String email;
    public UserRegistrationFailureException(String email) {
        super("Failed to register use with email: " + email);
        this.email = email;
    }
}