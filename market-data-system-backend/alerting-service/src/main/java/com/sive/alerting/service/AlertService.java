package com.sive.alerting.service;

import com.sive.alerting.dto.AlertDTO;
import com.sive.alerting.entity.Alert;
import com.sive.alerting.repository.AlertRepository;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private static final Logger logger =
            LoggerFactory.getLogger(AlertService.class);

    private final AlertRepository alertRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public AlertService(AlertRepository alertRepository, ModelMapper modelMapper) {
        this.alertRepository = alertRepository;
        this.modelMapper = modelMapper;
    }

    /**
     * Not so ideal if payload structure changes
     */
    public void saveAlert(Map<String, Object> payload) {
        try {
            Map<String, Object> data = getMap(payload, "data");
            Map<String, Object> alertDTO = getMap(data, "validationAlertDTO");

            Alert alert = new Alert();
            alert.setInstrument(getString(alertDTO, "instrument"));
            alert.setRate(getDouble(alertDTO, "rate"));
            alert.setSeverity(getString(alertDTO, "severity"));
            alert.setModelsAgreed(getInt(alertDTO, "flagCount"));
            alert.setTotalModels(getInt(alertDTO, "totalModels"));
            alert.setReceivedAt(LocalDateTime.now());

            // Date is a List [2025, 9, 30, 0, 0] — convert to string
            Object dateObj = alertDTO.get("date");
            if (dateObj instanceof List<?> dateList && dateList.size() >= 3) {
                alert.setDate(String.format("%d-%02d-%02d",
                        ((Number) dateList.get(0)).intValue(),
                        ((Number) dateList.get(1)).intValue(),
                        ((Number) dateList.get(2)).intValue()));
            }

            Object flagged = alertDTO.get("flaggedModels");
            if (flagged instanceof List<?> list) {
                alert.setFlaggedModels(
                        list.stream()
                                .map(Object::toString)
                                .collect(Collectors.joining(", "))
                );
            }

            // Build consensus label from flagCount
            int flagCount = getInt(alertDTO, "flagCount");
            alert.setConsensus(
                    flagCount == 3 ? "HIGH CONFIDENCE ANOMALY" :
                            flagCount == 2 ? "PROBABLE ANOMALY" : "VALID"
            );

            alertRepository.save(alert);
            logger.info("[ALERT] Saved — instrument={} severity={} models={}",
                    alert.getInstrument(), alert.getSeverity(),
                    alert.getFlaggedModels());

        } catch (Exception e) {
            logger.error("[ALERT] Failed to save alert: {}", e.getMessage());
        }
    }

    public List<AlertDTO> getAllAlerts() {
        return alertRepository.findAllByOrderByReceivedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AlertDTO> getAlertsByInstrument(String instrument) {
        return alertRepository
                .findByInstrumentOrderByReceivedAtDesc(instrument)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AlertDTO> getAlertsBySeverity(String severity) {
        return alertRepository
                .findBySeverityOrderByReceivedAtDesc(severity)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private AlertDTO toDTO(Alert a) {
        return modelMapper.map(a, AlertDTO.class);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getMap(Map<String, Object> map, String key) {
        if (map == null) return new HashMap<>();
        Object val = map.get(key);
        if (val instanceof Map) return (Map<String, Object>) val;
        return new HashMap<>();
    }

    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : null;
    }

    private Double getDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return null;
        if (val instanceof Number n) return n.doubleValue();
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private Integer getInt(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return null;
        if (val instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(val.toString());
        } catch (Exception e) {
            return null;
        }
    }
}