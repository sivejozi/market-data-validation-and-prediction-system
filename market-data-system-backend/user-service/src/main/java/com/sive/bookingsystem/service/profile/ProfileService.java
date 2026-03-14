package com.sive.bookingsystem.service.profile;

import com.sive.bookingsystem.dto.profile.ProfileDTO;
import com.sive.bookingsystem.dto.profile.RoleDTO;

import java.util.List;

public interface ProfileService {
    public ProfileDTO createProfile(ProfileDTO profileDto);
    public List<ProfileDTO> findAll();
    public ProfileDTO findByEmail(String email);
    ProfileDTO updateProfileRoles(String email, List<RoleDTO> roles);
    public List<RoleDTO> findRoles(String email);
    public List<RoleDTO> findAllRoles();
    boolean existsByEmail(String email);
    public void deleteRole(String email, String name);
    public void deleteUser(String email);
}
