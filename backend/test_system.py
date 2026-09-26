"""
End-to-End System Audit & Verification Test Script
"""

import random
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("=== STARTING LEGAL METROLOGY SYSTEM AUDIT ===")
    with TestClient(app) as client:
        # 1. Health Check
        res = client.get("/health")
        assert res.status_code == 200
        print("[OK] Health Check Passed:", res.json())

        # Reset demo passwords to ensure clean state
        reset_res = client.post("/auth/reset-demo-passwords")
        assert reset_res.status_code == 200
        print("[OK] Reset Demo Passwords Passed:", reset_res.json()["message"])

        # 2. Login Trader
        trader_res = client.post("/auth/login", json={"email": "apex.logistics@trader.com", "password": "Trader@12345"})
        assert trader_res.status_code == 200
        trader_data = trader_res.json()
        trader_token = trader_data["access_token"]
        print("[OK] Trader Login Passed:", trader_data["user"]["name"])

        # 3. Login LMO Officer
        lmo_res = client.post("/auth/login", json={"email": "lmo.delhi@legalmetrology.gov.in", "password": "Lmo@12345"})
        assert lmo_res.status_code == 200
        lmo_data = lmo_res.json()
        lmo_token = lmo_data["access_token"]
        print("[OK] LMO Officer Login Passed:", lmo_data["user"]["name"])

        # 4. Trader Registers New Instrument
        serial_no = f"ESS-2026-{random.randint(10000, 99999)}"
        inst_res = client.post(
            "/instruments",
            headers={"Authorization": f"Bearer {trader_token}"},
            json={
                "category": "electronic_weighing_scale",
                "brand": "Essae Digitronics",
                "model_number": "DS-215",
                "serial_number": serial_no,
                "capacity_rating": "15 kg",
                "accuracy_class": "class_iii",
                "verification_interval_months": 12,
                "installation_address": "Shop 4, Lajpat Nagar Market",
                "district": "Central Delhi",
                "state": "Delhi NCT",
                "pincode": "110024"
            }
        )
        assert inst_res.status_code == 201
        inst_data = inst_res.json()
        inst_id = inst_data["id"]
        print("[OK] Instrument Registration Passed. Serial:", inst_data["serial_number"])

        # 5. Trader Submits Application
        app_res = client.post(
            "/applications",
            headers={"Authorization": f"Bearer {trader_token}"},
            json={
                "instrument_id": inst_id,
                "application_type": "initial_verification",
                "trader_notes": "Urgent verification for commercial counter scale."
            }
        )
        assert app_res.status_code == 201
        app_data = app_res.json()
        app_id = app_data["id"]
        app_num = app_data["application_number"]
        print("[OK] Application Submission Passed. Number:", app_num)

        # 6. Officer Assigns Application
        assign_res = client.post(
            f"/applications/{app_id}/assign",
            headers={"Authorization": f"Bearer {lmo_token}"},
            json={
                "assigned_type": "LMO",
                "assigned_officer_id": lmo_data["user"]["id"]
            }
        )
        assert assign_res.status_code == 200
        print("[OK] Application Assignment Passed.")

        # 7. Officer Performs Field Inspection & Issues Digital Certificate
        insp_res = client.post(
            "/inspections",
            headers={"Authorization": f"Bearer {lmo_token}"},
            json={
                "application_id": app_id,
                "standard_weights_used": "Class F1 Standard Weights Set #DEL-104",
                "observed_max_error": 0.005,
                "tolerance_limit": 0.02,
                "result": "passed",
                "stamping_mark_no": "LM-STAMP-2026-DEL-901",
                "seal_number": "SEAL-DL-2026-7788",
                "remarks": "Tested at 0%, 25%, 50%, 75%, 100% capacity. Passed all MPE requirements."
            }
        )
        assert insp_res.status_code == 201
        print("[OK] Field Inspection & Certificate Generation Passed.")

        # 8. Retrieve Generated Digital Certificate
        certs_res = client.get("/certificates", headers={"Authorization": f"Bearer {trader_token}"})
        assert certs_res.status_code == 200
        certs = certs_res.json()
        target_cert = next(c for c in certs if c["application_id"] == app_id)
        cert_num = target_cert["certificate_number"]
        print("[OK] Generated Digital Certificate No:", cert_num)

        # 9. Public QR Verification Test (No Auth Token required)
        public_res = client.get(f"/public/verify/{cert_num}")
        assert public_res.status_code == 200
        pub_data = public_res.json()
        assert pub_data["is_valid"] is True
        assert pub_data["seal_number"] == "SEAL-DL-2026-7788"
        print("[OK] Public QR Authenticator Verification Passed:", pub_data["status"])

        # 10. Dashboard Stats Test
        stats_res = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {trader_token}"})
        assert stats_res.status_code == 200
        print("[OK] Dashboard Stats Passed:", stats_res.json())

    print("=== AUDIT COMPLETE: ALL WORKFLOWS PASSED 100% CLEANLY ===")

if __name__ == "__main__":
    run_tests()
