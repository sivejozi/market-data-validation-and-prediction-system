package com.sive.validation.prediction.system.dto.markets.fx;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FXRateDTO {
    private String currencyPair;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime date;
    private Double rate;
    private Double lag1;
    private Double rollingMean7;
    private Double rollingStd7;
    private Double rateScaled;

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        FXRateDTO fxRateDTO = (FXRateDTO) o;
        return Objects.equals(currencyPair, fxRateDTO.currencyPair) && Objects.equals(date, fxRateDTO.date) && Objects.equals(rate, fxRateDTO.rate) && Objects.equals(lag1, fxRateDTO.lag1) && Objects.equals(rollingMean7, fxRateDTO.rollingMean7) && Objects.equals(rollingStd7, fxRateDTO.rollingStd7) && Objects.equals(rateScaled, fxRateDTO.rateScaled);
    }

    @Override
    public int hashCode() {
        return Objects.hash(currencyPair, date, rate, lag1, rollingMean7, rollingStd7, rateScaled);
    }

    @Override
    public String toString() {
        return "FXRateDTO{" +
                "currencyPair='" + currencyPair + '\'' +
                ", date=" + date +
                ", rate=" + rate +
                ", lag1=" + lag1 +
                ", rollingMean7=" + rollingMean7 +
                ", rollingStd7=" + rollingStd7 +
                ", rateScaled=" + rateScaled +
                '}';
    }
}
