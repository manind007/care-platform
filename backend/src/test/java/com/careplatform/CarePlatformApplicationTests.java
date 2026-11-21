package com.careplatform;

import com.careplatform.auth.dto.LoginRequest;
import com.careplatform.auth.dto.LoginResponse;
import com.careplatform.client.model.Client;
import com.careplatform.client.service.ClientService;
import com.careplatform.visit.model.Visit;
import com.careplatform.visit.service.VisitService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CarePlatformApplicationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ClientService clientService;

    @Autowired
    private VisitService visitService;

    @Autowired
    private com.careplatform.tenant.repository.TenantRepository tenantRepository;

    @Test
    void contextLoads() {
        assertThat(clientService).isNotNull();
        assertThat(visitService).isNotNull();
    }

    @Test
    void testAuthenticationAndClientList() {
        String baseUrl = "http://localhost:" + port + "/api/v1";

        // Login as Care Manager using active tenant from repository
        String tenantId = tenantRepository.findAll().get(0).getTenantId();
        LoginRequest loginRequest = new LoginRequest("manager_sarah", "password123", tenantId);
        ResponseEntity<LoginResponse> response = restTemplate.postForEntity(
                baseUrl + "/auth/login", loginRequest, LoginResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getToken()).isNotBlank();
        assertThat(response.getBody().getUsername()).isEqualTo("manager_sarah");

        // Verify seeded clients exist in database
        List<Client> clients = clientService.getAllClients(null);
        assertThat(clients).isNotEmpty();
        assertThat(clients.get(0).getFirstName()).isEqualTo("Margaret");

        // Verify seeded visits exist
        List<Visit> todayVisits = visitService.getVisitsForToday(null);
        assertThat(todayVisits).isNotEmpty();
    }
}
