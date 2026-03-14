package com.sive.bookingsystem.exception.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No role found with name provided")
public class RoleNotFoundException extends RuntimeException {
    private String role;

    public RoleNotFoundException(String role) {
        super("No role found with name: " + role);
        this.role = role;
    }
}
