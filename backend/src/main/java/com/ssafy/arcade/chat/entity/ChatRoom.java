package com.ssafy.arcade.chat.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ssafy.arcade.common.util.BaseTimeEntity;
import com.ssafy.arcade.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ChatRoom extends BaseTimeEntity { // 관계형 DB에 매핑
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chatRoomSeq;
    @ManyToOne
    @JoinColumn(name = "user1") // 외래키 매핑
    @JsonBackReference // 순환 참조 방어
    private User user1; // 유저 1
    @ManyToOne
    @JoinColumn(name = "user2") // 외래키 매핑
    @JsonBackReference // 순환 참조 방어
    private User user2; // 유저 2
    @Column
    private String lastContent;
    @Column
    private String lastTime;
    @Builder
    public ChatRoom(User user1, User user2, String lastContent, String lastTime) {
        this.user1 = user1;
        this.user2 = user2;
        this.lastContent = lastContent;
        this.lastTime = lastTime;
    }
}
