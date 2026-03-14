package com.sive.bookingsystem.dto.profile;

import org.apache.commons.lang3.builder.CompareToBuilder;

public class RoleDTO implements Comparable<RoleDTO> {
    private String name;

    public RoleDTO(String name) {
        this.name = name;
    }

    public RoleDTO() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public int compareTo(RoleDTO roleDto) {
        return new CompareToBuilder().append(name, roleDto.name).toComparison();
    }
}
