package com.sive.bookingsystem.exception.message;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "No message provided")
public class MessageNotFoundException extends RuntimeException {

    public MessageNotFoundException() {
        super("No message found");
    }
}