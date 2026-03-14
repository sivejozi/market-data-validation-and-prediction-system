package com.sive.bookingsystem.exception.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No user found with email provided")
public class UserNotFoundException extends RuntimeException {

    private String email;
    public UserNotFoundException(String email) {
        super("No user found with email: " + email);
        this.email = email;
    }
}