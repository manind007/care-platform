package com.careplatform.visit.dto;

import lombok.Data;

@Data
public class CheckInRequest {
    private Double latitude;
    private Double longitude;
    private String method; // GPS, QR_CODE, NFC, MANUAL
    private String qrToken;
}
