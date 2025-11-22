package com.example.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.user.entity.Users;

public interface UserRepository extends JpaRepository<Users, Long> {
    Users findByEmail(String email);
    Optional<Users> findByuserId(Long id);
    List<Users> findByStatus(Users.Status status);
    
}
