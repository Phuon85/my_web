package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode; 
import org.hibernate.type.SqlTypes;         

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

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "role")
    @Builder.Default
    private TeamRole role = TeamRole.MEMBER; 

    @Column(name = "join_note", length = 300)
    private String joinNote;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;
}