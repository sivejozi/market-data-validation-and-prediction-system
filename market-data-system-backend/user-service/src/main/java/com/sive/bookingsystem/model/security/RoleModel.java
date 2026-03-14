package com.sive.bookingsystem.model.security;

import jakarta.persistence.*;
import org.apache.commons.lang3.builder.CompareToBuilder;

import java.util.Set;

@Entity
@Table(name = "roles", schema="public")
public class RoleModel implements Comparable<RoleModel>{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @ManyToMany(mappedBy = "roles")
    private Set<UserModel> users;

    public RoleModel(Long id, String name, Set<UserModel> users) {
        this.id = id;
        this.name = name;
        this.users = users;
    }

    public RoleModel() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<UserModel> getUsers() {
        return users;
    }

    public void setUsers(Set<UserModel> users) {
        this.users = users;
    }

    @Override
    public int compareTo(RoleModel roleModel) {
        return new CompareToBuilder().append(name, roleModel.name).toComparison();
    }
}
