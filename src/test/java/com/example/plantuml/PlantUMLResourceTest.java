package com.example.plantuml;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
public class PlantUMLResourceTest {

    @Test
    public void testHealthEndpoint() {
        given()
          .when().get("/api/plantuml/health")
          .then()
             .statusCode(200)
             .body("success", is(true));
    }

    @Test
    public void testFormatsEndpoint() {
        given()
          .when().get("/api/plantuml/formats")
          .then()
             .statusCode(200);
    }
}
