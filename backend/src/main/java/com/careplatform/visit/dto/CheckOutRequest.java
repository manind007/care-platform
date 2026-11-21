package com.careplatform.visit.dto;

import lombok.Data;

@Data
public class CheckOutRequest {
    private Double latitude;
    private Double longitude;
    private String careNotes;
    private boolean allTasksCompleted;
}
