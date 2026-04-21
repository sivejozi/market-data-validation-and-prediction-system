package com.sive.validation.prediction.system.service.market.rates.impl;

import com.sive.validation.prediction.system.dto.markets.rates.MarketRateDTO;
import com.sive.validation.prediction.system.model.market.rates.MarketRateModel;
import com.sive.validation.prediction.system.model.repository.market.rates.MarketRatesRepository;
import com.sive.validation.prediction.system.service.market.rates.MarketRateService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@CacheConfig(cacheNames = "MarketRates")
public class MarketRateServiceImpl implements MarketRateService {

    private static final Logger logger = LoggerFactory.getLogger(MarketRateServiceImpl.class);

    private final MarketRatesRepository marketRatesRepository;
    private final ModelMapper modelMapper;

    public MarketRateServiceImpl(MarketRatesRepository marketRatesRepository,
                             ModelMapper modelMapper) {
        this.marketRatesRepository = marketRatesRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    @Cacheable(key = "'all'")
    public List<MarketRateDTO> findAll() {
        logger.info("[CACHE MISS] Loading all Market rates from DB");
        return marketRatesRepository.findAll().stream()
                .map(this::convertEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(key = "#id")
    public MarketRateDTO findById(Long id) {
        logger.info("[CACHE MISS] Loading Market rate {} from DB", id);
        return marketRatesRepository.findById(id)
                .map(this::convertEntityToDTO)
                .orElse(null);
    }

    @Override
    @Cacheable(value = "rates", key = "#instrument")
    public List<MarketRateDTO> findByInstrument(String instrument) {
        logger.info("[CACHE MISS] Loading Market rates for {} from DB", instrument);
        return marketRatesRepository.findByInstrument(instrument).stream()
                .map(this::convertEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @CachePut(key = "#result.id")
    @CacheEvict(key = "'all'")
    public MarketRateDTO saveMarketRate(MarketRateDTO dto) {
        MarketRateModel model = convertDTOToEntity(dto);
        model.setCreatedAt(LocalDateTime.now());
        model.setUpdatedAt(LocalDateTime.now());

        MarketRateModel saved = marketRatesRepository.save(model);
        logger.info("[PERSIST] Saved Market rate: {} - {}", saved.getInstrument(), saved.getDate());

        return convertEntityToDTO(saved);
    }

    @Override
    @CachePut(key = "#id")
    @CacheEvict(allEntries = true)
    public MarketRateDTO updateMarketRate(Long id, MarketRateDTO dto) {
        Optional<MarketRateModel> optional = marketRatesRepository.findById(id);
        if (optional.isEmpty()) {
            logger.warn("Attempted to update non-existing MarketRate with id {}", id);
            throw new RuntimeException("MarketRate not found with id: " + id);
        }

        MarketRateModel existing = optional.get();
        existing.setInstrument(dto.getInstrument());
        existing.setDate(dto.getDate());
        existing.setRate(dto.getRate());
        existing.setLag1(dto.getLag1());
        existing.setRollingMean7(dto.getRollingMean7());
        existing.setRollingStd7(dto.getRollingStd7());
        existing.setRateScaled(dto.getRateScaled());
        existing.setUpdatedAt(LocalDateTime.now());

        MarketRateModel saved = marketRatesRepository.save(existing);
        logger.info("[UPDATE] Updated Market rate: {} - {}", saved.getInstrument(), saved.getDate());

        return convertEntityToDTO(saved);
    }

    @Override
    @CacheEvict(allEntries = true)
    public void deleteMarketRate(Long id) {
        if (marketRatesRepository.existsById(id)) {
            marketRatesRepository.deleteById(id);
            logger.info("[DELETE] Deleted MarketRate with id {}", id);
        } else {
            logger.warn("Attempted to delete non-existing MarketRate with id {}", id);
            throw new RuntimeException("MarketRate not found with id: " + id);
        }
    }

    private MarketRateModel convertDTOToEntity(MarketRateDTO dto) {
        return modelMapper.map(dto, MarketRateModel.class);
    }

    private MarketRateDTO convertEntityToDTO(MarketRateModel model) {
        return modelMapper.map(model, MarketRateDTO.class);
    }
}