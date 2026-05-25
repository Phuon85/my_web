package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_humg")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserHumg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(unique = true, length = 20)
    private String mssv;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "STUDENT";

    @Column(length = 100)
    private String lop;

    @Column(length = 100)
    private String khoa;

    @Column(length = 200)
    private String truong;

    @Column(name = "is_internal", nullable = false)
    @Builder.Default
    private Boolean isInternal = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "total_score")
    @Builder.Default
    private Integer totalScore = 0;

    @Column
    private Integer rank;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
