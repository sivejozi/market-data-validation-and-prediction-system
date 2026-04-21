package com.sive.validation.prediction.system.controller.markets.mlops;

import com.sive.validation.prediction.system.model.market.rates.ModelRun;
import com.sive.validation.prediction.system.service.market.rates.impl.ModelRunServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market-rates/mlops")
@Tag(name = "MLOps",
        description = "MLOps model status, training and run history endpoints")
public class MLOpsController {

    private static final Logger logger =
            LoggerFactory.getLogger(MLOpsController.class);

    private final WebClient webClient;
    private final ModelRunServiceImpl modelRunService;

    @Value("${services.ml.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Autowired
    public MLOpsController(
            WebClient.Builder webClientBuilder,
            ModelRunServiceImpl modelRunService) {
        this.webClient = webClientBuilder.build();
        this.modelRunService = modelRunService;
    }

    // ── Model status — all instruments ────────────────────────
    @GetMapping("/model-status")
    @Operation(summary = "Get model status for all instruments")
    public ResponseEntity<List> getAllModelStatus() {
        logger.info("[MLOPS] Fetching model status — all instruments");
        List result = webClient.get()
                .uri(mlServiceUrl + "/mlops/model-status")
                .retrieve()
                .onStatus(HttpStatusCode::isError, r ->
                        r.bodyToMono(String.class)
                                .flatMap(e -> Mono.error(
                                        new RuntimeException(
                                                "ML service error: " + e))))
                .bodyToMono(List.class)
                .block();
        return ResponseEntity.ok(result);
    }

    // ── Model status — single instrument ──────────────────────
    @GetMapping("/model-status/{instrument}")
    @Operation(summary = "Get model status for a specific instrument")
    public ResponseEntity<Map> getModelStatus(
            @PathVariable String instrument) {
        logger.info("[MLOPS] Fetching model status for {}",
                instrument);
        Map result = webClient.get()
                .uri(mlServiceUrl + "/mlops/model-status/" + instrument)
                .retrieve()
                .onStatus(HttpStatusCode::isError, r ->
                        r.bodyToMono(String.class)
                                .flatMap(e -> Mono.error(
                                        new RuntimeException(
                                                "ML service error: " + e))))
                .bodyToMono(Map.class)
                .block();
        return ResponseEntity.ok(result);
    }

    // ── Train single instrument ───────────────────────────────
    @PostMapping("/train/{instrument}")
    @Operation(summary = "Train all models for a specific instrument")
    public ResponseEntity<Map> trainModels(
            @PathVariable String instrument,
            @RequestBody Map<String, Object> request) {
        logger.info("[MLOPS] Triggering training for {}",
                instrument);
        Map result = webClient.post()
                .uri(mlServiceUrl + "/mlops/train/" + instrument)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, r ->
                        r.bodyToMono(String.class)
                                .flatMap(e -> Mono.error(
                                        new RuntimeException(
                                                "ML service error: " + e))))
                .bodyToMono(Map.class)
                .block();
        logger.info("[MLOPS] Training complete for {}", instrument);
        return ResponseEntity.ok(result);
    }

    // ── Retrain all instruments ───────────────────────────────
    @PostMapping("/retrain/all")
    @Operation(summary = "Retrain all models for all instruments")
    public ResponseEntity<Map> retrainAll(
            @RequestBody Map<String, Object> request) {
        logger.info("[MLOPS] Triggering retrain all");
        Map result = webClient.post()
                .uri(mlServiceUrl + "/mlops/retrain/all")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, r ->
                        r.bodyToMono(String.class)
                                .flatMap(e -> Mono.error(
                                        new RuntimeException(
                                                "ML service error: " + e))))
                .bodyToMono(Map.class)
                .block();
        logger.info("[MLOPS] Retrain all complete");
        return ResponseEntity.ok(result);
    }

    // ── Model run history — all ───────────────────────────────
    @GetMapping("/model-runs")
    @Operation(summary = "Get all model run history")
    public ResponseEntity<List<ModelRun>> getAllModelRuns() {
        return ResponseEntity.ok(modelRunService.getAllRuns());
    }

    // ── Model run history — by instrument ─────────────────────
    @GetMapping("/model-runs/instrument/{instrument}")
    @Operation(summary = "Get model runs by instrument")
    public ResponseEntity<List<ModelRun>> getRunsByInstrument(
            @PathVariable String instrument) {
        return ResponseEntity.ok(
                modelRunService.getRunsByInstrument(instrument));
    }

    // ── Model run history — by model ──────────────────────────
    @GetMapping("/model-runs/model/{model}")
    @Operation(summary = "Get model runs by model name")
    public ResponseEntity<List<ModelRun>> getRunsByModel(
            @PathVariable String model) {
        return ResponseEntity.ok(
                modelRunService.getRunsByModel(model));
    }
}
