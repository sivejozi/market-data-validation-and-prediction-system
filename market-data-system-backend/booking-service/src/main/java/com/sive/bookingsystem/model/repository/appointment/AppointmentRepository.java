package com.sive.bookingsystem.model.repository.appointment;

import com.sive.bookingsystem.model.appointment.AppointmentModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentModel, Long> {
    List<AppointmentModel> findByCustomerName(String customerName);
}
