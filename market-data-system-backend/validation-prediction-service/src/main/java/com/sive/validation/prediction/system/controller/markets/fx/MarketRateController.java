package com.sive.validation.prediction.system.controller.markets.fx;

import com.sive.validation.prediction.system.dto.markets.fx.MarketRateDTO;
import com.sive.validation.prediction.system.service.markets.fx.rates.MarketRateService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/market-rates")
@Tag(name = "Market Rates", description = "Clean Market Rates management endpoints")
public class MarketRateController {

    private final MarketRateService marketRateService;

    @Autowired
    public MarketRateController(MarketRateService marketRateService) {
        this.marketRateService = marketRateService;
    }

    private boolean isAdmin(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isEmpty()) return false;
        List<String> roles = Arrays.asList(rolesHeader.split(","));
        return roles.contains("ROLE_ADMIN");
    }

    // Needs auth + admin
    @GetMapping
    public ResponseEntity<List<MarketRateDTO>> findAll(
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(marketRateService.findAll());
    }

    // Needs auth
    @GetMapping("/{id}")
    public ResponseEntity<MarketRateDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(marketRateService.findById(id));
    }

    // Needs auth
    @GetMapping("/search")
    public ResponseEntity<List<MarketRateDTO>> findByInstrument(
            @RequestParam String instrument) {
        return ResponseEntity.ok(marketRateService.findByInstrument(instrument));
    }

    // Needs auth + admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMarketRate(
            @PathVariable Long id,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        marketRateService.deleteMarketRate(id);
        return ResponseEntity.noContent().build();
    }

    // Needs auth + admin
    @PostMapping
    public ResponseEntity<MarketRateDTO> save(
            @RequestBody MarketRateDTO MarketRateDTO,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(marketRateService.saveMarketRate(MarketRateDTO));
    }

    // Needs auth + admin
    @PutMapping("/{id}")
    public ResponseEntity<MarketRateDTO> update(
            @PathVariable Long id,
            @RequestBody MarketRateDTO MarketRateDTO,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(marketRateService.updateMarketRate(id, MarketRateDTO));
    }
}