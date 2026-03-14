package com.sive.bookingsystem.controller.security;

import com.sive.bookingsystem.dto.profile.ProfileDTO;
import com.sive.bookingsystem.dto.profile.ProfileSummaryDTO;
import com.sive.bookingsystem.dto.profile.RoleDTO;
import com.sive.bookingsystem.dto.security.response.security.JwtResponse;
import com.sive.bookingsystem.exception.security.UserNotFoundException;
import com.sive.bookingsystem.exception.security.UserRegistrationFailureException;
import com.sive.bookingsystem.service.profile.security.JwtService;
import com.sive.bookingsystem.service.profile.security.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final UserService userService;
    private final JwtService jwtService;

    @Autowired
    public AuthenticationController(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @GetMapping("/hi")
    public ResponseEntity<String> hi() {
        return ResponseEntity.ok("Hi from user service!");
    }

    @PostMapping(value = "/register")
    public ResponseEntity<?> register(@RequestBody ProfileDTO profileDto) {
        String email = profileDto.getName();

        if (profileDto.getEmail() != null && profileDto.getPassword() != null && (profileDto.getPassword().equals(profileDto.getConfirmPassword()))) {
            ProfileDTO newProfileDto = userService.registerUser(profileDto);
            if (newProfileDto != null) {
                return ResponseEntity.ok(newProfileDto);
            } else {
                throw new UserRegistrationFailureException(email);
            }
        } else {
            throw new UserNotFoundException(email);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody ProfileSummaryDTO request) {
        ProfileDTO profileDTO = userService.loadUserByUsername(request.getEmail());

        if (profileDTO == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        if (!new BCryptPasswordEncoder().matches(request.getPassword(), profileDTO.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        List<String> roles = profileDTO.getRoles().stream()
                .map(RoleDTO::getName)
                .collect(Collectors.toList());

        String token = jwtService.generateToken(profileDTO.getEmail(), roles);
        return ResponseEntity.ok(new JwtResponse(token));
    }
}