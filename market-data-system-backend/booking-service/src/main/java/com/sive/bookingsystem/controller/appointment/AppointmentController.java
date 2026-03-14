package com.sive.bookingsystem.controller.appointment;

import com.sive.bookingsystem.dto.appointment.AppointmentDTO;
import com.sive.bookingsystem.service.appointment.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Autowired
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    private boolean isAdmin(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isEmpty()) return false;
        List<String> roles = Arrays.asList(rolesHeader.split(","));
        return roles.contains("ROLE_ADMIN");
    }

    // Needs auth + admin
    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> findAll(
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(appointmentService.findAll());
    }

    // Needs auth
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }

    // Needs auth
    @GetMapping("/search")
    public ResponseEntity<List<AppointmentDTO>> findByCustomerName(
            @RequestParam String customerName) {
        return ResponseEntity.ok(appointmentService.findByCustomerName(customerName));
    }

    // Needs auth + admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id,
                                                  @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    // No auth
    @PostMapping("/create")
    public ResponseEntity<AppointmentDTO> save(@RequestBody AppointmentDTO appointmentDTO) {
        return ResponseEntity.ok(appointmentService.saveAppointment(appointmentDTO));
    }

    // Needs auth + admin
    @PutMapping("update/{id}/{pushEvent}")
    public ResponseEntity<AppointmentDTO> update(
            @PathVariable Long id,
            @PathVariable Boolean pushEvent,
            @RequestBody AppointmentDTO appointmentDTO,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(appointmentService.updateAppointment(id, appointmentDTO, pushEvent));
    }
}
