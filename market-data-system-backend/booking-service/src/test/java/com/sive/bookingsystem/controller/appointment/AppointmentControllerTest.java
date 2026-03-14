package com.sive.bookingsystem.controller.appointment;

import com.sive.bookingsystem.dto.appointment.AppointmentDTO;
import com.sive.bookingsystem.service.appointment.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    private AppointmentDTO sampleAppointment;

    @BeforeEach
    void setUp() {
        sampleAppointment = new AppointmentDTO();
        sampleAppointment.setId(1L);
        sampleAppointment.setCustomerName("John Doe");
    }

    @Test
    void testFindAll_AsAdmin_ShouldReturnOk() throws Exception {
        Mockito.when(appointmentService.findAll()).thenReturn(List.of(sampleAppointment));

        mockMvc.perform(get("/api/appointments")
                        .header("X-User-Email", "admin@email.com")
                        .header("X-User-Roles", "ROLE_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerName").value("John Doe"));
    }

    @Test
    void testFindAll_AsUser_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/appointments")
                        .header("X-User-Email", "user@email.com")
                        .header("X-User-Roles", "ROLE_USER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testFindById_ShouldReturnAppointment() throws Exception {
        Mockito.when(appointmentService.findById(1L)).thenReturn(sampleAppointment);

        mockMvc.perform(get("/api/appointments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("John Doe"));
    }

    @Test
    void testDeleteAppointment_AsAdmin_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/appointments/1")
                        .header("X-User-Roles", "ROLE_ADMIN"))
                .andExpect(status().isNoContent());

        Mockito.verify(appointmentService).deleteAppointment(1L);
    }

    @Test
    void testDeleteAppointment_AsUser_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(delete("/api/appointments/1")
                        .header("X-User-Roles", "ROLE_USER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testSaveAppointment_ShouldReturnCreated() throws Exception {
        Mockito.when(appointmentService.saveAppointment(any(AppointmentDTO.class)))
                .thenReturn(sampleAppointment);

        String json = """
                {"customerName": "John Doe"}
                """;

        mockMvc.perform(post("/api/appointments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("John Doe"));
    }

    @Test
    void testUpdateAppointment_AsAdmin_ShouldReturnOk() throws Exception {
        Mockito.when(appointmentService.updateAppointment(eq(1L), any(AppointmentDTO.class), eq(true)))
                .thenReturn(sampleAppointment);

        String json = """
                {"customerName": "Updated Name"}
                """;

        mockMvc.perform(put("/api/appointments/update/1/true")
                        .header("X-User-Roles", "ROLE_ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("John Doe"));
    }

    @Test
    void testUpdateAppointment_AsUser_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(put("/api/appointments/update/1/true")
                        .header("X-User-Roles", "ROLE_USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }
}
