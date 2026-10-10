package com.learncue;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Prototype only; restrict this before production.
public class ProgressController {
    private final Map<String, Object> latestProgress = new ConcurrentHashMap<>();

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "app", "LearnCue");
    }

    @PostMapping("/progress")
    public Map<String, Object> saveProgress(@RequestBody Map<String, Object> progress) {
        latestProgress.clear();
        latestProgress.putAll(progress);
        return Map.of("message", "Progress received", "progress", Map.copyOf(latestProgress));
    }

    @GetMapping("/progress")
    public Map<String, Object> getProgress() {
        return Map.copyOf(latestProgress);
    }
}
