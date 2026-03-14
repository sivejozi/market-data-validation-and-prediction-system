package com.sive.bookingsystem.service.appointment;

import com.sive.bookingsystem.dto.appointment.AppointmentDTO;

import java.util.List;

public interface AppointmentService {
    List<AppointmentDTO> findAll();
    AppointmentDTO saveAppointment(AppointmentDTO appointmentDTO);
    AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO, Boolean pushEvent);
    void deleteAppointment(Long id);
    AppointmentDTO findById(Long id);
    List<AppointmentDTO> findByCustomerName(String custerName);
}
