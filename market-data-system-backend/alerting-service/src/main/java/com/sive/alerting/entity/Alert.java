package com.sive.alerting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "instrument")
    private String instrument;

    @Column(name = "date")
    private String date;

    @Column(name = "rate")
    private Double rate;

    @Column(name = "severity")
    private String severity;

    @Column(name = "models_agreed")
    private Integer modelsAgreed;

    @Column(name = "total_models")
    private Integer totalModels;

    @Column(name = "flagged_models")
    private String flaggedModels;

    @Column(name = "consensus")
    private String consensus;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInstrument() {
        return instrument;
    }

    public void setInstrument(String instrument) {
        this.instrument = instrument;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Double getRate() {
        return rate;
    }

    public void setRate(Double rate) {
        this.rate = rate;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Integer getModelsAgreed() {
        return modelsAgreed;
    }

    public void setModelsAgreed(Integer modelsAgreed) {
        this.modelsAgreed = modelsAgreed;
    }

    public Integer getTotalModels() {
        return totalModels;
    }

    public void setTotalModels(Integer totalModels) {
        this.totalModels = totalModels;
    }

    public String getFlaggedModels() {
        return flaggedModels;
    }

    public void setFlaggedModels(String flaggedModels) {
        this.flaggedModels = flaggedModels;
    }

    public String getConsensus() {
        return consensus;
    }

    public void setConsensus(String consensus) {
        this.consensus = consensus;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }
}