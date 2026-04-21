package com.sive.validation.prediction.system.service.market.rates.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
public class CacheEvictionServiceImpl {

    private static final Logger logger =
            LoggerFactory.getLogger(CacheEvictionServiceImpl.class);

    @CacheEvict(
            value = {"kmeans", "autoencoder", "rfc", "rates"},
            allEntries = true
    )
    public void evictAllModelCaches() {
        logger.info("[MLOPS] All model caches evicted — " +
                "models will retrain on next request");
    }

    @CacheEvict(
            value = {"kmeans", "autoencoder", "rfc", "rates"},
            key = "#instrument"
    )
    public void evictCacheForInstrument(String instrument) {
        logger.info("[MLOPS] Cache evicted for instrument={} — " +
                "models will retrain on next request", instrument);
    }
}
