package com.sive.validation.prediction.system.model.repository.security;

import com.sive.validation.prediction.system.model.security.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserModel, Integer> {
    Optional<UserModel> findByEmailIgnoreCase(String email);
}