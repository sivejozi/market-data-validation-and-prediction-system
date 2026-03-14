package com.sive.validation.prediction.system.dto.message;

import com.sive.validation.prediction.system.dto.appointment.AppointmentDTO;

public class DataDTO {
    AppointmentDTO appointment;
    //there can be more objects here

    public DataDTO(AppointmentDTO appointment) {
        this.appointment = appointment;
    }

    public DataDTO() {
    }

    public AppointmentDTO getAppointment() {
        return appointment;
    }

    public void setAppointment(AppointmentDTO appointment) {
        this.appointment = appointment;
    }
}
