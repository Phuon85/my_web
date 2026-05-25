package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_member",
       uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "user_id"}))
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserHumg user;

    @Column(length = 50)
    @Builder.Default
    private String role = "MEMBER";  // CAPTAIN | MEMBER

    @Column(name = "join_note", length = 300)
    private String joinNote;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;
}