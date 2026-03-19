package com.sive.validation.prediction.system.exception.markets.fx;

public class MarketRatePersistenceException extends RuntimeException {

    private final String instrument;
    private final String date;

    public MarketRatePersistenceException(String instrument, String date, Throwable cause) {
        super(String.format("Failed to persist Market rate for %s on %s", instrument, date), cause);
        this.instrument = instrument;
        this.date = date;
    }

    public String getInstrument() {
        return instrument;
    }

    public String getDate() {
        return date;
    }
}
