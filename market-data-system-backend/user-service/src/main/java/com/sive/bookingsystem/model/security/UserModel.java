package com.sive.bookingsystem.model.security;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "users", schema = "public")
public class UserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String name;

    private String surname;

    private String cellphone;

    private String email;

    private String password;

    private String confirmPassword;

    @Column(name = "type", unique = true)
    @Enumerated(EnumType.STRING)
    private transient UserType type;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(name = "user_roles", schema = "public",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<RoleModel> roles;

    public UserModel(Long id, String title, String name, String surname, String cellphone, String email, String password,
                     String confirmPassword, UserType type, Set<RoleModel> roles) {
        this.id = id;
        this.title = title;
        this.name = name;
        this.surname = surname;
        this.cellphone = cellphone;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.type = type;
        this.roles = roles;
    }

    public UserModel() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getCellphone() {
        return cellphone;
    }

    public void setCellphone(String cellphone) {
        this.cellphone = cellphone;
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

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public UserType getType() {
        return type;
    }

    public void setType(UserType type) {
        this.type = type;
    }

    public Set<RoleModel> getRoles() {
        return roles;
    }

    public void setRoles(Set<RoleModel> roles) {
        this.roles = roles;
    }
}
