package com.sive.validation.prediction.system.controller.markets.fx;

import com.sive.validation.prediction.system.dto.markets.fx.FXRateDTO;
import com.sive.validation.prediction.system.service.markets.fx.rates.FXRateService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/fx-rates")
@Tag(name = "FX Rates", description = "FX Rate management endpoints")
public class FXRateController {

    private final FXRateService fxRateService;

    @Autowired
    public FXRateController(FXRateService fxRateService) {
        this.fxRateService = fxRateService;
    }

    private boolean isAdmin(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isEmpty()) return false;
        List<String> roles = Arrays.asList(rolesHeader.split(","));
        return roles.contains("ROLE_ADMIN");
    }

    // Needs auth + admin
    @GetMapping
    public ResponseEntity<List<FXRateDTO>> findAll(
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(fxRateService.findAll());
    }

    // Needs auth
    @GetMapping("/{id}")
    public ResponseEntity<FXRateDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(fxRateService.findById(id));
    }

    // Needs auth
    @GetMapping("/search")
    public ResponseEntity<List<FXRateDTO>> findByCurrencyPair(
            @RequestParam String currencyPair) {
        return ResponseEntity.ok(fxRateService.findByCurrencyPair(currencyPair));
    }

    // Needs auth + admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFXRate(
            @PathVariable Long id,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        fxRateService.deleteFXRate(id);
        return ResponseEntity.noContent().build();
    }

    // Needs auth + admin
    @PostMapping
    public ResponseEntity<FXRateDTO> save(
            @RequestBody FXRateDTO fxRateDTO,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fxRateService.saveFXRate(fxRateDTO));
    }

    // Needs auth + admin
    @PutMapping("/{id}")
    public ResponseEntity<FXRateDTO> update(
            @PathVariable Long id,
            @RequestBody FXRateDTO fxRateDTO,
            @RequestHeader("X-User-Roles") String rolesHeader) {

        if (!isAdmin(rolesHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(fxRateService.updateFXRate(id, fxRateDTO));
    }
}