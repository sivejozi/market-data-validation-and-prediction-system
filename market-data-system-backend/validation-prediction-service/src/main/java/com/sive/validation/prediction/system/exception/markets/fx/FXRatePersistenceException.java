package com.sive.validation.prediction.system.exception.markets.fx;

public class FXRatePersistenceException extends RuntimeException {

    private final String currencyPair;
    private final String date;

    public FXRatePersistenceException(String currencyPair, String date, Throwable cause) {
        super(String.format("Failed to persist FX rate for %s on %s", currencyPair, date), cause);
        this.currencyPair = currencyPair;
        this.date = date;
    }

    public String getCurrencyPair() {
        return currencyPair;
    }

    public String getDate() {
        return date;
    }
}
