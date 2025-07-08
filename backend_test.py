#!/usr/bin/env python3
import requests
import json
import uuid
from datetime import datetime, timedelta
import time
import sys

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://ba6f6a3b-cf53-4162-a4c0-831b84c52a1a.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

print(f"Testing backend at URL: {API_URL}")

# Test data for tenders with due_date field
test_tender_offer = {
    "item": "Enterprise Software License",
    "customer": "Acme Corp",
    "tender_name": "Q1 2024 Software Deal",
    "status": "Offer",  # Testing new "Offer" status
    "start_date": "2024-06-01",
    "expiry_date": "2024-07-15",
    "due_date": datetime.now().isoformat(),
    "deal_value": 125000.50,
    "priority": "High",
    "assigned_sales_rep": "John Smith"
}

test_tender_contract = {
    "item": "Cloud Storage Solution",
    "customer": "TechGiant Inc",
    "tender_name": "Annual Cloud Storage Contract",
    "status": "Contract Signed",  # Testing new "Contract Signed" status
    "start_date": "2024-05-15",
    "expiry_date": "2024-06-30",
    "due_date": (datetime.now() + timedelta(days=30)).isoformat(),
    "deal_value": 85000.00,
    "priority": "Medium",
    "assigned_sales_rep": "Sarah Johnson"
}

test_tender_round1 = {
    "item": "Security Consulting Package",
    "customer": "Acme Corp",
    "tender_name": "Security Assessment",
    "status": "Round 1",  # Existing status
    "start_date": "2024-04-01",
    "expiry_date": "2024-05-15",
    "due_date": (datetime.now() + timedelta(days=15)).isoformat(),
    "deal_value": 45000.00,
    "priority": "Low",
    "assigned_sales_rep": "John Smith"
}

# Helper functions
def print_separator():
    print("\n" + "="*80 + "\n")

def print_response(response, message=""):
    print(f"{message} Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

# Test functions
def test_api_health():
    print_separator()
    print("Testing API Health Check (GET /api/)")
    
    try:
        response = requests.get(f"{API_URL}/")
        print_response(response, "API Health Check Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response should contain 'message' field"
        
        print("✅ API Health Check Test Passed")
        return True
    except Exception as e:
        print(f"❌ API Health Check Test Failed: {str(e)}")
        return False

def test_create_tender_with_offer_status():
    print_separator()
    print("Testing Create Tender with 'Offer' status (POST /api/tenders)")
    
    try:
        response = requests.post(f"{API_URL}/tenders", json=test_tender_offer)
        print_response(response, "Create Tender with 'Offer' Status Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response fields
        data = response.json()
        assert "id" in data, "Response should contain 'id' field"
        assert data["item"] == test_tender_offer["item"], f"Expected item {test_tender_offer['item']}, got {data['item']}"
        assert data["customer"] == test_tender_offer["customer"], f"Expected customer {test_tender_offer['customer']}, got {data['customer']}"
        assert data["tender_name"] == test_tender_offer["tender_name"], f"Expected tender_name {test_tender_offer['tender_name']}, got {data['tender_name']}"
        assert data["status"] == test_tender_offer["status"], f"Expected status {test_tender_offer['status']}, got {data['status']}"
        assert data["deal_value"] == test_tender_offer["deal_value"], f"Expected deal_value {test_tender_offer['deal_value']}, got {data['deal_value']}"
        assert data["priority"] == test_tender_offer["priority"], f"Expected priority {test_tender_offer['priority']}, got {data['priority']}"
        assert data["assigned_sales_rep"] == test_tender_offer["assigned_sales_rep"], f"Expected assigned_sales_rep {test_tender_offer['assigned_sales_rep']}, got {data['assigned_sales_rep']}"
        assert "due_date" in data, "Response should contain 'due_date' field"
        
        # Save the ID for later tests
        tender_id = data["id"]
        print(f"Created tender with ID: {tender_id} and status: {data['status']}")
        
        print("✅ Create Tender with 'Offer' Status Test Passed")
        return tender_id
    except Exception as e:
        print(f"❌ Create Tender with 'Offer' Status Test Failed: {str(e)}")
        return None

def test_create_tender_with_contract_signed_status():
    print_separator()
    print("Testing Create Tender with 'Contract Signed' status (POST /api/tenders)")
    
    try:
        response = requests.post(f"{API_URL}/tenders", json=test_tender_contract)
        print_response(response, "Create Tender with 'Contract Signed' Status Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response fields
        data = response.json()
        assert "id" in data, "Response should contain 'id' field"
        assert data["status"] == test_tender_contract["status"], f"Expected status {test_tender_contract['status']}, got {data['status']}"
        assert "due_date" in data, "Response should contain 'due_date' field"
        
        # Save the ID for later tests
        tender_id = data["id"]
        print(f"Created tender with ID: {tender_id} and status: {data['status']}")
        
        print("✅ Create Tender with 'Contract Signed' Status Test Passed")
        return tender_id
    except Exception as e:
        print(f"❌ Create Tender with 'Contract Signed' Status Test Failed: {str(e)}")
        return None

def test_create_tender_default_status():
    print_separator()
    print("Testing Create Tender with Default Status (POST /api/tenders)")
    
    # Create a copy of the test data without the status field
    test_data = test_tender_offer.copy()
    del test_data["status"]
    
    try:
        response = requests.post(f"{API_URL}/tenders", json=test_data)
        print_response(response, "Create Tender with Default Status Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response fields
        data = response.json()
        assert "id" in data, "Response should contain 'id' field"
        assert data["status"] == "Offer", f"Expected default status 'Offer', got {data['status']}"
        
        # Save the ID for later tests
        tender_id = data["id"]
        print(f"Created tender with ID: {tender_id} and default status: {data['status']}")
        
        print("✅ Create Tender with Default Status Test Passed")
        return tender_id
    except Exception as e:
        print(f"❌ Create Tender with Default Status Test Failed: {str(e)}")
        return None

def test_get_all_tenders():
    print_separator()
    print("Testing Get All Tenders (GET /api/tenders)")
    
    try:
        response = requests.get(f"{API_URL}/tenders")
        print_response(response, "Get All Tenders Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response structure
        data = response.json()
        assert isinstance(data, list), "Response should be a list of tenders"
        
        if len(data) > 0:
            # Check structure of first tender
            first_tender = data[0]
            assert "id" in first_tender, "Tender should contain 'id' field"
            assert "item" in first_tender, "Tender should contain 'item' field"
            assert "customer" in first_tender, "Tender should contain 'customer' field"
            assert "tender_name" in first_tender, "Tender should contain 'tender_name' field"
            assert "status" in first_tender, "Tender should contain 'status' field"
            assert "start_date" in first_tender, "Tender should contain 'start_date' field"
            assert "expiry_date" in first_tender, "Tender should contain 'expiry_date' field"
            assert "due_date" in first_tender, "Tender should contain 'due_date' field"
            assert "deal_value" in first_tender, "Tender should contain 'deal_value' field"
            assert "priority" in first_tender, "Tender should contain 'priority' field"
            assert "assigned_sales_rep" in first_tender, "Tender should contain 'assigned_sales_rep' field"
        
        print(f"Found {len(data)} tenders")
        print("✅ Get All Tenders Test Passed")
        return True
    except Exception as e:
        print(f"❌ Get All Tenders Test Failed: {str(e)}")
        return False

def test_get_tender_by_id(tender_id):
    print_separator()
    print(f"Testing Get Tender by ID (GET /api/tenders/{tender_id})")
    
    try:
        response = requests.get(f"{API_URL}/tenders/{tender_id}")
        print_response(response, "Get Tender by ID Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response fields
        data = response.json()
        assert data["id"] == tender_id, f"Expected id {tender_id}, got {data['id']}"
        assert "item" in data, "Response should contain 'item' field"
        assert "customer" in data, "Response should contain 'customer' field"
        assert "tender_name" in data, "Response should contain 'tender_name' field"
        assert "status" in data, "Response should contain 'status' field"
        assert "start_date" in data, "Response should contain 'start_date' field"
        assert "expiry_date" in data, "Response should contain 'expiry_date' field"
        assert "due_date" in data, "Response should contain 'due_date' field"
        assert "deal_value" in data, "Response should contain 'deal_value' field"
        assert "priority" in data, "Response should contain 'priority' field"
        assert "assigned_sales_rep" in data, "Response should contain 'assigned_sales_rep' field"
        
        print("✅ Get Tender by ID Test Passed")
        return True
    except Exception as e:
        print(f"❌ Get Tender by ID Test Failed: {str(e)}")
        return False

def test_update_tender_to_offer_status(tender_id):
    print_separator()
    print(f"Testing Update Tender to 'Offer' Status (PUT /api/tenders/{tender_id})")
    
    update_data = {
        "status": "Offer"
    }
    
    try:
        response = requests.put(f"{API_URL}/tenders/{tender_id}", json=update_data)
        print_response(response, "Update Tender to 'Offer' Status Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response fields
        data = response.json()
        assert data["id"] == tender_id, f"Expected id {tender_id}, got {data['id']}"
        assert data["status"] == update_data["status"], f"Expected status {update_data['status']}, got {data['status']}"
        
        print("✅ Update Tender to 'Offer' Status Test Passed")
        return True
    except Exception as e:
        print(f"❌ Update Tender to 'Offer' Status Test Failed: {str(e)}")
        return False

def test_update_tender_to_contract_signed_status(tender_id):
    print_separator()
    print(f"Testing Update Tender to 'Contract Signed' Status (PUT /api/tenders/{tender_id})")
    
    update_data = {
        "status": "Contract Signed"
    }
    
    try:
        response = requests.put(f"{API_URL}/tenders/{tender_id}", json=update_data)
        print_response(response, "Update Tender to 'Contract Signed' Status Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response fields
        data = response.json()
        assert data["id"] == tender_id, f"Expected id {tender_id}, got {data['id']}"
        assert data["status"] == update_data["status"], f"Expected status {update_data['status']}, got {data['status']}"
        
        print("✅ Update Tender to 'Contract Signed' Status Test Passed")
        return True
    except Exception as e:
        print(f"❌ Update Tender to 'Contract Signed' Status Test Failed: {str(e)}")
        return False

def test_filter_by_offer_status():
    print_separator()
    print("Testing Filter by 'Offer' Status (GET /api/tenders?status=Offer)")
    
    try:
        response = requests.get(f"{API_URL}/tenders?status=Offer")
        print_response(response, "Filter by 'Offer' Status Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response
        data = response.json()
        assert isinstance(data, list), "Response should be a list of tenders"
        
        if len(data) > 0:
            # Check that all returned tenders have the correct status
            for tender in data:
                assert tender["status"] == "Offer", f"Expected status 'Offer', got {tender['status']}"
        
        print(f"Found {len(data)} tenders with 'Offer' status")
        print("✅ Filter by 'Offer' Status Test Passed")
        return True
    except Exception as e:
        print(f"❌ Filter by 'Offer' Status Test Failed: {str(e)}")
        return False

def test_filter_by_contract_signed_status():
    print_separator()
    print("Testing Filter by 'Contract Signed' Status (GET /api/tenders?status=Contract%20Signed)")
    
    try:
        response = requests.get(f"{API_URL}/tenders?status=Contract%20Signed")
        print_response(response, "Filter by 'Contract Signed' Status Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response
        data = response.json()
        assert isinstance(data, list), "Response should be a list of tenders"
        
        if len(data) > 0:
            # Check that all returned tenders have the correct status
            for tender in data:
                assert tender["status"] == "Contract Signed", f"Expected status 'Contract Signed', got {tender['status']}"
        
        print(f"Found {len(data)} tenders with 'Contract Signed' status")
        print("✅ Filter by 'Contract Signed' Status Test Passed")
        return True
    except Exception as e:
        print(f"❌ Filter by 'Contract Signed' Status Test Failed: {str(e)}")
        return False

def test_filter_helpers():
    print_separator()
    print("Testing Filter Helper Endpoints")
    
    try:
        # Test customers endpoint
        print("\nTesting GET /api/tenders/filters/customers")
        customers_response = requests.get(f"{API_URL}/tenders/filters/customers")
        print_response(customers_response, "Customers Filter Response:")
        assert customers_response.status_code == 200
        customers_data = customers_response.json()
        assert "customers" in customers_data, "Response should contain 'customers' field"
        assert isinstance(customers_data["customers"], list), "'customers' should be a list"
        print(f"Found {len(customers_data['customers'])} unique customers")
        
        # Test sales reps endpoint
        print("\nTesting GET /api/tenders/filters/sales-reps")
        sales_reps_response = requests.get(f"{API_URL}/tenders/filters/sales-reps")
        print_response(sales_reps_response, "Sales Reps Filter Response:")
        assert sales_reps_response.status_code == 200
        sales_reps_data = sales_reps_response.json()
        assert "sales_reps" in sales_reps_data, "Response should contain 'sales_reps' field"
        assert isinstance(sales_reps_data["sales_reps"], list), "'sales_reps' should be a list"
        print(f"Found {len(sales_reps_data['sales_reps'])} unique sales reps")
        
        print("✅ Filter Helper Endpoints Tests Passed")
        return True
    except Exception as e:
        print(f"❌ Filter Helper Endpoints Tests Failed: {str(e)}")
        return False

def test_delete_tender(tender_id):
    print_separator()
    print(f"Testing Delete Tender (DELETE /api/tenders/{tender_id})")
    
    try:
        response = requests.delete(f"{API_URL}/tenders/{tender_id}")
        print_response(response, "Delete Tender Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response should contain 'message' field"
        
        # Verify the tender is actually deleted
        verify_response = requests.get(f"{API_URL}/tenders/{tender_id}")
        assert verify_response.status_code == 404, f"Expected status code 404 after deletion, got {verify_response.status_code}"
        
        print("✅ Delete Tender Test Passed")
        return True
    except Exception as e:
        print(f"❌ Delete Tender Test Failed: {str(e)}")
        return False

def cleanup_test_data(tender_ids):
    print_separator()
    print("Cleaning up test data...")
    
    success = True
    for tender_id in tender_ids:
        try:
            response = requests.delete(f"{API_URL}/tenders/{tender_id}")
            if response.status_code == 200:
                print(f"Successfully deleted tender with ID: {tender_id}")
            else:
                print(f"Failed to delete tender with ID: {tender_id}, status code: {response.status_code}")
                success = False
        except Exception as e:
            print(f"Error deleting tender with ID: {tender_id}, error: {str(e)}")
            success = False
    
    if success:
        print("✅ All test data cleaned up successfully")
    else:
        print("⚠️ Some test data could not be cleaned up")
    
    return success

def run_all_tests():
    print("\n" + "="*30 + " TENDERS DASHBOARD API TESTS " + "="*30 + "\n")
    print(f"Testing API at: {API_URL}")
    
    test_results = {}
    tender_ids = []
    
    # Basic API health check
    test_results["api_health"] = test_api_health()
    
    # Test creating tenders with new statuses
    offer_tender_id = test_create_tender_with_offer_status()
    test_results["create_tender_with_offer_status"] = offer_tender_id is not None
    if offer_tender_id:
        tender_ids.append(offer_tender_id)
    
    contract_tender_id = test_create_tender_with_contract_signed_status()
    test_results["create_tender_with_contract_signed_status"] = contract_tender_id is not None
    if contract_tender_id:
        tender_ids.append(contract_tender_id)
    
    # Test default status
    default_tender_id = test_create_tender_default_status()
    test_results["create_tender_default_status"] = default_tender_id is not None
    if default_tender_id:
        tender_ids.append(default_tender_id)
    
    # Test getting all tenders
    test_results["get_all_tenders"] = test_get_all_tenders()
    
    # Test getting tender by ID
    if offer_tender_id:
        test_results["get_tender_by_id"] = test_get_tender_by_id(offer_tender_id)
    else:
        test_results["get_tender_by_id"] = False
    
    # Test updating tender status
    if contract_tender_id:
        test_results["update_tender_to_offer_status"] = test_update_tender_to_offer_status(contract_tender_id)
    else:
        test_results["update_tender_to_offer_status"] = False
    
    if offer_tender_id:
        test_results["update_tender_to_contract_signed_status"] = test_update_tender_to_contract_signed_status(offer_tender_id)
    else:
        test_results["update_tender_to_contract_signed_status"] = False
    
    # Test filtering by status
    test_results["filter_by_offer_status"] = test_filter_by_offer_status()
    test_results["filter_by_contract_signed_status"] = test_filter_by_contract_signed_status()
    
    # Test filter helper endpoints
    test_results["filter_helpers"] = test_filter_helpers()
    
    # Test deleting a tender
    if default_tender_id:
        test_results["delete_tender"] = test_delete_tender(default_tender_id)
        tender_ids.remove(default_tender_id)
    else:
        test_results["delete_tender"] = False
    
    # Cleanup remaining test data
    if tender_ids:
        cleanup_test_data(tender_ids)
    
    # Summary
    print("\n" + "="*30 + " TEST SUMMARY " + "="*30)
    all_passed = True
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        if not result:
            all_passed = False
        print(f"{test_name}: {status}")
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED! The Tenders Dashboard API is working correctly with the new statuses.")
        return 0
    else:
        print("\n⚠️ SOME TESTS FAILED. Please check the logs above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())