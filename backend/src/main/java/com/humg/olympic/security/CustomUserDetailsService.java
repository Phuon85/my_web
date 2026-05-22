package com.humg.olympic.security;

import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String credential) throws UsernameNotFoundException {
        UserHumg user = userRepository.findByEmailOrMssv(credential)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy người dùng: " + credential));

        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .disabled(!user.getIsActive())
                .accountExpired(false)
                .credentialsExpired(false)
                .accountLocked(false)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())))
                .build();
    }
}
