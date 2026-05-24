package com.humg.olympic.repository;

import com.humg.olympic.entity.ForumLike;
import com.humg.olympic.entity.ForumPost;
import com.humg.olympic.entity.UserHumg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ForumLikeRepository extends JpaRepository<ForumLike, Long> {

    Optional<ForumLike> findByPostAndUser(ForumPost post, UserHumg user);

    boolean existsByPostAndUser(ForumPost post, UserHumg user);

    @Modifying
    @Query("DELETE FROM ForumLike l WHERE l.post = :post AND l.user = :user")
    void deleteByPostAndUser(@Param("post") ForumPost post, @Param("user") UserHumg user);
}