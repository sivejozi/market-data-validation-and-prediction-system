package com.sive.bookingsystem.dto.profile;

public class ProfileSummaryDTO {

    private String email, password;

    public ProfileSummaryDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public ProfileSummaryDTO() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
