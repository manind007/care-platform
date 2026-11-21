package com.careplatform.skills.controller;

import com.careplatform.skills.model.CarerSkill;
import com.careplatform.skills.service.CarerSkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
@Tag(name = "Workforce Skills & Credential Matching", description = "Match complex client clinical needs with verified carer certifications")
public class CarerSkillController {

    private final CarerSkillService skillService;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get verified skills for a specific staff member")
    public List<CarerSkill> getSkillsForUser(@PathVariable Long userId) {
        return skillService.getSkillsForUser(userId);
    }

    @GetMapping
    @Operation(summary = "Get all carer skills matrix")
    public List<CarerSkill> getAllSkills() {
        return skillService.getAllSkills();
    }

    @PostMapping
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Record verified staff competency / certification")
    public ResponseEntity<CarerSkill> addSkill(@RequestBody CarerSkill skill) {
        return ResponseEntity.status(HttpStatus.CREATED).body(skillService.addSkill(skill));
    }

    @PostMapping("/match")
    @Operation(summary = "Intelligent skill matching engine: rank carers against required clinical competencies")
    public List<Map<String, Object>> matchCarers(@RequestBody Map<String, List<String>> request) {
        List<String> required = request.getOrDefault("requiredSkills", List.of());
        return skillService.matchCarers(required);
    }
}

