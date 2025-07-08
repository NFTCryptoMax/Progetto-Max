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

# Test data with due_date field and tender_name instead of offer_name
test_tender = {
    "item": "Enterprise Software License",
    "customer": "Acme Corp",
    "tender_name": "Q1 2024 Software Deal",
    "status": "Round 1",
    "start_date": "2024-06-01",
    "expiry_date": "2024-07-15",
    "due_date": datetime.now().isoformat(),
    "deal_value": 125000.50,
    "priority": "High",
    "assigned_sales_rep": "John Smith"
}

# Additional test data for filtering tests
test_tender2 = {
    "item": "Cloud Storage Solution",
    "customer": "TechGiant Inc",
    "tender_name": "Annual Cloud Storage Contract",
    "status": "Round 2",
    "start_date": "2024-05-15",
    "expiry_date": "2024-06-30",
    "due_date": (datetime.now() + timedelta(days=15)).isoformat(),
    "deal_value": 85000.00,
    "priority": "Medium",
    "assigned_sales_rep": "Sarah Johnson"
}

test_tender3 = {
    "item": "Security Consulting Package",
    "customer": "Acme Corp",
    "tender_name": "Security Assessment",
    "status": "Won",
    "start_date": "2024-04-01",
    "expiry_date": "2024-05-15",
    "due_date": (datetime.now() - timedelta(days=10)).isoformat(),
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

def test_create_tender():
    print_separator()
    print("Testing Create Tender (POST /api/tenders)")
    
    try:
        response = requests.post(f"{API_URL}/tenders", json=test_tender)
        print_response(response, "Create Tender Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response fields
        data = response.json()
        assert "id" in data, "Response should contain 'id' field"
        assert data["item"] == test_tender["item"], f"Expected item {test_tender['item']}, got {data['item']}"
        assert data["customer"] == test_tender["customer"], f"Expected customer {test_tender['customer']}, got {data['customer']}"
        assert data["tender_name"] == test_tender["tender_name"], f"Expected tender_name {test_tender['tender_name']}, got {data['tender_name']}"
        assert data["status"] == test_tender["status"], f"Expected status {test_tender['status']}, got {data['status']}"
        assert data["deal_value"] == test_tender["deal_value"], f"Expected deal_value {test_tender['deal_value']}, got {data['deal_value']}"
        assert data["priority"] == test_tender["priority"], f"Expected priority {test_tender['priority']}, got {data['priority']}"
        assert data["assigned_sales_rep"] == test_tender["assigned_sales_rep"], f"Expected assigned_sales_rep {test_tender['assigned_sales_rep']}, got {data['assigned_sales_rep']}"
        assert "due_date" in data, "Response should contain 'due_date' field"
        
        # Save the ID for later tests
        tender_id = data["id"]
        print(f"Created tender with ID: {tender_id}")
        
        print("✅ Create Tender Test Passed")
        return tender_id
    except Exception as e:
        print(f"❌ Create Tender Test Failed: {str(e)}")
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

def test_update_tender(tender_id):
    print_separator()
    print(f"Testing Update Tender (PUT /api/tenders/{tender_id})")
    
    update_data = {
        "status": "Round 2",
        "priority": "Medium",
        "deal_value": 130000.00,
        "due_date": (datetime.now() + timedelta(days=5)).isoformat()
    }
    
    try:
        response = requests.put(f"{API_URL}/tenders/{tender_id}", json=update_data)
        print_response(response, "Update Tender Response:")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        # Validate response fields
        data = response.json()
        assert data["id"] == tender_id, f"Expected id {tender_id}, got {data['id']}"
        assert data["status"] == update_data["status"], f"Expected status {update_data['status']}, got {data['status']}"
        assert data["priority"] == update_data["priority"], f"Expected priority {update_data['priority']}, got {data['priority']}"
        assert data["deal_value"] == update_data["deal_value"], f"Expected deal_value {update_data['deal_value']}, got {data['deal_value']}"
        assert "due_date" in data, "Response should contain 'due_date' field"
        
        print("✅ Update Tender Test Passed")
        return True
    except Exception as e:
        print(f"❌ Update Tender Test Failed: {str(e)}")
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

def test_filtering():
    print_separator()
    print("Testing Filtering Functionality")
    
    # Create additional test tenders for filtering
    tender_ids = []
    try:
        # Create first test tender
        response1 = requests.post(f"{API_URL}/tenders", json=test_tender)
        assert response1.status_code == 200
        tender_ids.append(response1.json()["id"])
        
        # Create second test tender
        response2 = requests.post(f"{API_URL}/tenders", json=test_tender2)
        assert response2.status_code == 200
        tender_ids.append(response2.json()["id"])
        
        # Create third test tender
        response3 = requests.post(f"{API_URL}/tenders", json=test_tender3)
        assert response3.status_code == 200
        tender_ids.append(response3.json()["id"])
        
        print(f"Created {len(tender_ids)} test tenders for filtering tests")
        
        # Test filter by status
        print("\nTesting filter by status (Round 1)")
        status_response = requests.get(f"{API_URL}/tenders?status=Round 1")
        print_response(status_response, "Filter by Status Response:")
        assert status_response.status_code == 200
        status_data = status_response.json()
        assert all(tender["status"] == "Round 1" for tender in status_data), "All tenders should have status 'Round 1'"
        print(f"Found {len(status_data)} tenders with status 'Round 1'")
        
        # Test filter by priority
        print("\nTesting filter by priority (Medium)")
        priority_response = requests.get(f"{API_URL}/tenders?priority=Medium")
        print_response(priority_response, "Filter by Priority Response:")
        assert priority_response.status_code == 200
        priority_data = priority_response.json()
        assert all(tender["priority"] == "Medium" for tender in priority_data), "All tenders should have priority 'Medium'"
        print(f"Found {len(priority_data)} tenders with priority 'Medium'")
        
        # Test filter by customer
        print("\nTesting filter by customer (Acme Corp)")
        customer_response = requests.get(f"{API_URL}/tenders?customer=Acme Corp")
        print_response(customer_response, "Filter by Customer Response:")
        assert customer_response.status_code == 200
        customer_data = customer_response.json()
        assert all(tender["customer"] == "Acme Corp" for tender in customer_data), "All tenders should have customer 'Acme Corp'"
        print(f"Found {len(customer_data)} tenders with customer 'Acme Corp'")
        
        # Test combined filters
        print("\nTesting combined filters (Acme Corp + Won status)")
        combined_response = requests.get(f"{API_URL}/tenders?customer=Acme Corp&status=Won")
        print_response(combined_response, "Combined Filters Response:")
        assert combined_response.status_code == 200
        combined_data = combined_response.json()
        assert all(tender["customer"] == "Acme Corp" and tender["status"] == "Won" for tender in combined_data), "All tenders should have customer 'Acme Corp' and status 'Won'"
        print(f"Found {len(combined_data)} tenders with customer 'Acme Corp' and status 'Won'")
        
        print("✅ Filtering Tests Passed")
        return tender_ids
    except Exception as e:
        print(f"❌ Filtering Tests Failed: {str(e)}")
        return tender_ids

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
    
    # Basic API health check
    test_results["api_health"] = test_api_health()
    
    # CRUD operations
    tender_id = test_create_tender()
    test_results["create_tender"] = tender_id is not None
    
    if tender_id:
        test_results["get_all_tenders"] = test_get_all_tenders()
        test_results["get_tender_by_id"] = test_get_tender_by_id(tender_id)
        test_results["update_tender"] = test_update_tender(tender_id)
        test_results["delete_tender"] = test_delete_tender(tender_id)
    else:
        test_results["get_all_tenders"] = False
        test_results["get_tender_by_id"] = False
        test_results["update_tender"] = False
        test_results["delete_tender"] = False
    
    # Filtering tests
    filter_tender_ids = test_filtering()
    test_results["filtering"] = len(filter_tender_ids) > 0
    
    # Filter helper endpoints
    test_results["filter_helpers"] = test_filter_helpers()
    
    # Cleanup
    if filter_tender_ids:
        cleanup_test_data(filter_tender_ids)
    
    # Summary
    print("\n" + "="*30 + " TEST SUMMARY " + "="*30)
    all_passed = True
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        if not result:
            all_passed = False
        print(f"{test_name}: {status}")
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED! The Tenders Dashboard API is working correctly.")
        return 0
    else:
        print("\n⚠️ SOME TESTS FAILED. Please check the logs above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
