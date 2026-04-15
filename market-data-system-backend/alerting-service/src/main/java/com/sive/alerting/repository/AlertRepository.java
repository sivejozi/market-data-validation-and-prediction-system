package com.sive.alerting.repository;

import com.sive.alerting.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByInstrumentOrderByReceivedAtDesc(String instrument);
    List<Alert> findAllByOrderByReceivedAtDesc();
    List<Alert> findBySeverityOrderByReceivedAtDesc(String severity);
}