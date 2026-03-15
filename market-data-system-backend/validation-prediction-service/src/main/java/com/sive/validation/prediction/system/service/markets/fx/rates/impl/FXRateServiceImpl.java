package com.sive.validation.prediction.system.service.markets.fx.rates.impl;

import com.sive.validation.prediction.system.dto.markets.fx.FXRateDTO;
import com.sive.validation.prediction.system.model.markets.fx.rates.FXRateModel;
import com.sive.validation.prediction.system.model.repository.markets.fx.rates.FXRatesRepository;

import com.sive.validation.prediction.system.service.markets.fx.rates.FXRateService;
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
@CacheConfig(cacheNames = "fxRates")
public class FXRateServiceImpl implements FXRateService {

    private static final Logger logger = LoggerFactory.getLogger(FXRateServiceImpl.class);

    private final FXRatesRepository fxRatesRepository;
    private final ModelMapper modelMapper;

    public FXRateServiceImpl(FXRatesRepository fxRatesRepository,
                             ModelMapper modelMapper) {
        this.fxRatesRepository = fxRatesRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    @Cacheable(key = "'all'")
    public List<FXRateDTO> findAll() {
        logger.info("[CACHE MISS] Loading all FX rates from DB");
        return fxRatesRepository.findAll().stream()
                .map(this::convertEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(key = "#id")
    public FXRateDTO findById(Long id) {
        logger.info("[CACHE MISS] Loading FX rate {} from DB", id);
        return fxRatesRepository.findById(id)
                .map(this::convertEntityToDTO)
                .orElse(null);
    }

    @Override
    @Cacheable(key = "#currencyPair")
    public List<FXRateDTO> findByCurrencyPair(String currencyPair) {
        logger.info("[CACHE MISS] Loading FX rates for {} from DB", currencyPair);
        return fxRatesRepository.findByCurrencyPair(currencyPair).stream()
                .map(this::convertEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @CachePut(key = "#result.id")
    @CacheEvict(key = "'all'")
    public FXRateDTO saveFXRate(FXRateDTO dto) {
        FXRateModel model = convertDTOToEntity(dto);
        model.setCreatedAt(LocalDateTime.now());
        model.setUpdatedAt(LocalDateTime.now());

        FXRateModel saved = fxRatesRepository.save(model);
        logger.info("[PERSIST] Saved FX rate: {} - {}", saved.getCurrencyPair(), saved.getDate());

        return convertEntityToDTO(saved);
    }

    @Override
    @CachePut(key = "#id")
    @CacheEvict(allEntries = true)
    public FXRateDTO updateFXRate(Long id, FXRateDTO dto) {
        Optional<FXRateModel> optional = fxRatesRepository.findById(id);
        if (optional.isEmpty()) {
            logger.warn("Attempted to update non-existing FXRate with id {}", id);
            throw new RuntimeException("FXRate not found with id: " + id);
        }

        FXRateModel existing = optional.get();
        existing.setCurrencyPair(dto.getCurrencyPair());
        existing.setDate(dto.getDate());
        existing.setRate(dto.getRate());
        existing.setLag1(dto.getLag1());
        existing.setRollingMean7(dto.getRollingMean7());
        existing.setRollingStd7(dto.getRollingStd7());
        existing.setRateScaled(dto.getRateScaled());
        existing.setUpdatedAt(LocalDateTime.now());

        FXRateModel saved = fxRatesRepository.save(existing);
        logger.info("[UPDATE] Updated FX rate: {} - {}", saved.getCurrencyPair(), saved.getDate());

        return convertEntityToDTO(saved);
    }

    @Override
    @CacheEvict(allEntries = true)
    public void deleteFXRate(Long id) {
        if (fxRatesRepository.existsById(id)) {
            fxRatesRepository.deleteById(id);
            logger.info("[DELETE] Deleted FXRate with id {}", id);
        } else {
            logger.warn("Attempted to delete non-existing FXRate with id {}", id);
            throw new RuntimeException("FXRate not found with id: " + id);
        }
    }

    private FXRateModel convertDTOToEntity(FXRateDTO dto) {
        return modelMapper.map(dto, FXRateModel.class);
    }

    private FXRateDTO convertEntityToDTO(FXRateModel model) {
        return modelMapper.map(model, FXRateDTO.class);
    }
}