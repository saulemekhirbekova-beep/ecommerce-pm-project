// DressCo витринасына жүктеме.
// Әдепкі: 5 VU, 30 с, NFR-01 табалдырығы p95 < 800 мс.
// Науқан стресі (SLO емес): SCENARIO=campaign k6 run tests/load_test_k6.js
// Витрина: docker compose -f docker-compose.monitoring.yml up -d
// Содан BASE_URL=http://127.0.0.1:8080

import http from "k6/http";
import { check, sleep } from "k6";

const base = __ENV.BASE_URL || "http://127.0.0.1:8080";
const campaign = __ENV.SCENARIO === "campaign";

export const options = campaign
  ? {
      scenarios: {
        blackFridayCatalog: {
          executor: "constant-arrival-rate",
          rate: 500,
          timeUnit: "1s",
          duration: "2m",
          preAllocatedVUs: 50,
          maxVUs: 500,
        },
      },
      thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<800"],
      },
    }
  : {
      vus: 5,
      duration: "30s",
      thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<800"],
      },
    };

export default function () {
  const response = http.get(`${base}/`);
  check(response, {
    "витрина 200": (res) => res.status === 200,
    "баға белгісі бар": (res) => String(res.body).includes('class="price"'),
  });
  if (!campaign) {
    sleep(1);
  }
}
