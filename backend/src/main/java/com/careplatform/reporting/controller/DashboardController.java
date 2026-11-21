package com.careplatform.reporting.controller;

import com.careplatform.reporting.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboards")
@RequiredArgsConstructor
@Tag(name = "Dashboards & Reporting", description = "Aggregated operational, clinical, compliance, and financial intelligence")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/management")
    @Operation(summary = "Get management operational KPI dashboard")
    public Map<String, Object> getManagementDashboard() {
        return dashboardService.getManagementDashboard();
    }

    @GetMapping("/care-manager")
    @Operation(summary = "Get care manager quality and clinical alert dashboard")
    public Map<String, Object> getCareManagerDashboard() {
        return dashboardService.getCareManagerDashboard();
    }
}
