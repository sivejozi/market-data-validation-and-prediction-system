package com.sive.alerting.controller;

import com.sive.alerting.dto.AlertDTO;
import com.sive.alerting.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts", description = "Market rate anomaly alert endpoints")
public class AlertController {

    private final AlertService alertService;

    @Autowired
    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    @Operation(summary = "Get all alerts ordered by most recent")
    public ResponseEntity<List<AlertDTO>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping("/instrument/{instrument}")
    @Operation(summary = "Get alerts by instrument")
    public ResponseEntity<List<AlertDTO>> getByInstrument(
            @PathVariable String instrument) {
        return ResponseEntity.ok(
                alertService.getAlertsByInstrument(instrument));
    }

    @GetMapping("/severity/{severity}")
    @Operation(summary = "Get alerts by severity — HIGH, MED, LOW")
    public ResponseEntity<List<AlertDTO>> getBySeverity(
            @PathVariable String severity) {
        return ResponseEntity.ok(
                alertService.getAlertsBySeverity(severity));
    }
}