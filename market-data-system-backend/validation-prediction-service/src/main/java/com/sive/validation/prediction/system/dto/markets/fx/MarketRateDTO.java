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
public class MarketRateDTO {
    private Long id;
    private String instrument;
    private String assetClass;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime date;
    private Double rate;
    private Double lag1;
    private Double lag7;
    private Double rollingMean7;
    private Double rollingStd7;
    private Double rateScaled;

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        MarketRateDTO fxRateDTO = (MarketRateDTO) o;
        return Objects.equals(instrument, fxRateDTO.instrument) && Objects.equals(date, fxRateDTO.date) && Objects.equals(rate, fxRateDTO.rate) && Objects.equals(lag1, fxRateDTO.lag1) && Objects.equals(lag7, fxRateDTO.lag7) && Objects.equals(rollingMean7, fxRateDTO.rollingMean7) && Objects.equals(rollingStd7, fxRateDTO.rollingStd7) && Objects.equals(rateScaled, fxRateDTO.rateScaled);
    }

    @Override
    public int hashCode() {
        return Objects.hash(instrument, date, rate, lag1, lag7, rollingMean7, rollingStd7, rateScaled);
    }

    @Override
    public String toString() {
        return "MarketRateDTO{" +
                "instrument='" + instrument + '\'' +
                ", date=" + date +
                ", rate=" + rate +
                ", lag1=" + lag1 +
                ", rollingMean7=" + rollingMean7 +
                ", rollingStd7=" + rollingStd7 +
                ", rateScaled=" + rateScaled +
                '}';
    }
}
