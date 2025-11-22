package com.example.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.user.entity.UserAccount;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
   UserAccount findByAccountId(Long accountID);

   UserAccount findByUsername(String username);

   List<UserAccount> findByStatus(UserAccount.Status status);
}