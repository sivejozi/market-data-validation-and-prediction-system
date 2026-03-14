package com.sive.validation.prediction.system.dto.markets.fx;

import java.time.LocalDate;
import java.util.Objects;

public class FXRateDTO {
    private String currencyPair;
    private LocalDate date;
    private Double rate;
    private Double lag1;
    private Double rollingMean7;
    private Double rollingStd7;
    private Double rateScaled;

    public FXRateDTO(String currencyPair, LocalDate date, Double rate, Double lag1, Double rollingMean7, Double rollingStd7, Double rateScaled) {
        this.currencyPair = currencyPair;
        this.date = date;
        this.rate = rate;
        this.lag1 = lag1;
        this.rollingMean7 = rollingMean7;
        this.rollingStd7 = rollingStd7;
        this.rateScaled = rateScaled;
    }

    public FXRateDTO() {
    }

    public String getCurrencyPair() {
        return currencyPair;
    }

    public void setCurrencyPair(String currencyPair) {
        this.currencyPair = currencyPair;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getRate() {
        return rate;
    }

    public void setRate(Double rate) {
        this.rate = rate;
    }

    public Double getLag1() {
        return lag1;
    }

    public void setLag1(Double lag1) {
        this.lag1 = lag1;
    }

    public Double getRollingMean7() {
        return rollingMean7;
    }

    public void setRollingMean7(Double rollingMean7) {
        this.rollingMean7 = rollingMean7;
    }

    public Double getRollingStd7() {
        return rollingStd7;
    }

    public void setRollingStd7(Double rollingStd7) {
        this.rollingStd7 = rollingStd7;
    }

    public Double getRateScaled() {
        return rateScaled;
    }

    public void setRateScaled(Double rateScaled) {
        this.rateScaled = rateScaled;
    }

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
