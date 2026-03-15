package com.sive.validation.prediction.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = "com.sive.validation.prediction.system")
@EnableDiscoveryClient
@EnableCaching
public class ValidationPredictionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ValidationPredictionServiceApplication.class, args);
    }
}
