package com.sive.bookingsystem.service.profile.security;

import com.sive.bookingsystem.dto.profile.ProfileDTO;
import com.sive.bookingsystem.exception.security.RoleNotFoundException;
import com.sive.bookingsystem.model.repository.security.RoleRepository;
import com.sive.bookingsystem.model.repository.security.UserRepository;
import com.sive.bookingsystem.model.security.RoleModel;
import com.sive.bookingsystem.model.security.UserModel;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {

    @Autowired
    private UserRepository profileRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ModelMapper modelMapper;

    public ProfileDTO loadUserByUsername(String email) {
        UserModel user = profileRepository.findByEmailIgnoreCase(email).isPresent() ? profileRepository.findByEmailIgnoreCase(email).get() : null;
        return this.modelMapper.map(user, ProfileDTO.class);
    }

    public ProfileDTO registerUser(ProfileDTO profileDto) {
        profileDto.setPassword(new BCryptPasswordEncoder().encode(profileDto.getPassword()));
        profileDto.setConfirmPassword(new BCryptPasswordEncoder().encode(profileDto.getConfirmPassword()));
        UserModel userModel = new UserModel();
        userModel.setEmail(profileDto.getEmail());
        userModel.setName(profileDto.getName());
        userModel.setSurname(profileDto.getSurname());
        userModel.setCellphone(profileDto.getCellphone());
        userModel.setPassword(profileDto.getPassword());
        userModel.setConfirmPassword(profileDto.getConfirmPassword());
        userModel.setTitle(profileDto.getTitle());

        RoleModel userRole = roleRepository.findByName("ROLE_USER").orElseThrow(() -> new RoleNotFoundException("ROLE_USER"));

        Set<RoleModel> roles = new HashSet<>();

        if (userRole != null)
            roles.add(userRole);

        userModel.setRoles(roles);
        return modelMapper.map(profileRepository.save(userModel), ProfileDTO.class);
    }
}
