package com.sive.validation.prediction.system.model.markets.fx.rates;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "clean_fx_rates", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FXRateModel implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String currencyPair;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime date;
    private Double rate;
    private Double lag1;
    private Double rollingMean7;
    private Double rollingStd7;
    private Double rateScaled;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        FXRateModel that = (FXRateModel) o;
        return Objects.equals(id, that.id) && Objects.equals(currencyPair, that.currencyPair) && Objects.equals(date, that.date) && Objects.equals(rate, that.rate) && Objects.equals(lag1, that.lag1) && Objects.equals(rollingMean7, that.rollingMean7) && Objects.equals(rollingStd7, that.rollingStd7) && Objects.equals(rateScaled, that.rateScaled) && Objects.equals(createdAt, that.createdAt) && Objects.equals(updatedAt, that.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, currencyPair, date, rate, lag1, rollingMean7, rollingStd7, rateScaled, createdAt, updatedAt);
    }

    @Override
    public String toString() {
        return "FXRateModel{" +
                "id=" + id +
                ", currencyPair='" + currencyPair + '\'' +
                ", date=" + date +
                ", rate=" + rate +
                ", lag1=" + lag1 +
                ", rollingMean7=" + rollingMean7 +
                ", rollingStd7=" + rollingStd7 +
                ", rateScaled=" + rateScaled +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
