package com.sive.bookingsystem.model.repository.security;

import com.sive.bookingsystem.model.security.RoleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<RoleModel, Integer> {
    Optional<RoleModel> findByName(String name);
}
