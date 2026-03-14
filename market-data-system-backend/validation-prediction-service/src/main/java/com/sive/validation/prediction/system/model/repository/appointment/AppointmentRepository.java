package com.sive.validation.prediction.system.model.repository.appointment;

import com.sive.validation.prediction.system.model.appointment.AppointmentModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentModel, Long> {
    List<AppointmentModel> findByCustomerName(String customerName);
}
