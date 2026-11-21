package com.careplatform.nutrition.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fluid_balance_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FluidBalanceEntry extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "entry_type", nullable = false, length = 20)
    private String entryType; // INTAKE, OUTPUT

    @Column(name = "volume_ml", nullable = false)
    private Integer volumeMl; // e.g. 250 (ml)

    @Column(name = "fluid_description", nullable = false, length = 100)
    private String fluidDescription; // e.g. "Cup of Tea", "Water", "Oral Nutritional Supplement (Ensure)", "Urine", "Catheter Drain", "Vomitus"

    @Column(name = "recorded_at", nullable = false)
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();

    @Column(name = "recorded_by", length = 150)
    private String recordedBy;

    @Column(name = "target_daily_volume_ml")
    @Builder.Default
    private Integer targetDailyVolumeMl = 1800;

    @Column(name = "diet_texture", length = 50)
    @Builder.Default
    private String dietTexture = "REGULAR"; // REGULAR, SOFT_AND_BITE_SIZED (IDDSI 6), MINCED_AND_MOIST (IDDSI 5), PUREED (IDDSI 4), LIQUIDISED (IDDSI 3)

    @Column(name = "fluid_thickness", length = 50)
    @Builder.Default
    private String fluidThickness = "NORMAL"; // NORMAL, SLIGHTLY_THICK (IDDSI 1), MILDLY_THICK (IDDSI 2), MODERATELY_THICK (IDDSI 3)

    @Column(columnDefinition = "TEXT")
    private String notes;
}

