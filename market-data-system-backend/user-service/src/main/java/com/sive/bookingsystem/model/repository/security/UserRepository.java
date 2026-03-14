package com.sive.bookingsystem.model.repository.security;

import com.sive.bookingsystem.model.security.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserModel, Integer> {
    Optional<UserModel> findByEmailIgnoreCase(String email);
}